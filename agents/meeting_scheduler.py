import os
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
from dotenv import load_dotenv
from datetime import datetime, timedelta
import json

# Load environment variables
load_dotenv()

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

class Message(BaseModel):
    role: str
    content: str

class TimeSlot(BaseModel):
    start_time: str
    end_time: str
    date: str

class MeetingRequest(BaseModel):
    client_name: str
    client_email: Optional[str] = None
    project_name: Optional[str] = None
    conversation_history: List[Message]
    available_slots: Optional[List[TimeSlot]] = None

class MeetingResponse(BaseModel):
    meeting_subject: str
    meeting_description: str
    suggested_date: str
    suggested_time: str
    duration_minutes: int
    attendees: List[str]
    calendar_event_created: bool = False
    calendar_event_id: Optional[str] = None

@app.post("/schedule-meeting", response_model=MeetingResponse)
async def schedule_meeting(request: MeetingRequest) -> MeetingResponse:
    """
    Schedule a meeting based on conversation history.
    
    Args:
        request: The meeting request containing conversation history and available slots
        
    Returns:
        MeetingResponse: The scheduled meeting details
    """
    try:
        # Prepare the system prompt
        system_prompt = """
        You are a meeting scheduler assistant for TDX, a technology development company. Your task is to analyze a conversation and extract information needed to schedule a meeting.
        
        Extract the following information:
        1. The purpose of the meeting
        2. Suggested date and time (if mentioned)
        3. Expected duration
        4. Required attendees
        
        If the conversation doesn't explicitly mention meeting details, suggest reasonable defaults based on the context.
        """
        
        # Prepare the conversation for analysis
        conversation_text = ""
        for message in request.conversation_history:
            conversation_text += f"{message.role.capitalize()}: {message.content}\n\n"
        
        # Prepare messages for the API call
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Please analyze this conversation and extract meeting details:\n\n{conversation_text}"}
        ]
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.3,
            max_tokens=1000
        )
        
        # Extract the analysis text
        analysis_text = response.choices[0].message.content
        
        # Generate meeting details based on the analysis
        meeting_subject = f"TDX Meeting with {request.client_name}"
        meeting_description = "Discussion about potential project collaboration."
        suggested_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
        suggested_time = "14:00"
        duration_minutes = 60
        attendees = [request.client_email] if request.client_email else []
        attendees.append("team@tdx.com")
        
        # Try to extract meeting subject
        if "purpose" in analysis_text.lower() or "subject" in analysis_text.lower():
            for line in analysis_text.split("\n"):
                if ":" in line and ("purpose" in line.lower() or "subject" in line.lower()):
                    extracted_subject = line.split(":", 1)[1].strip()
                    if extracted_subject:
                        if request.project_name:
                            meeting_subject = f"{extracted_subject} - {request.project_name}"
                        else:
                            meeting_subject = extracted_subject
        elif request.project_name:
            meeting_subject = f"TDX Meeting: {request.project_name} with {request.client_name}"
        
        # Try to extract meeting description
        if "description" in analysis_text.lower():
            for line in analysis_text.split("\n"):
                if ":" in line and "description" in line.lower():
                    extracted_description = line.split(":", 1)[1].strip()
                    if extracted_description:
                        meeting_description = extracted_description
        
        # Try to extract date and time
        if request.available_slots and len(request.available_slots) > 0:
            # Use the first available slot if provided
            suggested_date = request.available_slots[0].date
            suggested_time = request.available_slots[0].start_time
        else:
            # Try to extract from the conversation
            date_mentioned = False
            for line in analysis_text.split("\n"):
                if ":" in line and ("date" in line.lower() or "time" in line.lower()):
                    extracted_datetime = line.split(":", 1)[1].strip()
                    if extracted_datetime and "not mentioned" not in extracted_datetime.lower():
                        try:
                            # This is a simplified approach - in a real implementation, you would use a more robust date parsing
                            if "tomorrow" in extracted_datetime.lower():
                                suggested_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
                                date_mentioned = True
                            elif "next" in extracted_datetime.lower() and "week" in extracted_datetime.lower():
                                suggested_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
                                date_mentioned = True
                            
                            # Try to extract time
                            if ":" in extracted_datetime and "am" in extracted_datetime.lower() or "pm" in extracted_datetime.lower():
                                time_part = extracted_datetime.split(" ")[-2]
                                if ":" in time_part:
                                    suggested_time = time_part
                        except:
                            pass
            
            # If no date was mentioned, suggest a date based on the current day
            if not date_mentioned:
                # Avoid weekends
                days_to_add = 1
                next_day = datetime.now() + timedelta(days=days_to_add)
                while next_day.weekday() >= 5:  # 5 is Saturday, 6 is Sunday
                    days_to_add += 1
                    next_day = datetime.now() + timedelta(days=days_to_add)
                
                suggested_date = next_day.strftime("%Y-%m-%d")
        
        # Try to extract duration
        if "duration" in analysis_text.lower():
            for line in analysis_text.split("\n"):
                if ":" in line and "duration" in line.lower():
                    extracted_duration = line.split(":", 1)[1].strip()
                    if extracted_duration:
                        if "30" in extracted_duration:
                            duration_minutes = 30
                        elif "45" in extracted_duration:
                            duration_minutes = 45
                        elif "60" in extracted_duration or "hour" in extracted_duration:
                            duration_minutes = 60
                        elif "90" in extracted_duration:
                            duration_minutes = 90
                        elif "2" in extracted_duration and "hour" in extracted_duration:
                            duration_minutes = 120
        
        # Try to extract attendees
        if "attendees" in analysis_text.lower():
            for line in analysis_text.split("\n"):
                if ":" in line and "attendees" in line.lower():
                    extracted_attendees = line.split(":", 1)[1].strip()
                    if extracted_attendees and "not mentioned" not in extracted_attendees.lower():
                        # This is a simplified approach - in a real implementation, you would use a more robust parsing
                        attendee_list = [a.strip() for a in extracted_attendees.split(",")]
                        if attendee_list:
                            if request.client_email and request.client_email not in attendee_list:
                                attendee_list.append(request.client_email)
                            if "team@tdx.com" not in attendee_list:
                                attendee_list.append("team@tdx.com")
                            attendees = attendee_list
        
        # In a real implementation, you would create a calendar event here
        # For now, we'll just simulate it
        calendar_event_created = False
        calendar_event_id = None
        
        # Simulate creating a calendar event
        try:
            # This would be replaced with actual calendar API calls
            calendar_event_id = f"evt_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            calendar_event_created = True
        except:
            pass
        
        return MeetingResponse(
            meeting_subject=meeting_subject,
            meeting_description=meeting_description,
            suggested_date=suggested_date,
            suggested_time=suggested_time,
            duration_minutes=duration_minutes,
            attendees=attendees,
            calendar_event_created=calendar_event_created,
            calendar_event_id=calendar_event_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)

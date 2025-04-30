import os
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

class Message(BaseModel):
    role: str
    content: str

class PRDRequest(BaseModel):
    client_name: str
    project_name: str
    conversation_history: List[Message]
    additional_info: Optional[Dict[str, Any]] = None

class PRDResponse(BaseModel):
    prd_content: str
    suggested_questions: List[str]

# PRD template
PRD_TEMPLATE = """
# Project Requirements Document

## {project_name}

### Client: {client_name}

## 1. Project Overview
{overview}

## 2. Objectives
{objectives}

## 3. Requirements
### Functional Requirements
{functional_requirements}

### Non-Functional Requirements
{non_functional_requirements}

## 4. Timeline
{timeline}

## 5. Budget
{budget}

## 6. Stakeholders
{stakeholders}

Generated on: {date}
"""

@app.post("/generate-prd", response_model=PRDResponse)
async def generate_prd(request: PRDRequest) -> PRDResponse:
    """
    Generate a PRD based on conversation history.
    
    Args:
        request: The PRD request containing client info and conversation history
        
    Returns:
        PRDResponse: The generated PRD content and suggested follow-up questions
    """
    try:
        # Prepare the system prompt
        system_prompt = f"""
        You are a professional requirements analyst who creates detailed and structured PRDs for software projects.
        Your task is to generate a Project Requirements Document (PRD) for {request.client_name}'s project "{request.project_name}".
        
        Based on the conversation history, extract all relevant information and organize it into a comprehensive PRD.
        If there's missing information, make reasonable assumptions but mark them as [ASSUMPTION] so they can be verified later.
        
        The PRD should include:
        1. A clear project overview
        2. Specific objectives
        3. Detailed functional and non-functional requirements
        4. A realistic timeline with phases
        5. A budget range
        6. Key stakeholders
        
        Your PRD should be professional, detailed, and ready for client review.
        """
        
        # Prepare messages for the API call
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        for message in request.conversation_history:
            messages.append({"role": message.role, "content": message.content})
        
        # Add a final instruction to generate the PRD
        messages.append({
            "role": "user", 
            "content": "Based on our conversation, please generate a complete PRD document."
        })
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=4000
        )
        
        # Extract the PRD content
        prd_content = response.choices[0].message.content
        
        # Generate follow-up questions to fill any gaps
        follow_up_messages = messages.copy()
        follow_up_messages.append({
            "role": "user",
            "content": "Based on the PRD you generated, what are 3-5 important questions I should ask the client to improve the PRD?"
        })
        
        follow_up_response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=follow_up_messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        # Extract the suggested questions
        suggested_questions_text = follow_up_response.choices[0].message.content
        suggested_questions = [
            q.strip().replace("- ", "", 1) for q in suggested_questions_text.split("\n") 
            if q.strip() and q.strip().startswith("- ")
        ]
        
        if not suggested_questions:
            # If the format wasn't as expected, try to extract questions another way
            suggested_questions = suggested_questions_text.split("\n")
            suggested_questions = [q for q in suggested_questions if "?" in q]
        
        return PRDResponse(
            prd_content=prd_content,
            suggested_questions=suggested_questions[:5]  # Limit to 5 questions
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

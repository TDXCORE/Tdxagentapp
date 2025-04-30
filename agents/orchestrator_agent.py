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

class OrchestratorRequest(BaseModel):
    messages: List[Message]
    client_info: Optional[Dict[str, Any]] = None
    current_agent: str = "router"
    intent_detected: Optional[str] = None
    confidence: float = 0.0

class OrchestratorResponse(BaseModel):
    next_agent: str
    confidence: float
    reason: str
    context: Optional[Dict[str, Any]] = None

# Define the system prompt for the orchestrator
ORCHESTRATOR_PROMPT = """
You are an orchestrator agent for TDX, a technology development company. Your role is to determine which specialized agent should handle a client conversation based on the conversation history and detected intent.

Available agents:
1. Router Agent - For initial greeting and understanding client needs
2. PRD Agent - For detailed requirements gathering and PRD creation
3. Quotation Agent - For pricing discussions and quotation generation
4. Contract Agent - For contract discussions and document preparation
5. Meeting Scheduler - For scheduling meetings with clients

Based on the conversation history and detected intent, determine which agent should handle the next part of the conversation.
Provide a confidence score (0.0 to 1.0) for your decision and a brief explanation of your reasoning.
"""

@app.post("/orchestrate", response_model=OrchestratorResponse)
async def orchestrate(request: OrchestratorRequest) -> OrchestratorResponse:
    """
    Determine which agent should handle the next part of the conversation.
    
    Args:
        request: The orchestrator request containing conversation history and current agent
        
    Returns:
        OrchestratorResponse: The next agent to handle the conversation
    """
    try:
        # Prepare the prompt for the orchestrator
        messages = [{"role": "system", "content": ORCHESTRATOR_PROMPT}]
        
        # Add context about the current state
        context_message = f"""
        Current agent: {request.current_agent}
        Intent detected: {request.intent_detected or "None"}
        Current confidence: {request.confidence}
        
        Client information:
        """
        
        if request.client_info:
            for key, value in request.client_info.items():
                context_message += f"{key}: {value}\n"
        
        messages.append({"role": "system", "content": context_message})
        
        # Add conversation history
        for message in request.messages:
            messages.append({"role": message.role, "content": message.content})
        
        # Add a final instruction
        messages.append({
            "role": "user", 
            "content": "Based on this conversation, which agent should handle the next part? Respond with the agent name, confidence score, and reasoning."
        })
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.3,
            max_tokens=500
        )
        
        # Extract the response text
        response_text = response.choices[0].message.content
        
        # Parse the response to determine the next agent
        # This is a simplified parsing logic - in a real implementation, you would use a more robust approach
        next_agent = "router"  # Default to router
        confidence = 0.5  # Default confidence
        reason = "No clear determination could be made."
        
        if "prd agent" in response_text.lower() or "requirements" in response_text.lower():
            next_agent = "prd"
            confidence = 0.8
            reason = "The conversation is focused on gathering project requirements."
        elif "quotation agent" in response_text.lower() or "pricing" in response_text.lower() or "cost" in response_text.lower():
            next_agent = "quotation"
            confidence = 0.8
            reason = "The conversation is focused on pricing and quotation."
        elif "contract agent" in response_text.lower() or "legal" in response_text.lower():
            next_agent = "contract"
            confidence = 0.8
            reason = "The conversation is focused on contract terms and legal matters."
        elif "meeting scheduler" in response_text.lower() or "schedule" in response_text.lower() or "meeting" in response_text.lower():
            next_agent = "meeting"
            confidence = 0.8
            reason = "The conversation is focused on scheduling a meeting."
        
        # Extract confidence from the response if available
        confidence_text = response_text.lower().split("confidence:")
        if len(confidence_text) > 1:
            try:
                confidence_value = float(confidence_text[1].split()[0])
                if 0 <= confidence_value <= 1:
                    confidence = confidence_value
            except:
                pass
        
        # Extract reason from the response if available
        reason_text = response_text.lower().split("reasoning:")
        if len(reason_text) > 1:
            reason = reason_text[1].strip()
        
        return OrchestratorResponse(
            next_agent=next_agent,
            confidence=confidence,
            reason=reason,
            context={"original_response": response_text}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)

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

class ChatRequest(BaseModel):
    messages: List[Message]
    client_info: Optional[Dict[str, Any]] = None
    agent_type: str = "router"

class ChatResponse(BaseModel):
    response: str
    intent_detected: str
    next_agent: Optional[str] = None
    confidence: float = 1.0

# Define system prompts for different agent types
SYSTEM_PROMPTS = {
    "router": """
    You are a helpful assistant for TDX, a technology development company. 
    Your role is to greet the customer, understand their needs, and route them to the appropriate specialized agent.
    Ask for their name, company, and a brief description of what they're looking to build.

    Based on their response, you should classify their intent and route them to one of the following agents:
    1. PRD Agent - If they need detailed requirements gathering for a new project
    2. Quotation Agent - If they want pricing information or a quote
    3. Contract Agent - If they have questions about contracts or legal matters
    4. General Information - If they have general questions about TDX services

    Always be professional, courteous, and helpful.
    """,
    
    "prd": """
    You are a requirements gathering specialist for TDX. Your job is to ask detailed questions about the client's project to create a comprehensive PRD.
    Focus on understanding their business goals, technical requirements, user stories, and constraints.
    
    Ask specific questions about:
    1. Project objectives and success criteria
    2. Target users and their needs
    3. Functional requirements (what the system should do)
    4. Non-functional requirements (performance, security, etc.)
    5. Technical constraints or preferences
    6. Timeline and budget considerations
    
    Be thorough but conversational. Your goal is to gather enough information to create a detailed PRD.
    """,
    
    "quotation": """
    You are a pricing specialist for TDX. Based on the project requirements, estimate the effort, timeline, and cost.
    Ask clarifying questions about project scope, complexity, and any specific technologies or integrations required.
    
    Focus on understanding:
    1. Project scope and complexity
    2. Required team composition (developers, designers, etc.)
    3. Timeline constraints
    4. Special requirements that might affect pricing
    
    Be transparent about how pricing works and what factors influence the final quote.
    """,
    
    "contract": """
    You are a contract specialist for TDX. Your role is to explain contract terms, answer legal questions, and help prepare for the contract phase.
    
    Focus on:
    1. Explaining standard contract terms in simple language
    2. Addressing concerns about intellectual property, liability, etc.
    3. Outlining the contract process
    4. Gathering any specific requirements for the contract
    
    Be clear, precise, and helpful while maintaining legal accuracy.
    """
}

def detect_intent(text: str) -> str:
    """
    Detect the intent from the text to determine which agent should handle it.
    
    Args:
        text: The text to analyze
        
    Returns:
        str: The detected intent (prd, quotation, contract, or general)
    """
    text_lower = text.lower()
    
    if any(keyword in text_lower for keyword in ["requirements", "prd", "specification", "features", "functionality"]):
        return "prd"
    elif any(keyword in text_lower for keyword in ["price", "cost", "quote", "quotation", "how much", "pricing"]):
        return "quotation"
    elif any(keyword in text_lower for keyword in ["contract", "legal", "terms", "agreement", "sign"]):
        return "contract"
    else:
        return "general"

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process a chat request and return a response.
    
    Args:
        request: The chat request containing messages and optional client info
        
    Returns:
        ChatResponse: The agent's response and routing information
    """
    try:
        # Get the system prompt for the requested agent type
        system_prompt = SYSTEM_PROMPTS.get(request.agent_type, SYSTEM_PROMPTS["router"])
        
        # Prepare messages for the API call
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add client context if available
        if request.client_info:
            client_context = f"""
            Client Information:
            Name: {request.client_info.get('name', 'Unknown')}
            Company: {request.client_info.get('company_name', 'Unknown')}
            Status: {request.client_info.get('status', 'Unknown')}
            Email: {request.client_info.get('email', 'Unknown')}
            """
            messages.append({"role": "system", "content": client_context})
        
        # Add conversation history
        for message in request.messages:
            messages.append({"role": message.role, "content": message.content})
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=2000
        )
        
        # Extract the response text
        response_text = response.choices[0].message.content
        
        # Detect intent from the response
        intent = detect_intent(response_text)
        
        # Determine next agent based on intent
        next_agent = request.agent_type
        if request.agent_type == "router" and intent != "general":
            next_agent = intent
        
        return ChatResponse(
            response=response_text,
            intent_detected=intent,
            next_agent=next_agent,
            confidence=0.9  # In a real implementation, this would be calculated
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

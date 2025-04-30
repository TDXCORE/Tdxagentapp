import os
import json
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

class Message(BaseModel):
    role: str
    content: str

class QuotationRequest(BaseModel):
    client_name: str
    project_name: str
    project_type: Optional[str] = "web"
    complexity: Optional[int] = 50
    duration: Optional[int] = 3
    prd_content: Optional[str] = None
    conversation_history: Optional[List[Message]] = None

class QuotationItem(BaseModel):
    description: str
    hours: int
    rate: float
    amount: float

class QuotationResponse(BaseModel):
    client: str
    project: str
    date: str
    items: List[QuotationItem]
    subtotal: float
    tax: float
    total: float
    pdf_url: Optional[str] = None

@app.post("/generate-quotation", response_model=QuotationResponse)
async def generate_quotation(request: QuotationRequest) -> QuotationResponse:
    """
    Generate a quotation based on project information.
    
    Args:
        request: The quotation request containing project details
        
    Returns:
        QuotationResponse: The generated quotation
    """
    try:
        # Prepare the system prompt
        system_prompt = """
        You are a professional quotation specialist who creates accurate and detailed quotations for software projects.
        Your quotations are fair, comprehensive, and follow industry standards.
        
        Based on the provided project information, generate a detailed quotation with the following components:
        1. A breakdown of services (planning, development, testing, etc.)
        2. Hours estimated for each service
        3. Hourly rates based on complexity
        4. Subtotal
        5. Tax (19%)
        6. Total amount
        
        Return the quotation as a structured JSON object with the following format:
        {
          "client": "Client Name",
          "project": "Project Name",
          "date": "ISO date string",
          "items": [
            {
              "description": "Service description",
              "hours": number,
              "rate": number,
              "amount": number
            }
          ],
          "subtotal": number,
          "tax": number,
          "total": number
        }
        """
        
        # Prepare the user prompt with project details
        user_prompt = f"""
        Generate a detailed quotation for a client named {request.client_name} for their project "{request.project_name}".
        
        Project details:
        - Type: {request.project_type}
        - Complexity: {request.complexity} (on a scale of 1-100)
        - Duration: {request.duration} months
        """
        
        # Add PRD content if available
        if request.prd_content:
            user_prompt += f"\n\nBased on the following PRD:\n{request.prd_content}"
        
        # Add conversation history if available
        conversation_context = ""
        if request.conversation_history:
            conversation_context = "\n\nRelevant conversation history:\n"
            for message in request.conversation_history:
                conversation_context += f"{message.role.capitalize()}: {message.content}\n"
            
            user_prompt += conversation_context
        
        # Prepare messages for the API call
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=2000
        )
        
        # Extract the quotation JSON
        quotation_text = response.choices[0].message.content
        
        # Try to extract JSON from the response
        try:
            # Find JSON in the response (it might be surrounded by markdown code blocks)
            json_start = quotation_text.find('{')
            json_end = quotation_text.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                quotation_json = quotation_text[json_start:json_end]
                quotation_data = json.loads(quotation_json)
            else:
                raise ValueError("No JSON found in the response")
                
        except json.JSONDecodeError:
            # If JSON parsing fails, generate a simpler quotation
            base_rate = 100  # Base hourly rate
            complexity_factor = request.complexity / 50  # Normalize complexity
            total_hours = request.duration * 160  # 160 hours per month
            hourly_rate = base_rate * complexity_factor
            
            # Create items
            items = [
                {
                    "description": "Project Planning and Analysis",
                    "hours": round(total_hours * 0.2),
                    "rate": hourly_rate,
                    "amount": round(total_hours * 0.2 * hourly_rate)
                },
                {
                    "description": "Design and Development",
                    "hours": round(total_hours * 0.6),
                    "rate": hourly_rate,
                    "amount": round(total_hours * 0.6 * hourly_rate)
                },
                {
                    "description": "Testing and Deployment",
                    "hours": round(total_hours * 0.2),
                    "rate": hourly_rate,
                    "amount": round(total_hours * 0.2 * hourly_rate)
                }
            ]
            
            # Calculate totals
            subtotal = sum(item["amount"] for item in items)
            tax = subtotal * 0.19
            total = subtotal + tax
            
            quotation_data = {
                "client": request.client_name,
                "project": request.project_name,
                "date": datetime.now().isoformat(),
                "items": items,
                "subtotal": subtotal,
                "tax": tax,
                "total": total
            }
        
        # Convert to QuotationResponse model
        return QuotationResponse(**quotation_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)

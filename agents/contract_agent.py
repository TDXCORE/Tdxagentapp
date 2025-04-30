import os
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

class ContractRequest(BaseModel):
    client_name: str
    project_name: str
    contract_type: str = "standard"
    conversation_history: Optional[List[Message]] = None
    project_details: Optional[Dict[str, Any]] = None
    prd_content: Optional[str] = None
    quotation_content: Optional[Dict[str, Any]] = None

class ContractResponse(BaseModel):
    contract_content: str
    contract_type: str
    suggested_clauses: List[str]
    warnings: List[str]

# Contract templates
CONTRACT_TEMPLATES = {
    "standard": """
# SERVICE AGREEMENT

This Service Agreement (the "Agreement") is entered into as of {date} by and between:

**TDX** ("Service Provider"), a technology development company, and

**{client_name}** ("Client")

## 1. SERVICES

Service Provider agrees to provide Client with software development services for the project "{project_name}" as described in the attached Project Requirements Document.

## 2. PAYMENT

Client agrees to pay Service Provider according to the payment schedule outlined in the attached Quotation.

## 3. TERM

This Agreement shall commence on the date of execution and shall continue until all services have been provided, unless earlier terminated.

## 4. INTELLECTUAL PROPERTY

Upon receipt of full payment, Service Provider assigns to Client all rights, title, and interest in the deliverables.

## 5. CONFIDENTIALITY

Both parties agree to maintain the confidentiality of any proprietary information shared during the course of this Agreement.

## 6. TERMINATION

Either party may terminate this Agreement with 30 days written notice.

## 7. GOVERNING LAW

This Agreement shall be governed by the laws of [Jurisdiction].

## 8. SIGNATURES

**Service Provider:**
TDX
_____________________
Date: {date}

**Client:**
{client_name}
_____________________
Date: ________________
    """,
    
    "nda": """
# NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is entered into as of {date} by and between:

**TDX** ("Disclosing Party"), a technology development company, and

**{client_name}** ("Receiving Party")

## 1. CONFIDENTIAL INFORMATION

"Confidential Information" means any information disclosed by Disclosing Party to Receiving Party, either directly or indirectly, in writing, orally or by inspection of tangible objects, which is designated as "Confidential," "Proprietary" or some similar designation.

## 2. NON-DISCLOSURE

Receiving Party agrees not to use any Confidential Information for any purpose except to evaluate and engage in discussions concerning a potential business relationship between the parties.

## 3. TERM

This Agreement shall remain in effect for a period of 2 years from the date of execution.

## 4. SIGNATURES

**Disclosing Party:**
TDX
_____________________
Date: {date}

**Receiving Party:**
{client_name}
_____________________
Date: ________________
    """,
    
    "msa": """
# MASTER SERVICE AGREEMENT

This Master Service Agreement (the "Agreement") is entered into as of {date} by and between:

**TDX** ("Service Provider"), a technology development company, and

**{client_name}** ("Client")

## 1. SERVICES

Service Provider agrees to provide Client with technology development services as described in individual Statements of Work to be attached to this Agreement.

## 2. PAYMENT

Client agrees to pay Service Provider according to the payment terms outlined in each Statement of Work.

## 3. TERM

This Agreement shall commence on the date of execution and shall continue for a period of 1 year, with automatic renewal for successive 1-year terms unless terminated.

## 4. INTELLECTUAL PROPERTY

Upon receipt of full payment for each Statement of Work, Service Provider assigns to Client all rights, title, and interest in the deliverables for that Statement of Work.

## 5. CONFIDENTIALITY

Both parties agree to maintain the confidentiality of any proprietary information shared during the course of this Agreement.

## 6. TERMINATION

Either party may terminate this Agreement with 60 days written notice.

## 7. GOVERNING LAW

This Agreement shall be governed by the laws of [Jurisdiction].

## 8. SIGNATURES

**Service Provider:**
TDX
_____________________
Date: {date}

**Client:**
{client_name}
_____________________
Date: ________________
    """
}

@app.post("/generate-contract", response_model=ContractResponse)
async def generate_contract(request: ContractRequest) -> ContractResponse:
    """
    Generate a contract based on project information.
    
    Args:
        request: The contract request containing project details
        
    Returns:
        ContractResponse: The generated contract content and metadata
    """
    try:
        # Get the base template
        template = CONTRACT_TEMPLATES.get(request.contract_type, CONTRACT_TEMPLATES["standard"])
        
        # Fill in basic template variables
        contract_content = template.format(
            client_name=request.client_name,
            project_name=request.project_name,
            date=datetime.now().strftime("%B %d, %Y")
        )
        
        # If we have project details, PRD, or quotation, use AI to enhance the contract
        if request.project_details or request.prd_content or request.quotation_content or request.conversation_history:
            # Prepare the system prompt
            system_prompt = """
            You are a legal expert specializing in technology service contracts. Your task is to enhance a basic contract template with specific clauses and details based on the provided project information.
            
            The contract should be professional, legally sound, and tailored to the specific project requirements.
            
            Please maintain the overall structure of the template but add or modify clauses as needed to address the specific project requirements, risks, and deliverables.
            """
            
            # Prepare the user prompt with project details
            user_prompt = f"""
            I need to enhance the following contract template for a project with {request.client_name} called "{request.project_name}".
            
            Here is the basic template:
            
            {contract_content}
            """
            
            # Add project details if available
            if request.project_details:
                user_prompt += "\n\nProject details:\n"
                for key, value in request.project_details.items():
                    user_prompt += f"{key}: {value}\n"
            
            # Add PRD content if available
            if request.prd_content:
                user_prompt += f"\n\nProject Requirements Document:\n{request.prd_content}\n"
            
            # Add quotation content if available
            if request.quotation_content:
                user_prompt += "\n\nQuotation details:\n"
                for key, value in request.quotation_content.items():
                    user_prompt += f"{key}: {value}\n"
            
            # Add conversation history if available
            if request.conversation_history:
                user_prompt += "\n\nRelevant conversation history:\n"
                for message in request.conversation_history:
                    user_prompt += f"{message.role.capitalize()}: {message.content}\n"
            
            user_prompt += "\n\nPlease enhance this contract with specific clauses and details based on the provided information."
            
            # Prepare messages for the API call
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            # Call OpenAI API
            response = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=messages,
                temperature=0.5,
                max_tokens=4000
            )
            
            # Extract the enhanced contract content
            contract_content = response.choices[0].message.content
            
            # Generate suggested clauses and warnings
            clauses_messages = messages.copy()
            clauses_messages.append({
                "role": "assistant",
                "content": "I've enhanced the contract as requested."
            })
            clauses_messages.append({
                "role": "user",
                "content": "Based on this project, what are 3-5 additional clauses that might be worth considering? Also, are there any potential legal or business risks I should be aware of?"
            })
            
            clauses_response = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=clauses_messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            clauses_text = clauses_response.choices[0].message.content
            
            # Extract suggested clauses and warnings
            suggested_clauses = []
            warnings = []
            
            in_clauses_section = False
            in_warnings_section = False
            
            for line in clauses_text.split("\n"):
                line = line.strip()
                if not line:
                    continue
                    
                if "additional clauses" in line.lower() or "suggested clauses" in line.lower():
                    in_clauses_section = True
                    in_warnings_section = False
                    continue
                    
                if "risks" in line.lower() or "warnings" in line.lower():
                    in_clauses_section = False
                    in_warnings_section = True
                    continue
                    
                if in_clauses_section and (line.startswith("-") or line.startswith("*") or line[0].isdigit()):
                    suggested_clauses.append(line.lstrip("- *123456789."))
                    
                if in_warnings_section and (line.startswith("-") or line.startswith("*") or line[0].isdigit()):
                    warnings.append(line.lstrip("- *123456789."))
            
            # If we couldn't extract clauses or warnings properly, use a simpler approach
            if not suggested_clauses:
                suggested_clauses = ["Force Majeure Clause", "Dispute Resolution", "Change Request Process", "Warranty Period", "Limitation of Liability"]
                
            if not warnings:
                warnings = ["Ensure all deliverables are clearly defined", "Verify payment terms match company policy", "Check jurisdiction is appropriate for both parties"]
        
        else:
            # If we don't have additional information, provide generic suggestions
            suggested_clauses = ["Force Majeure Clause", "Dispute Resolution", "Change Request Process", "Warranty Period", "Limitation of Liability"]
            warnings = ["Ensure all deliverables are clearly defined", "Verify payment terms match company policy", "Check jurisdiction is appropriate for both parties"]
        
        return ContractResponse(
            contract_content=contract_content,
            contract_type=request.contract_type,
            suggested_clauses=suggested_clauses[:5],  # Limit to 5 clauses
            warnings=warnings[:3]  # Limit to 3 warnings
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)

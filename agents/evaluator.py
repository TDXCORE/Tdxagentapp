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

class EvaluationRequest(BaseModel):
    conversation_history: List[Message]
    agent_type: str
    evaluation_criteria: Optional[List[str]] = None

class EvaluationResponse(BaseModel):
    overall_score: float  # 0.0 to 1.0
    scores: Dict[str, float]
    feedback: str
    improvement_suggestions: List[str]

# Default evaluation criteria for different agent types
DEFAULT_EVALUATION_CRITERIA = {
    "router": [
        "greeting_quality",
        "understanding_needs",
        "appropriate_routing",
        "professionalism",
        "clarity"
    ],
    "prd": [
        "requirements_gathering",
        "technical_understanding",
        "detail_level",
        "clarity",
        "completeness"
    ],
    "quotation": [
        "pricing_accuracy",
        "detail_level",
        "transparency",
        "value_explanation",
        "professionalism"
    ],
    "contract": [
        "legal_accuracy",
        "clarity",
        "completeness",
        "risk_mitigation",
        "professionalism"
    ],
    "meeting": [
        "scheduling_efficiency",
        "clarity",
        "professionalism",
        "follow_up"
    ]
}

@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_conversation(request: EvaluationRequest) -> EvaluationResponse:
    """
    Evaluate a conversation based on specified criteria.
    
    Args:
        request: The evaluation request containing conversation history and criteria
        
    Returns:
        EvaluationResponse: Evaluation scores and feedback
    """
    try:
        # Get the appropriate evaluation criteria
        criteria = request.evaluation_criteria or DEFAULT_EVALUATION_CRITERIA.get(request.agent_type, ["overall_quality"])
        
        # Prepare the system prompt
        system_prompt = f"""
        You are an expert evaluator of AI agent conversations. Your task is to evaluate a conversation between an AI agent ({request.agent_type} agent) and a client.
        
        Please evaluate the conversation based on the following criteria:
        {', '.join(criteria)}
        
        For each criterion, provide a score from 0.0 to 1.0, where:
        - 0.0 is completely unsatisfactory
        - 0.5 is acceptable
        - 1.0 is excellent
        
        Also provide an overall score and specific feedback on what was done well and what could be improved.
        
        Format your response as follows:
        
        Overall Score: [score]
        
        Individual Scores:
        - [criterion1]: [score]
        - [criterion2]: [score]
        ...
        
        Feedback:
        [Your detailed feedback here]
        
        Improvement Suggestions:
        - [suggestion1]
        - [suggestion2]
        ...
        """
        
        # Prepare the conversation for evaluation
        conversation_text = ""
        for message in request.conversation_history:
            conversation_text += f"{message.role.capitalize()}: {message.content}\n\n"
        
        # Prepare messages for the API call
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Please evaluate this conversation:\n\n{conversation_text}"}
        ]
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.3,
            max_tokens=2000
        )
        
        # Extract the evaluation text
        evaluation_text = response.choices[0].message.content
        
        # Parse the evaluation to extract scores, feedback, and suggestions
        overall_score = 0.5  # Default score
        scores = {}
        feedback = ""
        improvement_suggestions = []
        
        # Extract overall score
        if "Overall Score:" in evaluation_text:
            try:
                score_text = evaluation_text.split("Overall Score:")[1].split("\n")[0].strip()
                overall_score = float(score_text)
            except:
                pass
        
        # Extract individual scores
        if "Individual Scores:" in evaluation_text:
            scores_section = evaluation_text.split("Individual Scores:")[1].split("Feedback:")[0].strip()
            for line in scores_section.split("\n"):
                if ":" in line and "-" in line:
                    try:
                        criterion = line.split("-")[1].split(":")[0].strip()
                        score = float(line.split(":")[-1].strip())
                        scores[criterion] = score
                    except:
                        pass
        
        # Extract feedback
        if "Feedback:" in evaluation_text:
            if "Improvement Suggestions:" in evaluation_text:
                feedback = evaluation_text.split("Feedback:")[1].split("Improvement Suggestions:")[0].strip()
            else:
                feedback = evaluation_text.split("Feedback:")[1].strip()
        
        # Extract improvement suggestions
        if "Improvement Suggestions:" in evaluation_text:
            suggestions_section = evaluation_text.split("Improvement Suggestions:")[1].strip()
            for line in suggestions_section.split("\n"):
                if line.strip() and line.strip().startswith("-"):
                    suggestion = line.strip().lstrip("- ")
                    if suggestion:
                        improvement_suggestions.append(suggestion)
        
        # If we couldn't extract suggestions properly, try a different approach
        if not improvement_suggestions:
            # Call OpenAI again specifically for suggestions
            suggestion_messages = [
                {"role": "system", "content": "You are an expert at improving AI agent conversations. Based on the conversation provided, suggest 3-5 specific improvements."},
                {"role": "user", "content": f"Please suggest improvements for this conversation:\n\n{conversation_text}"}
            ]
            
            suggestion_response = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=suggestion_messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            suggestion_text = suggestion_response.choices[0].message.content
            
            for line in suggestion_text.split("\n"):
                if line.strip() and (line.strip().startswith("-") or line.strip()[0].isdigit()):
                    suggestion = line.strip().lstrip("- 123456789.").strip()
                    if suggestion:
                        improvement_suggestions.append(suggestion)
        
        # Ensure we have at least some suggestions
        if not improvement_suggestions:
            improvement_suggestions = [
                "Be more specific when addressing client requirements",
                "Ask more follow-up questions to clarify client needs",
                "Provide more detailed explanations of technical concepts"
            ]
        
        return EvaluationResponse(
            overall_score=overall_score,
            scores=scores,
            feedback=feedback,
            improvement_suggestions=improvement_suggestions
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)

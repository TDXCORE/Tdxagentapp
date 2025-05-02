import os
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import openai
from dotenv import load_dotenv
import logging
from .rag_system import rag_system
from .logger_system import agent_logger
from .evaluator import evaluator  # Importar el evaluador

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("orchestrator_agent")

# Load environment variables
load_dotenv()

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

class Message(BaseModel):
    role: str
    content: str

class OrchestratorRequest(BaseModel):
    messages: List[Dict[str, str]]  # Cambiado de List[Message] a List[Dict[str, str]]
    client_info: Optional[Dict[str, Any]] = None
    current_agent: str = "router"
    intent_detected: Optional[str] = None
    confidence: float = 0.0
    user_id: str
    current_phase: Optional[str] = None
    rag_context: Optional[Dict[str, Any]] = None

class OrchestratorResponse(BaseModel):
    next_agent: str
    confidence: float
    reason: str
    context: Optional[Dict[str, Any]] = None
    response_content: Optional[str] = None

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
async def orchestrate(request: Request) -> OrchestratorResponse:
    """
    Determine which agent should handle the next part of the conversation.
    
    Args:
        request: The HTTP request containing conversation history and current agent
        
    Returns:
        OrchestratorResponse: The next agent to handle the conversation
    """
    try:
        # Obtener los datos de la solicitud como JSON
        request_data = await request.json()
        logger.info(f"Datos de solicitud recibidos: {request_data}")
        
        # Extraer los campos necesarios
        user_id = request_data.get("user_id", "unknown_user")
        messages = request_data.get("messages", [])
        client_info = request_data.get("client_info", {})
        current_agent = request_data.get("current_agent", "router")
        intent_detected = request_data.get("intent_detected")
        current_phase = request_data.get("current_phase", "CONSENT")
        
        logger.info(f"Orquestando conversación para usuario {user_id}")
        
        # Registrar entrada en el sistema de logs
        agent_logger.log_interaction(
            agent_type="orchestrator",
            input_data={
                "messages": messages,
                "client_info": client_info,
                "current_agent": current_agent,
                "intent_detected": intent_detected,
                "user_id": user_id
            },
            output_data={},  # Se completará al final
            metadata={"phase": "input"}
        )
        
        # Obtener contexto RAG
        rag_context = None
        try:
            # Extraer el último mensaje del usuario para la consulta
            user_messages = [m for m in messages if m.get("role") == "user"]
            query = user_messages[-1].get("content", "") if user_messages else ""
            
            # Detectar etiquetas <<NEXT:*>> en los mensajes
            import re
            tag = next((re.search(r'<<NEXT:([A-Z_]+)>>', m.get("content", "")) for m in messages if '<<NEXT:' in m.get("content", "")), None)
            if tag:  # ruta directa
                next_agent = tag.group(1).lower()
                logger.info(f"Tag <<NEXT:{next_agent}>> detectado, usando como ruta directa")
                return OrchestratorResponse(
                    next_agent=next_agent,
                    confidence=0.95,
                    reason='tag',
                    response_content=''
                )
            
            logger.info(f"Obteniendo contexto RAG para usuario {user_id}")
            rag_context = rag_system.get_relevant_context(
                user_id=user_id,
                query=query,
                limit=3,
                similarity_threshold=0.6
            )
            logger.info(f"Contexto RAG obtenido: {len(rag_context.get('recent_conversations', []))} conversaciones relevantes")
        except Exception as e:
            logger.error(f"Error al obtener contexto RAG: {str(e)}")
            rag_context = {
                "recent_conversations": [],
                "client_state": {"current_phase": current_phase, "data": {}},
                "relevant_documents": [],
                "current_phase": current_phase
            }
        
        if not current_phase:
            current_phase = "CONSENT"
        
        logger.info(f"Fase actual: {current_phase}")
        
        # Prepare the prompt for the orchestrator
        orchestrator_messages = [{"role": "system", "content": ORCHESTRATOR_PROMPT}]
        
        # Add context about the current state
        context_message = f"""
        Current agent: {current_agent}
        Intent detected: {intent_detected or "None"}
        Current phase: {current_phase}
        
        Client information:
        """
        
        if client_info:
            for key, value in client_info.items():
                context_message += f"{key}: {value}\n"
        
        orchestrator_messages.append({"role": "system", "content": context_message})
        
        # Añadir contexto de conversaciones anteriores si está disponible
        if rag_context and "recent_conversations" in rag_context and rag_context["recent_conversations"]:
            rag_context_message = "Recent relevant conversations:\n"
            for i, conv in enumerate(rag_context["recent_conversations"][:3]):  # Limitamos a las 3 más relevantes
                rag_context_message += f"- User: {conv.get('content', '')}\n  System: {conv.get('response', '')}\n"
            orchestrator_messages.append({"role": "system", "content": rag_context_message})
        
        # Añadir información sobre documentos generados si está disponible
        if rag_context and "relevant_documents" in rag_context and rag_context["relevant_documents"]:
            docs_context_message = "Relevant documents:\n"
            for doc in rag_context["relevant_documents"]:
                docs_context_message += f"- {doc.get('type', 'Document').upper()}: {doc.get('title', 'Untitled')}\n"
            orchestrator_messages.append({"role": "system", "content": docs_context_message})
        
        # Add conversation history
        for message in messages:
            orchestrator_messages.append({"role": message["role"], "content": message["content"]})
        
        # Add a final instruction
        orchestrator_messages.append({
            "role": "user",
            "content": "Based on this conversation, which agent should handle the next part? Respond with the agent name, confidence score, and reasoning."
        })
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=orchestrator_messages,
            temperature=0.3,
            max_tokens=500
        )
        
        # Extract the response text
        response_text = response.choices[0].message.content
        logger.info(f"Respuesta del orquestador: {response_text[:100]}...")
        
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
        
        # Generar una respuesta para el cliente basada en el agente seleccionado
        response_content = await generate_response_for_client(
            next_agent=next_agent,
            messages=messages,
            current_phase=current_phase,
            rag_context=rag_context
        )
        
        # Actualizar la fase del cliente si es necesario
        if user_id:
            try:
                # Determinar si debemos actualizar la fase
                new_phase = determine_next_phase(current_phase, next_agent)
                if new_phase != current_phase:
                    logger.info(f"Actualizando fase del cliente {user_id} de {current_phase} a {new_phase}")
                    rag_system.update_client_state(
                        user_id=user_id,
                        state_update={
                            "current_phase": new_phase
                        }
                    )
            except Exception as e:
                logger.error(f"Error al actualizar fase del cliente: {str(e)}")
        
        # Si next_agent no es router, establecer response_content a cadena vacía
        if next_agent != 'router':
            logger.info(f"Estableciendo response_content a cadena vacía para agente: {next_agent}")
            response_content = ''
        
        # Crear respuesta
        response = OrchestratorResponse(
            next_agent=next_agent,
            confidence=confidence,
            reason=reason,
            context={"original_response": response_text, "current_phase": current_phase},
            response_content=response_content
        )
        
        # Registrar salida en el sistema de logs
        agent_logger.log_interaction(
            agent_type="orchestrator",
            input_data={},  # Ya registrado anteriormente
            output_data={
                "next_agent": next_agent,
                "confidence": confidence,
                "reason": reason,
                "current_phase": current_phase,
                "response_content": response_content[:100] + "..." if len(response_content) > 100 else response_content
            },
            metadata={"phase": "output"}
        )
        
        # Llamar al evaluator para agentes especializados
        if next_agent in {'prd', 'quotation', 'contract', 'meeting'}:
            try:
                logger.info(f"Llamando al evaluator para agente: {next_agent}")
                evaluator.evaluate_conversation(
                    conversation_history=[Message(**m) for m in messages],
                    agent_type=next_agent
                )
                logger.info("Evaluación completada")
            except Exception as eval_error:
                logger.warning(f"Evaluator error: {eval_error}")
                # No interrumpir el flujo si hay error en la evaluación
        
        return response
        
    except Exception as e:
        logger.error(f"Error en orquestador: {str(e)}")
        
        # Registrar error en el sistema de logs
        try:
            agent_logger.log_interaction(
                agent_type="orchestrator",
                input_data={},  # Ya registrado anteriormente
                output_data={"error": str(e)},
                metadata={"phase": "error"}
            )
        except Exception as log_error:
            logger.error(f"Error al registrar error en logs: {str(log_error)}")
        
        raise HTTPException(status_code=500, detail=str(e))

async def generate_response_for_client(
    next_agent: str,
    messages: List[Dict[str, str]],
    current_phase: str,
    rag_context: Optional[Dict[str, Any]] = None
) -> str:
    """
    Genera una respuesta para el cliente basada en el agente seleccionado.
    
    Args:
        next_agent: El próximo agente que manejará la conversación
        messages: El historial de mensajes
        current_phase: La fase actual del cliente
        rag_context: El contexto RAG
        
    Returns:
        str: La respuesta generada para el cliente
    """
    # Si next_agent no es "router", retornar cadena vacía para dejar hablar al agente especializado
    if next_agent != "router":
        logger.info(f"Retornando cadena vacía para dejar hablar al agente especializado: {next_agent}")
        return ""
        
    try:
        # Registrar inicio de generación de respuesta
        agent_logger.log_interaction(
            agent_type=f"response_generator_{next_agent}",
            input_data={
                "next_agent": next_agent,
                "messages": messages,  # Ya son diccionarios, no necesitamos convertirlos
                "current_phase": current_phase
            },
            output_data={},  # Se completará después
            metadata={"phase": "generation_start"}
        )
        
        # Obtener el último mensaje del usuario
        user_messages = [m for m in messages if m["role"] == "user"]
        last_message = user_messages[-1]["content"] if user_messages else ""
        
        # Preparar el prompt según el agente seleccionado
        if next_agent == "prd":
            system_prompt = """
            Eres un especialista en requisitos para TDX. Tu trabajo es ayudar al cliente a definir los requisitos de su proyecto.
            Responde de manera amigable y profesional, haciendo preguntas específicas para entender mejor sus necesidades.
            """
        elif next_agent == "quotation":
            system_prompt = """
            Eres un especialista en cotizaciones para TDX. Tu trabajo es ayudar al cliente a entender los costos y plazos de su proyecto.
            Responde de manera amigable y profesional, explicando claramente los factores que influyen en el precio.
            """
        elif next_agent == "contract":
            system_prompt = """
            Eres un especialista en contratos para TDX. Tu trabajo es ayudar al cliente a entender los términos del contrato.
            Responde de manera amigable y profesional, explicando los términos legales en un lenguaje sencillo.
            """
        elif next_agent == "meeting":
            system_prompt = """
            Eres un programador de reuniones para TDX. Tu trabajo es ayudar al cliente a programar una reunión con el equipo.
            Responde de manera amigable y profesional, preguntando por su disponibilidad y preferencias.
            """
        else:
            system_prompt = """
            Eres un asistente general para TDX. Tu trabajo es ayudar al cliente con sus consultas generales.
            Responde de manera amigable y profesional, proporcionando información útil sobre los servicios de TDX.
            """
        
        # Añadir contexto de la fase actual con instrucciones específicas
        system_prompt += f"\nLa fase actual del cliente es: {current_phase}"
        
        # Añadir instrucciones específicas según la fase
        if current_phase == "QUALIFICATION":
            system_prompt += """
            
            IMPORTANTE: Estamos en la fase de CUALIFICACIÓN. Tu objetivo es obtener información BANT:
            - Budget (Presupuesto): ¿Cuánto está dispuesto a invertir?
            - Authority (Autoridad): ¿Es la persona que toma decisiones?
            - Need (Necesidad): ¿Cuál es su necesidad específica?
            - Timeline (Plazo): ¿Cuándo necesita implementar la solución?
            
            Haz preguntas cortas y directas. No hagas todas las preguntas a la vez.
            Si no tienes el nombre y empresa del cliente, pregunta por estos datos primero.
            """
        
        # Añadir contexto de conversaciones anteriores si está disponible
        if rag_context and "recent_conversations" in rag_context and rag_context["recent_conversations"]:
            system_prompt += "\n\nContexto de conversaciones recientes:\n"
            for i, conv in enumerate(rag_context["recent_conversations"][:2]):  # Limitamos a las 2 más relevantes
                system_prompt += f"- Cliente: {conv.get('content', '')}\n  Sistema: {conv.get('response', '')}\n"
        
        # Preparar mensajes para OpenAI
        messages_for_api = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": last_message}
        ]
        
        # Llamar a OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=messages_for_api,
            temperature=0.7,
            max_tokens=1000
        )
        
        # Extraer el texto de respuesta
        response_text = response.choices[0].message.content
        
        # Registrar respuesta generada
        agent_logger.log_interaction(
            agent_type=f"response_generator_{next_agent}",
            input_data={},  # Ya registrado anteriormente
            output_data={"response": response_text[:100] + "..." if len(response_text) > 100 else response_text},
            metadata={"phase": "generation_complete"}
        )
        
        return response_text
    except Exception as e:
        logger.error(f"Error al generar respuesta para el cliente: {str(e)}")
        
        # Registrar error
        agent_logger.log_interaction(
            agent_type=f"response_generator_{next_agent}",
            input_data={},  # Ya registrado anteriormente
            output_data={"error": str(e)},
            metadata={"phase": "generation_error"}
        )
        
        return "Lo siento, estoy teniendo problemas para procesar tu solicitud. ¿Podrías intentarlo de nuevo?"

def determine_next_phase(current_phase: str, next_agent: str) -> str:
    """
    Determina la próxima fase basada en la fase actual y el agente seleccionado.
    
    Args:
        current_phase: La fase actual
        next_agent: El próximo agente
        
    Returns:
        str: La próxima fase
    """
    # IMPORTANTE: Si estamos en fase de QUALIFICATION, mantenerla durante todo el proceso
    # de cualificación, independientemente del agente seleccionado
    if current_phase == "QUALIFICATION":
        logger.info(f"Manteniendo fase QUALIFICATION aunque el agente sea {next_agent}")
        return "QUALIFICATION"
    
    # Mapeo de agentes a fases
    agent_to_phase = {
        "prd": "PRD",
        "quotation": "QUOTATION",
        "contract": "CONTRACT",
        "meeting": "MEETING",
        "consent_acceptance": "QUALIFICATION"  # Añadido para manejar la intención consent_acceptance
    }
    
    # Secuencia lógica de fases
    phase_sequence = ["CONSENT", "QUALIFICATION", "PRD", "MEETING", "QUOTATION", "CONTRACT", "COMPLETED"]
    
    # Si el agente seleccionado corresponde a una fase específica, avanzar a esa fase
    if next_agent in agent_to_phase:
        target_phase = agent_to_phase[next_agent]
        
        # Solo avanzar a una fase si es la siguiente en la secuencia o si ya estamos en esa fase
        if current_phase == target_phase:
            return current_phase
        
        current_index = phase_sequence.index(current_phase) if current_phase in phase_sequence else 0
        target_index = phase_sequence.index(target_phase) if target_phase in phase_sequence else len(phase_sequence) - 1
        
        # Si la fase objetivo está adelante en la secuencia, avanzar a ella
        if target_index > current_index:
            return target_phase
    
    # Si no hay un mapeo claro o no debemos avanzar, mantener la fase actual
    return current_phase

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)

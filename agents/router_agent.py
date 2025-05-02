import os
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import openai
from dotenv import load_dotenv
import json
import logging

# Importamos el sistema RAG y el sistema de logs
from .rag_system import rag_system
from .logger_system import agent_logger

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("router_agent")

# Cargar variables de entorno
load_dotenv()

# Configuración de OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    client_info: Optional[Dict[str, Any]] = None
    agent_type: str = "router"
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    intent_detected: str
    next_agent: Optional[str] = None
    confidence: float = 1.0

# Define system prompts for different agent types
SYSTEM_PROMPTS = {
    "router": """
    Eres el Asistente TDX, especializado en desarrollo de software a medida.
    Tu objetivo es entender las necesidades del cliente y ayudarle a definir su proyecto.
    Pregunta siempre por su nombre y empresa si no los conoces.
    Sé amable, profesional y conciso en tus respuestas.
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

# Punto de entrada principal - Mantener compatibilidad con el endpoint original
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Punto de entrada principal y ÚNICO para todas las comunicaciones con el cliente.
    Este método es una fachada que delegará al flujo correcto según el contexto.
    """
    try:
        # Verificar si tenemos un ID de usuario
        user_id = request.user_id
        if not user_id and request.client_info and "id" in request.client_info:
            user_id = request.client_info["id"]
        
        # Si no hay ID de usuario y se proporciona un número de teléfono, buscar o crear usuario
        if not user_id and request.client_info and "phone" in request.client_info:
            user_id = await get_or_create_user_by_phone(request.client_info["phone"])
        
        # Si aún no hay ID de usuario, crear un cliente temporal
        if not user_id:
            user_id = await create_temporary_client()
            logger.info(f"Cliente temporal creado: {user_id}")
        
        # Iniciar sesión de logs
        session_id = agent_logger.start_session(user_id)
        logger.info(f"Iniciada sesión de logs: {session_id}")
        
        # Registrar entrada
        agent_logger.log_interaction(
            agent_type="router",
            input_data={
                "messages": [m.dict() for m in request.messages],
                "client_info": request.client_info,
                "agent_type": request.agent_type,
                "user_id": user_id
            },
            output_data={},  # Se completará al final
            session_id=session_id,
            metadata={"phase": "input"}
        )
        
        # Obtener el último mensaje del usuario
        last_message = ""
        if request.messages and len(request.messages) > 0:
            for msg in reversed(request.messages):
                if msg.role == "user":
                    last_message = msg.content
                    break
        
        # Si tenemos un ID de usuario, obtener contexto RAG
        rag_context = None
        if user_id:
            try:
                logger.info(f"Obteniendo contexto RAG para usuario {user_id}")
                rag_context = rag_system.get_relevant_context(
                    user_id=user_id,
                    query=last_message
                )
                logger.info(f"Contexto RAG obtenido: {len(rag_context.get('recent_conversations', []))} conversaciones relevantes")
            except Exception as rag_error:
                logger.error(f"Error al obtener contexto RAG: {rag_error}")
        
        # Determinar la fase actual
        current_phase = "CONSENT"
        if rag_context and "client_state" in rag_context:
            current_phase = rag_context.get("client_state", {}).get("current_phase", "CONSENT")
            logger.info(f"Fase actual del cliente: {current_phase}")
        
        # Detectar intención básica
        intent = detect_intent(last_message)
        logger.info(f"Intención detectada: {intent}")
        
        # IMPORTANTE: Si detectamos consentimiento, actualizar la fase inmediatamente
        if current_phase == "CONSENT" and (intent == "consent_acceptance" or is_consent_given(last_message)):
            logger.info("Consentimiento detectado, actualizando fase a QUALIFICATION")
            current_phase = "QUALIFICATION"
            
            # Actualizar el estado del cliente en la base de datos
            if user_id:
                try:
                    updated_state = rag_system.update_client_state(
                        user_id=user_id,
                        state_update={
                            "current_phase": "QUALIFICATION",
                            "consent_given": True
                        }
                    )
                    logger.info(f"Estado del cliente actualizado a QUALIFICATION: {updated_state}")
                except Exception as update_error:
                    logger.error(f"Error al actualizar estado del cliente: {update_error}")
        
        # Preparar prompt para el router incluyendo contexto RAG si está disponible
        system_prompt = get_router_prompt(current_phase, rag_context)
        
        # Preparar mensajes para OpenAI
        messages = [{"role": "system", "content": system_prompt}]
        
        # Añadir contexto del cliente
        if request.client_info:
            client_context = format_client_context(request.client_info)
            messages.append({"role": "system", "content": client_context})
        
        # Añadir historial de conversación
        for message in request.messages:
            messages.append({"role": message.role, "content": message.content})
        
        # Determinar si debemos delegar al orquestador
        should_delegate = should_delegate_to_orchestrator(current_phase, intent, last_message)
        
        if should_delegate:
            logger.info(f"Delegando al orquestador para usuario {user_id}")
            
            # Insertar etiqueta y resumen ANTES de delegar
            if intent in {'prd','qualification'} and '<<NEXT:' not in last_message:
                short = last_message[:80]
                request.messages.append(Message(role='assistant',
                    content=f'Perfecto, necesitas una app: {short}. <<NEXT:PRD>>'))
                logger.info(f"Añadida etiqueta <<NEXT:PRD>> con resumen: {short}")
            
            # Delegar al orquestador
            orchestrator_result = await delegate_to_orchestrator(
                user_id=user_id,
                messages=request.messages,
                intent=intent,
                current_phase=current_phase,
                rag_context=rag_context,
                client_info=request.client_info,
                session_id=session_id
            )
            
            # El orquestador nos devuelve la respuesta formateada para el cliente
            response_text = orchestrator_result.get("response_content", "Lo siento, no pude procesar tu solicitud.")
            next_agent = orchestrator_result.get("next_agent", "router")
            
            # Almacenar interacción en RAG
            if user_id:
                logger.info(f"Almacenando interacción en RAG para usuario {user_id}")
                try:
                    interaction_id = rag_system.store_interaction(
                        user_id=user_id,
                        message=last_message,
                        response=response_text,
                        phase=orchestrator_result.get("current_phase", current_phase),
                        metadata={
                            "intent": intent,
                            "next_agent": next_agent,
                            "delegated": True
                        }
                    )
                    logger.info(f"Interacción almacenada con ID: {interaction_id}")
                except Exception as rag_error:
                    logger.error(f"Error al almacenar interacción en RAG: {rag_error}")
                    # El error no es crítico, continuamos con el flujo
            
            # Crear respuesta
            response = ChatResponse(
                response=response_text,
                intent_detected=intent,
                next_agent=next_agent,
                confidence=orchestrator_result.get("confidence", 0.9)
            )
            
            # Registrar salida
            agent_logger.log_interaction(
                agent_type="router",
                input_data={},  # Ya registrado anteriormente
                output_data={
                    "response": response_text,
                    "intent_detected": intent,
                    "next_agent": next_agent,
                    "confidence": orchestrator_result.get("confidence", 0.9),
                    "delegated": True
                },
                session_id=session_id,
                metadata={"phase": "output", "delegated": True}
            )
            
            return response
        else:
            logger.info(f"Manejando directamente en el router para usuario {user_id}")
            # Manejar directamente en el router para casos simples
            # Esto es principalmente para la fase de CONSENT y mensajes iniciales
            
            # Llamar a OpenAI con límite de tokens reducido
            response = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=messages,
                temperature=0.7,
                max_tokens=400  # Limitar tokens para respuestas más cortas
            )
            
            # Extraer texto de respuesta
            response_text = response.choices[0].message.content
            
            # Truncar respuesta a máximo 6 líneas
            response_text = '\n'.join(response_text.split('\n')[:6])
            
            # Determinar próximo agente
            next_agent = "router"
            if intent not in ["general", "greeting"]:
                next_agent = intent
                
            # Añadir etiqueta <<NEXT:PRD>> y resumen corto si corresponde
            if next_agent == "prd" and '<<NEXT:' not in last_message:  # evitar duplicar
                short = last_message[:80]  # resumen corto
                response_text = f"Perfecto, necesitas una app: {short}. <<NEXT:PRD>>"
            
            # Actualizar estado del cliente si es la fase de consentimiento
            if current_phase == "CONSENT" and (is_consent_given(last_message) or intent == "consent_acceptance"):
                if user_id:
                    logger.info(f"Actualizando estado del cliente {user_id} - consentimiento dado")
                    
                    # IMPORTANTE: Forzar la actualización de la fase actual a QUALIFICATION
                    current_phase = "QUALIFICATION"
                    logger.info(f"Fase actualizada a: {current_phase}")
                    
                    # Modificar la respuesta para incluir preguntas de cualificación BANT
                    if "gracias por tu consentimiento" in response_text.lower() and not any(word in response_text.lower() for word in ["presupuesto", "nombre", "empresa", "plazo"]):
                        response_text += "\n\nPara ayudarte mejor con tu aplicación de inventario, ¿podrías compartir tu nombre y el de tu empresa?"
                    
                    try:
                        # Intentar actualizar en Supabase
                        updated_state = rag_system.update_client_state(
                            user_id=user_id,
                            state_update={
                                "current_phase": "QUALIFICATION",
                                "consent_given": True
                            }
                        )
                        
                        # Actualizar el contexto RAG
                        if rag_context:
                            if "client_state" in rag_context:
                                rag_context["client_state"]["current_phase"] = "QUALIFICATION"
                                rag_context["client_state"]["consent_given"] = True
                            else:
                                rag_context["client_state"] = {"current_phase": "QUALIFICATION", "consent_given": True}
                            rag_context["current_phase"] = "QUALIFICATION"
                        
                        logger.info(f"Estado del cliente actualizado correctamente: {updated_state}")
                    except Exception as update_error:
                        logger.error(f"Error al actualizar estado del cliente: {update_error}")
                        
                        # Actualizar el contexto RAG en memoria
                        if rag_context is None:
                            rag_context = {
                                "recent_conversations": [],
                                "client_state": {"current_phase": "QUALIFICATION", "consent_given": True},
                                "relevant_documents": [],
                                "current_phase": "QUALIFICATION"
                            }
                        else:
                            if "client_state" in rag_context:
                                rag_context["client_state"]["current_phase"] = "QUALIFICATION"
                                rag_context["client_state"]["consent_given"] = True
                            else:
                                rag_context["client_state"] = {"current_phase": "QUALIFICATION", "consent_given": True}
                            rag_context["current_phase"] = "QUALIFICATION"
                    
                    # Después de actualizar el estado, forzar la delegación al orquestador
                    # para la siguiente interacción del usuario
                    next_agent = "prd"  # Asumimos que después del consentimiento, vamos a PRD
                    logger.info(f"Después del consentimiento, estableciendo next_agent a: {next_agent}")
            
            # Almacenar interacción en RAG
            if user_id:
                logger.info(f"Almacenando interacción en RAG para usuario {user_id}")
                try:
                    interaction_id = rag_system.store_interaction(
                        user_id=user_id,
                        message=last_message,
                        response=response_text,
                        phase=current_phase,
                        metadata={
                            "intent": intent,
                            "next_agent": next_agent,
                            "delegated": False
                        }
                    )
                    logger.info(f"Interacción almacenada con ID: {interaction_id}")
                except Exception as rag_error:
                    logger.error(f"Error al almacenar interacción en RAG: {rag_error}")
                    # El error no es crítico, continuamos con el flujo
            
            # Crear respuesta
            response = ChatResponse(
                response=response_text,
                intent_detected=intent,
                next_agent=next_agent,
                confidence=0.9
            )
            
            # Registrar salida
            agent_logger.log_interaction(
                agent_type="router",
                input_data={},  # Ya registrado anteriormente
                output_data={
                    "response": response_text,
                    "intent_detected": intent,
                    "next_agent": next_agent,
                    "confidence": 0.9,
                    "delegated": False
                },
                session_id=session_id,
                metadata={"phase": "output", "delegated": False}
            )
            
            return response
        
    except Exception as e:
        logger.error(f"Error en router: {str(e)}")
        
        # Registrar error
        try:
            agent_logger.log_interaction(
                agent_type="router",
                input_data={},  # Ya registrado anteriormente
                output_data={"error": str(e)},
                session_id=session_id if 'session_id' in locals() else None,
                metadata={"phase": "error"}
            )
        except Exception as log_error:
            logger.error(f"Error al registrar error en logs: {str(log_error)}")
        
        raise HTTPException(status_code=500, detail=str(e))

def detect_intent(text: str) -> str:
    """
    Detecta la intención a partir del texto para determinar qué agente debe manejarlo.
    """
    text_lower = text.lower().strip()
    
    # Detectar tag especial <<NEXT:*>> y usarlo como intent directo
    import re
    next_tag_match = re.search(r'<<NEXT:([a-zA-Z_]+)>>', text)
    if next_tag_match:
        direct_intent = next_tag_match.group(1).lower()
        logger.info(f"Tag <<NEXT:{direct_intent}>> detectado, usando como intent directo")
        return direct_intent
    
    # Detectar consentimiento - usar la función is_consent_given para mayor consistencia
    if is_consent_given(text):
        return "consent_acceptance"
    
    # Detección de intenciones específicas
    
    # Intención de PRD/Requisitos - Lista reducida para evitar clasificar todo como PRD
    prd_keywords = [
        "requirement", "prd", "requisito", "feature", "función",
        "desarrollar", "proyecto", "web", "móvil", "movil"
    ]
    if any(keyword in text_lower for keyword in prd_keywords):
        return "prd"
    
    # Intención de cotización/precios
    quotation_keywords = [
        "price", "precio", "costo", "cost", "quot", "cotiza", "cuanto", "presupuesto",
        "valor", "tarifa", "pagar", "inversión", "inversion", "dinero", "cobrar"
    ]
    if any(keyword in text_lower for keyword in quotation_keywords):
        return "quotation"
    
    # Intención de contrato/legal
    contract_keywords = [
        "contract", "contrat", "legal", "terms", "término", "firma", "sign", "acuerdo",
        "convenio", "documento", "condiciones", "cláusulas", "clausulas"
    ]
    if any(keyword in text_lower for keyword in contract_keywords):
        return "contract"
    
    # Intención de reunión/agenda
    meeting_keywords = [
        "meeting", "reuni", "agenda", "calendar", "cita", "hablar", "conversar", "llamada",
        "videollamada", "zoom", "teams", "meet", "horario", "disponibilidad"
    ]
    if any(keyword in text_lower for keyword in meeting_keywords):
        return "meeting"
    
    # Saludos simples
    greeting_phrases = [
        "hola", "hello", "hi", "hey", "buenos días", "buenas tardes", "buenas noches",
        "saludos", "qué tal", "que tal", "cómo estás", "como estas"
    ]
    if text_lower.strip() in greeting_phrases:
        return "greeting"
    
    # Si el mensaje es corto y no se detectó ninguna intención específica, asumimos que es general
    if len(text.split()) <= 3:
        return "general"
    
    # Si el mensaje es más largo y contiene palabras relacionadas con proyectos o desarrollo,
    # asumimos que es PRD para iniciar el flujo de cualificación
    project_words = [
        "proyecto", "desarrollo", "aplicación", "aplicacion", "app", "sistema", "software",
        "web", "móvil", "movil", "crear", "hacer", "desarrollar", "implementar", "construir",
        "inventario", "gestión", "gestion", "seguimiento", "tracking", "monitoreo"
    ]
    if any(word in text_lower for word in project_words):
        return "prd"
    
    # Por defecto, retornamos intención general
    return "general"
def get_router_prompt(current_phase: str, rag_context: Optional[Dict[str, Any]]) -> str:
    """
    Genera un prompt enriquecido para el router basado en la fase actual y el contexto RAG.
    """
    # Usar el prompt simplificado del SYSTEM_PROMPTS["router"]
    base_prompt = SYSTEM_PROMPTS["router"]
    
    # Añadir contexto de conversaciones anteriores si está disponible
    if rag_context and "recent_conversations" in rag_context and rag_context["recent_conversations"]:
        base_prompt += "\n\nContexto de conversaciones recientes:\n"
        for i, conv in enumerate(rag_context["recent_conversations"][:3]):  # Limitamos a las 3 más relevantes
            base_prompt += f"- Cliente: {conv.get('content', '')}\n  Sistema: {conv.get('response', '')}\n"
    
    # Añadir información sobre documentos generados si está disponible
    if rag_context and "relevant_documents" in rag_context and rag_context["relevant_documents"]:
        base_prompt += "\n\nDocumentos generados previamente:\n"
        for doc in rag_context["relevant_documents"]:
            base_prompt += f"- {doc.get('type', 'Documento').upper()}: {doc.get('title', 'Sin título')}\n"
    # Sección eliminada para evitar duplicación
    
    # Añadir instrucción final
    base_prompt += """
    Recuerda: No tomes decisiones complejas tú mismo. Para conversaciones más allá del saludo inicial
    y el consentimiento, delegarás al Orchestrator para manejar el flujo adecuado.
    """
    
    return base_prompt

def format_client_context(client_info: Dict[str, Any]) -> str:
    """Formatea la información del cliente para incluirla en el prompt."""
    context = "Información del cliente:\n"
    for key, value in client_info.items():
        if key != "id":  # No incluir el ID en el prompt
            context += f"{key}: {value}\n"
    return context

def should_delegate_to_orchestrator(phase: str, intent: str, message: str) -> bool:
    """
    Determina si el router debe delegar al orquestador.
    En general, delegamos todo excepto saludos y consentimiento inicial.
    """
    # Si estamos en fase de consentimiento y el usuario está dando consentimiento,
    # manejamos aquí mismo para actualizar la fase a QUALIFICATION
    if phase == "CONSENT" and (intent == "consent_acceptance" or is_consent_given(message)):
        logger.info("No delegando porque el usuario está dando consentimiento")
        return False
    
    # Si es solo un saludo, no necesitamos delegar
    if intent == "greeting" and len(message.split()) <= 5:
        return False
    
    # Si ya estamos en fase de QUALIFICATION o posterior, SIEMPRE delegamos
    # para avanzar en el flujo según el diagrama de fases
    if phase == "QUALIFICATION" or phase == "PRD" or phase == "MEETING" or phase == "QUOTATION" or phase == "CONTRACT":
        logger.info(f"Delegando al orquestador porque estamos en fase {phase}")
        return True
    
    # Si el mensaje contiene información sobre un proyecto o aplicación, delegamos
    # para iniciar la fase de cualificación
    project_keywords = ["aplicacion", "aplicación", "app", "proyecto", "desarrollo", "software", "web", "móvil", "movil"]
    if any(keyword in message.lower() for keyword in project_keywords):
        logger.info(f"Delegando al orquestador porque el mensaje contiene palabras clave de proyecto")
        return True
    
    # Para todo lo demás, delegamos al orquestador
    return True

def is_consent_given(message: str) -> bool:
    """Determina si el mensaje indica consentimiento explícito."""
    message_lower = message.lower().strip()
    
    # Lista ampliada de palabras y frases que indican consentimiento
    consent_words = [
        "sí", "si", "acepto", "autorizo", "consiento", "de acuerdo", "ok", "yes",
        "claro", "por supuesto", "adelante", "estoy de acuerdo", "está bien",
        "correcto", "afirmativo", "confirmo", "procede", "continúa", "continua"
    ]
    
    # Si el mensaje es solo una de estas palabras, es un consentimiento claro
    if message_lower in consent_words:
        return True
    
    # Si el mensaje contiene alguna de estas palabras, probablemente es consentimiento
    if any(word in message_lower for word in consent_words):
        return True
    
    # Si el mensaje es muy corto y no contiene negaciones, probablemente es consentimiento
    if len(message_lower.split()) <= 3 and not any(neg in message_lower for neg in ["no", "nada", "nunca", "jamás"]):
        return True
    
    return False

async def delegate_to_orchestrator(user_id: str,
                                messages: List[Message],
                                intent: str,
                                current_phase: str,
                                rag_context: Optional[Dict[str, Any]] = None,
                                client_info: Optional[Dict[str, Any]] = None,
                                session_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Delega el procesamiento al orquestador.
    En un entorno real, esto sería una llamada a la API del orquestrador.
    """
    try:
        # Importar el orquestador
        # En una implementación real, esto podría ser una llamada HTTP a otro servicio
        from .orchestrator_agent import OrchestratorRequest, OrchestratorResponse
        import httpx
        
        # Preparar la solicitud para el orquestador
        # Convertir los objetos Message a diccionarios antes de crear la solicitud
        messages_dict = [{"role": m.role, "content": m.content} for m in messages]
        
        # Obtener el session_id si no se proporcionó
        if session_id is None:
            try:
                session_id = agent_logger.get_current_session_id()
                logger.info(f"Session ID obtenido: {session_id}")
            except Exception as session_error:
                logger.error(f"Error al obtener session_id: {str(session_error)}")
        
        orchestrator_request = OrchestratorRequest(
            messages=messages_dict,
            client_info=client_info,
            current_agent="router",
            intent_detected=intent,
            user_id=user_id,
            current_phase=current_phase,  # Añadir current_phase explícitamente
            session_id=session_id  # Añadir session_id explícitamente
        )
        
        # Registrar delegación al orquestador
        agent_logger.log_interaction(
            agent_type="router->orchestrator",
            input_data={
                "messages": [m.dict() for m in messages],
                "client_info": client_info,
                "current_agent": "router",
                "intent_detected": intent,
                "user_id": user_id,
                "current_phase": current_phase
            },
            output_data={},  # Se completará después
            metadata={"phase": "delegation"}
        )
        
        # Obtener el último mensaje del usuario
        last_message = ""
        for msg in reversed(messages):
            if msg.role == "user":
                last_message = msg.content
                break
        
        # Si estamos en fase de cualificación, generar una respuesta específica
        if current_phase == "QUALIFICATION":
            logger.info(f"Generando respuesta de cualificación para usuario {user_id}")
            response_content = generate_qualification_response(intent, last_message)
            orchestrator_response = {
                "next_agent": "prd",  # En cualificación, el siguiente agente es PRD
                "confidence": 0.9,
                "reason": "Avanzando en la fase de cualificación",
                "current_phase": "QUALIFICATION",
                "response_content": response_content
            }
            logger.info(f"Respuesta de cualificación generada: {response_content[:50]}...")
            return {
                "response_content": response_content,
                "next_agent": "prd",
                "confidence": 0.9,
                "current_phase": "QUALIFICATION"
            }
        
        # Para otras fases, intentar llamar al orquestador
        try:
            # Convertir los mensajes a formato JSON serializable
            messages_json = []
            for m in messages:
                if isinstance(m, dict):
                    messages_json.append(m)
                else:
                    messages_json.append({"role": m.role, "content": m.content})
            
            # Crear una solicitud serializable
            # IMPORTANTE: Asegurarnos de enviar la fase correcta al orchestrator
            # Si estamos en fase CONSENT y se ha dado consentimiento, forzar QUALIFICATION
            phase_to_send = current_phase
            if current_phase == "CONSENT" and (is_consent_given(last_message) or intent == "consent_acceptance"):
                phase_to_send = "QUALIFICATION"
                logger.info(f"Forzando fase QUALIFICATION en la solicitud al orchestrator")
                
                # Actualizar el estado del cliente inmediatamente
                try:
                    updated_state = rag_system.update_client_state(
                        user_id=user_id,
                        state_update={
                            "current_phase": "QUALIFICATION",
                            "consent_given": True
                        }
                    )
                    logger.info(f"Estado del cliente actualizado a QUALIFICATION: {updated_state}")
                    
                    # Actualizar la variable current_phase para el resto de la función
                    current_phase = "QUALIFICATION"
                except Exception as update_error:
                    logger.error(f"Error al actualizar estado del cliente: {update_error}")
            
            # Obtener el session_id actual
            session_id = None
            try:
                # Intentar obtener el session_id del logger
                session_id = agent_logger.get_current_session_id()
                logger.info(f"Session ID obtenido: {session_id}")
            except Exception as session_error:
                logger.error(f"Error al obtener session_id: {str(session_error)}")
            
            request_data = {
                "messages": messages_json,
                "client_info": client_info,
                "current_agent": "router",
                "intent_detected": intent,
                "user_id": user_id,
                "current_phase": phase_to_send,
                "session_id": session_id
            }
            
            # Asegurarnos de que session_id y current_phase estén correctamente incluidos
            if session_id is None:
                # Intentar obtener el session_id nuevamente
                try:
                    session_id = agent_logger.get_current_session_id()
                    if session_id:
                        request_data["session_id"] = session_id
                        logger.info(f"Session ID añadido al payload: {session_id}")
                except Exception as session_error:
                    logger.error(f"No se pudo obtener session_id: {str(session_error)}")
            
            # Verificar que current_phase sea correcto (no debe ser CONSENT si ya se dio consentimiento)
            if request_data["current_phase"] == "CONSENT" and is_consent_given(last_message):
                request_data["current_phase"] = "QUALIFICATION"
                logger.info("Corrigiendo current_phase a QUALIFICATION en el payload")
            
            logger.info(f"Llamando al orquestador para usuario {user_id}")
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://localhost:8010/orchestrate",
                    json=request_data,
                    timeout=10.0
                )
                orchestrator_response = response.json()
                logger.info(f"Respuesta del orquestador recibida: {orchestrator_response}")
        except Exception as http_error:
            logger.error(f"Error en la comunicación HTTP con el orquestador: {str(http_error)}")
            # Crear una respuesta basada en la intención detectada
            if intent == "prd" or "aplicacion" in last_message.lower() or "aplicación" in last_message.lower():
                response_content = "Entiendo que estás interesado en desarrollar una aplicación. Para ayudarte mejor, ¿podrías darme más detalles sobre qué tipo de aplicación necesitas y cuáles serían sus principales funcionalidades?"
                next_agent = "prd"
            elif intent == "quotation":
                response_content = "Gracias por tu interés en nuestros servicios. Para proporcionarte una cotización precisa, necesito algunos detalles sobre tu proyecto. ¿Podrías describir brevemente qué tipo de solución estás buscando y cuál es tu presupuesto aproximado?"
                next_agent = "quotation"
            elif intent == "contract":
                response_content = "Entiendo que tienes preguntas sobre contratos. Para ayudarte mejor, ¿podrías especificar qué aspectos del contrato te interesan o preocupan?"
                next_agent = "contract"
            elif intent == "meeting":
                response_content = "Me encantaría agendar una reunión contigo. ¿Podrías indicarme qué días y horarios te serían convenientes para esta reunión?"
                next_agent = "meeting"
            else:
                response_content = "Gracias por contactarnos. Para ayudarte mejor, ¿podrías darme más detalles sobre lo que estás buscando?"
                next_agent = "prd"
            
            orchestrator_response = {
                "next_agent": next_agent,
                "confidence": 0.9,
                "reason": "Respuesta generada debido a error de comunicación",
                "current_phase": current_phase,
                "response_content": response_content
            }
        
        # Procesar la respuesta del orquestador
        # En un entorno real, aquí procesaríamos la respuesta del orquestador
        # y obtendríamos la respuesta para el cliente
        
        # Usar la respuesta real del orchestrator
        result = {
            "response_content": orchestrator_response.get("response_content", "Lo siento, no pude procesar tu solicitud."),
            "next_agent": orchestrator_response.get("next_agent", "router"),
            "confidence": orchestrator_response.get("confidence", 0.9),
            "current_phase": orchestrator_response.get("current_phase", current_phase)
        }
        
        logger.info(f"Respuesta final del orchestrator: {result['response_content'][:50]}...")
        
        # Registrar respuesta del orquestador
        agent_logger.log_interaction(
            agent_type="orchestrator->router",
            input_data={},  # Ya registrado anteriormente
            output_data=result,
            metadata={"phase": "delegation_response"}
        )
        
        return result
    except Exception as e:
        logger.error(f"Error al delegar al orquestador: {str(e)}")
        
        # Registrar error
        error_response = {
            "response_content": "Lo siento, estoy teniendo problemas para procesar tu solicitud. ¿Podrías intentarlo de nuevo?",
            "next_agent": "router",
            "confidence": 0.5,
            "current_phase": current_phase
        }
        
        agent_logger.log_interaction(
            agent_type="orchestrator->router",
            input_data={},  # Ya registrado anteriormente
            output_data={"error": str(e), "fallback_response": error_response},
            metadata={"phase": "delegation_error"}
        )
        
        # En caso de error, devolver una respuesta genérica
        return error_response

def generate_qualification_response(intent: str, message: str) -> str:
    """
    Genera una respuesta específica para la fase de cualificación basada en la metodología BANT:
    Budget (Presupuesto), Authority (Autoridad), Need (Necesidad), Timeline (Plazo).
    
    Args:
        intent: La intención detectada
        message: El mensaje del usuario
        
    Returns:
        str: La respuesta generada para la fase de cualificación
    """
    # Detectar qué información ya tenemos en el mensaje
    message_lower = message.lower()
    
    # Si no tenemos información del cliente, pedirla primero - esta es la prioridad #1
    if "nombre" not in message_lower and "empresa" not in message_lower and "compañía" not in message_lower:
        return "Hola, gracias por tu interés en nuestra aplicación de inventario. Para ayudarte mejor, ¿podrías compartir tu nombre y el de tu empresa?"
    
    # Verificar si ya tenemos información sobre presupuesto (Budget)
    if "presupuesto" not in message_lower and "invertir" not in message_lower and "costo" not in message_lower and "precio" not in message_lower:
        return "¿Cuál es el presupuesto aproximado que tienes para este proyecto de inventario?"
    
    # Verificar si ya tenemos información sobre autoridad (Authority)
    if "decisión" not in message_lower and "decido" not in message_lower and "autorizo" not in message_lower:
        return "¿Eres tú quien toma la decisión final sobre este proyecto, o necesitas aprobación de alguien más?"
    
    # Verificar si ya tenemos información sobre plazo (Timeline)
    if "plazo" not in message_lower and "tiempo" not in message_lower and "cuando" not in message_lower and "cuándo" not in message_lower:
        return "¿Para cuándo necesitas tener implementada esta solución de inventario?"
    
    # Si ya tenemos toda la información BANT, preguntar por detalles específicos
    return "Gracias por la información. Para finalizar la cualificación, ¿podrías contarme qué funcionalidades específicas necesitas en tu aplicación de inventario además de la integración con WhatsApp?"

async def get_or_create_user_by_phone(phone: str) -> str:
    """
    Busca un usuario por número de teléfono o crea uno nuevo.
    En un entorno real, esto sería una llamada a la base de datos.
    """
    try:
        # Aquí implementarías la lógica para buscar o crear un usuario
        # Para este ejemplo, simplemente retornamos un ID falso
        logger.info(f"Buscando usuario por teléfono: {phone}")
        return f"user_{phone.replace('+', '').replace(' ', '')}"
    except Exception as e:
        logger.error(f"Error al buscar/crear usuario por teléfono: {str(e)}")
        return "temp_user_unknown"

async def create_temporary_client() -> str:
    """
    Crea un cliente temporal.
    En un entorno real, esto sería una llamada a la base de datos.
    """
    try:
        # Aquí implementarías la lógica para crear un cliente temporal
        # Para este ejemplo, simplemente retornamos un ID falso
        import uuid
        temp_id = str(uuid.uuid4())
        logger.info(f"Creando cliente temporal con ID: {temp_id}")
        return f"temp_{temp_id}"
    except Exception as e:
        logger.error(f"Error al crear cliente temporal: {str(e)}")
        return "temp_user_unknown"

# Webhook para WhatsApp
@app.post("/whatsapp_webhook")
async def whatsapp_webhook(request: Request):
    """
    Webhook para recibir mensajes de WhatsApp.
    Este es el punto inicial para comunicaciones desde WhatsApp.
    """
    try:
        # Obtener el payload del webhook
        payload = await request.json()
        logger.info(f"Webhook de WhatsApp recibido: {payload}")
        
        # Registrar webhook recibido
        agent_logger.log_interaction(
            agent_type="whatsapp_webhook",
            input_data=payload,
            output_data={},  # Se completará después
            metadata={"phase": "webhook_received"}
        )
        
        # Extraer información del mensaje (depende de la estructura específica del webhook)
        from_number = payload.get("from", "")
        message_body = payload.get("text", "")
        timestamp = payload.get("timestamp", "")
        
        if not from_number or not message_body:
            logger.error("Mensaje incompleto en webhook de WhatsApp")
            return {"status": "error", "message": "Mensaje incompleto"}
        
        # Buscar o crear el usuario por número de teléfono
        user_id = await get_or_create_user_by_phone(from_number)
        
        # Crear la solicitud para el router
        chat_request = ChatRequest(
            messages=[Message(role="user", content=message_body)],
            client_info={"phone": from_number},
            user_id=user_id
        )
        
        # Procesar a través del router
        response = await chat(chat_request)
        logger.info(f"Respuesta generada para WhatsApp: {response.response[:50]}...")
        
        # Aquí enviarías la respuesta a la API de WhatsApp
        # send_whatsapp_message(from_number, response.response)
        
        # Registrar respuesta enviada a WhatsApp
        agent_logger.log_interaction(
            agent_type="whatsapp_webhook",
            input_data={},  # Ya registrado anteriormente
            output_data={"status": "success", "response": response.response},
            metadata={"phase": "webhook_response"}
        )
        
        return {"status": "success", "response": response.response}
    
    except Exception as e:
        logger.error(f"Error en webhook de WhatsApp: {str(e)}")
        
        # Registrar error
        agent_logger.log_interaction(
            agent_type="whatsapp_webhook",
            input_data={},  # Ya registrado anteriormente
            output_data={"status": "error", "message": str(e)},
            metadata={"phase": "webhook_error"}
        )
        
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

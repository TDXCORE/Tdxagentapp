"""
Script para ejecutar agentes TDX con integración de LangSmith.
Este script permite ejecutar cualquier agente desde la línea de comandos
y asegura que todas las interacciones se registren en LangSmith.

Uso:
    python run_agent.py [agent_name] [message]

Ejemplos:
    python run_agent.py router "Hola, necesito una aplicación web"
    python run_agent.py prd "Quiero un sistema de inventario"
    python run_agent.py quotation "¿Cuánto cuesta desarrollar una app?"
"""

import os
import sys
import json
import asyncio
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Añadir directorio raíz al path para importar langsmith_config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from langsmith_config import configure_env_vars, trace_agent

# Cargar variables de entorno
load_dotenv()

# Configurar variables de entorno para LangSmith
configure_env_vars()

# Definir modelos de datos
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    client_info: Optional[Dict[str, Any]] = None
    agent_type: str = "router"
    user_id: Optional[str] = None

async def run_router_agent(message: str):
    """
    Ejecuta el agente router con un mensaje.
    
    Args:
        message: El mensaje del usuario
    """
    from agents.router_agent import chat
    
    # Crear solicitud
    request = ChatRequest(
        messages=[Message(role="user", content=message)],
        client_info={"source": "run_agent.py"},
        user_id="test_user_langsmith"
    )
    
    # Registrar en LangSmith
    trace_ctx = trace_agent("router_agent_console",
                           {"message": message, "agent": "router"},
                           {},
                           {"source": "console"})
    
    with trace_ctx:
        # Ejecutar agente
        response = await chat(request)
        
        # Registrar outputs en LangSmith
        trace_ctx.update_outputs({
            "response": response.response,
            "intent_detected": response.intent_detected,
            "next_agent": response.next_agent,
            "confidence": str(response.confidence)
        })
        
        # Mostrar respuesta
        print("\n=== Respuesta del Agente Router ===")
        print(f"Respuesta: {response.response}")
        print(f"Intención detectada: {response.intent_detected}")
        print(f"Siguiente agente: {response.next_agent}")
        print(f"Confianza: {response.confidence}")
        
        return response

async def run_prd_agent(message: str):
    """
    Ejecuta el agente PRD con un mensaje.
    
    Args:
        message: El mensaje del usuario
    """
    from agents.prd_agent import generate_prd
    
    # Crear solicitud
    messages = [{"role": "user", "content": message}]
    
    # Registrar en LangSmith
    trace_ctx = trace_agent("prd_agent_console",
                           {"message": message, "agent": "prd"},
                           {},
                           {"source": "console"})
    
    with trace_ctx:
        # Ejecutar agente
        response = await generate_prd(messages, "test_user_langsmith")
        
        # Registrar outputs en LangSmith
        trace_ctx.update_outputs({
            "response": response.get('response', 'No hay respuesta')
        })
        
        # Mostrar respuesta
        print("\n=== Respuesta del Agente PRD ===")
        print(f"Respuesta: {response.get('response', 'No hay respuesta')}")
        
        return response

async def run_quotation_agent(message: str):
    """
    Ejecuta el agente de cotización con un mensaje.
    
    Args:
        message: El mensaje del usuario
    """
    from agents.quotation_agent import generate_quotation
    
    # Crear solicitud
    messages = [{"role": "user", "content": message}]
    
    # Registrar en LangSmith
    trace_ctx = trace_agent("quotation_agent_console",
                           {"message": message, "agent": "quotation"},
                           {},
                           {"source": "console"})
    
    with trace_ctx:
        # Ejecutar agente
        response = await generate_quotation(messages, "test_user_langsmith")
        
        # Registrar outputs en LangSmith
        trace_ctx.update_outputs({
            "response": response.get('response', 'No hay respuesta')
        })
        
        # Mostrar respuesta
        print("\n=== Respuesta del Agente de Cotización ===")
        print(f"Respuesta: {response.get('response', 'No hay respuesta')}")
        
        return response

async def run_contract_agent(message: str):
    """
    Ejecuta el agente de contratos con un mensaje.
    
    Args:
        message: El mensaje del usuario
    """
    from agents.contract_agent import generate_contract_info
    
    # Crear solicitud
    messages = [{"role": "user", "content": message}]
    
    # Registrar en LangSmith
    trace_ctx = trace_agent("contract_agent_console",
                           {"message": message, "agent": "contract"},
                           {},
                           {"source": "console"})
    
    with trace_ctx:
        # Ejecutar agente
        response = await generate_contract_info(messages, "test_user_langsmith")
        
        # Registrar outputs en LangSmith
        trace_ctx.update_outputs({
            "response": response.get('response', 'No hay respuesta')
        })
        
        # Mostrar respuesta
        print("\n=== Respuesta del Agente de Contratos ===")
        print(f"Respuesta: {response.get('response', 'No hay respuesta')}")
        
        return response

async def run_meeting_agent(message: str):
    """
    Ejecuta el agente de reuniones con un mensaje.
    
    Args:
        message: El mensaje del usuario
    """
    from agents.meeting_scheduler import schedule_meeting
    
    # Crear solicitud
    messages = [{"role": "user", "content": message}]
    
    # Registrar en LangSmith
    trace_ctx = trace_agent("meeting_agent_console",
                           {"message": message, "agent": "meeting"},
                           {},
                           {"source": "console"})
    
    with trace_ctx:
        # Ejecutar agente
        response = await schedule_meeting(messages, "test_user_langsmith")
        
        # Registrar outputs en LangSmith
        trace_ctx.update_outputs({
            "response": response.get('response', 'No hay respuesta')
        })
        
        # Mostrar respuesta
        print("\n=== Respuesta del Agente de Reuniones ===")
        print(f"Respuesta: {response.get('response', 'No hay respuesta')}")
        
        return response

async def run_orchestrator_agent(message: str):
    """
    Ejecuta el agente orquestador con un mensaje.
    
    Args:
        message: El mensaje del usuario
    """
    from agents.orchestrator_agent import orchestrate
    
    # Crear solicitud
    request_data = {
        "messages": [{"role": "user", "content": message}],
        "client_info": {"source": "run_agent.py"},
        "current_agent": "router",
        "intent_detected": "general",
        "user_id": "test_user_langsmith",
        "current_phase": "QUALIFICATION",
        "session_id": "test_session_langsmith"
    }
    
    # Registrar en LangSmith
    with trace_agent("orchestrator_agent_console", 
                    {"message": message, "agent": "orchestrator"}, 
                    {}, 
                    {"source": "console"}):
        # Ejecutar agente
        response = await orchestrate(request_data)
        
        # Mostrar respuesta
        print("\n=== Respuesta del Agente Orquestador ===")
        print(f"Respuesta: {response.get('response_content', 'No hay respuesta')}")
        print(f"Siguiente agente: {response.get('next_agent', 'No especificado')}")
        
        return response

async def main():
    """
    Función principal que ejecuta el agente especificado.
    """
    if len(sys.argv) < 3:
        print("Uso: python run_agent.py [agent_name] [message]")
        print("\nAgentes disponibles:")
        print("  router     - Agente router principal")
        print("  prd        - Agente de requisitos")
        print("  quotation  - Agente de cotización")
        print("  contract   - Agente de contratos")
        print("  meeting    - Agente de reuniones")
        print("  orchestrator - Agente orquestador")
        print("  all        - Ejecutar todos los agentes en secuencia")
        return
    
    agent_name = sys.argv[1].lower()
    message = sys.argv[2]
    
    print(f"Ejecutando agente: {agent_name}")
    print(f"Mensaje: {message}")
    print("Todas las interacciones serán registradas en LangSmith.")
    
    if agent_name == "router":
        await run_router_agent(message)
    elif agent_name == "prd":
        await run_prd_agent(message)
    elif agent_name == "quotation":
        await run_quotation_agent(message)
    elif agent_name == "contract":
        await run_contract_agent(message)
    elif agent_name == "meeting":
        await run_meeting_agent(message)
    elif agent_name == "orchestrator":
        await run_orchestrator_agent(message)
    elif agent_name == "all":
        print("\n=== Ejecutando todos los agentes en secuencia ===")
        await run_router_agent(message)
        await run_prd_agent(message)
        await run_quotation_agent(message)
        await run_contract_agent(message)
        await run_meeting_agent(message)
        await run_orchestrator_agent(message)
    else:
        print(f"Agente '{agent_name}' no reconocido.")
    
    print("\nEjecución completada. Verifica las trazas en LangSmith:")
    print("https://smith.langchain.com/")

if __name__ == "__main__":
    asyncio.run(main())
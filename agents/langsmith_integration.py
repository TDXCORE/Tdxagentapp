"""
Módulo para integrar LangSmith en todos los agentes TDX.
Este módulo proporciona funciones y decoradores para asegurar que
todas las interacciones de los agentes se registren en LangSmith.
"""

import os
import sys
import functools
import inspect
from typing import Callable, Dict, Any, Optional

# Añadir directorio raíz al path para importar langsmith_config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from langsmith_config import trace_agent

def trace_agent_function(agent_name: str):
    """
    Decorador para rastrear funciones de agentes en LangSmith.
    
    Args:
        agent_name: Nombre del agente
        
    Returns:
        Callable: Decorador configurado
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Extraer información de los argumentos
            # Intentar obtener el mensaje y el user_id
            message = None
            user_id = None
            
            # Buscar en args
            for arg in args:
                if isinstance(arg, list) and len(arg) > 0 and isinstance(arg[0], dict) and "content" in arg[0]:
                    message = arg[0].get("content")
                elif isinstance(arg, str):
                    user_id = arg
            
            # Buscar en kwargs
            if "messages" in kwargs and kwargs["messages"] and isinstance(kwargs["messages"][0], dict):
                message = kwargs["messages"][0].get("content")
            if "user_id" in kwargs:
                user_id = kwargs["user_id"]
            
            # Preparar inputs para LangSmith
            inputs = {
                "agent": agent_name,
                "function": func.__name__,
            }
            
            if message:
                inputs["message"] = message
            if user_id:
                inputs["user_id"] = user_id
            
            # Añadir todos los argumentos posicionales y de palabras clave
            for i, arg in enumerate(args):
                if isinstance(arg, (str, int, float, bool, list, dict)):
                    inputs[f"arg_{i}"] = str(arg)[:100]  # Limitar longitud
            
            for key, value in kwargs.items():
                if isinstance(value, (str, int, float, bool)):
                    inputs[key] = value
                elif isinstance(value, (list, dict)):
                    inputs[key] = str(value)[:100]  # Limitar longitud
            
            # Ejecutar función con tracing
            with trace_agent(f"{agent_name}_{func.__name__}", inputs, {}, {"source": "agent_function"}):
                result = await func(*args, **kwargs)
                
                # Actualizar outputs
                outputs = {}
                if isinstance(result, dict):
                    for key, value in result.items():
                        if isinstance(value, (str, int, float, bool)):
                            outputs[key] = value
                        elif isinstance(value, (list, dict)):
                            outputs[key] = str(value)[:100]  # Limitar longitud
                
                return result
                
        return wrapper
    return decorator

def apply_tracing_to_module(module_name: str, agent_name: str):
    """
    Aplica tracing a todas las funciones asíncronas en un módulo.
    
    Args:
        module_name: Nombre del módulo
        agent_name: Nombre del agente
    """
    import importlib
    
    try:
        # Importar el módulo
        module = importlib.import_module(module_name)
        
        # Encontrar todas las funciones asíncronas
        for name, obj in inspect.getmembers(module):
            if inspect.iscoroutinefunction(obj) and not name.startswith('_'):
                # Aplicar decorador
                setattr(module, name, trace_agent_function(agent_name)(obj))
                
        print(f"Tracing aplicado a {module_name}")
        return True
    except Exception as e:
        print(f"Error al aplicar tracing a {module_name}: {e}")
        return False

def initialize_langsmith_for_all_agents():
    """
    Inicializa LangSmith para todos los agentes.
    """
    # Lista de agentes y sus módulos
    agents = [
        ("router", "agents.router_agent"),
        ("prd", "agents.prd_agent"),
        ("quotation", "agents.quotation_agent"),
        ("contract", "agents.contract_agent"),
        ("meeting", "agents.meeting_scheduler"),
        ("orchestrator", "agents.orchestrator_agent"),
        ("evaluator", "agents.evaluator"),
        ("rag", "agents.rag_system")
    ]
    
    # Aplicar tracing a cada módulo
    for agent_name, module_name in agents:
        apply_tracing_to_module(module_name, agent_name)
    
    print("LangSmith inicializado para todos los agentes")

# Inicializar LangSmith para todos los agentes al importar este módulo
if __name__ != "__main__":
    initialize_langsmith_for_all_agents()
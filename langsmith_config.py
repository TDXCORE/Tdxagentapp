"""
Configuración de LangSmith para observabilidad de agentes.
Este archivo configura la integración con LangSmith para monitorear y depurar
las aplicaciones basadas en LangChain.
"""

import os
from langsmith import Client
from langchain.callbacks.tracers.langchain import LangChainTracer
from langchain.callbacks.manager import CallbackManager
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de LangSmith
LANGSMITH_TRACING = os.getenv("LANGSMITH_TRACING", "true").lower() == "true"
LANGSMITH_ENDPOINT = os.getenv("LANGSMITH_ENDPOINT", "https://api.smith.langchain.com")
LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY", "")
LANGSMITH_PROJECT = os.getenv("LANGSMITH_PROJECT", "pr-spotless-driveway-65")

# Inicializar cliente de LangSmith
langsmith_client = Client(
    api_key=LANGSMITH_API_KEY,
    api_url=LANGSMITH_ENDPOINT,
)

# Crear tracer para LangChain
tracer = LangChainTracer(
    project_name=LANGSMITH_PROJECT,
)

# Crear callback manager
callback_manager = CallbackManager([tracer])

def get_callback_manager():
    """
    Obtiene el callback manager para LangChain.
    
    Returns:
        CallbackManager: El callback manager configurado.
    """
    return callback_manager

class TraceContext:
    """Contexto para tracing de agentes."""
    
    def __init__(self, agent_name, inputs, outputs=None, metadata=None):
        self.agent_name = agent_name
        self.inputs = inputs
        self.outputs = outputs or {}
        self.metadata = metadata or {}
        self.run = None
    
    def __enter__(self):
        if not LANGSMITH_TRACING or not LANGSMITH_API_KEY:
            return self
        
        try:
            # Crear run en LangSmith
            self.run = langsmith_client.create_run(
                name=self.agent_name,
                inputs=self.inputs,
                run_type="chain",
                project_name=LANGSMITH_PROJECT,
                extra=self.metadata,
            )
            print(f"Creado run en LangSmith con ID: {self.run.id}")
        except Exception as e:
            print(f"Error al crear run en LangSmith: {e}")
        
        return self
    
    def set_output(self, key, value):
        """Establece un valor de salida."""
        self.outputs[key] = value
        return self
    
    def update_outputs(self, outputs_dict):
        """Actualiza los outputs con un diccionario."""
        self.outputs.update(outputs_dict)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.run is not None:
            try:
                # Asegurarse de que outputs no esté vacío
                if not self.outputs:
                    self.outputs = {"result": "Completed successfully"}
                
                # Actualizar run con outputs
                langsmith_client.update_run(
                    self.run.id,
                    outputs=self.outputs,
                    end_time=None,  # Automáticamente se establece al momento actual
                )
                print(f"Actualizado run en LangSmith con outputs: {self.outputs}")
            except Exception as e:
                print(f"Error al actualizar run en LangSmith: {e}")

def trace_agent(agent_name, inputs, outputs, metadata=None):
    """
    Registra una interacción de agente en LangSmith.
    
    Args:
        agent_name (str): Nombre del agente.
        inputs (dict): Entradas del agente.
        outputs (dict): Salidas del agente.
        metadata (dict, optional): Metadatos adicionales.
    
    Returns:
        TraceContext: Contexto para tracing de agentes.
    """
    return TraceContext(agent_name, inputs, outputs, metadata)

def configure_env_vars():
    """
    Configura las variables de entorno necesarias para LangSmith.
    """
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_ENDPOINT"] = LANGSMITH_ENDPOINT
    os.environ["LANGCHAIN_API_KEY"] = LANGSMITH_API_KEY
    os.environ["LANGCHAIN_PROJECT"] = LANGSMITH_PROJECT
"""
Script para probar la integración de LangSmith con los agentes TDX.
Este script ejecuta una llamada simple a un modelo de chat para verificar
que las trazas se envían correctamente a LangSmith.
"""

import os
import sys
from dotenv import load_dotenv
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

# Añadir directorio raíz al path para importar langsmith_config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from langsmith_config import configure_env_vars, trace_agent

# Cargar variables de entorno
load_dotenv()

# Configurar variables de entorno para LangSmith
configure_env_vars()

def main():
    """
    Función principal que ejecuta una prueba simple de LangSmith.
    """
    print("Iniciando prueba de integración con LangSmith...")
    
    # Crear un modelo de chat
    llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0.7,
        max_tokens=400
    )
    
    # Crear un prompt
    prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content="Eres un asistente útil y conciso."),
        HumanMessage(content="¿Qué es LangSmith y para qué sirve?")
    ])
    
    # Ejecutar con tracing
    trace_inputs = {
        "prompt": "¿Qué es LangSmith y para qué sirve?",
        "test_type": "integration_test"
    }
    
    print("Enviando solicitud al modelo con tracing de LangSmith...")
    
    with trace_agent("test_langsmith", trace_inputs, {}, {"test": True}):
        response = llm.invoke(prompt.format())
    
    print("\nRespuesta del modelo:")
    print(response)
    print("\nLa traza ha sido enviada a LangSmith. Verifica en el dashboard:")
    print("https://smith.langchain.com/")

if __name__ == "__main__":
    main()
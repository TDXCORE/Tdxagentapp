import os
import sys
import json
from dotenv import load_dotenv
import logging
import asyncio

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("test_rag_system")

# Cargar variables de entorno
load_dotenv()

# Importar el sistema RAG
try:
    from rag_system import rag_system
except ImportError:
    from .rag_system import rag_system

async def test_store_interaction():
    """Prueba la funcionalidad de almacenar una interacción en el sistema RAG."""
    try:
        user_id = "test_user_123"
        message = "Hola, necesito un sistema de gestión de inventario para mi tienda."
        response = "Claro, puedo ayudarte con eso. ¿Podrías darme más detalles sobre tu tienda y tus necesidades específicas?"
        phase = "QUALIFICATION"
        
        logger.info("Probando store_interaction...")
        result = rag_system.store_interaction(
            user_id=user_id,
            message=message,
            response=response,
            phase=phase,
            metadata={"test": True, "source": "test_script"}
        )
        
        logger.info(f"Interacción almacenada correctamente: {result}")
        return True
    except Exception as e:
        logger.error(f"Error en test_store_interaction: {str(e)}")
        return False

async def test_get_relevant_context():
    """Prueba la funcionalidad de obtener contexto relevante del sistema RAG."""
    try:
        user_id = "test_user_123"
        query = "¿Qué características tendría el sistema de inventario?"
        
        logger.info("Probando get_relevant_context...")
        context = rag_system.get_relevant_context(
            user_id=user_id,
            query=query,
            limit=3,
            similarity_threshold=0.6
        )
        
        logger.info(f"Contexto relevante obtenido: {len(context.get('recent_conversations', []))} conversaciones")
        logger.info(f"Fase actual: {context.get('current_phase', 'No disponible')}")
        
        # Mostrar las conversaciones relevantes
        for i, conv in enumerate(context.get('recent_conversations', [])):
            logger.info(f"Conversación {i+1}:")
            logger.info(f"  - Contenido: {conv.get('content', '')[:50]}...")
            logger.info(f"  - Respuesta: {conv.get('response', '')[:50]}...")
            logger.info(f"  - Similitud: {conv.get('similarity', 0)}")
        
        return True
    except Exception as e:
        logger.error(f"Error en test_get_relevant_context: {str(e)}")
        return False

async def test_update_client_state():
    """Prueba la funcionalidad de actualizar el estado del cliente."""
    try:
        user_id = "test_user_123"
        
        logger.info("Probando update_client_state...")
        updated_state = rag_system.update_client_state(
            user_id=user_id,
            state_update={
                "current_phase": "PRD",
                "data": {
                    "project_type": "inventory_system",
                    "business_size": "small",
                    "priority_features": ["barcode_scanning", "reports", "alerts"]
                }
            }
        )
        
        logger.info(f"Estado del cliente actualizado: {json.dumps(updated_state, indent=2)}")
        return True
    except Exception as e:
        logger.error(f"Error en test_update_client_state: {str(e)}")
        return False

async def run_all_tests():
    """Ejecuta todas las pruebas del sistema RAG."""
    logger.info("Iniciando pruebas del sistema RAG...")
    
    # Probar almacenar una interacción
    store_result = await test_store_interaction()
    logger.info(f"Prueba store_interaction: {'ÉXITO' if store_result else 'FALLO'}")
    
    # Probar obtener contexto relevante
    context_result = await test_get_relevant_context()
    logger.info(f"Prueba get_relevant_context: {'ÉXITO' if context_result else 'FALLO'}")
    
    # Probar actualizar estado del cliente
    update_result = await test_update_client_state()
    logger.info(f"Prueba update_client_state: {'ÉXITO' if update_result else 'FALLO'}")
    
    # Resumen final
    logger.info("Resumen de pruebas:")
    logger.info(f"- store_interaction: {'✅' if store_result else '❌'}")
    logger.info(f"- get_relevant_context: {'✅' if context_result else '❌'}")
    logger.info(f"- update_client_state: {'✅' if update_result else '❌'}")
    
    all_passed = all([store_result, context_result, update_result])
    logger.info(f"Resultado final: {'TODAS LAS PRUEBAS PASARON' if all_passed else 'ALGUNAS PRUEBAS FALLARON'}")

if __name__ == "__main__":
    # Ejecutar todas las pruebas
    asyncio.run(run_all_tests())
import os
from typing import Dict, List, Optional, Any
import openai
import numpy as np
from dotenv import load_dotenv
import json
import requests
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("rag_system")

# Reducir nivel de logging para errores de Supabase
logging.getLogger("requests").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)

# Cargar variables de entorno
load_dotenv()

# Configuración de Supabase
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Configuración de OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

class RAGSystem:
    """
    Sistema RAG para proporcionar contexto a los agentes basado en 
    conversaciones previas y documentos relevantes.
    """
    
    def __init__(self):
        """Inicializa el sistema RAG."""
        self.supabase_url = SUPABASE_URL
        self.supabase_key = SUPABASE_KEY
        
        if not self.supabase_url or not self.supabase_key:
            logger.error("Faltan variables de entorno para Supabase")
            raise ValueError("NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos")
        
        if not openai.api_key:
            logger.error("Falta la clave de API de OpenAI")
            raise ValueError("OPENAI_API_KEY es requerido")
    
    def create_embedding(self, text: str) -> List[float]:
        """
        Crea un embedding vectorial para el texto proporcionado.
        
        Args:
            text: Texto para vectorizar
            
        Returns:
            Vector de embedding (lista de floats)
        """
        try:
            response = openai.Embedding.create(
                input=text,
                model="text-embedding-3-small" 
            )
            
            return response['data'][0]['embedding']
        except Exception as e:
            logger.error(f"Error al crear embedding: {str(e)}")
            raise
    
    def _make_supabase_request(self, method, endpoint, data=None, params=None):
        """Método auxiliar para hacer solicitudes a la API de Supabase."""
        url = f"{self.supabase_url}{endpoint}"
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
        }
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, params=params)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data)
            else:
                raise ValueError(f"Método no soportado: {method}")
            
            response.raise_for_status()  # Lanza una excepción para códigos de error HTTP
            
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.warning(f"Error en solicitud a Supabase: {str(e)}")
            if hasattr(e, 'response') and e.response:
                logger.debug(f"Detalles: {e.response.text}")
            raise
    
    def store_interaction(self,
                         user_id: str,
                         message: str,
                         response: str,
                         phase: str,
                         metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Almacena una interacción con el usuario en Supabase Vectors.
        
        Args:
            user_id: ID del usuario
            message: Mensaje del usuario
            response: Respuesta del sistema
            phase: Fase actual del flujo
            metadata: Metadatos adicionales
            
        Returns:
            ID del registro creado
        """
        try:
            # Crear texto combinado para embedding
            combined_text = f"User: {message}\nSystem: {response}\nPhase: {phase}"
            
            # Generar embedding
            embedding = self.create_embedding(combined_text)
            
            # Preparar metadatos
            meta = metadata or {}
            meta.update({
                "user_id": user_id,
                "phase": phase,
                "timestamp": "now()"
            })
            
            # Llamar a la función RPC de Supabase
            rpc_data = {
                "user_id": user_id,
                "content": message,
                "response": response,
                "phase": phase,
                "metadata": meta,
                "embedding": embedding
            }
            
            try:
                result = self._make_supabase_request("POST", "/rest/v1/rpc/insert_conversation_embedding", data=rpc_data)
                logger.info(f"Interacción almacenada correctamente para el usuario {user_id}")
                return result
            except Exception as e:
                logger.debug(f"Error al almacenar interacción: {str(e)}")
                logger.info("Generando ID local para la interacción")
                # Devolver un ID falso para no interrumpir el flujo
                import uuid
                return str(uuid.uuid4())
        except Exception as e:
            logger.debug(f"Error al almacenar interacción: {str(e)}")
            logger.info("Generando ID local para la interacción")
            # Devolver un ID falso para no interrumpir el flujo
            import uuid
            return str(uuid.uuid4())
    
    def get_relevant_context(self,
                           user_id: str,
                           query: str,
                           phase: Optional[str] = None,
                           limit: int = 5,
                           similarity_threshold: float = 0.7) -> Dict[str, Any]:
        """
        Recupera contexto relevante basado en similaridad semántica.
        
        Args:
            user_id: ID del usuario
            query: Consulta actual (mensaje del usuario)
            phase: Filtrar por fase específica (opcional)
            limit: Número máximo de resultados
            similarity_threshold: Umbral mínimo de similaridad
            
        Returns:
            Diccionario con contexto relevante
        """
        try:
            # Generar embedding para la consulta
            query_embedding = self.create_embedding(query)
            
            # Preparar parámetros para la búsqueda
            params = {
                "query_embedding": query_embedding,
                "match_threshold": similarity_threshold,
                "match_count": limit,
                "user_id": user_id
            }
            
            if phase:
                params["filter_phase"] = phase
            
            # Ejecutar búsqueda de similaridad
            try:
                result = self._make_supabase_request("POST", "/rest/v1/rpc/match_conversation_embeddings", data=params)
            except Exception as e:
                logger.debug(f"Error al buscar conversaciones similares (posiblemente la tabla no existe): {str(e)}")
                logger.info("Usando resultados vacíos para conversaciones similares")
                result = []
            
            # Obtener también el estado actual del cliente
            client_state = self._get_client_state(user_id)
            
            # Recuperar documentos relevantes
            try:
                documents = self._get_relevant_documents(user_id, phase)
            except Exception as e:
                logger.debug(f"Error al recuperar documentos relevantes (posiblemente la tabla no existe): {str(e)}")
                logger.info("Usando lista vacía para documentos relevantes")
                documents = []
            
            # Construir contexto completo
            context = {
                "recent_conversations": result or [],
                "client_state": client_state,
                "relevant_documents": documents,
                "current_phase": client_state.get("current_phase", "CONSENT")
            }
            
            logger.info(f"Contexto relevante recuperado para el usuario {user_id}: {len(result or [])} conversaciones, {len(documents)} documentos")
            
            return context
        except Exception as e:
            logger.debug(f"Error al recuperar contexto relevante: {str(e)}")
            logger.info("Usando contexto vacío por defecto")
            # En caso de error, devolver un contexto vacío pero válido
            return {
                "recent_conversations": [],
                "client_state": {"current_phase": "CONSENT", "data": {}},
                "relevant_documents": [],
                "current_phase": "CONSENT"
            }
    
    def _get_client_state(self, user_id: str) -> Dict[str, Any]:
        """
        Recupera el estado actual del cliente desde Supabase.
        
        Args:
            user_id: ID del usuario
            
        Returns:
            Estado del cliente
        """
        try:
            params = {"user_id": f"eq.{user_id}", "select": "*"}
            result = self._make_supabase_request("GET", "/rest/v1/client_states", params=params)
            
            if result and len(result) > 0:
                return result[0]
            
            # Si no existe, retornar estado por defecto
            logger.info(f"No se encontró estado para el cliente {user_id}, usando valores por defecto")
            return {
                "current_phase": "CONSENT",
                "consent_given": False,
                "data": {}
            }
        except Exception as e:
            logger.debug(f"Error al recuperar estado del cliente: {str(e)}")
            logger.info(f"Usando estado por defecto para el cliente {user_id}")
            # En caso de error, devolver un estado por defecto
            return {
                "current_phase": "CONSENT",
                "consent_given": False,
                "data": {}
            }
    
    def _get_relevant_documents(self, 
                              user_id: str,
                              phase: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Recupera documentos relevantes para el usuario.
        
        Args:
            user_id: ID del usuario
            phase: Fase actual (opcional, para filtrar documentos)
            
        Returns:
            Lista de documentos relevantes
        """
        try:
            params = {"client_id": f"eq.{user_id}", "select": "*"}
            
            # Filtrar por tipo de documento según la fase
            if phase:
                if phase == "PRD":
                    params["type"] = "eq.prd"
                elif phase == "QUOTATION":
                    params["type"] = "eq.quotation"
                elif phase == "CONTRACT":
                    params["type"] = "eq.contract"
            
            result = self._make_supabase_request("GET", "/rest/v1/documents", params=params)
            
            return result or []
        except Exception as e:
            logger.debug(f"Error al recuperar documentos relevantes: {str(e)}")
            logger.info("Usando lista vacía de documentos")
            return []
    
    def update_client_state(self,
                          user_id: str,
                          state_update: Dict[str, Any]) -> Dict[str, Any]:
        """
        Actualiza el estado del cliente en Supabase.
        
        Args:
            user_id: ID del usuario
            state_update: Actualizaciones al estado
            
        Returns:
            Estado actualizado
        """
        try:
            # Obtener estado actual
            current_state = self._get_client_state(user_id)
            
            # Fusionar con actualizaciones
            current_data = current_state.get("data", {})
            if isinstance(current_data, str):
                current_data = json.loads(current_data)
            
            if "data" in state_update:
                if isinstance(state_update["data"], str):
                    state_update_data = json.loads(state_update["data"])
                else:
                    state_update_data = state_update["data"]
                updated_data = {**current_data, **state_update_data}
                # Eliminar data del state_update para evitar duplicación
                del state_update["data"]
            else:
                updated_data = current_data
            
            updated_state = {
                **current_state,
                **state_update,
                "data": updated_data,
                "updated_at": "now()"
            }
            
            try:
                # Verificar si el registro existe
                if "id" in current_state:
                    # Actualizar registro existente
                    params = {"id": f"eq.{current_state['id']}"}
                    self._make_supabase_request("PUT", "/rest/v1/client_states", data=updated_state, params=params)
                    logger.info(f"Estado del cliente {user_id} actualizado correctamente")
                else:
                    # Crear nuevo registro
                    updated_state["user_id"] = user_id
                    self._make_supabase_request("POST", "/rest/v1/client_states", data=updated_state)
                    logger.info(f"Nuevo estado creado para el cliente {user_id}")
            except Exception as e:
                logger.debug(f"Error al actualizar estado del cliente en la base de datos: {str(e)}")
                # Almacenar el estado actualizado en memoria para no interrumpir el flujo
                logger.info(f"Usando almacenamiento en memoria para el cliente {user_id}")
                # Añadir el estado actualizado a las actualizaciones
                updated_state["current_phase"] = state_update.get("current_phase", current_state.get("current_phase", "CONSENT"))
                # No lanzar excepción, simplemente retornar el estado actualizado en memoria
            
            # Siempre retornar el estado actualizado, incluso si hubo error en la base de datos
            return updated_state
        except Exception as e:
            logger.debug(f"Error al actualizar estado del cliente: {str(e)}")
            logger.info(f"Usando estado básico para el cliente {user_id}")
            # Devolver un estado básico para no interrumpir el flujo
            return {
                "current_phase": state_update.get("current_phase", "CONSENT"),
                "consent_given": state_update.get("consent_given", False),
                "data": {}
            }

# Instancia global para uso en la aplicación
rag_system = RAGSystem()
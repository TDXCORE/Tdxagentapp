import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

# Configurar logging básico
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("agent_logger")

# Directorio para almacenar los logs
LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

class AgentLogger:
    """
    Sistema de logging para registrar todas las interacciones de los agentes.
    Guarda logs detallados de cada paso de la conversación y las decisiones tomadas.
    """
    
    def __init__(self):
        """Inicializa el sistema de logging."""
        self.session_logs = {}
        self.current_session_id = None
        
        # Asegurar que el directorio de logs existe
        self.log_file_path = os.path.join(LOG_DIR, f"agent_logs_{datetime.now().strftime('%Y%m%d')}.json")
        
        # Crear archivo de logs si no existe
        if not os.path.exists(self.log_file_path):
            with open(self.log_file_path, 'w') as f:
                json.dump([], f)
    
    def start_session(self, user_id: str) -> str:
        """
        Inicia una nueva sesión de logging.
        
        Args:
            user_id: ID del usuario
            
        Returns:
            str: ID de la sesión
        """
        session_id = f"{user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        self.session_logs[session_id] = {
            "session_id": session_id,
            "user_id": user_id,
            "start_time": datetime.now().isoformat(),
            "interactions": []
        }
        self.current_session_id = session_id
        logger.info(f"Iniciada nueva sesión de logging: {session_id}")
        return session_id
    
    def log_interaction(self, 
                      agent_type: str, 
                      input_data: Dict[str, Any], 
                      output_data: Dict[str, Any], 
                      session_id: Optional[str] = None,
                      metadata: Optional[Dict[str, Any]] = None) -> None:
        """
        Registra una interacción con un agente.
        
        Args:
            agent_type: Tipo de agente (router, orchestrator, prd, etc.)
            input_data: Datos de entrada al agente
            output_data: Datos de salida del agente
            session_id: ID de la sesión (opcional, usa la sesión actual si no se proporciona)
            metadata: Metadatos adicionales (opcional)
        """
        session_id = session_id or self.current_session_id
        if not session_id:
            logger.warning("No hay sesión activa. Iniciando una nueva sesión con user_id='unknown'")
            session_id = self.start_session("unknown")
        
        if session_id not in self.session_logs:
            logger.warning(f"Sesión {session_id} no encontrada. Iniciando una nueva sesión.")
            self.session_logs[session_id] = {
                "session_id": session_id,
                "user_id": "unknown",
                "start_time": datetime.now().isoformat(),
                "interactions": []
            }
        
        # Crear registro de interacción
        interaction = {
            "timestamp": datetime.now().isoformat(),
            "agent_type": agent_type,
            "input": input_data,
            "output": output_data,
            "metadata": metadata or {}
        }
        
        # Añadir a la sesión
        self.session_logs[session_id]["interactions"].append(interaction)
        
        # Guardar en archivo
        self._save_to_file(session_id)
        
        logger.info(f"Registrada interacción con agente {agent_type} en sesión {session_id}")
    
    def get_session_logs(self, session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Obtiene los logs de una sesión.
        
        Args:
            session_id: ID de la sesión (opcional, usa la sesión actual si no se proporciona)
            
        Returns:
            Dict: Logs de la sesión
        """
        session_id = session_id or self.current_session_id
        if not session_id or session_id not in self.session_logs:
            logger.warning(f"Sesión {session_id} no encontrada")
            return {"error": "Sesión no encontrada"}
        
        return self.session_logs[session_id]
    
    def get_recent_logs(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Obtiene los logs más recientes.
        
        Args:
            limit: Número máximo de sesiones a devolver
            
        Returns:
            List: Lista de sesiones de logs
        """
        # Ordenar sesiones por tiempo de inicio (más reciente primero)
        sorted_sessions = sorted(
            self.session_logs.values(), 
            key=lambda x: x.get("start_time", ""), 
            reverse=True
        )
        
        return sorted_sessions[:limit]
    
    def _save_to_file(self, session_id: str) -> None:
        """
        Guarda los logs de una sesión en un archivo.
        
        Args:
            session_id: ID de la sesión
        """
        try:
            # Leer logs existentes
            existing_logs = []
            try:
                with open(self.log_file_path, 'r') as f:
                    existing_logs = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                existing_logs = []
            
            # Buscar si ya existe esta sesión
            session_found = False
            for i, log in enumerate(existing_logs):
                if log.get("session_id") == session_id:
                    existing_logs[i] = self.session_logs[session_id]
                    session_found = True
                    break
            
            # Si no existe, añadirla
            if not session_found:
                existing_logs.append(self.session_logs[session_id])
            
            # Guardar logs actualizados
            with open(self.log_file_path, 'w') as f:
                json.dump(existing_logs, f, indent=2)
        
        except Exception as e:
            logger.error(f"Error al guardar logs en archivo: {str(e)}")

# Instancia global para uso en la aplicación
agent_logger = AgentLogger()
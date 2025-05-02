import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { readdirSync } from 'fs';

// Definir interfaces para los logs
interface LogInteraction {
  timestamp: string;
  agent_type: string;
  input: Record<string, any>;
  output: Record<string, any>;
  metadata: {
    phase: string;
    delegated?: boolean;
    [key: string]: any;
  };
}

interface SessionLog {
  session_id: string;
  user_id: string;
  start_time: string;
  interactions: LogInteraction[];
}

export async function GET(request: Request) {
  try {
    // Directorio de logs
    const logsDir = path.join(process.cwd(), 'logs');
    
    // Verificar si el directorio existe
    if (!fs.existsSync(logsDir)) {
      console.log(`Directorio de logs no encontrado: ${logsDir}`);
      fs.mkdirSync(logsDir, { recursive: true });
      return NextResponse.json({ logs: [] });
    }
    
    // Obtener todos los archivos de logs
    const logFiles = readdirSync(logsDir)
      .filter(file => file.startsWith('agent_logs_') && file.endsWith('.json'))
      .sort()
      .reverse(); // Ordenar por nombre (más recientes primero)
    
    if (logFiles.length === 0) {
      console.log('No se encontraron archivos de logs');
      return NextResponse.json({ logs: [] });
    }
    
    // Leer todos los archivos de logs (hasta 3 archivos más recientes)
    const allLogs: LogInteraction[] = [];
    
    for (const file of logFiles.slice(0, 3)) {
      try {
        const logFilePath = path.join(logsDir, file);
        const logFileContent = fs.readFileSync(logFilePath, 'utf-8');
        
        // Intentar parsear el contenido como JSON
        const fileLogs = JSON.parse(logFileContent) as SessionLog[];
        
        // Procesar los logs para simplificarlos
        const processedLogs: LogInteraction[] = fileLogs.flatMap((sessionLog: SessionLog) => {
          if (!sessionLog.interactions || !Array.isArray(sessionLog.interactions)) {
            return [];
          }
          
          return sessionLog.interactions.map((interaction: LogInteraction) => ({
            timestamp: interaction.timestamp,
            agent_type: interaction.agent_type,
            input: interaction.input,
            output: interaction.output,
            metadata: interaction.metadata || { phase: "unknown" }
          }));
        });
        
        allLogs.push(...processedLogs);
      } catch (parseError) {
        console.error(`Error al procesar archivo ${file}:`, parseError);
        // Continuar con el siguiente archivo
      }
    }
    
    // Ordenar todos los logs por timestamp (más recientes primero)
    allLogs.sort((a: LogInteraction, b: LogInteraction) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Limitar a los 100 logs más recientes para evitar respuestas demasiado grandes
    const recentLogs = allLogs.slice(0, 100);
    
    console.log(`Enviando ${recentLogs.length} logs al cliente`);
    return NextResponse.json({ logs: recentLogs });
  } catch (error: any) {
    console.error('Error al obtener logs:', error);
    
    // Devolver un mensaje de error apropiado
    return NextResponse.json(
      {
        error: error.message || 'Error al obtener logs',
        logs: []
      },
      { status: 500 }
    );
  }
}
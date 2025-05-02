import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicializar el cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Obtener los datos de la solicitud
    const { messages, model, temperature, top_p, functions, agent_type, user_id, client_info } = await request.json();

    // Validar los datos
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Se requieren mensajes válidos' },
        { status: 400 }
      );
    }

    // Determinar si debemos usar el router_agent o llamar directamente a OpenAI
    const useRouterAgent = process.env.USE_ROUTER_AGENT === 'true';
    
    if (useRouterAgent) {
      // Usar el router_agent.py
      try {
        console.log("Usando router_agent.py para procesar la solicitud");
        
        // Preparar la solicitud para el router_agent
        const routerRequest = {
          messages: messages,
          client_info: client_info || {},
          agent_type: agent_type || "router",
          user_id: user_id || "test_user"
        };
        
        // Llamar al router_agent
        const routerResponse = await fetch('http://localhost:8000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(routerRequest),
        });
        
        if (!routerResponse.ok) {
          throw new Error(`Error al llamar al router_agent: ${routerResponse.statusText}`);
        }
        
        const routerData = await routerResponse.json();
        console.log("Respuesta del router_agent:", JSON.stringify(routerData));
        
        // Convertir la respuesta del router_agent al formato esperado por el frontend
        const formattedResponse = {
          id: `chatcmpl-${Date.now()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: model || 'router-agent',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: routerData.response
              },
              finish_reason: 'stop'
            }
          ],
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
          },
          // Añadir información adicional del router_agent
          router_info: {
            intent_detected: routerData.intent_detected,
            next_agent: routerData.next_agent,
            confidence: routerData.confidence
          }
        };
        
        return NextResponse.json(formattedResponse);
      } catch (routerError: any) {
        console.error('Error al usar router_agent:', routerError);
        
        // Si falla el router_agent, intentar con OpenAI como fallback
        console.log("Fallback a OpenAI debido a error en router_agent");
      }
    }
    
    // Configurar las opciones de la solicitud a OpenAI (usado directamente o como fallback)
    const options: any = {
      model: model || 'gpt-4o',
      messages,
      temperature: temperature !== undefined ? temperature : 0.7,
      top_p: top_p !== undefined ? top_p : 1.0,
    };

    // Añadir funciones si están definidas
    if (functions && Array.isArray(functions) && functions.length > 0) {
      options.functions = functions;
    }

    // Realizar la solicitud a la API de OpenAI
    const completion = await openai.chat.completions.create(options);
    
    console.log("Respuesta de OpenAI:", JSON.stringify(completion));

    // Devolver la respuesta
    return NextResponse.json(completion);
  } catch (error: any) {
    console.error('Error en la API de chat:', error);
    
    // Devolver un mensaje de error apropiado
    return NextResponse.json(
      {
        error: error.message || 'Error al procesar la solicitud',
        details: error.response?.data || error
      },
      { status: error.status || 500 }
    );
  }
}
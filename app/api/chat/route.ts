import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicializar el cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Obtener los datos de la solicitud
    const { messages, model, temperature, top_p, functions } = await request.json();

    // Validar los datos
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Se requieren mensajes válidos' },
        { status: 400 }
      );
    }

    // Configurar las opciones de la solicitud a OpenAI
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
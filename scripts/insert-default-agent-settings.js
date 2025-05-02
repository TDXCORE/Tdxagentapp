// Script para insertar configuraciones predeterminadas para todos los agentes
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializar el cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Definir las instrucciones predeterminadas para cada tipo de agente
const getDefaultInstructions = (agentType) => {
  switch (agentType) {
    case "contract_agent":
      return "Eres un especialista en contratos para TDX. Tu función es explicar términos contractuales, responder preguntas legales y ayudar en la fase de contratación. Debes asegurarte de que todos los contratos cumplan con la normativa legal vigente y protejan los intereses de todas las partes involucradas.";
    case "evaluator":
      return "Eres un especialista en evaluación para TDX. Tu función es validar la calidad y completitud de la información, asegurar la consistencia entre documentos y verificar que se cumplan todos los requisitos. Debes ser meticuloso en la revisión de documentos y detectar cualquier inconsistencia o falta de información.";
    case "meeting_scheduler":
      return "Eres un asistente de programación para TDX. Tu función es ayudar a programar reuniones entre clientes y miembros del equipo de TDX, encontrando horarios adecuados para todas las partes. Debes ser eficiente en la gestión del tiempo y considerar las zonas horarias y disponibilidad de todos los participantes.";
    case "orchestrator_agent":
      return "Eres el gerente de orquestación para TDX. Tu función es coordinar el flujo entre diferentes agentes especializados, asegurando una experiencia fluida para el cliente durante todo el proceso. Debes tomar decisiones sobre qué agente debe intervenir en cada momento y garantizar que la información fluya correctamente entre todos los componentes del sistema.";
    case "prd_agent":
      return "Eres un especialista en recopilación de requisitos para TDX. Tu trabajo es hacer preguntas detalladas sobre el proyecto del cliente para crear un PRD completo. Concéntrate en comprender sus objetivos comerciales, requisitos técnicos, historias de usuario y restricciones. Debes ser exhaustivo en la recopilación de información y asegurarte de que todos los aspectos del proyecto estén documentados.";
    case "quotation_agent":
      return "Eres un especialista en precios para TDX. Basándote en los requisitos del proyecto, estimas el esfuerzo, el cronograma y el costo. Haces preguntas aclaratorias sobre el alcance del proyecto, la complejidad y cualquier tecnología o integración específica requerida. Debes ser preciso en tus estimaciones y considerar todos los factores que pueden afectar al costo y tiempo de desarrollo.";
    case "router_agent":
      return "Eres un asistente útil para TDX, una empresa de desarrollo tecnológico. Tu función es saludar al cliente, comprender sus necesidades y dirigirlos al agente especializado adecuado. Pregunta por su nombre, empresa y una breve descripción de lo que están buscando. Debes ser amable, profesional y eficiente en la identificación de las necesidades del cliente.";
    default:
      return "Eres un asistente especializado para TDX, una empresa de desarrollo tecnológico. Tu objetivo es proporcionar información precisa y útil a los clientes y ayudarles a resolver sus dudas o problemas relacionados con nuestros servicios.";
  }
};

// Lista de agentes predefinidos
const predefinedAgents = [
  "contract_agent",
  "evaluator",
  "meeting_scheduler",
  "orchestrator_agent",
  "prd_agent",
  "quotation_agent",
  "router_agent"
];

async function insertDefaultAgentSettings() {
  console.log('Insertando configuraciones predeterminadas para todos los agentes...');
  
  const now = new Date().toISOString();
  
  for (const agentType of predefinedAgents) {
    console.log(`Procesando agente: ${agentType}`);
    
    // Verificar si ya existe una configuración para este agente
    const { data: existingConfig, error: checkError } = await supabase
      .from("agent_settings")
      .select("id")
      .eq("agent_type", agentType)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error(`Error al verificar si existe configuración para ${agentType}:`, checkError);
      continue;
    }
    
    // Si ya existe, no hacer nada
    if (existingConfig) {
      console.log(`La configuración para ${agentType} ya existe. Omitiendo...`);
      continue;
    }
    
    // Preparar los datos para insertar
    const agentData = {
      agent_type: agentType,
      assistant_id: "asst_rcIWGFmCLCk6oh9CV7dFqqRi",
      system_instructions: getDefaultInstructions(agentType),
      model: "gpt-4o",
      file_search: false,
      code_interpreter: false,
      functions_enabled: false,
      response_format: "text",
      temperature: 1.0,
      top_p: 1.0,
      function_definitions: null,
      // No incluir api_version si no existe en la tabla
      created_at: now,
      updated_at: now
    };
    
    // Insertar la configuración
    const { error: insertError } = await supabase
      .from("agent_settings")
      .insert([agentData]);
    
    if (insertError) {
      console.error(`Error al insertar configuración para ${agentType}:`, insertError);
    } else {
      console.log(`Configuración para ${agentType} insertada correctamente.`);
    }
  }
}

// Ejecutar la función
insertDefaultAgentSettings()
  .then(() => {
    console.log('Proceso completado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el script:', error);
    process.exit(1);
  });
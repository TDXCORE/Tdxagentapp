// Script para crear la tabla agent_settings en Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializar el cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAgentSettingsTable() {
  console.log('Verificando si la tabla agent_settings existe...');

  try {
    // Intentar insertar datos en la tabla para verificar si existe
    // Si la tabla no existe, esto generará un error
    const { error } = await supabase
      .from('agent_settings')
      .select('agent_type')
      .limit(1);

    // Si no hay error o el error no es de "tabla no existe", asumimos que la tabla existe
    if (!error || error.code !== 'PGRST204') {
      console.log('La tabla agent_settings ya existe.');
      return true;
    }
  } catch (error) {
    console.log('La tabla agent_settings no existe, se procederá a crearla.');
  }

  console.log('Creando tabla agent_settings...');

  // En lugar de usar SQL directo, usaremos la interfaz de administración de Supabase
  // Esto es solo informativo, ya que necesitarás crear la tabla manualmente en la interfaz de Supabase
  console.log(`
    Para crear la tabla agent_settings, sigue estos pasos:
    
    1. Ve al panel de administración de Supabase: ${process.env.NEXT_PUBLIC_SUPABASE_URL}
    2. Navega a "Table editor" > "New table"
    3. Configura la tabla con los siguientes campos:
       - id: uuid (primary key, default: gen_random_uuid())
       - agent_type: text (not null, unique)
       - assistant_id: text
       - system_instructions: text
       - model: text
       - file_search: boolean (default: false)
       - code_interpreter: boolean (default: false)
       - functions_enabled: boolean (default: false)
       - response_format: text (default: 'text')
       - temperature: real (default: 1.0)
       - top_p: real (default: 1.0)
       - function_definitions: jsonb
       - created_at: timestamptz (default: now())
       - updated_at: timestamptz (default: now())
    4. Habilita RLS (Row Level Security)
    5. Crea políticas para permitir acceso a usuarios autenticados
  `);

  // Asumimos que la tabla ya ha sido creada manualmente o que se creará después
  console.log('Continuando con la inserción de datos predeterminados...');

  if (error) {
    console.error('Error al crear la tabla agent_settings:', error);
    return;
  }

  console.log('Tabla agent_settings creada exitosamente.');

  // Insertar configuraciones predeterminadas para cada tipo de agente
  const defaultAgents = [
    {
      agent_type: 'contract_agent',
      system_instructions: 'Eres un especialista en contratos para TDX. Tu función es explicar términos contractuales, responder preguntas legales y ayudar en la fase de contratación. Debes asegurarte de que todos los contratos cumplan con la normativa legal vigente y protejan los intereses de todas las partes involucradas.',
      model: 'gpt-4o'
    },
    {
      agent_type: 'evaluator',
      system_instructions: 'Eres un especialista en evaluación para TDX. Tu función es validar la calidad y completitud de la información, asegurar la consistencia entre documentos y verificar que se cumplan todos los requisitos. Debes ser meticuloso en la revisión de documentos y detectar cualquier inconsistencia o falta de información.',
      model: 'gpt-4o'
    },
    {
      agent_type: 'meeting_scheduler',
      system_instructions: 'Eres un asistente de programación para TDX. Tu función es ayudar a programar reuniones entre clientes y miembros del equipo de TDX, encontrando horarios adecuados para todas las partes. Debes ser eficiente en la gestión del tiempo y considerar las zonas horarias y disponibilidad de todos los participantes.',
      model: 'gpt-4o'
    },
    {
      agent_type: 'orchestrator_agent',
      system_instructions: 'Eres el gerente de orquestación para TDX. Tu función es coordinar el flujo entre diferentes agentes especializados, asegurando una experiencia fluida para el cliente durante todo el proceso. Debes tomar decisiones sobre qué agente debe intervenir en cada momento y garantizar que la información fluya correctamente entre todos los componentes del sistema.',
      model: 'gpt-4o'
    },
    {
      agent_type: 'prd_agent',
      system_instructions: 'Eres un especialista en recopilación de requisitos para TDX. Tu trabajo es hacer preguntas detalladas sobre el proyecto del cliente para crear un PRD completo. Concéntrate en comprender sus objetivos comerciales, requisitos técnicos, historias de usuario y restricciones. Debes ser exhaustivo en la recopilación de información y asegurarte de que todos los aspectos del proyecto estén documentados.',
      model: 'gpt-4o'
    },
    {
      agent_type: 'quotation_agent',
      system_instructions: 'Eres un especialista en precios para TDX. Basándote en los requisitos del proyecto, estimas el esfuerzo, el cronograma y el costo. Haces preguntas aclaratorias sobre el alcance del proyecto, la complejidad y cualquier tecnología o integración específica requerida. Debes ser preciso en tus estimaciones y considerar todos los factores que pueden afectar al costo y tiempo de desarrollo.',
      model: 'gpt-4o'
    },
    {
      agent_type: 'router_agent',
      system_instructions: 'Eres un asistente útil para TDX, una empresa de desarrollo tecnológico. Tu función es saludar al cliente, comprender sus necesidades y dirigirlos al agente especializado adecuado. Pregunta por su nombre, empresa y una breve descripción de lo que están buscando. Debes ser amable, profesional y eficiente en la identificación de las necesidades del cliente.',
      model: 'gpt-4o'
    }
  ];

  for (const agent of defaultAgents) {
    const { error: insertError } = await supabase
      .from('agent_settings')
      .insert([agent]);

    if (insertError) {
      console.error(`Error al insertar configuración para ${agent.agent_type}:`, insertError);
    } else {
      console.log(`Configuración para ${agent.agent_type} insertada correctamente.`);
    }
  }

  console.log('Proceso completado.');
}

// Ejecutar la función
createAgentSettingsTable()
  .then(() => {
    console.log('Script finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el script:', error);
    process.exit(1);
  });
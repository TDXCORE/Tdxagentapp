// Script para listar las columnas de la tabla agent_settings
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializar el cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listTableColumns() {
  console.log('Consultando las columnas de la tabla agent_settings...');

  try {
    // Consultar directamente information_schema.columns
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'agent_settings');

    if (error) {
      console.error('Error al consultar information_schema.columns:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('Columnas de la tabla agent_settings:');
      console.table(data);
      
      // Verificar campos que usamos en la aplicación
      const columns = data.map(col => col.column_name);
      console.log('Columnas encontradas:', columns);
      
      const requiredColumns = [
        'id', 'agent_type', 'assistant_id', 'system_instructions', 'model',
        'file_search', 'code_interpreter', 'functions_enabled', 'response_format',
        'temperature', 'top_p', 'function_definitions', 'api_version',
        'created_at', 'updated_at'
      ];
      
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('\nColumnas faltantes que se usan en la aplicación:');
        missingColumns.forEach(col => console.log(`- ${col}`));
        
        // Generar SQL para añadir las columnas faltantes
        console.log('\nSQL para añadir las columnas faltantes:');
        missingColumns.forEach(col => {
          let dataType = 'text';
          let defaultValue = '';
          
          if (col === 'file_search' || col === 'code_interpreter' || col === 'functions_enabled') {
            dataType = 'boolean';
            defaultValue = 'DEFAULT false';
          } else if (col === 'temperature' || col === 'top_p') {
            dataType = 'real';
            defaultValue = 'DEFAULT 1.0';
          } else if (col === 'function_definitions') {
            dataType = 'jsonb';
          } else if (col === 'id') {
            dataType = 'uuid';
            defaultValue = 'DEFAULT uuid_generate_v4() PRIMARY KEY';
          } else if (col === 'created_at' || col === 'updated_at') {
            dataType = 'timestamp with time zone';
            defaultValue = 'DEFAULT now()';
          } else if (col === 'api_version') {
            dataType = 'text';
            defaultValue = "DEFAULT 'Latest'";
          }
          
          console.log(`ALTER TABLE public.agent_settings ADD COLUMN ${col} ${dataType} ${defaultValue};`);
        });
      } else {
        console.log('\nTodas las columnas requeridas están presentes.');
      }
    } else {
      console.log('No se encontraron columnas para la tabla agent_settings.');
    }
  } catch (error) {
    console.error('Error general:', error);
  }
}

// Ejecutar la función
listTableColumns()
  .then(() => {
    console.log('Verificación completada.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el script:', error);
    process.exit(1);
  });
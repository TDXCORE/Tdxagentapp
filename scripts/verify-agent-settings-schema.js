// Script para verificar y actualizar el esquema de la tabla agent_settings
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializar el cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyAgentSettingsSchema() {
  console.log('Verificando el esquema de la tabla agent_settings...');

  try {
    // Verificar si la tabla existe
    const { data: tableInfo, error: tableError } = await supabase
      .from('agent_settings')
      .select('*')
      .limit(1);

    if (tableError && tableError.code === 'PGRST204') {
      console.error('La tabla agent_settings no existe. Por favor, créala primero.');
      return;
    }

    // Obtener información sobre las columnas de la tabla
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'agent_settings' });

    if (columnsError) {
      console.error('Error al obtener información de las columnas:', columnsError);
      console.log('Nota: Es posible que necesites crear la función RPC get_table_columns en Supabase.');
      console.log(`
        CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
        RETURNS TABLE(column_name text, data_type text)
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          SELECT c.column_name::text, c.data_type::text
          FROM information_schema.columns c
          WHERE c.table_schema = 'public'
            AND c.table_name = table_name;
        END;
        $$;
      `);
      
      // Alternativa: usar una consulta SQL directa para obtener información de las columnas
      console.log('Intentando obtener información de las columnas mediante consulta SQL...');
      
      // Verificar los campos existentes mediante una consulta a la tabla
      const { data: sampleData, error: sampleError } = await supabase
        .from('agent_settings')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('Error al obtener datos de muestra:', sampleError);
        return;
      }
      
      // Si no hay datos, insertar un registro de prueba
      if (!sampleData || sampleData.length === 0) {
        console.log('No hay datos en la tabla. Insertando un registro de prueba...');
        
        const testData = {
          agent_type: 'test_agent',
          assistant_id: 'test_assistant_id',
          system_instructions: 'Test instructions',
          model: 'gpt-4o',
          file_search: false,
          code_interpreter: false,
          functions_enabled: false,
          response_format: 'text',
          temperature: 1.0,
          top_p: 1.0,
          function_definitions: null,
          api_version: 'Latest',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase
          .from('agent_settings')
          .upsert(testData, { onConflict: 'agent_type' });
        
        if (insertError) {
          console.error('Error al insertar datos de prueba:', insertError);
          
          // Analizar el error para identificar columnas faltantes
          if (insertError.message && insertError.message.includes('column')) {
            const missingColumnMatch = insertError.message.match(/column "([^"]+)" of relation "agent_settings" does not exist/);
            if (missingColumnMatch && missingColumnMatch[1]) {
              const missingColumn = missingColumnMatch[1];
              console.log(`Columna faltante detectada: ${missingColumn}`);
              
              // Sugerir comando SQL para añadir la columna
              console.log(`Para añadir esta columna, ejecuta el siguiente comando SQL en la consola de Supabase:`);
              
              let dataType = 'text';
              if (missingColumn === 'file_search' || missingColumn === 'code_interpreter' || missingColumn === 'functions_enabled') {
                dataType = 'boolean DEFAULT false';
              } else if (missingColumn === 'temperature' || missingColumn === 'top_p') {
                dataType = 'real DEFAULT 1.0';
              } else if (missingColumn === 'function_definitions') {
                dataType = 'jsonb';
              } else if (missingColumn === 'created_at' || missingColumn === 'updated_at') {
                dataType = 'timestamp with time zone DEFAULT now()';
              }
              
              console.log(`ALTER TABLE agent_settings ADD COLUMN ${missingColumn} ${dataType};`);
            }
          }
          
          return;
        }
        
        // Obtener los datos insertados
        const { data: refreshedData, error: refreshError } = await supabase
          .from('agent_settings')
          .select('*')
          .eq('agent_type', 'test_agent')
          .single();
        
        if (refreshError) {
          console.error('Error al obtener datos actualizados:', refreshError);
          return;
        }
        
        // Verificar campos existentes
        const existingColumns = Object.keys(refreshedData);
        console.log('Columnas existentes:', existingColumns);
        
        // Verificar campos requeridos
        const requiredColumns = [
          'id', 'agent_type', 'assistant_id', 'system_instructions', 'model',
          'file_search', 'code_interpreter', 'functions_enabled', 'response_format',
          'temperature', 'top_p', 'function_definitions', 'api_version',
          'created_at', 'updated_at'
        ];
        
        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
        
        if (missingColumns.length > 0) {
          console.log('Columnas faltantes:', missingColumns);
          console.log('Para añadir estas columnas, ejecuta los siguientes comandos SQL en la consola de Supabase:');
          
          missingColumns.forEach(col => {
            let dataType = 'text';
            if (col === 'file_search' || col === 'code_interpreter' || col === 'functions_enabled') {
              dataType = 'boolean DEFAULT false';
            } else if (col === 'temperature' || col === 'top_p') {
              dataType = 'real DEFAULT 1.0';
            } else if (col === 'function_definitions') {
              dataType = 'jsonb';
            } else if (col === 'id') {
              dataType = 'uuid PRIMARY KEY DEFAULT uuid_generate_v4()';
            } else if (col === 'created_at' || col === 'updated_at') {
              dataType = 'timestamp with time zone DEFAULT now()';
            }
            
            console.log(`ALTER TABLE agent_settings ADD COLUMN ${col} ${dataType};`);
          });
        } else {
          console.log('Todos los campos requeridos están presentes en la tabla agent_settings.');
        }
        
        // Limpiar datos de prueba
        if (refreshedData) {
          const { error: deleteError } = await supabase
            .from('agent_settings')
            .delete()
            .eq('agent_type', 'test_agent');
          
          if (deleteError) {
            console.error('Error al eliminar datos de prueba:', deleteError);
          }
        }
      } else {
        // Verificar campos existentes
        const existingColumns = Object.keys(sampleData[0]);
        console.log('Columnas existentes:', existingColumns);
        
        // Verificar campos requeridos
        const requiredColumns = [
          'id', 'agent_type', 'assistant_id', 'system_instructions', 'model',
          'file_search', 'code_interpreter', 'functions_enabled', 'response_format',
          'temperature', 'top_p', 'function_definitions', 'api_version',
          'created_at', 'updated_at'
        ];
        
        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
        
        if (missingColumns.length > 0) {
          console.log('Columnas faltantes:', missingColumns);
          console.log('Para añadir estas columnas, ejecuta los siguientes comandos SQL en la consola de Supabase:');
          
          missingColumns.forEach(col => {
            let dataType = 'text';
            if (col === 'file_search' || col === 'code_interpreter' || col === 'functions_enabled') {
              dataType = 'boolean DEFAULT false';
            } else if (col === 'temperature' || col === 'top_p') {
              dataType = 'real DEFAULT 1.0';
            } else if (col === 'function_definitions') {
              dataType = 'jsonb';
            } else if (col === 'id') {
              dataType = 'uuid PRIMARY KEY DEFAULT uuid_generate_v4()';
            } else if (col === 'created_at' || col === 'updated_at') {
              dataType = 'timestamp with time zone DEFAULT now()';
            }
            
            console.log(`ALTER TABLE agent_settings ADD COLUMN ${col} ${dataType};`);
          });
        } else {
          console.log('Todos los campos requeridos están presentes en la tabla agent_settings.');
        }
      }
    } else if (columns) {
      // Verificar campos requeridos
      const existingColumns = columns.map(col => col.column_name);
      console.log('Columnas existentes:', existingColumns);
      
      const requiredColumns = [
        'id', 'agent_type', 'assistant_id', 'system_instructions', 'model',
        'file_search', 'code_interpreter', 'functions_enabled', 'response_format',
        'temperature', 'top_p', 'function_definitions', 'api_version',
        'created_at', 'updated_at'
      ];
      
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('Columnas faltantes:', missingColumns);
        console.log('Para añadir estas columnas, ejecuta los siguientes comandos SQL en la consola de Supabase:');
        
        missingColumns.forEach(col => {
          let dataType = 'text';
          if (col === 'file_search' || col === 'code_interpreter' || col === 'functions_enabled') {
            dataType = 'boolean DEFAULT false';
          } else if (col === 'temperature' || col === 'top_p') {
            dataType = 'real DEFAULT 1.0';
          } else if (col === 'function_definitions') {
            dataType = 'jsonb';
          } else if (col === 'id') {
            dataType = 'uuid PRIMARY KEY DEFAULT uuid_generate_v4()';
          } else if (col === 'created_at' || col === 'updated_at') {
            dataType = 'timestamp with time zone DEFAULT now()';
          }
          
          console.log(`ALTER TABLE agent_settings ADD COLUMN ${col} ${dataType};`);
        });
      } else {
        console.log('Todos los campos requeridos están presentes en la tabla agent_settings.');
      }
    }
  } catch (error) {
    console.error('Error al verificar el esquema:', error);
  }
}

// Ejecutar la función
verifyAgentSettingsSchema()
  .then(() => {
    console.log('Verificación completada.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el script:', error);
    process.exit(1);
  });
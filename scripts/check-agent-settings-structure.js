// Script para consultar la estructura de la tabla agent_settings
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializar el cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableStructure() {
  console.log('Consultando la estructura de la tabla agent_settings...');

  try {
    // Intentar obtener un registro para ver la estructura
    const { data, error } = await supabase
      .from('agent_settings')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST204') {
        console.log('La tabla agent_settings no existe o está vacía.');
        
        // Intentar obtener la definición de la tabla desde el esquema de la base de datos
        console.log('Consultando el esquema de la base de datos...');
        
        const { data: columns, error: schemaError } = await supabase
          .rpc('get_table_info', { table_name: 'agent_settings' });
        
        if (schemaError) {
          console.error('Error al consultar el esquema:', schemaError);
          console.log('Intentando método alternativo...');
          
          // Método alternativo: consultar directamente information_schema
          const { data: tableExists, error: tableError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', 'agent_settings')
            .single();
          
          if (tableError) {
            console.error('Error al verificar si la tabla existe:', tableError);
            return;
          }
          
          if (!tableExists) {
            console.log('La tabla agent_settings no existe en la base de datos.');
            return;
          }
          
          console.log('La tabla agent_settings existe, pero no se puede consultar su estructura.');
        } else if (columns) {
          console.log('Estructura de la tabla agent_settings:');
          console.table(columns);
        }
      } else {
        console.error('Error al consultar la tabla:', error);
      }
      return;
    }

    if (data && data.length > 0) {
      console.log('Estructura de la tabla agent_settings:');
      console.log('Columnas encontradas:');
      
      const columns = Object.keys(data[0]);
      columns.forEach(column => {
        const value = data[0][column];
        const type = typeof value;
        console.log(`- ${column}: ${type} ${value !== null ? `(ejemplo: ${JSON.stringify(value)})` : '(null)'}`);
      });
      
      // Verificar campos que usamos en la aplicación
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
      } else {
        console.log('\nTodas las columnas requeridas están presentes.');
      }
    } else {
      console.log('La tabla agent_settings existe pero está vacía.');
      
      // Intentar obtener la definición de la tabla desde el esquema de la base de datos
      console.log('Consultando el esquema de la base de datos...');
      
      // Crear un registro temporal para ver la estructura
      console.log('Creando un registro temporal para ver la estructura...');
      
      const tempRecord = {
        agent_type: 'temp_agent',
        system_instructions: 'Instrucciones temporales'
      };
      
      const { error: insertError } = await supabase
        .from('agent_settings')
        .insert([tempRecord]);
      
      if (insertError) {
        console.error('Error al crear registro temporal:', insertError);
        return;
      }
      
      // Consultar el registro temporal
      const { data: tempData, error: tempError } = await supabase
        .from('agent_settings')
        .select('*')
        .eq('agent_type', 'temp_agent')
        .single();
      
      if (tempError) {
        console.error('Error al consultar registro temporal:', tempError);
      } else if (tempData) {
        console.log('Estructura de la tabla agent_settings:');
        console.log('Columnas encontradas:');
        
        const columns = Object.keys(tempData);
        columns.forEach(column => {
          const value = tempData[column];
          const type = typeof value;
          console.log(`- ${column}: ${type} ${value !== null ? `(ejemplo: ${JSON.stringify(value)})` : '(null)'}`);
        });
        
        // Verificar campos que usamos en la aplicación
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
        } else {
          console.log('\nTodas las columnas requeridas están presentes.');
        }
      }
      
      // Eliminar el registro temporal
      const { error: deleteError } = await supabase
        .from('agent_settings')
        .delete()
        .eq('agent_type', 'temp_agent');
      
      if (deleteError) {
        console.error('Error al eliminar registro temporal:', deleteError);
      }
    }
  } catch (error) {
    console.error('Error general:', error);
  }
}

// Ejecutar la función
checkTableStructure()
  .then(() => {
    console.log('Verificación completada.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el script:', error);
    process.exit(1);
  });
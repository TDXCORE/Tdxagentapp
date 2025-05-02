// Script para crear las tablas y funciones necesarias para el sistema RAG en Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializar el cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createRAGTables() {
  console.log('Creando tablas y funciones para el sistema RAG...');

  // 1. Crear tabla client_states
  console.log('Creando tabla client_states...');
  const { error: clientStatesError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'client_states',
    table_definition: `
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL UNIQUE,
      current_phase TEXT DEFAULT 'CONSENT',
      consent_given BOOLEAN DEFAULT FALSE,
      data JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    `
  });

  if (clientStatesError) {
    console.error('Error al crear la tabla client_states:', clientStatesError);
    console.log(`
      Para crear la tabla client_states manualmente, ejecuta el siguiente SQL en la consola de SQL de Supabase:
      
      CREATE TABLE IF NOT EXISTS client_states (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL UNIQUE,
        current_phase TEXT DEFAULT 'CONSENT',
        consent_given BOOLEAN DEFAULT FALSE,
        data JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Crear índice para búsquedas rápidas por user_id
      CREATE INDEX IF NOT EXISTS idx_client_states_user_id ON client_states(user_id);
    `);
  } else {
    console.log('Tabla client_states creada exitosamente.');
  }

  // 2. Crear tabla conversation_embeddings
  console.log('Creando tabla conversation_embeddings...');
  const { error: conversationEmbeddingsError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'conversation_embeddings',
    table_definition: `
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      response TEXT NOT NULL,
      phase TEXT NOT NULL,
      metadata JSONB DEFAULT '{}',
      embedding VECTOR(1536),
      created_at TIMESTAMPTZ DEFAULT now()
    `
  });

  if (conversationEmbeddingsError) {
    console.error('Error al crear la tabla conversation_embeddings:', conversationEmbeddingsError);
    console.log(`
      Para crear la tabla conversation_embeddings manualmente, ejecuta el siguiente SQL en la consola de SQL de Supabase:
      
      -- Habilitar la extensión vector si no está habilitada
      CREATE EXTENSION IF NOT EXISTS vector;
      
      -- Crear la tabla
      CREATE TABLE IF NOT EXISTS conversation_embeddings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        response TEXT NOT NULL,
        phase TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        embedding VECTOR(1536),
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Crear índices
      CREATE INDEX IF NOT EXISTS idx_conversation_embeddings_user_id ON conversation_embeddings(user_id);
      CREATE INDEX IF NOT EXISTS idx_conversation_embeddings_phase ON conversation_embeddings(phase);
    `);
  } else {
    console.log('Tabla conversation_embeddings creada exitosamente.');
  }

  // 3. Crear tabla documents
  console.log('Creando tabla documents...');
  const { error: documentsError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'documents',
    table_definition: `
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    `
  });

  if (documentsError) {
    console.error('Error al crear la tabla documents:', documentsError);
    console.log(`
      Para crear la tabla documents manualmente, ejecuta el siguiente SQL en la consola de SQL de Supabase:
      
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Crear índices
      CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
      CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
    `);
  } else {
    console.log('Tabla documents creada exitosamente.');
  }

  // 4. Crear función RPC insert_conversation_embedding
  console.log('Creando función RPC insert_conversation_embedding...');
  const { error: insertConversationEmbeddingError } = await supabase.rpc('create_function_if_not_exists', {
    function_name: 'insert_conversation_embedding',
    function_definition: `
      CREATE OR REPLACE FUNCTION insert_conversation_embedding(
        user_id TEXT,
        content TEXT,
        response TEXT,
        phase TEXT,
        metadata JSONB,
        embedding VECTOR(1536)
      ) RETURNS UUID AS $$
      DECLARE
        new_id UUID;
      BEGIN
        INSERT INTO conversation_embeddings (user_id, content, response, phase, metadata, embedding)
        VALUES (user_id, content, response, phase, metadata, embedding)
        RETURNING id INTO new_id;
        
        RETURN new_id;
      END;
      $$ LANGUAGE plpgsql;
    `
  });

  if (insertConversationEmbeddingError) {
    console.error('Error al crear la función RPC insert_conversation_embedding:', insertConversationEmbeddingError);
    console.log(`
      Para crear la función RPC insert_conversation_embedding manualmente, ejecuta el siguiente SQL en la consola de SQL de Supabase:
      
      CREATE OR REPLACE FUNCTION insert_conversation_embedding(
        user_id TEXT,
        content TEXT,
        response TEXT,
        phase TEXT,
        metadata JSONB,
        embedding VECTOR(1536)
      ) RETURNS UUID AS $$
      DECLARE
        new_id UUID;
      BEGIN
        INSERT INTO conversation_embeddings (user_id, content, response, phase, metadata, embedding)
        VALUES (user_id, content, response, phase, metadata, embedding)
        RETURNING id INTO new_id;
        
        RETURN new_id;
      END;
      $$ LANGUAGE plpgsql;
    `);
  } else {
    console.log('Función RPC insert_conversation_embedding creada exitosamente.');
  }

  // 5. Crear función RPC match_conversation_embeddings
  console.log('Creando función RPC match_conversation_embeddings...');
  const { error: matchConversationEmbeddingsError } = await supabase.rpc('create_function_if_not_exists', {
    function_name: 'match_conversation_embeddings',
    function_definition: `
      CREATE OR REPLACE FUNCTION match_conversation_embeddings(
        query_embedding VECTOR(1536),
        match_threshold FLOAT,
        match_count INT,
        user_id TEXT,
        filter_phase TEXT DEFAULT NULL
      ) RETURNS TABLE (
        id UUID,
        user_id TEXT,
        content TEXT,
        response TEXT,
        phase TEXT,
        metadata JSONB,
        similarity FLOAT
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT
          ce.id,
          ce.user_id,
          ce.content,
          ce.response,
          ce.phase,
          ce.metadata,
          1 - (ce.embedding <=> query_embedding) AS similarity
        FROM conversation_embeddings ce
        WHERE 
          ce.user_id = match_conversation_embeddings.user_id
          AND (filter_phase IS NULL OR ce.phase = filter_phase)
        ORDER BY ce.embedding <=> query_embedding
        LIMIT match_count;
      END;
      $$ LANGUAGE plpgsql;
    `
  });

  if (matchConversationEmbeddingsError) {
    console.error('Error al crear la función RPC match_conversation_embeddings:', matchConversationEmbeddingsError);
    console.log(`
      Para crear la función RPC match_conversation_embeddings manualmente, ejecuta el siguiente SQL en la consola de SQL de Supabase:
      
      CREATE OR REPLACE FUNCTION match_conversation_embeddings(
        query_embedding VECTOR(1536),
        match_threshold FLOAT,
        match_count INT,
        user_id TEXT,
        filter_phase TEXT DEFAULT NULL
      ) RETURNS TABLE (
        id UUID,
        user_id TEXT,
        content TEXT,
        response TEXT,
        phase TEXT,
        metadata JSONB,
        similarity FLOAT
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT
          ce.id,
          ce.user_id,
          ce.content,
          ce.response,
          ce.phase,
          ce.metadata,
          1 - (ce.embedding <=> query_embedding) AS similarity
        FROM conversation_embeddings ce
        WHERE 
          ce.user_id = match_conversation_embeddings.user_id
          AND (filter_phase IS NULL OR ce.phase = filter_phase)
        ORDER BY ce.embedding <=> query_embedding
        LIMIT match_count;
      END;
      $$ LANGUAGE plpgsql;
    `);
  } else {
    console.log('Función RPC match_conversation_embeddings creada exitosamente.');
  }

  // 6. Crear funciones auxiliares para crear tablas y funciones
  console.log('Creando funciones auxiliares...');
  const { error: createTableFunctionError } = await supabase.rpc('create_function_if_not_exists', {
    function_name: 'create_table_if_not_exists',
    function_definition: `
      CREATE OR REPLACE FUNCTION create_table_if_not_exists(
        table_name TEXT,
        table_definition TEXT
      ) RETURNS VOID AS $$
      BEGIN
        EXECUTE format('
          CREATE TABLE IF NOT EXISTS %I (
            %s
          );
        ', table_name, table_definition);
      END;
      $$ LANGUAGE plpgsql;
    `
  });

  if (createTableFunctionError) {
    console.error('Error al crear la función create_table_if_not_exists:', createTableFunctionError);
  } else {
    console.log('Función create_table_if_not_exists creada exitosamente.');
  }

  const { error: createFunctionFunctionError } = await supabase.rpc('create_function_if_not_exists', {
    function_name: 'create_function_if_not_exists',
    function_definition: `
      CREATE OR REPLACE FUNCTION create_function_if_not_exists(
        function_name TEXT,
        function_definition TEXT
      ) RETURNS VOID AS $$
      BEGIN
        EXECUTE function_definition;
      END;
      $$ LANGUAGE plpgsql;
    `
  });

  if (createFunctionFunctionError) {
    console.error('Error al crear la función create_function_if_not_exists:', createFunctionFunctionError);
  } else {
    console.log('Función create_function_if_not_exists creada exitosamente.');
  }

  console.log('Proceso completado.');
}

// Ejecutar la función
createRAGTables()
  .then(() => {
    console.log('Script finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el script:', error);
    process.exit(1);
  });
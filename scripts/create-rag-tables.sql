-- Habilitar la extensión vector si no está habilitada
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Crear tabla client_states
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

-- 2. Crear tabla conversation_embeddings
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

-- 3. Crear tabla documents
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

-- 4. Crear función RPC insert_conversation_embedding
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

-- 5. Crear función RPC match_conversation_embeddings
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
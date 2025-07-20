-- Script para implementar Vector Store no Supabase
-- Arquivo: create_vector_store.sql

-- 1. Habilitar extensão pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabela para armazenar documentos
CREATE TABLE IF NOT EXISTS chatbot_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela para armazenar chunks de texto com embeddings
CREATE TABLE IF NOT EXISTS chatbot_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES chatbot_documents(id) ON DELETE CASCADE,
  chatbot_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding VECTOR(1536), -- OpenAI embeddings têm 1536 dimensões
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS chatbot_embeddings_embedding_idx 
ON chatbot_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS chatbot_embeddings_user_idx 
ON chatbot_embeddings (chatbot_user);

CREATE INDEX IF NOT EXISTS chatbot_documents_user_idx 
ON chatbot_documents (chatbot_user);

CREATE INDEX IF NOT EXISTS chatbot_embeddings_document_idx 
ON chatbot_embeddings (document_id);

-- 5. Habilitar RLS
ALTER TABLE chatbot_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_embeddings ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para chatbot_documents
CREATE POLICY "Users can view own documents" ON chatbot_documents
    FOR SELECT USING (auth.uid()::text = chatbot_user::text);

CREATE POLICY "Users can insert own documents" ON chatbot_documents
    FOR INSERT WITH CHECK (auth.uid()::text = chatbot_user::text);

CREATE POLICY "Users can update own documents" ON chatbot_documents
    FOR UPDATE USING (auth.uid()::text = chatbot_user::text);

CREATE POLICY "Users can delete own documents" ON chatbot_documents
    FOR DELETE USING (auth.uid()::text = chatbot_user::text);

-- 7. Políticas RLS para chatbot_embeddings
CREATE POLICY "Users can view own embeddings" ON chatbot_embeddings
    FOR SELECT USING (auth.uid()::text = chatbot_user::text);

CREATE POLICY "Users can insert own embeddings" ON chatbot_embeddings
    FOR INSERT WITH CHECK (auth.uid()::text = chatbot_user::text);

CREATE POLICY "Users can delete own embeddings" ON chatbot_embeddings
    FOR DELETE USING (auth.uid()::text = chatbot_user::text);

-- 8. Função para busca por similaridade
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding VECTOR(1536),
  user_id UUID,
  match_threshold FLOAT DEFAULT 0.78,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_text TEXT,
  similarity FLOAT,
  metadata JSONB,
  filename VARCHAR(255)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.document_id,
    ce.chunk_text,
    1 - (ce.embedding <=> query_embedding) AS similarity,
    ce.metadata,
    cd.filename
  FROM chatbot_embeddings ce
  JOIN chatbot_documents cd ON ce.document_id = cd.id
  WHERE ce.chatbot_user = user_id
    AND 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 9. Função para atualizar status do documento
CREATE OR REPLACE FUNCTION update_document_status(
  doc_id UUID,
  new_status VARCHAR(50)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE chatbot_documents 
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE id = doc_id
    AND chatbot_user = auth.uid();
END;
$$;

-- 10. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chatbot_documents_updated_at 
    BEFORE UPDATE ON chatbot_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificar se tudo foi criado corretamente
SELECT 'Vector store criado com sucesso!' as status;

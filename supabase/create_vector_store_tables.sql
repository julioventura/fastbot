-- Criação das tabelas necessárias para o Vector Store

-- Habilitar extensão para vetores (se não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela para armazenar chunks de documentos com embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES chatbot_documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    embedding vector(1536), -- OpenAI ada-002 produz vetores de 1536 dimensões
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para otimizar buscas
CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON document_chunks USING ivfflat (embedding vector_cosine_ops);

-- RLS (Row Level Security) para document_chunks
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários só podem ver chunks de seus próprios documentos
CREATE POLICY "Users can view their own document chunks" 
ON document_chunks FOR SELECT 
USING (
  document_id IN (
    SELECT id FROM chatbot_documents 
    WHERE chatbot_user = auth.uid()
  )
);

-- Política RLS: usuários só podem inserir chunks em seus próprios documentos
CREATE POLICY "Users can insert chunks for their own documents" 
ON document_chunks FOR INSERT 
WITH CHECK (
  document_id IN (
    SELECT id FROM chatbot_documents 
    WHERE chatbot_user = auth.uid()
  )
);

-- Política RLS: usuários só podem atualizar chunks de seus próprios documentos
CREATE POLICY "Users can update their own document chunks" 
ON document_chunks FOR UPDATE 
USING (
  document_id IN (
    SELECT id FROM chatbot_documents 
    WHERE chatbot_user = auth.uid()
  )
);

-- Política RLS: usuários só podem deletar chunks de seus próprios documentos
CREATE POLICY "Users can delete their own document chunks" 
ON document_chunks FOR DELETE 
USING (
  document_id IN (
    SELECT id FROM chatbot_documents 
    WHERE chatbot_user = auth.uid()
  )
);

-- Função para busca semântica com similaridade
CREATE OR REPLACE FUNCTION search_document_chunks(
  query_embedding vector(1536),
  user_id UUID,
  similarity_threshold float DEFAULT 0.8,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_text TEXT,
  similarity FLOAT,
  metadata JSONB,
  filename TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.document_id,
    dc.chunk_text,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    dc.metadata,
    cd.filename
  FROM document_chunks dc
  JOIN chatbot_documents cd ON dc.document_id = cd.id
  WHERE cd.chatbot_user = user_id
    AND 1 - (dc.embedding <=> query_embedding) > similarity_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Comentários sobre as tabelas
COMMENT ON TABLE document_chunks IS 'Armazena chunks de documentos processados com seus embeddings para busca semântica';
COMMENT ON COLUMN document_chunks.embedding IS 'Vetor de embedding gerado pelo modelo text-embedding-ada-002 da OpenAI';
COMMENT ON COLUMN document_chunks.chunk_text IS 'Texto do chunk extraído do documento original';
COMMENT ON COLUMN document_chunks.chunk_index IS 'Posição do chunk no documento original';
COMMENT ON COLUMN document_chunks.metadata IS 'Metadados adicionais sobre o chunk (tamanho, posição, etc.)';
COMMENT ON FUNCTION search_document_chunks IS 'Função para busca semântica em chunks de documentos usando similaridade de cosseno';

-- Adicionar coluna summary à tabela chatbot_documents se não existir
ALTER TABLE chatbot_documents 
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Criar índice para melhor performance em buscas por resumo
CREATE INDEX IF NOT EXISTS idx_chatbot_documents_summary 
ON chatbot_documents USING gin(to_tsvector('portuguese', summary));

-- Comentário sobre o campo
COMMENT ON COLUMN chatbot_documents.summary IS 'Resumo automático do conteúdo do documento (máximo 50 palavras)';

-- TESTE ESPECÍFICO: Buscar informações sobre inscrições
-- Execute no SQL Editor do Supabase

-- 1. Primeiro, confirmar que há dados sobre inscrições
SELECT 
    cd.filename,
    ce.chunk_index,
    ce.chunk_text,
    cd.chatbot_user
FROM chatbot_embeddings ce
JOIN chatbot_documents cd ON ce.document_id = cd.id
WHERE ce.chunk_text ILIKE '%inscri%'
ORDER BY cd.upload_date DESC, ce.chunk_index;

-- 2. Ver todos os chunks do arquivo DOLESC.txt que contém as informações
SELECT 
    ce.chunk_index,
    ce.chunk_text,
    cd.chatbot_user
FROM chatbot_embeddings ce
JOIN chatbot_documents cd ON ce.document_id = cd.id
WHERE cd.filename = 'DOLESC.txt'
ORDER BY ce.chunk_index;

-- 3. Verificar se a função match_embeddings existe
SELECT 
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'match_embeddings' AND n.nspname = 'public';

-- 4. Se a função não existir, vamos criá-la:
-- (Descomente se necessário)
/*
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(1536),
  user_id uuid,
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chunk_text text,
  similarity float,
  metadata jsonb,
  filename varchar(255)
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
*/

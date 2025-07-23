-- TESTE MANUAL DA BUSCA VETORIAL
-- Execute no SQL Editor do Supabase

-- 1. Obter informações do usuário que tem documentos
SELECT 
    cd.chatbot_user,
    cd.filename,
    cd.status,
    COUNT(ce.id) as chunks_count
FROM chatbot_documents cd
LEFT JOIN chatbot_embeddings ce ON cd.id = ce.document_id
WHERE cd.filename = 'DOLESC.txt'
GROUP BY cd.chatbot_user, cd.filename, cd.status;

-- 2. Ver exatamente o chunk que contém "Inscrições: 12 / 05"
SELECT 
    ce.id,
    ce.chunk_index,
    ce.chunk_text,
    cd.chatbot_user,
    vector_dims(ce.embedding) as embedding_dims
FROM chatbot_embeddings ce
JOIN chatbot_documents cd ON ce.document_id = cd.id
WHERE ce.chunk_text ILIKE '%inscri%'
   AND ce.chunk_text ILIKE '%12%'
   AND ce.chunk_text ILIKE '%05%';

-- 3. Verificar se pgvector está funcionando (teste de similaridade simples)
-- Este teste usa dois embeddings da própria base para calcular similaridade
SELECT 
    a.chunk_text as chunk_a,
    b.chunk_text as chunk_b,
    1 - (a.embedding <=> b.embedding) as similarity
FROM chatbot_embeddings a, chatbot_embeddings b
WHERE a.id != b.id
  AND a.document_id IN (SELECT id FROM chatbot_documents WHERE filename = 'DOLESC.txt')
  AND b.document_id IN (SELECT id FROM chatbot_documents WHERE filename = 'DOLESC.txt')
LIMIT 3;

-- 4. Testar ordenação por similaridade (deve funcionar se pgvector está OK)
WITH base_chunk AS (
  SELECT embedding 
  FROM chatbot_embeddings 
  WHERE chunk_text ILIKE '%inscri%' 
  LIMIT 1
)
SELECT 
    ce.chunk_text,
    1 - (ce.embedding <=> bc.embedding) as similarity
FROM chatbot_embeddings ce, base_chunk bc
WHERE ce.document_id IN (SELECT id FROM chatbot_documents WHERE filename = 'DOLESC.txt')
ORDER BY ce.embedding <=> bc.embedding
LIMIT 5;

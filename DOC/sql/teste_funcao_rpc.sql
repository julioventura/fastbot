-- TESTE DA FUNÇÃO match_embeddings
-- Execute no SQL Editor do Supabase para testar a busca vetorial

-- Primeiro, verificar se a função existe
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'match_embeddings';

-- Verificar se há embeddings na base
SELECT 
    COUNT(*) as total_embeddings,
    COUNT(DISTINCT document_id) as documentos_únicos,
    COUNT(DISTINCT chatbot_user) as usuarios_únicos
FROM chatbot_embeddings;

-- Ver exemplo de embedding (informações sobre o vector)
SELECT 
    id,
    chunk_index,
    LEFT(chunk_text, 100) as chunk_preview,
    -- Para vector type, usamos vector_dims() ao invés de array_length()
    vector_dims(embedding) as embedding_dimensions,
    -- Não podemos extrair dimensões individuais de vector facilmente
    'Vector de ' || vector_dims(embedding) || ' dimensões' as embedding_info
FROM chatbot_embeddings 
LIMIT 3;

-- Para testar a função match_embeddings, você precisará:
-- 1. Um embedding de teste (1536 dimensões)
-- 2. Um user_id válido

-- Exemplo de como testar (substitua pelos valores reais):
/*
SELECT * FROM match_embeddings(
    '[0.1,0.2,0.3,...]'::vector(1536),  -- embedding da query
    'seu-user-id-aqui'::uuid,          -- seu user ID
    0.7,                                -- threshold
    5                                   -- limit
);
*/

-- Para obter um user_id real da sua base:
SELECT DISTINCT chatbot_user FROM chatbot_documents LIMIT 1;

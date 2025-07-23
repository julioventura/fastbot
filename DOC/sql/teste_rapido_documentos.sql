-- TESTE RÁPIDO: Verificar se há documentos e embeddings na base
-- Execute este comando no SQL Editor do Supabase

-- 1. Contar total de documentos
SELECT 'TOTAL DOCUMENTOS' as tipo, COUNT(*) as quantidade FROM chatbot_documents
UNION ALL
SELECT 'DOCUMENTOS PROCESSADOS' as tipo, COUNT(*) as quantidade FROM chatbot_documents WHERE status = 'completed'
UNION ALL 
SELECT 'TOTAL EMBEDDINGS' as tipo, COUNT(*) as quantidade FROM chatbot_embeddings;

-- 2. Ver os últimos documentos uploadados
SELECT 
    'DOCUMENTO: ' || filename as info,
    'Status: ' || status || ' | Tamanho: ' || file_size || ' bytes | Data: ' || upload_date::date as detalhes
FROM chatbot_documents 
ORDER BY upload_date DESC 
LIMIT 5;

-- 3. Buscar por palavras-chave relacionadas a "inscrições"
SELECT 
    'CHUNK ENCONTRADO: ' || cd.filename as arquivo,
    'Similaridade potencial para inscrições: ' || 
    CASE 
        WHEN ce.chunk_text ILIKE '%inscri%' THEN 'ALTA'
        WHEN ce.chunk_text ILIKE '%data%' AND ce.chunk_text ILIKE '%prazo%' THEN 'MÉDIA'
        WHEN ce.chunk_text ILIKE '%data%' OR ce.chunk_text ILIKE '%prazo%' THEN 'BAIXA'
        ELSE 'NENHUMA'
    END as relevancia,
    LEFT(ce.chunk_text, 150) as preview
FROM chatbot_embeddings ce
JOIN chatbot_documents cd ON ce.document_id = cd.id
WHERE ce.chunk_text ILIKE '%inscri%' 
   OR ce.chunk_text ILIKE '%data%'
   OR ce.chunk_text ILIKE '%prazo%'
ORDER BY 
    CASE 
        WHEN ce.chunk_text ILIKE '%inscri%' THEN 1
        WHEN ce.chunk_text ILIKE '%data%' AND ce.chunk_text ILIKE '%prazo%' THEN 2
        ELSE 3
    END
LIMIT 10;

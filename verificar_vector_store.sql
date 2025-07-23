-- Script para verificar documentos e embeddings na base vetorial
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar documentos uploadados
SELECT 
    id,
    filename,
    status,
    file_size,
    upload_date,
    LEFT(content, 100) as content_preview
FROM chatbot_documents 
ORDER BY upload_date DESC;

-- 2. Verificar embeddings processados
SELECT 
    cd.filename,
    cd.status,
    COUNT(ce.id) as chunks_count,
    cd.upload_date
FROM chatbot_documents cd
LEFT JOIN chatbot_embeddings ce ON cd.id = ce.document_id
GROUP BY cd.id, cd.filename, cd.status, cd.upload_date
ORDER BY cd.upload_date DESC;

-- 3. Verificar conteúdo dos chunks (primeiros 5)
SELECT 
    cd.filename,
    ce.chunk_index,
    LEFT(ce.chunk_text, 200) as chunk_preview,
    ce.metadata
FROM chatbot_embeddings ce
JOIN chatbot_documents cd ON ce.document_id = cd.id
ORDER BY cd.upload_date DESC, ce.chunk_index
LIMIT 5;

-- 4. Testar busca por "inscrições" ou "data"
SELECT 
    cd.filename,
    ce.chunk_text,
    ce.chunk_index
FROM chatbot_embeddings ce
JOIN chatbot_documents cd ON ce.document_id = cd.id
WHERE ce.chunk_text ILIKE '%inscri%' 
   OR ce.chunk_text ILIKE '%data%'
   OR ce.chunk_text ILIKE '%prazo%'
ORDER BY cd.upload_date DESC
LIMIT 10;

-- ===============================================================
-- SQL COMPLETO - EXECUTE NO SUPABASE DASHBOARD PARA RESOLVER ERRO
-- ===============================================================
-- ERRO ATUAL: "Could not find the 'uploaded_images' column"
-- SOLUÇÃO: Execute este SQL completo no Supabase Dashboard

-- ⚠️  INSTRUÇÕES:
-- 1. Acesse: https://supabase.cirurgia.com.br
-- 2. Faça login
-- 3. Vá em "SQL Editor" (menu lateral)
-- 4. Copie TODO este código
-- 5. Cole no SQL Editor
-- 6. Clique em "RUN" ou "Executar"

-- 1. Controles de personalidade
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS formality_level INTEGER DEFAULT 50;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS use_emojis BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS memorize_user_name BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS paragraph_size INTEGER DEFAULT 50;

-- 2. Controles de escopo
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS main_topic TEXT;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS allowed_topics TEXT[] DEFAULT '{}';
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS source_strictness INTEGER DEFAULT 50;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS allow_internet_search BOOLEAN DEFAULT FALSE;

-- 3. Controles de comportamento
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS confidence_threshold INTEGER DEFAULT 70;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS fallback_action TEXT DEFAULT 'human';
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS response_time_promise TEXT;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS fallback_message TEXT;

-- 4. Links e documentos (INCLUINDO uploaded_images que está faltando!)
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS main_link TEXT;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS mandatory_link BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS uploaded_documents TEXT[] DEFAULT '{}';
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS uploaded_images TEXT[] DEFAULT '{}';
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS footer_message TEXT;

-- 5. Regras automáticas
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS mandatory_phrases TEXT[] DEFAULT '{}';
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS auto_link BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS max_list_items INTEGER DEFAULT 10;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS list_style TEXT DEFAULT 'numbered';

-- 6. Interação
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS ask_for_name BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS name_usage_frequency INTEGER DEFAULT 30;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS remember_context BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS returning_user_greeting TEXT;

-- 7. Configurações avançadas
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS response_speed INTEGER DEFAULT 50;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS debug_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS chat_color TEXT DEFAULT '#3b82f6';

-- ✅ MENSAGEM DE SUCESSO
SELECT 'SUCESSO: Todas as colunas foram adicionadas com sucesso!' as resultado;

-- 🔍 VERIFICAÇÃO: Execute para confirmar que as colunas foram criadas
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'mychatbot_2' 
AND column_name IN (
    'formality_level', 'use_emojis', 'memorize_user_name', 'paragraph_size',
    'main_topic', 'allowed_topics', 'source_strictness', 'allow_internet_search',
    'confidence_threshold', 'fallback_action', 'response_time_promise', 'fallback_message',
    'main_link', 'mandatory_link', 'uploaded_documents', 'uploaded_images', 'footer_message',
    'mandatory_phrases', 'auto_link', 'max_list_items', 'list_style',
    'ask_for_name', 'name_usage_frequency', 'remember_context', 'returning_user_greeting',
    'response_speed', 'debug_mode', 'chat_color'
)
ORDER BY column_name;

-- 📊 CONTAGEM: Verificar quantas colunas foram criadas (deve ser 27)
SELECT 
    COUNT(*) as total_colunas_avancadas,
    'Esperado: 27 colunas' as observacao
FROM information_schema.columns 
WHERE table_name = 'mychatbot_2' 
AND column_name IN (
    'formality_level', 'use_emojis', 'memorize_user_name', 'paragraph_size',
    'main_topic', 'allowed_topics', 'source_strictness', 'allow_internet_search',
    'confidence_threshold', 'fallback_action', 'response_time_promise', 'fallback_message',
    'main_link', 'mandatory_link', 'uploaded_documents', 'uploaded_images', 'footer_message',
    'mandatory_phrases', 'auto_link', 'max_list_items', 'list_style',
    'ask_for_name', 'name_usage_frequency', 'remember_context', 'returning_user_greeting',
    'response_speed', 'debug_mode', 'chat_color'
);

-- ===================================================
-- EXECUTE ESTE SQL NO SUPABASE DASHBOARD AGORA!
-- ===================================================
-- Acesse: https://supabase.cirurgia.com.br
-- Vá em: SQL Editor
-- Cole este código completo e execute

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

-- 4. Links e documentos (INCLUINDO footer_message que está faltando!)
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS main_link TEXT;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS mandatory_link BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS uploaded_documents TEXT[] DEFAULT '{}';
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS uploaded_images TEXT[] DEFAULT '{}';
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS footer_message TEXT;

-- 5. Regras automáticas (INCLUINDO max_list_items que estava faltando!)
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

-- VERIFICAÇÃO: Execute isso depois para confirmar que as colunas foram criadas
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'mychatbot_2' 
AND column_name IN (
    'footer_message', 'max_list_items', 'formality_level', 
    'main_topic', 'confidence_threshold', 'chat_color',
    'uploaded_images', 'uploaded_documents'
)
ORDER BY column_name;

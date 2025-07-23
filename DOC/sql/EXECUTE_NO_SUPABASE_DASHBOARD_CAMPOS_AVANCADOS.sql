-- Execute este SQL no Supabase Dashboard para adicionar os campos avançados
-- Vai na aba SQL Editor e cole este código completo

-- Controles de personalidade
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS formality_level INTEGER DEFAULT 50;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS use_emojis BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS memorize_user_name BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS paragraph_size INTEGER DEFAULT 50;

-- Controles de escopo
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS main_topic TEXT;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS allowed_topics TEXT[] DEFAULT '{}';
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS source_strictness INTEGER DEFAULT 50;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS allow_internet_search BOOLEAN DEFAULT FALSE;

-- Controles de comportamento
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS confidence_threshold INTEGER DEFAULT 70;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS fallback_action TEXT DEFAULT 'human';
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS response_time_promise TEXT;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS fallback_message TEXT;

-- Links e documentos
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS main_link TEXT;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS mandatory_link BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS uploaded_documents TEXT[] DEFAULT '{}';

-- Regras automáticas
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS mandatory_phrases TEXT[] DEFAULT '{}';
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS auto_link BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS max_list_items INTEGER DEFAULT 10;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS list_style TEXT DEFAULT 'numbered';

-- Interação
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS ask_for_name BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS name_usage_frequency INTEGER DEFAULT 30;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS remember_context BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS returning_user_greeting TEXT;

-- Configurações avançadas
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS response_speed INTEGER DEFAULT 50;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS debug_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS chat_color TEXT DEFAULT '#3b82f6';

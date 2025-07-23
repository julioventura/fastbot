-- Script para adicionar campos avançados na tabela mychatbot_2
-- Execute este script no Supabase Dashboard

-- Controles de personalidade
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS formality_level INTEGER DEFAULT 50 CHECK (formality_level >= 0 AND formality_level <= 100);
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS use_emojis BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS memorize_user_name BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS paragraph_size INTEGER DEFAULT 50 CHECK (paragraph_size >= 0 AND paragraph_size <= 100);

-- Controles de escopo
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS main_topic TEXT;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS allowed_topics TEXT[] DEFAULT '{}';
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS source_strictness INTEGER DEFAULT 50 CHECK (source_strictness >= 0 AND source_strictness <= 100);
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS allow_internet_search BOOLEAN DEFAULT FALSE;

-- Controles de comportamento
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS confidence_threshold INTEGER DEFAULT 70 CHECK (confidence_threshold >= 0 AND confidence_threshold <= 100);
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS fallback_action TEXT DEFAULT 'human' CHECK (fallback_action IN ('human', 'search', 'link'));
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS response_time_promise TEXT;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS fallback_message TEXT;

-- Links e documentos
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS main_link TEXT;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS mandatory_link BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS uploaded_documents TEXT[] DEFAULT '{}';

-- Regras automáticas
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS mandatory_phrases TEXT[] DEFAULT '{}';
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS auto_link BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS max_list_items INTEGER DEFAULT 10 CHECK (max_list_items >= 1 AND max_list_items <= 50);
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS list_style TEXT DEFAULT 'numbered' CHECK (list_style IN ('numbered', 'bullets', 'simple'));

-- Interação
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS ask_for_name BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS name_usage_frequency INTEGER DEFAULT 30 CHECK (name_usage_frequency >= 0 AND name_usage_frequency <= 100);
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS remember_context BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS returning_user_greeting TEXT;

-- Configurações avançadas
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS response_speed INTEGER DEFAULT 50 CHECK (response_speed >= 0 AND response_speed <= 100);
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS debug_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE mychatbot_2 ADD COLUMN IF NOT EXISTS chat_color TEXT DEFAULT '#3b82f6';

-- Comentários sobre o script
COMMENT ON COLUMN mychatbot_2.formality_level IS 'Nível de formalidade do chatbot (0-100)';
COMMENT ON COLUMN mychatbot_2.use_emojis IS 'Se deve usar emojis nas respostas';
COMMENT ON COLUMN mychatbot_2.memorize_user_name IS 'Se deve memorizar o nome do usuário';
COMMENT ON COLUMN mychatbot_2.paragraph_size IS 'Tamanho dos parágrafos (0-100)';
COMMENT ON COLUMN mychatbot_2.main_topic IS 'Tema principal do chatbot';
COMMENT ON COLUMN mychatbot_2.allowed_topics IS 'Array de temas permitidos';
COMMENT ON COLUMN mychatbot_2.source_strictness IS 'Rigidez nas fontes (0-100)';
COMMENT ON COLUMN mychatbot_2.allow_internet_search IS 'Se permite busca na internet';
COMMENT ON COLUMN mychatbot_2.confidence_threshold IS 'Limite de confiança para resposta (0-100)';
COMMENT ON COLUMN mychatbot_2.fallback_action IS 'Ação quando não souber responder';
COMMENT ON COLUMN mychatbot_2.response_time_promise IS 'Prazo prometido para retorno humano';
COMMENT ON COLUMN mychatbot_2.fallback_message IS 'Mensagem para encaminhamento';
COMMENT ON COLUMN mychatbot_2.main_link IS 'Link principal/adicional';
COMMENT ON COLUMN mychatbot_2.mandatory_link IS 'Se deve incluir link obrigatoriamente';
COMMENT ON COLUMN mychatbot_2.uploaded_documents IS 'Array de documentos anexados';
COMMENT ON COLUMN mychatbot_2.mandatory_phrases IS 'Frases obrigatórias de finalização';
COMMENT ON COLUMN mychatbot_2.auto_link IS 'Se deve incluir links automaticamente';
COMMENT ON COLUMN mychatbot_2.max_list_items IS 'Máximo de itens por lista (1-50)';
COMMENT ON COLUMN mychatbot_2.list_style IS 'Estilo das listas';
COMMENT ON COLUMN mychatbot_2.ask_for_name IS 'Se deve solicitar nome do usuário';
COMMENT ON COLUMN mychatbot_2.name_usage_frequency IS 'Frequência de uso do nome (0-100)';
COMMENT ON COLUMN mychatbot_2.remember_context IS 'Se deve lembrar contexto da conversa';
COMMENT ON COLUMN mychatbot_2.returning_user_greeting IS 'Saudação para usuários retornantes';
COMMENT ON COLUMN mychatbot_2.response_speed IS 'Velocidade de resposta (0-100)';
COMMENT ON COLUMN mychatbot_2.debug_mode IS 'Se deve mostrar informações de debug';
COMMENT ON COLUMN mychatbot_2.chat_color IS 'Cor principal do chat (hex)';

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'mychatbot_2' 
AND column_name IN (
    'formality_level', 'use_emojis', 'memorize_user_name', 'paragraph_size',
    'main_topic', 'allowed_topics', 'source_strictness', 'allow_internet_search',
    'confidence_threshold', 'fallback_action', 'response_time_promise', 'fallback_message',
    'main_link', 'mandatory_link', 'uploaded_documents',
    'mandatory_phrases', 'auto_link', 'max_list_items', 'list_style',
    'ask_for_name', 'name_usage_frequency', 'remember_context', 'returning_user_greeting',
    'response_speed', 'debug_mode', 'chat_color'
)
ORDER BY column_name;

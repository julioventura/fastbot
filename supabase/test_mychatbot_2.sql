-- Script de teste para mychatbot_2

-- Verificar se a tabela existe e sua estrutura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'mychatbot_2' 
ORDER BY ordinal_position;

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_records FROM mychatbot_2;

-- Verificar se há registros para o usuário específico
SELECT * FROM mychatbot_2 WHERE chatbot_user = '81c4ac02-bdc5-4e66-b2aa-8c64c7b9950a';

-- Inserir um registro de teste (substitua o USER_ID pelo ID do usuário logado)
INSERT INTO mychatbot_2 (
    chatbot_user,
    chatbot_name,
    system_message,
    office_address,
    office_hours,
    specialties,
    welcome_message,
    whatsapp,
    created_at,
    updated_at
) VALUES (
    '81c4ac02-bdc5-4e66-b2aa-8c64c7b9950a',
    'Teste Chatbot',
    'Você é um assistente especializado em testes.',
    'Rua Teste, 123',
    'Segunda a Sexta, 9h às 18h',
    'Testes e Desenvolvimento',
    'Olá! Como posso ajudar você hoje?',
    '+55 11 99999-9999',
    NOW(),
    NOW()
) ON CONFLICT (chatbot_user) DO UPDATE SET
    chatbot_name = EXCLUDED.chatbot_name,
    updated_at = NOW();

-- Verificar se o registro foi inserido
SELECT * FROM mychatbot_2 WHERE chatbot_user = '81c4ac02-bdc5-4e66-b2aa-8c64c7b9950a';

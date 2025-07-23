-- TESTE RÁPIDO: Verificar se as novas funções ultimate foram criadas

-- 1. Verificar se as funções existem
SELECT 
    'VERIFICAÇÃO DAS FUNÇÕES ULTIMATE:' as status,
    routine_name,
    security_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_name IN ('delete_user_account_ultimate', 'check_all_user_dependencies')
AND routine_schema = 'public'
ORDER BY routine_name;

-- 2. Identificar TODAS as foreign keys que referenciam auth.users
SELECT 
    'TODAS AS FOREIGN KEYS que referenciam auth.users:' as info,
    tc.constraint_name, 
    tc.table_name,
    kcu.column_name,
    'auth.users' as references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND ccu.table_name = 'users'
AND ccu.table_schema = 'auth'
ORDER BY tc.table_name, kcu.column_name;

-- 3. Verificar se a tabela mychatbot existe (pode ser diferente de mychatbot_2)
SELECT 
    'TABELAS mychatbot* encontradas:' as info,
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name LIKE 'mychatbot%'
AND table_schema = 'public';

-- 4. Se o usuário atual estiver logado, testar a função de verificação
-- SELECT 'TESTE DA FUNÇÃO check_all_user_dependencies (se logado):' as test;
-- SELECT check_all_user_dependencies() as result;

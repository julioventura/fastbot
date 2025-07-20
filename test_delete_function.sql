-- Script de teste para verificar se a função de delete está funcionando
-- Este script testa a função delete_user_account_complete

-- ========================================================
-- VERIFICAR SE AS FUNÇÕES FORAM CRIADAS
-- ========================================================

SELECT 
    'Verificação das funções criadas:' as status,
    routine_name,
    security_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_name IN ('delete_user_account_complete', 'check_user_dependencies')
AND routine_schema = 'public';

-- ========================================================
-- TESTAR FUNÇÃO DE VERIFICAÇÃO DE DEPENDÊNCIAS (para usuário atual)
-- ========================================================

SELECT 'Testando check_user_dependencies:' as test_name;
SELECT check_user_dependencies() as dependencies_result;

-- ========================================================
-- VERIFICAR DADOS ATUAIS (antes da exclusão)
-- ========================================================

SELECT 'Dados atuais no sistema:' as info;

SELECT 
    'auth.users' as table_name,
    count(*) as record_count
FROM auth.users
UNION ALL
SELECT 
    'profiles' as table_name,
    count(*) as record_count
FROM public.profiles
UNION ALL
SELECT 
    'mychatbot_2' as table_name,
    count(*) as record_count
FROM public.mychatbot_2
UNION ALL
SELECT 
    'user_roles' as table_name,
    count(*) as record_count
FROM public.user_roles;

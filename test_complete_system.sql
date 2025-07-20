-- Script completo para testar a exclusão de usuários
-- Cria um usuário de teste e testa a funcionalidade de exclusão

-- ========================================================
-- PART 1: VERIFICAR ESTADO ATUAL DO SISTEMA
-- ========================================================

SELECT 'ESTADO ATUAL DO SISTEMA:' as section_title;

SELECT 
    'Contagem de registros:' as info,
    (SELECT count(*) FROM auth.users) as users_count,
    (SELECT count(*) FROM public.profiles) as profiles_count,
    (SELECT count(*) FROM public.mychatbot_2) as chatbots_count,
    (SELECT count(*) FROM public.user_roles) as user_roles_count;

-- ========================================================
-- PART 2: VERIFICAR SE AS FUNÇÕES EXISTEM
-- ========================================================

SELECT 'VERIFICAÇÃO DAS FUNÇÕES:' as section_title;

SELECT 
    routine_name,
    security_type,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('delete_user_account_complete', 'check_user_dependencies')
AND routine_schema = 'public';

-- ========================================================
-- PART 3: MOSTRAR ESTRUTURA DAS TABELAS RELACIONADAS
-- ========================================================

SELECT 'ESTRUTURA DAS TABELAS:' as section_title;

-- Ver constraints de foreign key
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name IN ('user_roles', 'profiles', 'mychatbot_2') 
     OR ccu.table_name = 'users');

-- ========================================================
-- PART 4: VER DADOS ATUAIS DOS USUÁRIOS (primeiros 3)
-- ========================================================

SELECT 'USUÁRIOS ATUAIS (sample):' as section_title;

SELECT 
    u.id,
    u.email,
    u.created_at as user_created,
    CASE WHEN p.id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_profile,
    CASE WHEN c.chatbot_user IS NOT NULL THEN 'YES' ELSE 'NO' END as has_chatbot,
    COALESCE(ur.roles_count, 0) as roles_count,
    COALESCE(ur_granted.granted_count, 0) as roles_granted_count
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.mychatbot_2 c ON u.id::text = c.chatbot_user
LEFT JOIN (
    SELECT user_id, count(*) as roles_count 
    FROM public.user_roles 
    GROUP BY user_id
) ur ON u.id = ur.user_id
LEFT JOIN (
    SELECT granted_by, count(*) as granted_count 
    FROM public.user_roles 
    GROUP BY granted_by
) ur_granted ON u.id = ur_granted.granted_by
ORDER BY u.created_at DESC
LIMIT 3;

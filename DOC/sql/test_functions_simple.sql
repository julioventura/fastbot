-- Teste simples da função de exclusão de usuário
-- Este script verifica se a função delete_user_account_complete funciona corretamente

-- 1. Verificar se a função existe
SELECT 
    'Função delete_user_account_complete:' as status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'delete_user_account_complete' 
            AND routine_schema = 'public'
        ) THEN 'EXISTE ✓'
        ELSE 'NÃO EXISTE ✗'
    END as function_status;

-- 2. Verificar se a função check_user_dependencies existe
SELECT 
    'Função check_user_dependencies:' as status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'check_user_dependencies' 
            AND routine_schema = 'public'
        ) THEN 'EXISTE ✓'
        ELSE 'NÃO EXISTE ✗'
    END as function_status;

-- 3. Mostrar constraints de foreign key relevantes
SELECT 
    'CONSTRAINTS de Foreign Key encontradas:' as info,
    tc.constraint_name, 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'user_roles';

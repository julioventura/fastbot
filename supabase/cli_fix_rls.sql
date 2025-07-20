-- Diagnóstico e correção via Supabase CLI
-- Verificar status RLS e políticas

SELECT 
    'DIAGNÓSTICO RLS' as secao,
    schemaname, 
    tablename, 
    rowsecurity as rls_ativo
FROM pg_tables 
WHERE tablename = 'mychatbot_2';

SELECT 
    'POLÍTICAS EXISTENTES' as secao,
    schemaname, 
    tablename, 
    policyname, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'mychatbot_2';

-- Desabilitar RLS completamente
ALTER TABLE mychatbot_2 DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas
DROP POLICY IF EXISTS "Enable read for authenticated users" ON mychatbot_2;
DROP POLICY IF EXISTS "Enable insert for own records" ON mychatbot_2;
DROP POLICY IF EXISTS "Enable update for own records" ON mychatbot_2;
DROP POLICY IF EXISTS "Enable delete for own records" ON mychatbot_2;
DROP POLICY IF EXISTS "Simple policy for authenticated users" ON mychatbot_2;

-- Verificar que RLS está desabilitado
SELECT 
    'VERIFICAÇÃO FINAL' as secao,
    schemaname, 
    tablename, 
    rowsecurity as rls_ainda_ativo
FROM pg_tables 
WHERE tablename = 'mychatbot_2';

-- Testar consulta que estava falhando
SELECT 
    'TESTE CONSULTA' as secao,
    COUNT(*) as registros_encontrados
FROM mychatbot_2 
WHERE chatbot_user = '5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f';

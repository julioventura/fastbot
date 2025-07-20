-- ================================================================
-- SCRIPT DE EMERGÊNCIA - EXECUTE NO SQL EDITOR DO SUPABASE DASHBOARD
-- ================================================================

-- 1. VERIFICAR STATUS ATUAL
SELECT 'VERIFICAÇÃO INICIAL - STATUS RLS' as secao;
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'mychatbot_2';

SELECT 'VERIFICAÇÃO INICIAL - POLÍTICAS EXISTENTES' as secao;  
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'mychatbot_2';

-- 2. DESABILITAR RLS COMPLETAMENTE
SELECT 'DESABILITANDO RLS' as secao;
ALTER TABLE public.mychatbot_2 DISABLE ROW LEVEL SECURITY;

-- 3. REMOVER TODAS AS POLÍTICAS
SELECT 'REMOVENDO POLÍTICAS' as secao;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.mychatbot_2;
DROP POLICY IF EXISTS "Enable insert for own records" ON public.mychatbot_2;
DROP POLICY IF EXISTS "Enable update for own records" ON public.mychatbot_2;
DROP POLICY IF EXISTS "Enable delete for own records" ON public.mychatbot_2;
DROP POLICY IF EXISTS "Simple policy for authenticated users" ON public.mychatbot_2;

-- 4. GARANTIR PERMISSÕES
SELECT 'GARANTINDO PERMISSÕES' as secao;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mychatbot_2 TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mychatbot_2 TO anon;

-- 5. VERIFICAÇÃO FINAL
SELECT 'VERIFICAÇÃO FINAL - RLS DEVE ESTAR FALSE' as secao;
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'mychatbot_2';

SELECT 'VERIFICAÇÃO FINAL - DEVE MOSTRAR 0 POLÍTICAS' as secao;
SELECT COUNT(*) as total_policies FROM pg_policies WHERE tablename = 'mychatbot_2';

-- 6. TESTE DA CONSULTA PROBLEMÁTICA
SELECT 'TESTE DA CONSULTA - DEVE RETORNAR SEM ERRO' as secao;
SELECT COUNT(*) as registros_usuario 
FROM public.mychatbot_2 
WHERE chatbot_user = '5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f';

SELECT 'SCRIPT CONCLUÍDO - TESTE NO FRONTEND AGORA!' as status;

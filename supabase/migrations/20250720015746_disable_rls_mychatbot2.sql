-- Desabilitar RLS completamente na tabela mychatbot_2
-- Esta migração resolve o erro 406 (Not Acceptable)

-- 1. Desabilitar RLS
ALTER TABLE public.mychatbot_2 DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.mychatbot_2;
DROP POLICY IF EXISTS "Enable insert for own records" ON public.mychatbot_2;
DROP POLICY IF EXISTS "Enable update for own records" ON public.mychatbot_2;
DROP POLICY IF EXISTS "Enable delete for own records" ON public.mychatbot_2;
DROP POLICY IF EXISTS "Simple policy for authenticated users" ON public.mychatbot_2;

-- 3. Garantir permissões diretas para authenticated e anon roles
GRANT ALL ON public.mychatbot_2 TO authenticated;
GRANT ALL ON public.mychatbot_2 TO anon;

-- 4. Verificação (comentado para não aparecer na migração)
-- SELECT 'RLS Status:' as info, tablename, rowsecurity FROM pg_tables WHERE tablename = 'mychatbot_2';
-- SELECT 'Policies Count:' as info, COUNT(*) as total FROM pg_policies WHERE tablename = 'mychatbot_2';
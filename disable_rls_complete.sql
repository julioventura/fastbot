-- Comando SQL direto para desabilitar RLS completamente
ALTER TABLE public.mychatbot_2 DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.mychatbot_2;
DROP POLICY IF EXISTS "Enable insert for own records" ON public.mychatbot_2;
DROP POLICY IF EXISTS "Enable update for own records" ON public.mychatbot_2;
DROP POLICY IF EXISTS "Enable delete for own records" ON public.mychatbot_2;
DROP POLICY IF EXISTS "Simple policy for authenticated users" ON public.mychatbot_2;

-- Garantir que authenticated role tenha acesso direto à tabela
GRANT ALL ON public.mychatbot_2 TO authenticated;
GRANT ALL ON public.mychatbot_2 TO anon;

-- Verificar se RLS foi desabilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'mychatbot_2';

-- Verificar se não há mais políticas
SELECT COUNT(*) as total_policies FROM pg_policies WHERE tablename = 'mychatbot_2';

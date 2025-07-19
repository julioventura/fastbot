-- Debug e correção das políticas de RLS para mychatbot_2

-- 1. Primeiro, vamos verificar as políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'mychatbot_2';

-- 2. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'mychatbot_2';

-- 3. Remover todas as políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view own chatbot data" ON mychatbot_2;
DROP POLICY IF EXISTS "Users can insert own chatbot data" ON mychatbot_2;
DROP POLICY IF EXISTS "Users can update own chatbot data" ON mychatbot_2;
DROP POLICY IF EXISTS "Users can delete own chatbot data" ON mychatbot_2;

-- 4. Temporariamente desabilitar RLS para teste
ALTER TABLE mychatbot_2 DISABLE ROW LEVEL SECURITY;

-- 5. Reabilitar RLS
ALTER TABLE mychatbot_2 ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas mais simples primeiro (apenas SELECT para teste)
CREATE POLICY "Enable read access for own records" ON mychatbot_2
    FOR SELECT USING (auth.uid()::text = chatbot_user);

-- 7. Verificar novamente as políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'mychatbot_2';

-- 8. Testar uma consulta simples
-- SELECT * FROM mychatbot_2 WHERE chatbot_user = auth.uid()::text;

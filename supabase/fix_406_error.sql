-- Fix 406 error for mychatbot_2 table
-- Script para corrigir erro 406 na tabela mychatbot_2

-- 1. Verificar se a tabela existe e seu esquema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'mychatbot_2';

-- 2. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'mychatbot_2';

-- 3. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'mychatbot_2';

-- 4. Temporariamente desabilitar RLS para teste
ALTER TABLE mychatbot_2 DISABLE ROW LEVEL SECURITY;

-- 5. Verificar se a consulta funciona sem RLS
-- SELECT * FROM mychatbot_2 LIMIT 5;

-- 6. Reabilitar RLS
ALTER TABLE mychatbot_2 ENABLE ROW LEVEL SECURITY;

-- 7. Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can view own chatbot data" ON mychatbot_2;
DROP POLICY IF EXISTS "Users can insert own chatbot data" ON mychatbot_2;
DROP POLICY IF EXISTS "Users can update own chatbot data" ON mychatbot_2;
DROP POLICY IF EXISTS "Users can delete own chatbot data" ON mychatbot_2;

-- 8. Criar política simples e funcional
CREATE POLICY "Enable all operations for authenticated users" ON mychatbot_2
    FOR ALL USING (auth.role() = 'authenticated');

-- 9. Verificar as novas políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'mychatbot_2';

-- 10. Testar consulta após as correções
-- SELECT * FROM mychatbot_2 WHERE chatbot_user = '81c4ac02-bdc5-4e66-b2aa-8c64c7b9950a';

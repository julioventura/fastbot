-- Script para corrigir erro 406 na tabela mychatbot_2
-- Este script resolve o problema quando usuários sem chatbot configurado fazem login

-- ================================
-- DIAGNÓSTICO INICIAL
-- ================================

-- 1. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'mychatbot_2' 
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'mychatbot_2';

-- 3. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'mychatbot_2';

-- 4. Contar registros na tabela
SELECT COUNT(*) as total_records FROM mychatbot_2;

-- ================================
-- CORREÇÃO DO PROBLEMA
-- ================================

-- 5. Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can view own chatbot data" ON mychatbot_2;
DROP POLICY IF EXISTS "Users can insert own chatbot data" ON mychatbot_2;
DROP POLICY IF EXISTS "Users can update own chatbot data" ON mychatbot_2;
DROP POLICY IF EXISTS "Users can delete own chatbot data" ON mychatbot_2;
DROP POLICY IF EXISTS "Enable read access for own records" ON mychatbot_2;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON mychatbot_2;

-- 6. Criar política simples e funcional para SELECT (permitir consultar registros próprios OU quando não há registro)
CREATE POLICY "Users can view own chatbot data" ON mychatbot_2
    FOR SELECT TO authenticated
    USING (
        auth.uid()::text = chatbot_user 
        OR 
        NOT EXISTS (SELECT 1 FROM mychatbot_2 WHERE chatbot_user = auth.uid()::text)
    );

-- 7. Política para INSERT (permitir criar novo registro)
CREATE POLICY "Users can insert own chatbot data" ON mychatbot_2
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = chatbot_user);

-- 8. Política para UPDATE (permitir atualizar próprio registro)
CREATE POLICY "Users can update own chatbot data" ON mychatbot_2
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = chatbot_user)
    WITH CHECK (auth.uid()::text = chatbot_user);

-- 9. Política para DELETE (permitir deletar próprio registro)
CREATE POLICY "Users can delete own chatbot data" ON mychatbot_2
    FOR DELETE TO authenticated
    USING (auth.uid()::text = chatbot_user);

-- ================================
-- VERIFICAÇÃO FINAL
-- ================================

-- 10. Verificar as novas políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'mychatbot_2';

-- ================================
-- TESTE DE FUNCIONALIDADE
-- ================================

-- 11. Testar consulta que estava falhando (substitua o UUID pelo do usuário com problema)
-- SELECT * FROM mychatbot_2 WHERE chatbot_user = '5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f';

-- 12. Testar consulta geral com auth.uid()
-- SELECT * FROM mychatbot_2 WHERE chatbot_user = auth.uid()::text;

-- ================================
-- NOTAS IMPORTANTES
-- ================================

/*
PROBLEMA IDENTIFICADO:
- Usuário sem chatbot configurado faz login
- Frontend tenta buscar dados com: WHERE chatbot_user = eq.{user_id}
- RLS bloqueia consulta porque não há registro para o usuário
- Retorna erro 406 em vez de resultado vazio

SOLUÇÃO:
- Política RLS modificada para permitir SELECT mesmo quando não há registro
- Isso permite ao frontend identificar que não há chatbot configurado
- Frontend pode então criar um novo registro conforme implementado no código

PRÓXIMO PASSO:
- Execute este script no SQL Editor do Supabase
- Teste fazendo login com o usuário que estava com problema
- Verifique se o erro 406 foi resolvido
*/

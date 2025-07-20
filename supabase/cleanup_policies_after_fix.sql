-- Script de limpeza e verificação após execução do fix_406_error_complete.sql
-- Remove política genérica que pode estar causando conflito

-- ================================
-- LIMPEZA DE POLÍTICAS CONFLITANTES
-- ================================

-- Remover a política genérica que pode estar conflitando
DROP POLICY IF EXISTS "mychatbot_2_policy" ON mychatbot_2;

-- ================================
-- VERIFICAÇÃO FINAL DAS POLÍTICAS
-- ================================

-- Verificar políticas restantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'mychatbot_2'
ORDER BY cmd, policyname;

-- ================================
-- TESTE FINAL COM O USUÁRIO PROBLEMÁTICO
-- ================================

-- Testar a consulta específica que estava falhando
-- Substitua o UUID pelo do usuário com problema se necessário
SELECT * FROM mychatbot_2 WHERE chatbot_user = '5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f';

-- Testar se a política permite consulta vazia para usuário sem chatbot
-- (Esta consulta deve retornar 0 registros sem erro)
SELECT COUNT(*) as registros_encontrados 
FROM mychatbot_2 
WHERE chatbot_user = '5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f';

-- ================================
-- VERIFICAÇÃO DE ESTRUTURA
-- ================================

-- Confirmar que RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'mychatbot_2';

-- Contar total de registros
SELECT COUNT(*) as total_chatbots_configurados FROM mychatbot_2;

-- ================================
-- PRÓXIMOS PASSOS
-- ================================

/*
APÓS EXECUTAR ESTE SCRIPT:

1. Verifique se apenas 4 políticas permanecem:
   - Users can view own chatbot data (SELECT)
   - Users can insert own chatbot data (INSERT)  
   - Users can update own chatbot data (UPDATE)
   - Users can delete own chatbot data (DELETE)

2. Teste no frontend:
   - Faça login com o usuário que tinha problema (5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f)
   - Verifique se não há mais erro 406
   - Confirme se o chatbot é criado automaticamente

3. Se ainda houver problemas:
   - Verifique os logs do navegador
   - Confirme se está usando o Supabase correto (auto-hosted)
   - Teste com outro usuário sem chatbot configurado
*/

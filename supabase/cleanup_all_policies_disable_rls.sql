-- LIMPEZA TOTAL E CORREÇÃO DEFINITIVA
-- Remove todas as políticas conflitantes e cria uma solução simples

-- ================================
-- LIMPEZA COMPLETA DAS POLÍTICAS
-- ================================

-- Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Enable read for authenticated users" ON mychatbot_2;
DROP POLICY IF EXISTS "Enable insert for own records" ON mychatbot_2;
DROP POLICY IF EXISTS "Enable update for own records" ON mychatbot_2;
DROP POLICY IF EXISTS "Enable delete for own records" ON mychatbot_2;
DROP POLICY IF EXISTS "Simple policy for authenticated users" ON mychatbot_2;

-- ================================
-- DESABILITAR RLS COMPLETAMENTE (TEMPORÁRIO)
-- ================================

-- Desabilitar RLS para teste definitivo
ALTER TABLE mychatbot_2 DISABLE ROW LEVEL SECURITY;

-- ================================
-- VERIFICAÇÃO
-- ================================

-- Verificar que não há mais políticas
SELECT COUNT(*) as total_policies 
FROM pg_policies 
WHERE tablename = 'mychatbot_2';

-- Verificar que RLS está desabilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'mychatbot_2';

-- Testar consulta (deve funcionar sem erro)
SELECT * FROM mychatbot_2 WHERE chatbot_user = '5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f';

/*
APÓS EXECUTAR ESTE SCRIPT:

1. Teste IMEDIATAMENTE no frontend
2. Faça logout/login com o usuário problemático
3. Se funcionar sem erro 406:
   - O problema estava nas políticas RLS
   - Podemos reabilitar RLS depois com política correta
4. Se AINDA tiver erro 406:
   - O problema é mais profundo (servidor, cache, etc.)
   - Precisaremos investigar outras causas

IMPORTANTE: 
RLS está desabilitado temporariamente para diagnóstico.
Só reabilite depois de confirmar que funciona.
*/

-- SCRIPT SIMPLIFICADO PARA CORREÇÃO DO ERRO 406
-- Corrigido para PostgreSQL mais recente

-- ================================
-- DIAGNÓSTICO BÁSICO
-- ================================

-- 1. Verificar se a tabela existe
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'mychatbot_2';

-- 2. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'mychatbot_2' 
ORDER BY ordinal_position;

-- 3. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'mychatbot_2';

-- 4. Verificar políticas atuais
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'mychatbot_2';

-- ================================
-- SOLUÇÃO DIRETA: DESABILITAR RLS TEMPORARIAMENTE
-- ================================

-- Desabilitar RLS para teste
ALTER TABLE mychatbot_2 DISABLE ROW LEVEL SECURITY;

-- Testar consulta (deve funcionar agora)
SELECT COUNT(*) as total_records FROM mychatbot_2;

-- Testar consulta específica
SELECT * FROM mychatbot_2 WHERE chatbot_user = '5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f';

-- ================================
-- TESTE IMEDIATO NO FRONTEND
-- ================================

/*
AGORA TESTE NO FRONTEND:

1. Faça logout
2. Faça login com o usuário problemático
3. Veja se o erro 406 desapareceu
4. Se funcionar, podemos reabilitar RLS com políticas corretas

SE FUNCIONAR, CONTINUE COM O PRÓXIMO BLOCO
SE NÃO FUNCIONAR, PARE AQUI E ME INFORME
*/

-- ================================
-- SE FUNCIONOU, REABILITAR RLS COM POLÍTICA SIMPLES
-- ================================

-- Reabilitar RLS
ALTER TABLE mychatbot_2 ENABLE ROW LEVEL SECURITY;

-- Criar política simples para authenticated users
CREATE POLICY "Simple policy for authenticated users" ON mychatbot_2
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Verificar nova política
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'mychatbot_2';

-- ================================
-- TESTE FINAL
-- ================================

-- Testar novamente com RLS habilitado
SELECT * FROM mychatbot_2 WHERE chatbot_user = '5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f';

/*
PRÓXIMOS PASSOS:

1. Execute até a linha 38 (antes do bloco "SE FUNCIONOU")
2. Teste no frontend
3. Se funcionar, execute o resto do script
4. Se não funcionar, me informe que ainda há problema

O script está dividido em etapas para facilitar o diagnóstico.
*/

-- DIAGNÓSTICO COMPLETO E CORREÇÃO FINAL DO ERRO 406
-- Vamos investigar e resolver definitivamente o problema

-- ================================
-- DIAGNÓSTICO AVANÇADO
-- ================================

-- 1. Verificar se a tabela mychatbot_2 realmente existe
SELECT table_name, table_schema, table_type 
FROM information_schema.tables 
WHERE table_name = 'mychatbot_2';

-- 2. Verificar estrutura completa da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'mychatbot_2' 
ORDER BY ordinal_position;

-- 3. Verificar se RLS está realmente habilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    tablespace
FROM pg_tables 
WHERE tablename = 'mychatbot_2';

-- 4. Verificar políticas atuais (deve mostrar as 4 que criamos)
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'mychatbot_2'
ORDER BY cmd, policyname;

-- 5. Verificar permissões da tabela
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type, 
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'mychatbot_2';

-- ================================
-- TESTE DIRETO SEM RLS
-- ================================

-- Temporariamente desabilitar RLS para teste
ALTER TABLE mychatbot_2 DISABLE ROW LEVEL SECURITY;

-- Testar consulta direta (deve funcionar sem RLS)
SELECT COUNT(*) as total_records FROM mychatbot_2;

-- Testar consulta específica do usuário
SELECT * FROM mychatbot_2 WHERE chatbot_user = '5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f';

-- Reabilitar RLS
ALTER TABLE mychatbot_2 ENABLE ROW LEVEL SECURITY;

-- ================================
-- ESTRATÉGIA ALTERNATIVA: POLÍTICA MAIS SIMPLES
-- ================================

-- Remover todas as políticas novamente
DROP POLICY IF EXISTS "Enable read for authenticated users" ON mychatbot_2;
DROP POLICY IF EXISTS "Enable insert for own records" ON mychatbot_2;
DROP POLICY IF EXISTS "Enable update for own records" ON mychatbot_2;
DROP POLICY IF EXISTS "Enable delete for own records" ON mychatbot_2;

-- Criar uma política única e simples para ALL operations
CREATE POLICY "Allow authenticated users full access" ON mychatbot_2
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- ================================
-- VERIFICAÇÃO FINAL
-- ================================

-- Verificar a nova política
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'mychatbot_2';

-- ================================
-- TESTE FINAL
-- ================================

-- Testar novamente a consulta problemática
SELECT * FROM mychatbot_2 WHERE chatbot_user = '5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f';

-- Testar insert (simulando o que o frontend faz)
-- COMENTADO para não executar acidentalmente
/*
INSERT INTO mychatbot_2 (
    chatbot_user,
    system_message,
    office_address,
    office_hours,
    specialties,
    chatbot_name,
    welcome_message,
    whatsapp
) VALUES (
    '5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
);
*/

-- ================================
-- ALTERNATIVA: DESABILITAR RLS TEMPORARIAMENTE
-- ================================

/*
Se nada funcionar, use esta alternativa temporária:

-- Desabilitar RLS completamente (APENAS PARA TESTE)
ALTER TABLE mychatbot_2 DISABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Reabilite RLS depois de resolver:
-- ALTER TABLE mychatbot_2 ENABLE ROW LEVEL SECURITY;
*/

-- ================================
-- NOTAS DE DIAGNÓSTICO
-- ================================

/*
POSSÍVEIS CAUSAS DO ERRO 406:

1. RLS habilitado mas sem políticas funcionais
2. Políticas com sintaxe incorreta
3. Problemas de permissão na tabela
4. Cache do Supabase não atualizado
5. Problemas com auth.uid() no contexto

PRÓXIMOS PASSOS:

1. Execute este script completo
2. Analise os resultados do diagnóstico
3. Se ainda houver erro 406, considere desabilitar RLS temporariamente
4. Teste no frontend após cada alteração
5. Se funcionar, podemos recriar políticas mais restritivas depois

IMPORTANTE:
A política "Allow authenticated users full access" é temporária e permissiva.
Use apenas para resolver o problema imediato.
*/

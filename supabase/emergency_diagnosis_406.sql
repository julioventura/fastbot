-- VERIFICAÇÃO URGENTE: Por que ainda há erro 406?
-- Vamos descobrir o que realmente está acontecendo

-- ================================
-- VERIFICAÇÃO CRÍTICA
-- ================================

-- 1. Confirmar se RLS realmente está desabilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '❌ RLS AINDA ATIVO'
        WHEN rowsecurity = false THEN '✅ RLS DESABILITADO'
        ELSE '❓ ESTADO DESCONHECIDO'
    END as status
FROM pg_tables 
WHERE tablename = 'mychatbot_2';

-- 2. Contar políticas existentes (deve ser 0 se limpeza funcionou)
SELECT 
    COUNT(*) as total_policies,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ SEM POLÍTICAS'
        ELSE '❌ AINDA HÁ POLÍTICAS'
    END as status
FROM pg_policies 
WHERE tablename = 'mychatbot_2';

-- 3. Listar políticas existentes (se houver)
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'mychatbot_2';

-- ================================
-- TESTE DE CONSULTA DIRETA
-- ================================

-- 4. Testar consulta simples
SELECT 'TESTE CONSULTA SIMPLES' as teste;

-- 5. Testar count na tabela
SELECT COUNT(*) as total_registros FROM mychatbot_2;

-- 6. Testar consulta com filtro específico
SELECT 
    chatbot_user,
    chatbot_name,
    system_message
FROM mychatbot_2 
WHERE chatbot_user = '5e9f5f3d-0cbd-43a7-adfc-a5eead28f69f';

-- ================================
-- FORÇAR DESABILITAÇÃO COMPLETA
-- ================================

-- 7. Forçar desabilitação RLS novamente
ALTER TABLE mychatbot_2 DISABLE ROW LEVEL SECURITY;

-- 8. Verificar novamente
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity = false THEN 'RLS AGORA DESABILITADO'
        ELSE 'RLS AINDA ATIVO - PROBLEMA CRÍTICO!'
    END as resultado
FROM pg_tables 
WHERE tablename = 'mychatbot_2';

-- ================================
-- INVESTIGAÇÃO ADICIONAL
-- ================================

-- 9. Verificar se a tabela tem owner correto
SELECT 
    t.table_name,
    t.table_schema,
    pg_get_userbyid(c.relowner) as table_owner
FROM information_schema.tables t
JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_name = 'mychatbot_2';

-- 10. Verificar permissões da tabela
SELECT 
    grantee, 
    privilege_type, 
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'mychatbot_2'
ORDER BY grantee, privilege_type;

-- ================================
-- POSSÍVEL PROBLEMA: CACHE
-- ================================

/*
SE RLS ESTÁ DESABILITADO MAS AINDA HÁ ERRO 406:

POSSÍVEIS CAUSAS:

1. Cache do Supabase não atualizou
2. Problema com a instância auto-hosted
3. Conflito com outras configurações
4. Problema de rede/proxy

SOLUÇÕES A TENTAR:

A) Reiniciar o Supabase (se possível)
B) Aguardar alguns minutos para cache limpar
C) Verificar se há múltiplas instâncias rodando
D) Testar com outro usuário
E) Mudar para Supabase Cloud temporariamente

PRÓXIMOS PASSOS:

1. Execute este script completo
2. Analise os resultados
3. Se RLS está desabilitado mas erro persiste = problema de cache/servidor
4. Considere usar Supabase Cloud temporariamente
*/

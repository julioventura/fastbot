-- ========================================================
-- CRIAR FUNÇÕES PARA DELETAR CONTA DE USUÁRIO
-- ========================================================

-- Função 1: Deletar usuário com confirmação de email (mais segura)
CREATE OR REPLACE FUNCTION self_delete_user_with_email(confirm_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id uuid;
    current_user_email text;
    result json;
BEGIN
    -- Obter ID e email do usuário atual
    SELECT auth.uid() INTO current_user_id;
    SELECT email FROM auth.users WHERE id = current_user_id INTO current_user_email;
    
    -- Verificar se usuário está autenticado
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuário não autenticado'
        );
    END IF;
    
    -- Verificar se o email de confirmação confere
    IF current_user_email != confirm_email THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Email de confirmação não confere'
        );
    END IF;
    
    BEGIN
        -- Deletar dados relacionados primeiro
        DELETE FROM public.mychatbot_2 WHERE chatbot_user = current_user_id::text;
        DELETE FROM public.profiles WHERE id = current_user_id;
        
        -- Deletar usuário do auth
        DELETE FROM auth.users WHERE id = current_user_id;
        
        RETURN json_build_object(
            'success', true,
            'message', 'Conta deletada com sucesso'
        );
        
    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao deletar conta: ' || SQLERRM
        );
    END;
END;
$$;

-- Função 2: Deletar usuário sem confirmação (mais simples)
CREATE OR REPLACE FUNCTION self_delete_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id uuid;
    result json;
BEGIN
    -- Obter ID do usuário atual
    SELECT auth.uid() INTO current_user_id;
    
    -- Verificar se usuário está autenticado
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuário não autenticado'
        );
    END IF;
    
    BEGIN
        -- Deletar dados relacionados primeiro
        DELETE FROM public.mychatbot_2 WHERE chatbot_user = current_user_id::text;
        DELETE FROM public.profiles WHERE id = current_user_id;
        
        -- Deletar usuário do auth
        DELETE FROM auth.users WHERE id = current_user_id;
        
        RETURN json_build_object(
            'success', true,
            'message', 'Conta deletada com sucesso'
        );
        
    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao deletar conta: ' || SQLERRM
        );
    END;
END;
$$;

-- Função 3: Deletar usuário por email (fallback admin)
CREATE OR REPLACE FUNCTION simple_delete_user(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id_to_delete uuid;
    current_user_id uuid;
    result json;
BEGIN
    -- Obter ID do usuário atual
    SELECT auth.uid() INTO current_user_id;
    
    -- Verificar se usuário está autenticado
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuário não autenticado'
        );
    END IF;
    
    -- Encontrar o usuário pelo email
    SELECT id FROM auth.users WHERE email = user_email INTO user_id_to_delete;
    
    -- Verificar se é o próprio usuário
    IF user_id_to_delete != current_user_id THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Só é possível deletar sua própria conta'
        );
    END IF;
    
    BEGIN
        -- Deletar dados relacionados primeiro
        DELETE FROM public.mychatbot_2 WHERE chatbot_user = user_id_to_delete::text;
        DELETE FROM public.profiles WHERE id = user_id_to_delete;
        
        -- Deletar usuário do auth
        DELETE FROM auth.users WHERE id = user_id_to_delete;
        
        RETURN json_build_object(
            'success', true,
            'message', 'Conta deletada com sucesso'
        );
        
    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao deletar conta: ' || SQLERRM
        );
    END;
END;
$$;

-- ========================================================
-- CONCEDER PERMISSÕES
-- ========================================================

-- Permitir que usuários autenticados executem as funções
GRANT EXECUTE ON FUNCTION self_delete_user_with_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION self_delete_user() TO authenticated;
GRANT EXECUTE ON FUNCTION simple_delete_user(text) TO authenticated;

-- ========================================================
-- TESTES DAS FUNÇÕES (COMENTADOS POR SEGURANÇA)
-- ========================================================

/*
-- ATENÇÃO: NÃO EXECUTE ESTES TESTES EM PRODUÇÃO!

-- Teste 1: Função com confirmação de email
SELECT self_delete_user_with_email('test@example.com');

-- Teste 2: Função simples
SELECT self_delete_user();

-- Teste 3: Função por email
SELECT simple_delete_user('test@example.com');
*/

-- ========================================================
-- VERIFICAÇÃO DAS FUNÇÕES CRIADAS
-- ========================================================

-- Listar as funções criadas
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name IN (
    'self_delete_user_with_email',
    'self_delete_user', 
    'simple_delete_user'
)
AND routine_schema = 'public';

-- ========================================================
-- NOTAS IMPORTANTES
-- ========================================================

/*
FUNCIONALIDADES IMPLEMENTADAS:

1. self_delete_user_with_email(email):
   - Mais segura, exige confirmação do email
   - Verifica se o email informado é do usuário atual
   - Deleta dados das tabelas relacionadas e auth.users

2. self_delete_user():
   - Mais simples, sem confirmação de email
   - Deleta automaticamente a conta do usuário autenticado
   - Mais rápida mas menos segura

3. simple_delete_user(email):
   - Fallback compatível com código existente
   - Verifica se usuário só está deletando própria conta
   - Previne exclusão de contas de terceiros

SEGURANÇA:
- Todas as funções usam SECURITY DEFINER (executam com privilégios do criador)
- Verificam autenticação via auth.uid()
- Previnem exclusão de contas de terceiros
- Fazem limpeza de todas as tabelas relacionadas

ORDEM DE EXCLUSÃO:
1. Dados das tabelas public (mychatbot_2, profiles)
2. Usuário da tabela auth.users

Isso evita erros de foreign key constraints.
*/

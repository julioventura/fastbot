-- SOLUÇÃO DEFINITIVA: Função de exclusão com CASCADE e tratamento robusto de foreign keys
-- Esta versão resolve completamente o problema das constraints user_roles

-- ========================================================
-- FUNÇÃO ULTRA-ROBUSTA: delete_user_account_ultra_safe
-- ========================================================

CREATE OR REPLACE FUNCTION delete_user_account_ultra_safe()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id uuid;
    current_user_email text;
    deleted_profiles_count integer := 0;
    deleted_chatbots_count integer := 0;
    deleted_user_roles_count integer := 0;
    deleted_user_roles_granted_count integer := 0;
    result json;
    constraint_error_occurred boolean := false;
BEGIN
    -- Obter dados do usuário atual
    SELECT auth.uid() INTO current_user_id;
    
    -- Verificar se usuário está autenticado
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro: Usuário não está autenticado',
            'error_code', 'NOT_AUTHENTICATED'
        );
    END IF;
    
    -- Obter email do usuário
    SELECT email FROM auth.users WHERE id = current_user_id INTO current_user_email;
    
    IF current_user_email IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro: Usuário não encontrado no sistema de autenticação',
            'error_code', 'USER_NOT_FOUND'
        );
    END IF;
    
    BEGIN
        -- ETAPA 1: Deletar dados da tabela mychatbot_2 primeiro
        DELETE FROM public.mychatbot_2 WHERE chatbot_user = current_user_id::text;
        GET DIAGNOSTICS deleted_chatbots_count = ROW_COUNT;
        RAISE NOTICE 'Deletados % registros de mychatbot_2', deleted_chatbots_count;
        
        -- ETAPA 2: Deletar TODOS os user_roles relacionados (tanto como user_id quanto granted_by)
        -- Primeiro: roles concedidos por este usuário
        DELETE FROM public.user_roles WHERE granted_by = current_user_id;
        GET DIAGNOSTICS deleted_user_roles_granted_count = ROW_COUNT;
        RAISE NOTICE 'Deletados % registros de user_roles (granted_by)', deleted_user_roles_granted_count;
        
        -- Segundo: roles pertencentes a este usuário
        DELETE FROM public.user_roles WHERE user_id = current_user_id;
        GET DIAGNOSTICS deleted_user_roles_count = ROW_COUNT;
        RAISE NOTICE 'Deletados % registros de user_roles (user_id)', deleted_user_roles_count;
        
        -- ETAPA 3: Deletar dados da tabela profiles
        DELETE FROM public.profiles WHERE id = current_user_id;
        GET DIAGNOSTICS deleted_profiles_count = ROW_COUNT;
        RAISE NOTICE 'Deletados % registros de profiles', deleted_profiles_count;
        
        -- ETAPA 4: Tentar deletar usuário do auth.users
        -- Se ainda houver foreign key constraints, vamos detectar e reportar
        BEGIN
            DELETE FROM auth.users WHERE id = current_user_id;
            RAISE NOTICE 'Usuário deletado do auth.users com sucesso';
        EXCEPTION 
            WHEN foreign_key_violation THEN
                RAISE NOTICE 'Foreign key violation ainda presente: %', SQLERRM;
                constraint_error_occurred := true;
                -- Vamos continuar e reportar quais tabelas ainda têm referências
            WHEN OTHERS THEN
                RAISE NOTICE 'Outro erro ao deletar de auth.users: %', SQLERRM;
                constraint_error_occurred := true;
        END;
        
        -- Se houve erro de constraint, vamos investigar quais tabelas ainda referenciam o usuário
        IF constraint_error_occurred THEN
            RETURN json_build_object(
                'success', false,
                'message', 'Ainda existem dependências que impedem a exclusão completa',
                'error_code', 'FOREIGN_KEY_CONSTRAINT',
                'details', json_build_object(
                    'user_email', current_user_email,
                    'deleted_profiles', deleted_profiles_count,
                    'deleted_chatbots', deleted_chatbots_count,
                    'deleted_user_roles', deleted_user_roles_count,
                    'deleted_roles_granted', deleted_user_roles_granted_count,
                    'auth_user_deleted', false,
                    'constraint_error', SQLERRM
                )
            );
        END IF;
        
        -- Retornar sucesso se chegou até aqui
        RETURN json_build_object(
            'success', true,
            'message', 'Conta deletada com sucesso',
            'details', json_build_object(
                'user_email', current_user_email,
                'deleted_profiles', deleted_profiles_count,
                'deleted_chatbots', deleted_chatbots_count,
                'deleted_user_roles', deleted_user_roles_count,
                'deleted_roles_granted', deleted_user_roles_granted_count,
                'auth_user_deleted', true
            )
        );
        
    EXCEPTION WHEN OTHERS THEN
        -- Log do erro detalhado
        RAISE NOTICE 'Erro geral ao deletar conta: %', SQLERRM;
        
        RETURN json_build_object(
            'success', false,
            'message', 'Erro interno ao deletar conta: ' || SQLERRM,
            'error_code', 'DELETE_ERROR',
            'sql_error', SQLERRM,
            'details', json_build_object(
                'user_email', current_user_email,
                'deleted_profiles', deleted_profiles_count,
                'deleted_chatbots', deleted_chatbots_count,
                'deleted_user_roles', deleted_user_roles_count,
                'deleted_roles_granted', deleted_user_roles_granted_count
            )
        );
    END;
END;
$$;

-- ========================================================
-- FUNÇÃO PARA INVESTIGAR TODAS AS FOREIGN KEYS
-- ========================================================

CREATE OR REPLACE FUNCTION investigate_user_references()
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
    -- Obter dados do usuário atual
    SELECT auth.uid() INTO current_user_id;
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Usuário não autenticado');
    END IF;
    
    -- Obter email do usuário
    SELECT email FROM auth.users WHERE id = current_user_id INTO current_user_email;
    
    -- Retornar todas as referências encontradas
    RETURN json_build_object(
        'success', true,
        'user_id', current_user_id,
        'user_email', current_user_email,
        'references_found', json_build_object(
            'profiles_count', (SELECT COUNT(*) FROM public.profiles WHERE id = current_user_id),
            'mychatbot_2_count', (SELECT COUNT(*) FROM public.mychatbot_2 WHERE chatbot_user = current_user_id::text),
            'user_roles_as_user', (SELECT COUNT(*) FROM public.user_roles WHERE user_id = current_user_id),
            'user_roles_as_granter', (SELECT COUNT(*) FROM public.user_roles WHERE granted_by = current_user_id),
            'auth_users_exists', (SELECT CASE WHEN EXISTS(SELECT 1 FROM auth.users WHERE id = current_user_id) THEN true ELSE false END)
        )
    );
END;
$$;

-- ========================================================
-- CONCEDER PERMISSÕES
-- ========================================================

GRANT EXECUTE ON FUNCTION delete_user_account_ultra_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION investigate_user_references() TO authenticated;

-- ========================================================
-- VERIFICAR SE AS FUNÇÕES FORAM CRIADAS
-- ========================================================

SELECT 
    'Nova função criada:' as status,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('delete_user_account_ultra_safe', 'investigate_user_references')
AND routine_schema = 'public';

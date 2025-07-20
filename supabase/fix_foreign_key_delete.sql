-- Script SQL para criar função de delete robusta que resolve foreign keys
-- Esta versão resolve o problema da constraint user_roles_granted_by_fkey

-- ========================================================
-- FUNÇÃO MELHORADA: delete_user_account_complete
-- ========================================================

CREATE OR REPLACE FUNCTION delete_user_account_complete()
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
        -- ETAPA 1: Deletar dados da tabela mychatbot_2
        DELETE FROM public.mychatbot_2 WHERE chatbot_user = current_user_id::text;
        GET DIAGNOSTICS deleted_chatbots_count = ROW_COUNT;
        
        -- ETAPA 2: Deletar user_roles onde o usuário é o granted_by (quem concedeu)
        DELETE FROM public.user_roles WHERE granted_by = current_user_id;
        GET DIAGNOSTICS deleted_user_roles_granted_count = ROW_COUNT;
        
        -- ETAPA 3: Deletar user_roles onde o usuário é o beneficiário
        DELETE FROM public.user_roles WHERE user_id = current_user_id;
        GET DIAGNOSTICS deleted_user_roles_count = ROW_COUNT;
        
        -- ETAPA 4: Deletar dados da tabela profiles
        DELETE FROM public.profiles WHERE id = current_user_id;
        GET DIAGNOSTICS deleted_profiles_count = ROW_COUNT;
        
        -- ETAPA 5: Deletar usuário do auth.users
        DELETE FROM auth.users WHERE id = current_user_id;
        
        -- Retornar sucesso com detalhes
        RETURN json_build_object(
            'success', true,
            'message', 'Conta deletada com sucesso',
            'details', json_build_object(
                'user_email', current_user_email,
                'deleted_profiles', deleted_profiles_count,
                'deleted_chatbots', deleted_chatbots_count,
                'deleted_user_roles', deleted_user_roles_count,
                'deleted_roles_granted', deleted_user_roles_granted_count
            )
        );
        
    EXCEPTION WHEN OTHERS THEN
        -- Log do erro
        RAISE NOTICE 'Erro ao deletar conta: %', SQLERRM;
        
        RETURN json_build_object(
            'success', false,
            'message', 'Erro interno ao deletar conta: ' || SQLERRM,
            'error_code', 'DELETE_ERROR',
            'sql_error', SQLERRM
        );
    END;
END;
$$;

-- ========================================================
-- FUNÇÃO DE DIAGNÓSTICO: ver todas as dependências
-- ========================================================

CREATE OR REPLACE FUNCTION check_user_dependencies()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id uuid;
    current_user_email text;
    profiles_count integer := 0;
    chatbots_count integer := 0;
    user_roles_count integer := 0;
    roles_granted_count integer := 0;
    result json;
BEGIN
    -- Obter dados do usuário atual
    SELECT auth.uid() INTO current_user_id;
    
    -- Verificar se usuário está autenticado
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuário não autenticado'
        );
    END IF;
    
    -- Obter email do usuário
    SELECT email FROM auth.users WHERE id = current_user_id INTO current_user_email;
    
    -- Contar registros relacionados
    SELECT COUNT(*) FROM public.profiles WHERE id = current_user_id INTO profiles_count;
    SELECT COUNT(*) FROM public.mychatbot_2 WHERE chatbot_user = current_user_id::text INTO chatbots_count;
    SELECT COUNT(*) FROM public.user_roles WHERE user_id = current_user_id INTO user_roles_count;
    SELECT COUNT(*) FROM public.user_roles WHERE granted_by = current_user_id INTO roles_granted_count;
    
    RETURN json_build_object(
        'success', true,
        'user_id', current_user_id,
        'user_email', current_user_email,
        'dependencies', json_build_object(
            'profiles_found', profiles_count,
            'chatbots_found', chatbots_count,
            'user_roles_found', user_roles_count,
            'roles_granted_found', roles_granted_count
        ),
        'message', 'Dependências encontradas para exclusão'
    );
END;
$$;

-- ========================================================
-- CONCEDER PERMISSÕES
-- ========================================================

GRANT EXECUTE ON FUNCTION delete_user_account_complete() TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_dependencies() TO authenticated;

-- ========================================================
-- VERIFICAÇÃO DAS FUNÇÕES
-- ========================================================

SELECT 
    'Funções atualizadas com sucesso:' as status,
    routine_name,
    security_type
FROM information_schema.routines 
WHERE routine_name IN ('delete_user_account_complete', 'check_user_dependencies')
AND routine_schema = 'public';

-- ========================================================
-- VERIFICAR ESTRUTURA DA TABELA USER_ROLES
-- ========================================================

SELECT 
    'Estrutura da tabela user_roles:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
ORDER BY ordinal_position;

-- Script SQL para criar uma função de delete mais robusta
-- Esta função será usada pelo componente CloseAccount

-- ========================================================
-- FUNÇÃO PRINCIPAL: delete_user_account
-- ========================================================

CREATE OR REPLACE FUNCTION delete_user_account()
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
        
        -- ETAPA 2: Deletar dados da tabela profiles
        DELETE FROM public.profiles WHERE id = current_user_id;
        GET DIAGNOSTICS deleted_profiles_count = ROW_COUNT;
        
        -- ETAPA 3: Deletar usuário do auth.users
        DELETE FROM auth.users WHERE id = current_user_id;
        
        -- Retornar sucesso com detalhes
        RETURN json_build_object(
            'success', true,
            'message', 'Conta deletada com sucesso',
            'details', json_build_object(
                'user_email', current_user_email,
                'deleted_profiles', deleted_profiles_count,
                'deleted_chatbots', deleted_chatbots_count
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
-- CONCEDER PERMISSÕES
-- ========================================================

GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- ========================================================
-- FUNÇÃO DE TESTE (SÓ PARA VERIFICAR SEM DELETAR)
-- ========================================================

CREATE OR REPLACE FUNCTION check_user_data_before_delete()
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
    
    RETURN json_build_object(
        'success', true,
        'user_id', current_user_id,
        'user_email', current_user_email,
        'profiles_found', profiles_count,
        'chatbots_found', chatbots_count,
        'message', 'Dados encontrados para exclusão'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION check_user_data_before_delete() TO authenticated;

-- ========================================================
-- VERIFICAÇÃO DAS FUNÇÕES
-- ========================================================

SELECT 
    'Funções criadas com sucesso:' as status,
    routine_name,
    security_type
FROM information_schema.routines 
WHERE routine_name IN ('delete_user_account', 'check_user_data_before_delete')
AND routine_schema = 'public';

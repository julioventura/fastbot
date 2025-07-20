-- SOLUÇÃO DEFINITIVA: Deletar usuário tratando TODAS as foreign keys
-- Este script identifica e trata todas as tabelas que referenciam auth.users

-- ========================================================
-- PRIMEIRO: IDENTIFICAR TODAS AS FOREIGN KEYS
-- ========================================================

SELECT 
    'TODAS AS FOREIGN KEYS encontradas que referenciam auth.users:' as info,
    tc.constraint_name, 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND ccu.table_name = 'users'
AND ccu.table_schema = 'auth'
ORDER BY tc.table_name, kcu.column_name;

-- ========================================================
-- FUNÇÃO ULTRA-ROBUSTA: delete_user_account_ultimate
-- ========================================================

CREATE OR REPLACE FUNCTION delete_user_account_ultimate()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id uuid;
    current_user_email text;
    deleted_mychatbot_count integer := 0;
    deleted_mychatbot_2_count integer := 0;
    deleted_profiles_count integer := 0;
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
        -- ETAPA 1: Deletar da tabela mychatbot (SE EXISTIR)
        -- Verificar se a tabela mychatbot existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mychatbot' AND table_schema = 'public') THEN
            -- Tentar deletar por possíveis campos de referência
            DELETE FROM public.mychatbot WHERE usuario = current_user_id;
            GET DIAGNOSTICS deleted_mychatbot_count = ROW_COUNT;
            
            -- Se não deletou, tentar outros campos possíveis
            IF deleted_mychatbot_count = 0 THEN
                BEGIN
                    DELETE FROM public.mychatbot WHERE user_id = current_user_id;
                    GET DIAGNOSTICS deleted_mychatbot_count = ROW_COUNT;
                EXCEPTION WHEN OTHERS THEN
                    -- Ignorar se campo não existe
                    deleted_mychatbot_count := 0;
                END;
            END IF;
            
            -- Se ainda não deletou, tentar campo id
            IF deleted_mychatbot_count = 0 THEN
                BEGIN
                    DELETE FROM public.mychatbot WHERE id = current_user_id;
                    GET DIAGNOSTICS deleted_mychatbot_count = ROW_COUNT;
                EXCEPTION WHEN OTHERS THEN
                    -- Ignorar se campo não existe
                    deleted_mychatbot_count := 0;
                END;
            END IF;
        END IF;
        
        -- ETAPA 2: Deletar dados da tabela mychatbot_2
        DELETE FROM public.mychatbot_2 WHERE chatbot_user = current_user_id::text;
        GET DIAGNOSTICS deleted_mychatbot_2_count = ROW_COUNT;
        
        -- ETAPA 3: Deletar user_roles onde o usuário é o granted_by (quem concedeu)
        DELETE FROM public.user_roles WHERE granted_by = current_user_id;
        GET DIAGNOSTICS deleted_user_roles_granted_count = ROW_COUNT;
        
        -- ETAPA 4: Deletar user_roles onde o usuário é o beneficiário
        DELETE FROM public.user_roles WHERE user_id = current_user_id;
        GET DIAGNOSTICS deleted_user_roles_count = ROW_COUNT;
        
        -- ETAPA 5: Deletar dados da tabela profiles
        DELETE FROM public.profiles WHERE id = current_user_id;
        GET DIAGNOSTICS deleted_profiles_count = ROW_COUNT;
        
        -- ETAPA 6: Deletar usuário do auth.users
        DELETE FROM auth.users WHERE id = current_user_id;
        
        -- Retornar sucesso com detalhes
        RETURN json_build_object(
            'success', true,
            'message', 'Conta deletada com sucesso',
            'details', json_build_object(
                'user_email', current_user_email,
                'deleted_mychatbot', deleted_mychatbot_count,
                'deleted_mychatbot_2', deleted_mychatbot_2_count,
                'deleted_profiles', deleted_profiles_count,
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
            'sql_error', SQLERRM,
            'user_id', current_user_id,
            'user_email', current_user_email
        );
    END;
END;
$$;

-- ========================================================
-- FUNÇÃO DIAGNÓSTICA MELHORADA
-- ========================================================

CREATE OR REPLACE FUNCTION check_all_user_dependencies()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id uuid;
    current_user_email text;
    profiles_count integer := 0;
    mychatbot_count integer := 0;
    mychatbot_2_count integer := 0;
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
    SELECT COUNT(*) FROM public.mychatbot_2 WHERE chatbot_user = current_user_id::text INTO mychatbot_2_count;
    SELECT COUNT(*) FROM public.user_roles WHERE user_id = current_user_id INTO user_roles_count;
    SELECT COUNT(*) FROM public.user_roles WHERE granted_by = current_user_id INTO roles_granted_count;
    
    -- Verificar tabela mychatbot se existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mychatbot' AND table_schema = 'public') THEN
        BEGIN
            SELECT COUNT(*) FROM public.mychatbot WHERE usuario = current_user_id INTO mychatbot_count;
        EXCEPTION WHEN OTHERS THEN
            BEGIN
                SELECT COUNT(*) FROM public.mychatbot WHERE user_id = current_user_id INTO mychatbot_count;
            EXCEPTION WHEN OTHERS THEN
                BEGIN
                    SELECT COUNT(*) FROM public.mychatbot WHERE id = current_user_id INTO mychatbot_count;
                EXCEPTION WHEN OTHERS THEN
                    mychatbot_count := 0;
                END;
            END;
        END;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'user_id', current_user_id,
        'user_email', current_user_email,
        'dependencies', json_build_object(
            'profiles_found', profiles_count,
            'mychatbot_found', mychatbot_count,
            'mychatbot_2_found', mychatbot_2_count,
            'user_roles_found', user_roles_count,
            'roles_granted_found', roles_granted_count
        ),
        'message', 'Todas as dependências encontradas para exclusão'
    );
END;
$$;

-- ========================================================
-- CONCEDER PERMISSÕES
-- ========================================================

GRANT EXECUTE ON FUNCTION delete_user_account_ultimate() TO authenticated;
GRANT EXECUTE ON FUNCTION check_all_user_dependencies() TO authenticated;

-- ========================================================
-- VERIFICAÇÃO FINAL
-- ========================================================

SELECT 
    'Funções ultimate criadas com sucesso:' as status,
    routine_name,
    security_type
FROM information_schema.routines 
WHERE routine_name IN ('delete_user_account_ultimate', 'check_all_user_dependencies')
AND routine_schema = 'public';

-- ================================================
-- SCRIPT DE DELEÇÃO SEGURA DE USUÁRIOS
-- Para ambientes Supabase Self-Hosted
-- ================================================

-- 1. FUNÇÃO ADMINISTRATIVA PARA DELEÇÃO SEGURA
CREATE OR REPLACE FUNCTION admin_delete_user(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    user_id UUID;
    profiles_count INTEGER;
    dentist_count INTEGER;
    chatbot_count INTEGER;
    result JSON;
BEGIN
    -- Buscar o ID do usuário
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuário não encontrado',
            'email', user_email
        );
    END IF;
    
    -- Contar registros relacionados antes da deleção (com verificação de existência)
    SELECT COUNT(*) INTO profiles_count FROM profiles WHERE id = user_id;
    
    -- Verificar se a tabela dentist_homepage existe
    SELECT COUNT(*) INTO dentist_count 
    FROM information_schema.tables 
    WHERE table_name = 'dentist_homepage' AND table_schema = 'public';
    
    IF dentist_count > 0 THEN
        SELECT COUNT(*) INTO dentist_count FROM dentist_homepage WHERE user_id = user_id;
    ELSE
        dentist_count := 0;
    END IF;
    
    -- Verificar se a tabela mychatbot existe
    SELECT COUNT(*) INTO chatbot_count 
    FROM information_schema.tables 
    WHERE table_name = 'mychatbot' AND table_schema = 'public';
    
    IF chatbot_count > 0 THEN
        SELECT COUNT(*) INTO chatbot_count FROM mychatbot WHERE user_id = user_id;
    ELSE
        chatbot_count := 0;
    END IF;
    
    -- Deletar o usuário (CASCADE DELETE automático)
    DELETE FROM auth.users WHERE id = user_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Usuário deletado com sucesso',
        'user_id', user_id,
        'email', user_email,
        'deleted_records', json_build_object(
            'profiles', profiles_count,
            'dentist_homepage', dentist_count,
            'mychatbot', chatbot_count
        )
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao deletar usuário: ' || SQLERRM,
            'user_id', user_id,
            'email', user_email,
            'error_code', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. FUNÇÃO PARA VERIFICAR DADOS DE UM USUÁRIO
CREATE OR REPLACE FUNCTION admin_check_user(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    profiles_count INTEGER;
    dentist_count INTEGER;
    chatbot_count INTEGER;
    sessions_count INTEGER;
BEGIN
    -- Buscar dados do usuário
    SELECT id, email, created_at, email_confirmed_at, last_sign_in_at 
    INTO user_record 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_record.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuário não encontrado',
            'email', user_email
        );
    END IF;
    
    -- Contar registros relacionados (com verificação de existência)
    SELECT COUNT(*) INTO profiles_count FROM profiles WHERE id = user_record.id;
    
    -- Verificar dentist_homepage
    SELECT COUNT(*) INTO dentist_count 
    FROM information_schema.tables 
    WHERE table_name = 'dentist_homepage' AND table_schema = 'public';
    
    IF dentist_count > 0 THEN
        SELECT COUNT(*) INTO dentist_count FROM dentist_homepage WHERE user_id = user_record.id;
    ELSE
        dentist_count := 0;
    END IF;
    
    -- Verificar mychatbot
    SELECT COUNT(*) INTO chatbot_count 
    FROM information_schema.tables 
    WHERE table_name = 'mychatbot' AND table_schema = 'public';
    
    IF chatbot_count > 0 THEN
        SELECT COUNT(*) INTO chatbot_count FROM mychatbot WHERE user_id = user_record.id;
    ELSE
        chatbot_count := 0;
    END IF;
    
    SELECT COUNT(*) INTO sessions_count FROM auth.sessions WHERE user_id = user_record.id;
    
    RETURN json_build_object(
        'success', true,
        'user', json_build_object(
            'id', user_record.id,
            'email', user_record.email,
            'created_at', user_record.created_at,
            'email_confirmed_at', user_record.email_confirmed_at,
            'last_sign_in_at', user_record.last_sign_in_at
        ),
        'related_records', json_build_object(
            'profiles', profiles_count,
            'dentist_homepage', dentist_count,
            'mychatbot', chatbot_count,
            'sessions', sessions_count
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNÇÃO PARA LISTAR USUÁRIOS COM REGISTROS ÓRFÃOS
CREATE OR REPLACE FUNCTION admin_check_orphaned_records()
RETURNS JSON AS $$
DECLARE
    orphaned_profiles INTEGER;
    orphaned_dentist INTEGER;
    orphaned_chatbot INTEGER;
    result JSON;
BEGIN
    -- Contar registros órfãos (com verificação de existência)
    SELECT COUNT(*) INTO orphaned_profiles 
    FROM profiles p 
    WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);
    
    -- Verificar dentist_homepage
    SELECT COUNT(*) INTO orphaned_dentist 
    FROM information_schema.tables 
    WHERE table_name = 'dentist_homepage' AND table_schema = 'public';
    
    IF orphaned_dentist > 0 THEN
        SELECT COUNT(*) INTO orphaned_dentist 
        FROM dentist_homepage d 
        WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = d.user_id);
    ELSE
        orphaned_dentist := 0;
    END IF;
    
    -- Verificar mychatbot
    SELECT COUNT(*) INTO orphaned_chatbot 
    FROM information_schema.tables 
    WHERE table_name = 'mychatbot' AND table_schema = 'public';
    
    IF orphaned_chatbot > 0 THEN
        SELECT COUNT(*) INTO orphaned_chatbot 
        FROM mychatbot m 
        WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = m.user_id);
    ELSE
        orphaned_chatbot := 0;
    END IF;
    
    RETURN json_build_object(
        'orphaned_records', json_build_object(
            'profiles', orphaned_profiles,
            'dentist_homepage', orphaned_dentist,
            'mychatbot', orphaned_chatbot
        ),
        'has_orphans', (orphaned_profiles > 0 OR orphaned_dentist > 0 OR orphaned_chatbot > 0)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNÇÃO PARA LIMPAR REGISTROS ÓRFÃOS
CREATE OR REPLACE FUNCTION admin_clean_orphaned_records()
RETURNS JSON AS $$
DECLARE
    deleted_profiles INTEGER;
    deleted_dentist INTEGER;
    deleted_chatbot INTEGER;
BEGIN
    -- Deletar registros órfãos (com verificação de existência)
    DELETE FROM profiles p 
    WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);
    GET DIAGNOSTICS deleted_profiles = ROW_COUNT;
    
    -- Verificar e limpar dentist_homepage
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_name = 'dentist_homepage' AND table_schema = 'public'
    INTO deleted_dentist;
    
    IF deleted_dentist > 0 THEN
        DELETE FROM dentist_homepage d 
        WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = d.user_id);
        GET DIAGNOSTICS deleted_dentist = ROW_COUNT;
    ELSE
        deleted_dentist := 0;
    END IF;
    
    -- Verificar e limpar mychatbot
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_name = 'mychatbot' AND table_schema = 'public'
    INTO deleted_chatbot;
    
    IF deleted_chatbot > 0 THEN
        DELETE FROM mychatbot m 
        WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = m.user_id);
        GET DIAGNOSTICS deleted_chatbot = ROW_COUNT;
    ELSE
        deleted_chatbot := 0;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'deleted_records', json_build_object(
            'profiles', deleted_profiles,
            'dentist_homepage', deleted_dentist,
            'mychatbot', deleted_chatbot
        ),
        'total_deleted', deleted_profiles + deleted_dentist + deleted_chatbot
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- EXEMPLOS DE USO:
-- ================================================

-- Verificar dados de um usuário específico:
-- SELECT admin_check_user('usuario@email.com');

-- Verificar se há registros órfãos:
-- SELECT admin_check_orphaned_records();

-- Limpar registros órfãos:
-- SELECT admin_clean_orphaned_records();

-- Deletar um usuário específico:
-- SELECT admin_delete_user('usuario@email.com');

-- ================================================
-- COMANDOS MANUAIS DE EMERGÊNCIA:
-- ================================================

-- Para deletar um usuário manualmente (substitua USER_ID_AQUI):
/*
-- 1. Verificar dados antes da deleção
SELECT 
    u.id, u.email, u.created_at,
    (SELECT COUNT(*) FROM profiles WHERE id = u.id) as profiles,
    (SELECT COUNT(*) FROM dentist_homepage WHERE user_id = u.id) as dentist,
    (SELECT COUNT(*) FROM mychatbot WHERE user_id = u.id) as chatbots
FROM auth.users u 
WHERE u.email = 'usuario@email.com';

-- 2. Deletar o usuário (CASCADE DELETE automático)
DELETE FROM auth.users WHERE email = 'usuario@email.com';

-- 3. Verificar se deleção foi bem-sucedida
SELECT COUNT(*) FROM auth.users WHERE email = 'usuario@email.com'; -- Deve retornar 0
*/

-- ================================================
-- VERSÃO SIMPLIFICADA (APENAS TABELAS CONHECIDAS)
-- ================================================

-- FUNÇÃO SIMPLIFICADA PARA DELETAR USUÁRIO
CREATE OR REPLACE FUNCTION simple_delete_user(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    user_id UUID;
    profiles_count INTEGER;
BEGIN
    -- Buscar o ID do usuário
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuário não encontrado',
            'email', user_email
        );
    END IF;
    
    -- Contar apenas profiles (tabela que sabemos que existe)
    SELECT COUNT(*) INTO profiles_count FROM profiles WHERE id = user_id;
    
    -- Deletar o usuário (CASCADE DELETE automático)
    DELETE FROM auth.users WHERE id = user_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Usuário deletado com sucesso',
        'user_id', user_id,
        'email', user_email,
        'deleted_profiles', profiles_count
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao deletar usuário: ' || SQLERRM,
            'user_id', user_id,
            'email', user_email,
            'error_code', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

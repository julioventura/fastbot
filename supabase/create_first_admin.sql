-- ================================================
-- FUNCAO ESPECIAL PARA CRIAR O PRIMEIRO ADMINISTRADOR
-- Use apenas quando nao houver nenhum admin no sistema
-- ================================================

-- FUNCAO PARA CRIAR O PRIMEIRO ADMIN (SEM VERIFICACAO DE PERMISSAO)
CREATE OR REPLACE FUNCTION create_first_admin(target_email TEXT)
RETURNS JSON AS $$
DECLARE
    target_user_id UUID;
    admin_count INTEGER;
BEGIN
    -- Verificar se ja existe algum admin no sistema
    SELECT COUNT(*) INTO admin_count FROM user_roles WHERE role = 'admin';
    
    IF admin_count > 0 THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Ja existem administradores no sistema. Use grant_admin_role() sendo um admin.',
            'admin_count', admin_count
        );
    END IF;
    
    -- Buscar ID do usuario alvo
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuario nao encontrado',
            'email', target_email
        );
    END IF;
    
    -- Inserir role de admin (primeira vez - sem verificacao)
    INSERT INTO user_roles (user_id, role, granted_by)
    VALUES (target_user_id, 'admin', target_user_id) -- Auto-concede
    ON CONFLICT (user_id, role) DO UPDATE SET
        granted_by = EXCLUDED.granted_by,
        granted_at = NOW();
    
    RETURN json_build_object(
        'success', true,
        'message', 'Primeiro administrador criado com sucesso',
        'user_id', target_user_id,
        'email', target_email,
        'note', 'Agora use grant_admin_role() para criar outros admins.'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao criar primeiro admin: ' || SQLERRM,
            'error_code', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNCAO ALTERNATIVA: PROMOCAO DE EMERGENCIA
-- Use se houver problemas com a funcao acima
CREATE OR REPLACE FUNCTION emergency_admin_promotion(target_email TEXT)
RETURNS JSON AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Buscar ID do usuario alvo
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuario nao encontrado',
            'email', target_email
        );
    END IF;
    
    -- Inserir role de admin (sem verificacoes - emergencia)
    INSERT INTO user_roles (user_id, role, granted_by)
    VALUES (target_user_id, 'admin', target_user_id)
    ON CONFLICT (user_id, role) DO UPDATE SET
        granted_by = EXCLUDED.granted_by,
        granted_at = NOW();
    
    RETURN json_build_object(
        'success', true,
        'message', 'Promocao de emergencia realizada com sucesso',
        'user_id', target_user_id,
        'email', target_email
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro na promocao de emergencia: ' || SQLERRM,
            'error_code', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissoes publicas para estas funcoes especiais
GRANT EXECUTE ON FUNCTION create_first_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION emergency_admin_promotion(TEXT) TO authenticated;

-- ================================================
-- INSTRUCOES DE USO:
-- ================================================

-- 1. Para criar o primeiro admin (quando nao ha nenhum):
-- SELECT create_first_admin('ana@dentistas.com.br');

-- 2. Para promocao de emergencia (se houver problemas):
-- SELECT emergency_admin_promotion('ana@dentistas.com.br');

-- 3. Para verificar se funcionou:
-- SELECT * FROM get_all_admins();

-- 4. Para verificar roles de um usuario:
-- SELECT is_admin((SELECT id FROM auth.users WHERE email = 'ana@dentistas.com.br'));

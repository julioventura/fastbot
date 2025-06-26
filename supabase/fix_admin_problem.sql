-- ================================================
-- SCRIPT COMPLETO PARA RESOLVER PROBLEMA DO ADMIN
-- Execute este script no SQL Editor do Supabase
-- ================================================

-- PARTE 1: Funcao para criar primeiro admin
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
    VALUES (target_user_id, 'admin', target_user_id)
    ON CONFLICT (user_id, role) DO UPDATE SET
        granted_by = EXCLUDED.granted_by,
        granted_at = NOW();
    
    RETURN json_build_object(
        'success', true,
        'message', 'Primeiro administrador criado com sucesso',
        'user_id', target_user_id,
        'email', target_email
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

-- PARTE 2: Conceder permissoes
GRANT EXECUTE ON FUNCTION create_first_admin(TEXT) TO authenticated;

-- PARTE 3: Criar o primeiro admin para ana@dentistas.com.br
SELECT create_first_admin('ana@dentistas.com.br');

-- PARTE 4: Verificar se funcionou (sem usar get_all_admins)
SELECT 
    ur.user_id,
    u.email,
    ur.role,
    ur.granted_at,
    'Primeiro admin criado com sucesso!' as status
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role = 'admin'
ORDER BY ur.granted_at;

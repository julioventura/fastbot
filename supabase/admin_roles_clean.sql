-- ================================================
-- SISTEMA DE ROLES E ADMINISTRADORES (VERSÃO EXECUTÁVEL)
-- Execute APENAS este script primeiro
-- ================================================

-- 1. CRIAR TABELA DE ROLES/FUNÇÕES
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- 3. HABILITAR RLS (Row Level Security)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE SEGURANÇA
CREATE POLICY "Usuários podem ver suas próprias roles"
ON user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Apenas admins podem modificar roles"
ON user_roles FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'admin'
    )
);

-- 5. FUNÇÃO PARA VERIFICAR SE USUÁRIO É ADMIN
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_roles.user_id = is_admin.user_id 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNÇÃO PARA LISTAR TODOS OS ADMINS
-- Primeiro removemos a função existente se houver conflito de tipos
DROP FUNCTION IF EXISTS get_all_admins();

CREATE OR REPLACE FUNCTION get_all_admins()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    role VARCHAR(50),
    granted_at TIMESTAMP WITH TIME ZONE,
    granted_by_email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ur.user_id,
        u.email::TEXT,
        ur.role,
        ur.created_at as granted_at,
        gb.email::TEXT as granted_by_email
    FROM user_roles ur
    JOIN auth.users u ON ur.user_id = u.id
    LEFT JOIN auth.users gb ON ur.granted_by = gb.id
    WHERE ur.role = 'admin'
    ORDER BY ur.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNÇÃO PARA CONCEDER ROLE DE ADMIN
CREATE OR REPLACE FUNCTION grant_admin_role(target_email TEXT, granted_by_id UUID DEFAULT auth.uid())
RETURNS JSON AS $$
DECLARE
    target_user_id UUID;
    is_granter_admin BOOLEAN;
BEGIN
    -- Verificar se quem está concedendo é admin
    SELECT is_admin(granted_by_id) INTO is_granter_admin;
    
    IF NOT is_granter_admin THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Apenas administradores podem conceder roles',
            'error_code', 'INSUFFICIENT_PERMISSIONS'
        );
    END IF;
    
    -- Buscar ID do usuário alvo
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuário não encontrado',
            'email', target_email
        );
    END IF;
    
    -- Inserir role (ON CONFLICT para evitar duplicatas)
    INSERT INTO user_roles (user_id, role, granted_by)
    VALUES (target_user_id, 'admin', granted_by_id)
    ON CONFLICT (user_id, role) DO UPDATE SET
        granted_by = EXCLUDED.granted_by,
        granted_at = NOW();
    
    RETURN json_build_object(
        'success', true,
        'message', 'Role de administrador concedida com sucesso',
        'user_id', target_user_id,
        'email', target_email
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao conceder role: ' || SQLERRM,
            'error_code', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. FUNÇÃO PARA REMOVER ROLE DE ADMIN
CREATE OR REPLACE FUNCTION revoke_admin_role(target_email TEXT, revoked_by_id UUID DEFAULT auth.uid())
RETURNS JSON AS $$
DECLARE
    target_user_id UUID;
    is_revoker_admin BOOLEAN;
BEGIN
    -- Verificar se quem está revogando é admin
    SELECT is_admin(revoked_by_id) INTO is_revoker_admin;
    
    IF NOT is_revoker_admin THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Apenas administradores podem revogar roles',
            'error_code', 'INSUFFICIENT_PERMISSIONS'
        );
    END IF;
    
    -- Buscar ID do usuário alvo
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuário não encontrado',
            'email', target_email
        );
    END IF;
    
    -- Evitar que um admin remova a própria role (proteção)
    IF target_user_id = revoked_by_id THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Você não pode remover sua própria role de administrador',
            'error_code', 'SELF_REVOKE_FORBIDDEN'
        );
    END IF;
    
    -- Remover role
    DELETE FROM user_roles 
    WHERE user_id = target_user_id AND role = 'admin';
    
    RETURN json_build_object(
        'success', true,
        'message', 'Role de administrador removida com sucesso',
        'user_id', target_user_id,
        'email', target_email
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao revogar role: ' || SQLERRM,
            'error_code', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

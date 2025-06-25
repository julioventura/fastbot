-- CORREÇÃO RÁPIDA: Recriar função get_all_admins com tipos corretos
-- Execute este script no SQL Editor do Supabase para corrigir o erro de tipo

-- 1. Remover função existente (necessário para mudança de tipo)
DROP FUNCTION IF EXISTS get_all_admins();

-- 2. Recriar função com tipos compatíveis
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

-- 3. Testar a função
SELECT * FROM get_all_admins();

-- ================================================
-- SCRIPT DE EMERGENCIA PARA CRIAR ADMIN
-- Use se os outros scripts nao funcionarem
-- ================================================

-- VERIFICAR/CRIAR TABELA user_roles (se nao existir)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- CRIAR INDICES (se nao existirem)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- HABILITAR RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- INSERIR ADMIN DIRETAMENTE
INSERT INTO user_roles (user_id, role, granted_by)
SELECT 
    u.id, 
    'admin', 
    u.id
FROM auth.users u 
WHERE u.email = 'ana@dentistas.com.br'
ON CONFLICT (user_id, role) DO UPDATE SET
    granted_at = NOW();

-- VERIFICAR RESULTADO
SELECT 
    u.email,
    ur.role,
    ur.granted_at,
    'ADMIN CRIADO COM SUCESSO!' as status
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'ana@dentistas.com.br' AND ur.role = 'admin';

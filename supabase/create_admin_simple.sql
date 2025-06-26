-- ================================================
-- SCRIPT SIMPLES PARA CRIAR PRIMEIRO ADMIN
-- Execute este script no SQL Editor do Supabase
-- ================================================

-- PASSO 1: Verificar se ja existem admins
SELECT COUNT(*) as admins_existentes FROM user_roles WHERE role = 'admin';

-- PASSO 2: Verificar se o usuario existe
SELECT id, email FROM auth.users WHERE email = 'ana@dentistas.com.br';

-- PASSO 3: Criar admin diretamente (se nao existir)
INSERT INTO user_roles (user_id, role, granted_by, granted_at)
SELECT 
    u.id, 
    'admin', 
    u.id,  -- Auto-concede
    NOW()
FROM auth.users u 
WHERE u.email = 'ana@dentistas.com.br'
  AND NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'admin')
ON CONFLICT (user_id, role) DO UPDATE SET
    granted_at = NOW(),
    granted_by = EXCLUDED.granted_by;

-- PASSO 4: Verificar o resultado
SELECT 
    u.email,
    ur.role,
    ur.granted_at,
    'SUCESSO: Admin criado!' as resultado
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role = 'admin' AND u.email = 'ana@dentistas.com.br';

-- PASSO 5: Listar todos os admins para confirmar
SELECT 
    u.email,
    ur.role,
    ur.granted_at
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role = 'admin'
ORDER BY ur.granted_at;

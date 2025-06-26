# Solução para o Problema do Primeiro Administrador

## Problema

- Erro: "Apenas administradores podem conceder roles"
- Usuário não consegue acessar `/admin`
- Função `grant_admin_role()` requer privilégios de admin
- Catch-22: Precisa ser admin para criar admin, mas não há admins

## Soluções Implementadas

- **`create_first_admin(email)`**: Cria o primeiro administrador sem verificação
- **`emergency_admin_promotion(email)`**: Método alternativo de emergência
- Ambas verificam se já existem admins antes de executar

## Método Rápido (Execute no SQL Editor do Supabase)

### Opção 1: Inserção Direta

```sql
-- Inserir admin diretamente
INSERT INTO user_roles (user_id, role, granted_by)
SELECT u.id, 'admin', u.id
FROM auth.users u 
WHERE u.email = 'ana@dentistas.com.br'
ON CONFLICT (user_id, role) DO UPDATE SET granted_at = NOW();

-- Verificar se funcionou
SELECT u.email, ur.role, ur.granted_at
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'ana@dentistas.com.br' AND ur.role = 'admin';
```

### Opção 2: Função Especializada

```sql
-- Criar função
CREATE OR REPLACE FUNCTION create_first_admin(target_email TEXT)
RETURNS JSON AS $$
DECLARE
    target_user_id UUID;
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM user_roles WHERE role = 'admin';
    
    IF admin_count > 0 THEN
        RETURN json_build_object('success', false, 'message', 'Ja existem admins');
    END IF;
    
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Usuario nao encontrado');
    END IF;
    
    INSERT INTO user_roles (user_id, role, granted_by)
    VALUES (target_user_id, 'admin', target_user_id)
    ON CONFLICT (user_id, role) DO UPDATE SET granted_at = NOW();
    
    RETURN json_build_object('success', true, 'message', 'Admin criado');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão
GRANT EXECUTE ON FUNCTION create_first_admin(TEXT) TO authenticated;

-- Criar o admin
SELECT create_first_admin('ana@dentistas.com.br');
```

### Opção 3: Script de Emergência

```sql
-- Script de emergência (se tabela não existir)
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Inserir admin
INSERT INTO user_roles (user_id, role, granted_by)
SELECT u.id, 'admin', u.id
FROM auth.users u 
WHERE u.email = 'ana@dentistas.com.br'
ON CONFLICT (user_id, role) DO UPDATE SET granted_at = NOW();
```

## Resultado Esperado

Você deve ver algo como:

```json
{
  "email": "ana@dentistas.com.br",
  "role": "admin", 
  "granted_at": "2025-06-26 15:30:00"
}
```

## Após Executar

- ✅ Usuário vira administrador
- ✅ Acesso liberado para `/admin`
- ✅ Pode usar `grant_admin_role()` normalmente
- ✅ Sistema de administração funciona

## Arquivos Relacionados

1. `supabase/create_first_admin.sql` - Funções completas
2. `supabase/fix_admin_problem.sql` - Script de execução rápida
3. `SOLUCAO_PRIMEIRO_ADMIN.md` - Esta documentação

## Segurança

- ✅ Função só funciona quando NÃO há admins no sistema
- ✅ Depois do primeiro admin, usa processo normal
- ✅ Não permite bypass de segurança após configuração inicial

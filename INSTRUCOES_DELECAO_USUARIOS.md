# 🔧 Instruções para Executar o Script de Deleção de Usuários

## 📋 Pré-requisitos

- Acesso ao painel administrativo do Supabase self-hosted
- Permissões de administrador no banco de dados
- Backup do banco de dados (recomendado)

## 🚀 Passo a Passo

### 1. Acessar o Painel do Supabase

1. Acesse: `https://supabase.cirurgia.com.br`
2. Faça login com suas credenciais de administrador
3. Vá para o projeto FastBot

### 2. Executar o Script SQL

1. No painel Supabase, vá para **SQL Editor**
2. Abra o arquivo `supabase/admin_user_deletion.sql`
3. Copie TODO o conteúdo do arquivo
4. Cole no SQL Editor
5. Clique em **Run** ou pressione `Ctrl+Enter`

### 3. Verificar se as Funções foram Criadas

Execute este comando para verificar:

```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN (
    'admin_delete_user',
    'admin_check_user', 
    'admin_check_orphaned_records',
    'admin_clean_orphaned_records'
);
```

Deve retornar 4 funções.

### 4. Testar as Funções

#### Verificar registros órfãos

```sql
SELECT admin_check_orphaned_records();
```

#### Limpar registros órfãos (se houver)

```sql
SELECT admin_clean_orphaned_records();
```

#### Verificar um usuário específico

```sql
SELECT admin_check_user('teste@dentistas.com.br');
```

#### Deletar um usuário específico

```sql
SELECT admin_delete_user('teste@dentistas.com.br');
```

### 5. Usar a Interface Web

1. Acesse: `https://supabase.cirurgia.com.br/fastbot/admin`
2. Faça login com uma conta @cirurgia.com.br
3. Use a interface para gerenciar usuários

## ⚠️ Importante

### Problemas Conhecidos

- **Interface padrão do Supabase Authentication não funciona** em ambientes self-hosted
- **Erro "API error happened while trying to communicate with the server"** é comum
- **Use sempre as funções SQL ou a interface web customizada**

### Segurança

- As funções são criadas com `SECURITY DEFINER` (executam com privilégios do criador)
- Apenas usuários com acesso ao SQL Editor podem executar
- A interface web tem restrição por domínio de email (@cirurgia.com.br)

### Backup

Antes de deletar usuários em produção:

```sql
-- Backup de usuários
CREATE TABLE backup_users_$(date +%Y%m%d) AS 
SELECT * FROM auth.users;

-- Backup de profiles
CREATE TABLE backup_profiles_$(date +%Y%m%d) AS 
SELECT * FROM profiles;
```

## 🎯 Resolução do Problema Original

O problema de deleção de usuários foi causado por:

1. **Ambiente self-hosted** com limitações na interface padrão
2. **Registros órfãos** em tabelas relacionadas
3. **Foreign keys sem CASCADE DELETE** (corrigido)

**Solução implementada:**

- ✅ Foreign keys com CASCADE DELETE em todas as tabelas
- ✅ Funções SQL para deleção segura
- ✅ Interface web administrativa
- ✅ Limpeza automática de registros órfãos
- ✅ Validações e confirmações de segurança

## ✅ **Verificações Pós-Limpeza**

Após limpar o banco e deixar apenas um usuário inicial, execute estas verificações:

### 1. Verificar Integridade

```sql
-- Verificar usuário restante
SELECT id, email, created_at, email_confirmed_at FROM auth.users;

-- Verificar profile correspondente  
SELECT id, email, created_at FROM profiles;

-- Verificar se não há registros órfãos (deve retornar 0)
SELECT COUNT(*) as orfaos_profiles 
FROM profiles p 
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);
```

### 2. Verificar Foreign Keys

```sql
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'profiles';
```

### 3. Verificar Triggers

```sql
-- Verificar trigger de criação de profiles
SELECT tgname, tgrelid::regclass, tgfoid::regproc
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Verificar função handle_new_user
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
```

### 4. Comandos de Monitoramento

```sql
-- Durante testes, use estes comandos para monitorar:
SELECT id, email, created_at, email_confirmed_at FROM auth.users ORDER BY created_at DESC;
SELECT id, email, created_at FROM profiles ORDER BY created_at DESC;
SELECT 
    (SELECT COUNT(*) FROM auth.users) as usuarios,
    (SELECT COUNT(*) FROM profiles) as profiles;
```

## 🧪 **Roteiro de Teste Completo**

1. ✅ **Banco limpo** - mantido apenas usuário `dolescfo@gmail.com`
2. ⏳ **Cadastrar usuário teste** via interface web
3. ⏳ **Verificar criação automática** do profile
4. ⏳ **Confirmar email** (se necessário)
5. ⏳ **Testar login** do novo usuário
6. ⏳ **Testar deleção** usando `DELETE FROM auth.users WHERE email = 'teste@email.com';`
7. ⏳ **Verificar CASCADE DELETE** (profile deve ser removido automaticamente)

## 📞 Suporte

Em caso de problemas:

1. Verificar logs do servidor Supabase
2. Usar comandos SQL manuais de emergência
3. Verificar permissões de usuário
4. Confirmar que as funções foram criadas corretamente

## 👥 **Sistema de Administradores**

### Como Verificar Quem São os Admins (via SQL)

```sql
-- Ver todos os administradores atuais
SELECT * FROM get_all_admins();

-- Ver se um usuário específico é admin
SELECT is_admin((SELECT id FROM auth.users WHERE email = 'dolescfo@gmail.com'));

-- Listar todos os usuários e suas roles
SELECT 
    u.email,
    COALESCE(ur.role, 'user') as role,
    ur.granted_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at;
```

### Como Definir Administradores

#### 1. **Primeira Configuração (Execute UMA vez)**

```sql
-- Executar o script admin_roles_system.sql primeiro
-- Depois conceder admin para o usuário inicial:
INSERT INTO user_roles (user_id, role, granted_by)
SELECT 
    u.id, 
    'admin', 
    u.id  -- Auto-concede (primeira vez)
FROM auth.users u 
WHERE u.email = 'dolescfo@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

#### 2. **Adicionar Novos Admins**

```sql
-- Via SQL
SELECT grant_admin_role('novo.admin@cirurgia.com.br');

-- Via Interface Web (aba "Gerenciar Administradores")
-- Acesse /admin → aba "Gerenciar Administradores"
```

#### 3. **Remover Admins**

```sql
-- Via SQL
SELECT revoke_admin_role('usuario@email.com');

-- Via Interface Web
-- Use o botão "Remover" na lista de administradores
```

### Estrutura do Sistema

**Tabela `user_roles`:**

- Armazena roles (funções) dos usuários
- Suporta múltiplas roles por usuário
- Rastreia quem concedeu a role e quando
- Protegida por RLS (Row Level Security)

**Funções Disponíveis:**

- `is_admin(user_id)` - Verifica se usuário é admin
- `get_all_admins()` - Lista todos os administradores
- `grant_admin_role(email)` - Concede role de admin
- `revoke_admin_role(email)` - Remove role de admin

**Segurança:**

- Apenas admins podem modificar roles
- Proteção contra auto-remoção
- Logs de auditoria (quem concedeu, quando)
- RLS habilitado para proteção de dados

## 🔧 Correção de Problemas Conhecidos

### Erro na Função get_all_admins (Tipo de Retorno)

Se você encontrar erro relacionado ao tipo de retorno da função `get_all_admins`, execute:

1. **Execute o script de correção rápida**:
   - Abra o arquivo `supabase/fix_get_all_admins.sql`
   - Execute todo o conteúdo no SQL Editor
   - Isso irá recriar a função com os tipos corretos

2. **Teste a correção**:

   ```sql
   SELECT * FROM get_all_admins();
   ```

### Problema: "Function does not exist"

- Certifique-se de que executou o script `admin_roles_clean.sql` completo
- Se persistir, execute cada seção do script individualmente

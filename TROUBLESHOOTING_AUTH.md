# Guia de Configuração e Solução de Problemas - Sistema de Autenticação FastBot

## 🔧 Configuração SMTP no Supabase

### 1. Configuração no Dashboard do Supabase

Acesse: `Settings > Auth > SMTP Settings`

Configure as seguintes variáveis:

```
ENABLE_SMTP=true
SMTP_HOST=seu-servidor-smtp.com
SMTP_PORT=587 (ou 465 para SSL)
SMTP_USER=seu-email@dominio.com
SMTP_PASS=sua-senha-smtp
SMTP_SENDER_NAME=FastBot
SMTP_ADMIN_EMAIL=noreply@seudominio.com
```

**Nota:** No Dashboard do Supabase, o campo aparece como "From Email Address", mas na configuração via variáveis de ambiente use `SMTP_ADMIN_EMAIL`.

### 2. Configuração de Confirmação de Email

Em `Settings > Auth > Email Templates`:

- ✅ Habilitar "Enable email confirmations"
- ✅ Configurar template personalizado se necessário

### 3. Configuração de URL de Confirmação

Em `Settings > Auth > URL Configuration`:

- Site URL: `http://localhost:8080/fastbot/` (desenvolvimento) ou `https://seudominio.com` (produção)
- Redirect URLs: 
  - `http://localhost:8080/fastbot/**` (desenvolvimento)
  - `https://seudominio.com/**` (produção)

**IMPORTANTE:** Verifique a porta que seu Vite está usando! Neste caso é 8080, não a padrão 5173!

## ⚠️ CORREÇÃO CRÍTICA - URLs de Redirecionamento

### Problema Comum: URLs Incorretas nos Emails

Se os links nos emails estão apontando para portas erradas (como 8000 ou 8080), você precisa:

1. **Verificar configuração no Supabase Dashboard:**
   - Acesse `Settings > Auth > URL Configuration`
   - Site URL: `http://localhost:8080/fastbot/` (desenvolvimento)
   - Redirect URLs: `http://localhost:8080/fastbot/**`

2. **Verificar arquivo .env:**
   - Use apenas uma configuração (não tenha URLs duplicadas)
   - Para desenvolvimento local, use a configuração do Supabase oficial
   - Para produção, use sua instância personalizada

3. **Limpar cache do Supabase:**
   - Salve as configurações no dashboard
   - Aguarde alguns minutos para propagação
   - Teste com novo email de reset

**⚠️ ATENÇÃO:** Seu Vite roda na porta 8080 com base path `/fastbot/`, então configure:

- Site URL: `http://localhost:8080/fastbot/`
- Redirect URLs: `http://localhost:8080/fastbot/**`

### URLs Corretas Esperadas

- **Desenvolvimento:** `http://localhost:8080/fastbot/#reset-password?access_token=...`
- **Produção:** `https://seudominio.com/#reset-password?access_token=...`

## 🐛 Problemas Comuns e Soluções

### Erro: "POST /auth/v1/token 400 (Bad Request)"

**Causa Principal:** Usuário criado mas email não confirmado

**Soluções:**

1. ✅ Verificar caixa de entrada/spam para email de confirmação
2. ✅ Usar o botão "Reenviar Email de Confirmação" no formulário de login
3. ✅ Verificar configuração SMTP no Supabase
4. ✅ Confirmar que "Enable email confirmations" está ativo

### Erro: "Invalid login credentials"

**Possíveis Causas:**

- Email ou senha incorretos
- Usuário não existe
- Usuário existe mas não foi confirmado

**Solução:**

- Verificar se o usuário existe na tabela `auth.users`
- Verificar campo `email_confirmed_at` (não deve ser NULL)

### Erro: "Email not confirmed"

**Solução:**

- Confirmar email através do link enviado
- Usar função "Reenviar confirmação" implementada
- Verificar configuração SMTP

## 🗑️ Problemas com Deleção de Usuários

### Diagnóstico Completo Realizado (27/01/2025)

#### ✅ Verificações Já Realizadas

1. **Foreign Keys com CASCADE DELETE:**
   - `profiles.id` → `auth.users.id` (CASCADE DELETE)
   - `dentist_homepage.user_id` → `auth.users.id` (CASCADE DELETE) 
   - `mychatbot.user_id` → `auth.users.id` (CASCADE DELETE)
   - Demais tabelas do Supabase (`sessions`, `identities`, etc.) já têm CASCADE DELETE nativo

2. **Limpeza de Registros Órfãos:**
   - Removidos registros em `profiles` sem correspondência em `auth.users`
   - Verificado que não há registros órfãos em outras tabelas customizadas

3. **Triggers e Constraints:**
   - Trigger `on_auth_user_created` funciona corretamente
   - Função `handle_new_user()` cria profiles automaticamente
   - Não há triggers que impeçam deleção

#### ❌ Problema Identificado: Ambiente Self-Hosted

**CAUSA RAIZ:** O projeto usa ambiente Supabase self-hosted (`supabase.cirurgia.com.br`) ao invés do Supabase Cloud oficial.

**Limitações conhecidas em ambientes self-hosted:**

- Interface de Authentication pode ter bugs específicos
- Permissões de admin podem estar limitadas
- APIs de deleção podem ter comportamento diferente
- Logs de erro limitados ou ausentes

#### 🔧 Soluções Possíveis

### 1. **Deleção Manual via SQL (RECOMENDADO)**

```sql
-- 1. Identificar o usuário
SELECT id, email, created_at FROM auth.users WHERE email = 'usuario@email.com';

-- 2. Verificar dados relacionados (antes da deleção)
SELECT COUNT(*) as profiles FROM profiles WHERE id = 'USER_ID_AQUI';
SELECT COUNT(*) as dentist FROM dentist_homepage WHERE user_id = 'USER_ID_AQUI';
SELECT COUNT(*) as chatbots FROM mychatbot WHERE user_id = 'USER_ID_AQUI';

-- 3. Deletar o usuário (CASCADE DELETE cuidará do resto)
DELETE FROM auth.users WHERE id = 'USER_ID_AQUI';

-- 4. Verificar se deleção foi bem-sucedida
SELECT id FROM auth.users WHERE id = 'USER_ID_AQUI'; -- Deve retornar vazio
SELECT COUNT(*) FROM profiles WHERE id = 'USER_ID_AQUI'; -- Deve retornar 0
```

### 2. **Função Administrativa de Deleção**

```sql
-- Criar função para deleção segura de usuários
CREATE OR REPLACE FUNCTION admin_delete_user(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    user_id UUID;
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
    
    -- Deletar o usuário (CASCADE DELETE automático)
    DELETE FROM auth.users WHERE id = user_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Usuário deletado com sucesso',
        'user_id', user_id,
        'email', user_email
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao deletar usuário: ' || SQLERRM,
            'user_id', user_id,
            'email', user_email
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usar a função
SELECT admin_delete_user('usuario@email.com');
```

### 3. **Implementar Deleção via Code (Frontend)**

```typescript
// No AuthContext ou novo hook
export const useAdminActions = () => {
  const deleteUser = async (userEmail: string) => {
    try {
      const { data, error } = await supabase.rpc('admin_delete_user', {
        user_email: userEmail
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return { success: false, error };
    }
  };
  
  return { deleteUser };
};
```

### 4. **Verificação de Configuração Self-Hosted**

**Verificar no painel administrativo do Supabase self-hosted:**

- Logs de erro do servidor
- Permissões do usuário administrativo
- Configurações de RLS (Row Level Security)
- Status dos serviços (Auth, API, etc.)

**Comandos para verificar logs (se tiver acesso ao servidor):**

```bash
# Logs do container Supabase
docker logs supabase-auth
docker logs supabase-kong
docker logs supabase-rest

# Logs do PostgreSQL
docker logs supabase-db
```

#### 📊 Status Final

- ✅ Estrutura do banco corrigida (Foreign Keys, CASCADE DELETE)
- ✅ Registros órfãos limpos
- ✅ Triggers funcionando
- ❌ Interface de Authentication com bug em ambiente self-hosted
- ✅ Deleção manual via SQL funciona perfeitamente

#### 🎯 Recomendação

**Use a deleção manual via SQL ou implemente a função `admin_delete_user` para ter controle total sobre o processo de deleção em ambientes self-hosted.**

### 🔧 Implementação Completa Disponível

#### 1. Script SQL Administrativo

Arquivo: `supabase/admin_user_deletion.sql`

- Funções para verificar, deletar e limpar usuários
- Comandos manuais de emergência
- Exemplos de uso prático

#### 2. Interface Web Administrativa  

- Página: `/admin` (acesso restrito a emails @cirurgia.com.br)
- Componente: `AdminUserManagement.tsx`
- Funcionalidades:
  - Buscar e verificar dados de usuários
  - Deletar usuários com confirmação
  - Verificar e limpar registros órfãos
  - Interface amigável com validações

#### 3. Como Usar

1. **Acesso:** Vá para `https://supabase.cirurgia.com.br/fastbot/admin`
2. **Login:** Use uma conta com email @cirurgia.com.br
3. **Buscar:** Digite o email do usuário para ver seus dados
4. **Verificar:** Veja todos os registros relacionados
5. **Deletar:** Confirme a deleção (ação irreversível)
6. **Manutenção:** Use as funções de limpeza quando necessário

## 🧪 Como Testar o Sistema

### 1. Teste de Cadastro

```
1. Acesse a aba "Cadastro"
2. Preencha: Nome, Email, WhatsApp, Senha
3. Clique em "Criar Conta"
4. Verifique mensagem de sucesso
5. Verifique email na caixa de entrada
```

### 2. Teste de Confirmação

```
1. Abra o email de confirmação
2. Clique no link de confirmação
3. Verifique se é redirecionado corretamente
4. Tente fazer login
```

### 3. Teste de Login

```
1. Acesse a aba "Login"
2. Use email e senha cadastrados
3. Se der erro de "não confirmado", use o botão de reenvio
4. Confirme o email e tente novamente
```

### 4. Teste de Reset de Senha

```
1. Acesse a aba "Recuperar"
2. Digite o email
3. Clique em "Enviar link de recuperação"
4. Verifique email de reset
5. Siga as instruções do email
```

## 🔍 Debug - Logs Implementados

Os logs foram adicionados temporariamente para debug:

### Console do Browser

- Tentativas de login/cadastro
- Respostas do Supabase
- Status de confirmação do usuário
- Erros detalhados

### Como usar os logs

```javascript
// Abra o console do navegador (F12)
// Logs aparecerão durante:
// - Tentativas de cadastro: "Tentando criar conta para: email@exemplo.com"
// - Tentativas de login: "Tentando fazer login com: email@exemplo.com"
// - Respostas: Detalhes completos da resposta do Supabase
```

## 📋 Checklist de Verificação

### ✅ Configuração do Supabase

- [ ] SMTP configurado e testado
- [ ] Email confirmations habilitado
- [ ] Site URL configurada
- [ ] Redirect URLs configuradas
- [ ] Templates de email configurados

### ✅ Teste do Fluxo

- [ ] Cadastro funciona
- [ ] Email de confirmação é enviado
- [ ] Link de confirmação funciona
- [ ] Login funciona após confirmação
- [ ] Reset de senha funciona
- [ ] Botão de reenvio funciona

### ✅ Verificação no Database

- [ ] Usuário criado em `auth.users`
- [ ] Profile criado em `profiles`
- [ ] Campo `email_confirmed_at` preenchido após confirmação

## 🚨 Quando Remover os Logs

Após confirmar que tudo está funcionando, remover os logs de debug:

1. Em `AuthContext.tsx` - remover `console.log` das funções `signIn` e `signUp`
2. Manter apenas logs de erro essenciais

## 📞 Suporte

Se os problemas persistirem:

1. Verificar logs do servidor Supabase
2. Testar SMTP manualmente
3. Verificar configurações de DNS se usando domínio próprio
4. Verificar firewall/proxy que podem bloquear emails

#### ⚠️ **IMPORTANTE: Executar Script SQL Primeiro**

**Se você receber erro "function admin_delete_user(unknown) does not exist":**

1. **Copie TODO o conteúdo** do arquivo `supabase/admin_user_deletion.sql`
2. **Cole no SQL Editor** do Supabase
3. **Execute o script completo** (clique em "Run")
4. **Depois execute:** `SELECT admin_delete_user('email@usuario.com');`

**Método alternativo (SEM funções):**

```sql
-- Deletar usuário diretamente (funciona imediatamente)
DELETE FROM auth.users WHERE email = 'teste@dentistas.com.br';
```

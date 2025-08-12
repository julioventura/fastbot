# 🔧 Solução para Erro de Criação de Conta - FastBot

## 📋 **Problema Identificado**

O erro `"Database error saving new user"` indica que há um problema na configuração do banco de dados Supabase que está impedindo a criação de novos usuários.

### **Erros Observados:**

1. **Refresh Token Error (400)**: `Invalid Refresh Token: Refresh Token Not Found`

2. **SignUp Error (500)**: `Database error saving new user`

## 🛠️ **Soluções Implementadas**

### **1. Correções no Código da Aplicação**

✅ **Configuração do Cliente Supabase** - Melhorada em `client.ts`

✅ **URL de Redirecionamento** - Corrigida em `AuthContext.tsx`

✅ **Tratamento de Sessões Inválidas** - Implementado limpeza automática

✅ **Logs de Debugging** - Adicionados para facilitar diagnóstico

### **2. Correção do Banco de Dados (CRÍTICO)**

O arquivo SQL `fix_signup_database_error.sql` foi criado para corrigir problemas no Supabase.

## 🚀 **Como Aplicar a Correção**

### **Passo 1: Executar o Script SQL no Supabase**

1. Acesse o **Supabase Dashboard**

2. Vá para **SQL Editor**

3. Execute o arquivo: `supabase/fix_signup_database_error.sql`

### **Passo 2: Verificar URLs de Redirecionamento**

No Dashboard do Supabase:

1. Vá para **Authentication** → **URL Configuration**

2. Adicione estas URLs:

   - **Site URL**: `http://localhost:8081/fastbot/`
   - **Redirect URLs**:
     - `http://localhost:8081/fastbot/`
     - `https://supabase.cirurgia.com.br/`

### **Passo 3: Verificar Configuração SMTP**

1. Vá para **Authentication** → **Settings**

2. Configure o SMTP:


  - **Host**: `mail.dentistas.com.br`
  - **Port**: `465`
  - **User**: `julio@dentistas.com.br`
  - **Password**: (sua senha SMTP)

### **Passo 4: Testar a Aplicação**

1. Reinicie o servidor: `npm run dev`

2. Acesse: `http://localhost:8081/fastbot/`

3. Tente criar uma nova conta

## 🔍 **Diagnóstico Adicional**

Se o problema persistir, execute este comando no SQL Editor:

```sql
SELECT test_profile_creation();
```

## 📝 **Mudanças Implementadas no Código**

### **1. Cliente Supabase (`src/integrations/supabase/client.ts`)**

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'  // ← Novo
  },
  global: {
    headers: {
      'X-Client-Info': 'fastbot-web'  // ← Novo
    }
  }
})
```


### **2. AuthContext (`src/lib/auth/AuthContext.tsx`)**

- ✅ URL de redirecionamento baseada no ambiente
- ✅ Limpeza automática de sessões inválidas
- ✅ Logs detalhados para debugging


### **3. SignUpForm (`src/components/auth/SignUpForm.tsx`)**

- ✅ Limpeza de sessão antes do signup
- ✅ Logs adicionais para debug

## 🆘 **Se o Problema Persistir**


### **Verificar Logs do Supabase:**

1. Dashboard → **Logs**

2. Filtrar por erros recentes

3. Procurar por erros relacionados a `profiles` ou `auth.users`


### **Verificar Políticas RLS:**

Execute no SQL Editor:

```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```


### **Teste Manual no SQL:**

```sql
-- Tentar inserir um usuário manualmente
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('test@test.com', crypt('password123', gen_salt('bf')), NOW());
```

## 📞 **Suporte**

Se ainda houver problemas:

1. Verifique os logs do terminal onde está rodando `npm run dev`

2. Abra o Console do navegador (F12) e procure por erros

3. Execute o script de diagnóstico SQL fornecido

---

**Status**: ✅ Correções aplicadas - Teste agora a criação de conta!

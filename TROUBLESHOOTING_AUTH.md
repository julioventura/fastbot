# Guia de Configuração e Solução de Problemas - Sistema de Autenticação FastBot

## 🔧 Configuração SMTP no Supabase

### 1. Configuração no Dashboard do Supabase

Acesse: `Settings > Auth > SMTP Settings`

Configure as seguintes variáveis:
```
Enable custom SMTP: true
SMTP Host: seu-servidor-smtp.com
SMTP Port: 587 (ou 465 para SSL)
SMTP User: seu-email@dominio.com
SMTP Password: sua-senha-smtp
SMTP Sender Name: FastBot
From Email: noreply@seudominio.com
```

### 2. Configuração de Confirmação de Email

Em `Settings > Auth > Email Templates`:
- ✅ Habilitar "Enable email confirmations"
- ✅ Configurar template personalizado se necessário

### 3. Configuração de URL de Confirmação

Em `Settings > Auth > URL Configuration`:
- Site URL: `http://localhost:5173` (desenvolvimento) ou `https://seudominio.com` (produção)
- Redirect URLs: Adicionar as URLs permitidas

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

### Console do Browser:
- Tentativas de login/cadastro
- Respostas do Supabase
- Status de confirmação do usuário
- Erros detalhados

### Como usar os logs:
```javascript
// Abra o console do navegador (F12)
// Logs aparecerão durante:
// - Tentativas de cadastro: "Tentando criar conta para: email@exemplo.com"
// - Tentativas de login: "Tentando fazer login com: email@exemplo.com"
// - Respostas: Detalhes completos da resposta do Supabase
```

## 📋 Checklist de Verificação

### ✅ Configuração do Supabase:
- [ ] SMTP configurado e testado
- [ ] Email confirmations habilitado
- [ ] Site URL configurada
- [ ] Redirect URLs configuradas
- [ ] Templates de email configurados

### ✅ Teste do Fluxo:
- [ ] Cadastro funciona
- [ ] Email de confirmação é enviado
- [ ] Link de confirmação funciona
- [ ] Login funciona após confirmação
- [ ] Reset de senha funciona
- [ ] Botão de reenvio funciona

### ✅ Verificação no Database:
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

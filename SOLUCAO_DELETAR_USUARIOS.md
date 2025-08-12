# 🗑️ Solução para Deletar Usuários - Problema do Dashboard Supabase

## 🚨 **Problema Identificado**

O erro `"Failed to delete selected users"` no Dashboard do Supabase acontece devido a:

1. **Foreign Keys**: Referências na tabela `profiles` impedem exclusão
2. **Políticas RLS**: Políticas de segurança bloqueiam exclusão via dashboard  
3. **Triggers**: Podem causar conflitos durante a exclusão
4. **Cascata não configurada**: Dashboard não consegue deletar dependências

## 🛠️ **Solução Implementada**

### **Script SQL**: `supabase/delete_specific_users.sql`

Este script resolve o problema deletando usuários na ordem correta:
1. **Chatbots** (`mychatbot`)
2. **Roles** (`user_roles`) 
3. **Profiles** (`profiles`)
4. **Usuários** (`auth.users`)

## 🚀 **Como Executar a Correção**

### **Passo 1: Acessar SQL Editor**
1. Vá para o **Supabase Dashboard**
2. Clique em **SQL Editor**
3. Clique em **"New query"**

### **Passo 2: Executar o Script**
1. Copie todo o conteúdo do arquivo `supabase/delete_specific_users.sql`
2. Cole no SQL Editor
3. Clique em **"Run"**

### **Passo 3: Verificar Resultado**
O script irá retornar um JSON com o resultado:

```json
{
  "success": true,
  "message": "Processo concluído. 3 usuários deletados de 3 solicitados",
  "summary": {
    "users_deleted": 3,
    "total_profiles_deleted": 3,
    "total_roles_deleted": 0,
    "total_chatbots_deleted": 0
  }
}
```

## 📋 **Usuários que Serão Deletados**

- ✅ `test-1754959365229@test.com`
- ✅ `test-1754959327059@test.com`  
- ✅ `tutfop@dentistas.com.br`

## 🔧 **Alternativas Disponíveis**

### **Opção 1: Deletar Usuários Específicos**
```sql
SELECT admin_delete_specific_users();
```

### **Opção 2: Limpar TODOS os Usuários de Teste**
```sql
SELECT cleanup_all_test_users();
```

### **Opção 3: Verificar Usuários Restantes**
```sql
SELECT email, created_at FROM auth.users ORDER BY created_at DESC;
```

## 🔍 **Por Que o Dashboard Falha?**

### **Limitações do Dashboard Supabase:**
1. **Não segue ordem de dependências**: Tenta deletar `auth.users` antes das referências
2. **Não executa CASCADE DELETE**: Não remove automaticamente registros relacionados
3. **RLS interferindo**: Políticas podem bloquear operações do dashboard
4. **Triggers complexos**: Podem causar conflitos durante exclusão

### **Vantagens do Script SQL:**
- ✅ **Ordem correta** de exclusão
- ✅ **Tratamento de erros** robusto
- ✅ **Logs detalhados** do processo
- ✅ **Verificação de órfãos** após exclusão
- ✅ **Rollback automático** em caso de erro

## 🛡️ **Medidas de Segurança**

### **O Script Inclui:**
1. **Verificação de existência** antes da exclusão
2. **Logs detalhados** de cada operação
3. **Tratamento de exceções** sem parar o processo
4. **Contadores** de registros afetados
5. **Verificação final** de registros órfãos

### **Permissões Necessárias:**
- ✅ Acesso ao SQL Editor
- ✅ Função `SECURITY DEFINER` (já configurada)
- ✅ Permissões em `auth.users` e `public.*`

## 📊 **Monitoramento Pós-Execução**

Após executar o script, você verá:

### **Usuários Restantes:**
```sql
SELECT COUNT(*) FROM auth.users; -- Deve mostrar apenas usuários válidos
```

### **Verificação de Integridade:**
```sql
-- Não deve haver registros órfãos
SELECT COUNT(*) FROM profiles p 
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);
```

## 🎯 **Resultado Esperado**

Após executar o script:
- ✅ **3 usuários deletados** com sucesso
- ✅ **Sem registros órfãos** no banco
- ✅ **Dashboard funcionando** normalmente
- ✅ **Integridade mantida** entre tabelas

## 🆘 **Se Houver Problemas**

### **Script Falhou Parcialmente:**
```sql
-- Ver detalhes do erro
SELECT admin_delete_specific_users();
-- Verificar usuários restantes
SELECT email FROM auth.users WHERE email IN (
    'test-1754959365229@test.com',
    'test-1754959327059@test.com', 
    'tutfop@dentistas.com.br'
);
```

### **Dashboard Ainda Não Funciona:**
1. Aguarde alguns minutos (cache do dashboard)
2. Faça logout/login no Supabase Dashboard
3. Use sempre o script SQL para exclusões futuras

---

**🎯 Execute o script agora e os usuários problemáticos serão removidos com segurança!**

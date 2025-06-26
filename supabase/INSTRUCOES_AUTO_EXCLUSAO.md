# INSTRUÇÕES PARA APLICAR AS FUNÇÕES DE AUTO-EXCLUSÃO

## Aplicar as Funções SQL no Supabase

### Método 1: Via Dashboard do Supabase
1. Acesse o dashboard do Supabase
2. Vá em `SQL Editor`
3. Copie e cole o conteúdo do arquivo `supabase/self_delete_user.sql`
4. Execute o script

### Método 2: Via CLI do Supabase (se configurado)
```bash
supabase db reset
# ou
supabase db push
```

### Método 3: Manualmente via psql
```bash
psql -h [HOST] -p [PORT] -U [USER] -d [DATABASE] -f supabase/self_delete_user.sql
```

## Testando as Funções

### Teste da função self_delete_user_with_email:
```sql
SELECT self_delete_user_with_email('seu.email@exemplo.com');
```

### Teste da função self_delete_user:
```sql
SELECT self_delete_user();
```

## Como Funciona no Frontend

O componente CloseAccount agora tenta executar as funções na seguinte ordem:

1. **self_delete_user_with_email** (mais segura - confirma email)
2. **self_delete_user** (menos segura - não confirma email)
3. **simple_delete_user** (função admin como fallback)

## Recursos de Segurança

- ✅ Usa `auth.uid()` para identificar o usuário autenticado
- ✅ Verifica se o usuário está autenticado antes de excluir
- ✅ Opção com confirmação de email para maior segurança
- ✅ Excluí primeiro o perfil, depois o usuário auth
- ✅ Tratamento de erros com JSON de resposta
- ✅ `SECURITY DEFINER` para execução com privilégios elevados

## Notas Importantes

⚠️ **ATENÇÃO**: Essas funções fazem exclusão permanente de dados!

- A exclusão é irreversível
- Remove todos os dados do usuário (perfil + autenticação)
- Funciona apenas para o usuário autenticado (não pode excluir outros)
- Requer que o usuário esteja logado

## Solução de Problemas

Se as funções não funcionarem:

1. **Verificar se foram criadas no banco**:
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%self_delete%';
```

2. **Verificar permissões**:
```sql
SELECT * FROM information_schema.role_routine_grants 
WHERE routine_name = 'self_delete_user';
```

3. **Testar manualmente**:
```sql
SELECT self_delete_user(); -- Como usuário autenticado
```

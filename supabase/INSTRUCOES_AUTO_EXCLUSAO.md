# Instruções para Auto-Exclusão de Usuário

## Funcionalidades

- Permite que o próprio usuário exclua sua conta
- Remove dados de `profiles` e `auth.users`
- Segurança através de `auth.uid()`
- Validação com email de confirmação

## Para Instalar

```sql
-- Execute este arquivo no SQL Editor do Supabase
-- O arquivo self_delete_user.sql contém as funções necessárias
```

## Para Usar na Aplicação

```javascript
// Método 1: Exclusão simples
const result = await supabase.rpc('self_delete_user');

// Método 2: Exclusão com confirmação de email
const result = await supabase.rpc('self_delete_user_with_email', {
  confirm_email: 'usuario@email.com'
});
```

## Exemplo de Uso

```javascript
const handleDeleteAccount = async () => {
  try {
    const { data, error } = await supabase.rpc('self_delete_user_with_email', {
      confirm_email: user.email
    });
    
    if (error) throw error;
    
    if (data.success) {
      console.log('Conta excluída:', data.message);
      // Redirecionar para página de login
    } else {
      console.error('Erro:', data.message);
    }
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
  }
};
```

## Exemplo de Resposta

```json
{
  "success": true,
  "message": "Conta excluida com sucesso",
  "user_id": "uuid-do-usuario",
  "email": "usuario@email.com",
  "deleted_profiles": 1
}
```

## Como Funciona

1. Verifica se usuário está autenticado via `auth.uid()`

```sql
current_user_id := auth.uid();
```

1. Confirma email se solicitado

```sql
IF current_user_email != confirm_email THEN
    RETURN json_build_object('success', false, 'message', 'Email nao confere');
END IF;
```

1. Exclui perfil primeiro, depois usuário

```sql
DELETE FROM profiles WHERE id = current_user_id;
DELETE FROM auth.users WHERE id = current_user_id;
```

## Segurança

- ✅ Apenas o próprio usuário pode se excluir
- ✅ Validação via `auth.uid()`
- ✅ Confirmação opcional por email
- ✅ Transação atômica (tudo ou nada)
- ✅ Logs detalhados de erro
- ✅ Função `SECURITY DEFINER` para privilégios elevados

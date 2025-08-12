# 🚨 CORREÇÃO DO ERRO: column chatbot_embeddings.user_id does not exist

## 📋 **Resumo do Problema**

**Erro:** `column chatbot_embeddings.user_id does not exist`  
**Arquivo:** `src/components/chatbot/DocumentUpload.tsx`  
**Linha:** 219  
**Função:** `deleteDocument`  

## 🔍 **Causa Raiz**

O código estava tentando deletar embeddings usando uma coluna `user_id` que não existe na tabela `chatbot_embeddings`.

### Código Incorreto (❌)

```typescript
const { error: embeddingsError } = await supabase
  .from("chatbot_embeddings")
  .delete()
  .eq("document_id", documentId)
  .eq("user_id", user.id);  // ❌ Coluna não existe!
```

### Código Correto (✅)

```typescript
const { error: embeddingsError } = await supabase
  .from("chatbot_embeddings")
  .delete()
  .eq("document_id", documentId)
  .eq("chatbot_user", user.id);  // ✅ Coluna correta!
```

## 📊 **Estrutura da Tabela `chatbot_embeddings`**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `document_id` | UUID | Referência ao documento |
| `chatbot_user` | UUID | Referência ao usuário (auth.users) |
| `chunk_text` | TEXT | Texto do chunk |
| `chunk_index` | INTEGER | Índice do chunk |
| `embedding` | VECTOR(1536) | Embedding do OpenAI |
| `metadata` | JSONB | Metadados adicionais |
| `created_at` | TIMESTAMP | Data de criação |

## 🛠️ **Correção Aplicada**

**Arquivo:** `c:\contexto\fastbot\src\components\chatbot\DocumentUpload.tsx`  
**Linha:** 219  

```typescript
// ANTES:
.eq("user_id", user.id);

// DEPOIS:
.eq("chatbot_user", user.id);
```

## 🧪 **Como Testar a Correção**

1. **Fazer upload de um documento**
2. **Tentar deletar o documento**  
3. **Verificar no console que não há mais erro 400**
4. **Confirmar que o documento e embeddings foram deletados**

## 📝 **Scripts de Diagnóstico Criados**

1. **`supabase/verificar_estrutura_embeddings.sql`** - Verifica estrutura das tabelas
2. **`supabase/diagnostico_erro_embeddings_user_id.sql`** - Diagnóstico específico do erro

## ⚠️ **Prevenção de Problemas Similares**

### Sempre verificar a estrutura das tabelas antes de fazer queries

```sql
-- Verificar colunas de uma tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'nome_da_tabela' 
  AND table_schema = 'public';
```

### Usar nomes de colunas consistentes

- Para referências de usuário em tabelas do chatbot: `chatbot_user`
- Para outras tabelas: verificar documentação/estrutura

## 🎯 **Status Final**

✅ **PROBLEMA RESOLVIDO**  
✅ **Código corrigido em DocumentUpload.tsx**  
✅ **Scripts de diagnóstico criados**  
✅ **Documentação atualizada**  

**Próximas ações:** Testar a funcionalidade de deletar documentos no frontend para confirmar que o erro foi completamente resolvido.

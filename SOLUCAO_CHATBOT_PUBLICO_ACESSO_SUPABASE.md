# Solução: Chatbot Público com Acesso ao Supabase Vector Store

## 📋 Problema Original

O chatbot público não conseguia acessar os dados vetoriais (embeddings) armazenados no Supabase, resultando em respostas genéricas sem contexto dos documentos carregados.

**Sintomas:**

- Busca vetorial retornava 0 resultados
- IA respondia sem contexto dos documentos
- Erro 404 na função RPC `match_embeddings_public`
- Usuários anônimos sem acesso aos dados

## 🔍 Diagnóstico Realizado

### 1. Verificação de RLS (Row Level Security)

```sql
-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('chatbot_documents', 'chatbot_embeddings', 'mychatbot');
```

### 2. Análise de Políticas de Segurança

```sql
-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('chatbot_documents', 'chatbot_embeddings', 'mychatbot');
```

### 3. Teste de Acesso Anônimo

```sql
-- Testar acesso como anon
SET ROLE anon;
SELECT COUNT(*) FROM chatbot_documents;
RESET ROLE;
```

### 4. Verificação de Funções RPC

```sql
-- Verificar funções disponíveis
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%match%';
```

## 🛠️ Soluções Implementadas

### 1. Criação de Políticas Públicas para RLS

**Problema:** RLS bloqueava acesso anônimo às tabelas.

**Solução:** Criação de políticas que permitem leitura pública:

```sql
-- Políticas para mychatbot (leitura pública)
CREATE POLICY "Public read access for mychatbot" ON mychatbot
    FOR SELECT USING (true);

-- Políticas para chatbot_documents (leitura pública)
CREATE POLICY "Public read access for chatbot_documents" ON chatbot_documents
    FOR SELECT USING (true);

-- Políticas para chatbot_embeddings (leitura pública)
CREATE POLICY "Public read access for chatbot_embeddings" ON chatbot_embeddings
    FOR SELECT USING (true);
```

### 2. Criação de Função RPC Pública

**Problema:** Função `match_embeddings` original restrita a usuários autenticados.

**Solução:** Nova função `match_embeddings_public` com `SECURITY DEFINER`:

```sql
CREATE OR REPLACE FUNCTION match_embeddings_public(
  query_embedding VECTOR(1536),
  target_user_id UUID,
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_text TEXT,
  similarity FLOAT,
  metadata JSONB,
  filename VARCHAR(255)
)
LANGUAGE plpgsql
SECURITY DEFINER -- Permite execução com privilégios elevados
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.document_id,
    ce.chunk_text,
    1 - (ce.embedding <=> query_embedding) AS similarity,
    ce.metadata,
    cd.filename
  FROM chatbot_embeddings ce
  JOIN chatbot_documents cd ON ce.document_id = cd.id
  WHERE ce.chatbot_user = target_user_id
    AND 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Dar permissões para roles anônimo e autenticado
GRANT EXECUTE ON FUNCTION match_embeddings_public TO anon;
GRANT EXECUTE ON FUNCTION match_embeddings_public TO authenticated;
```

### 3. Correção de Incompatibilidade de Modelos de Embedding

**Problema:** Modelos diferentes causavam incompatibilidade vetorial:

- Embeddings armazenados: `text-embedding-ada-002`
- Busca no frontend: `text-embedding-3-small`

**Solução:** Padronização para `text-embedding-ada-002`:

```typescript
// PublicChatbotPage.tsx - Função getChatbotContextForUser
const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${openaiApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: userMessage,
    model: 'text-embedding-ada-002' // ✅ Mesmo modelo usado para criar embeddings
  }),
});
```

### 4. Atualização do Frontend para Usar Nova Função

**Problema:** Frontend usava função RPC inexistente para usuários anônimos.

**Solução:** Atualização para usar `match_embeddings_public`:

```typescript
// PublicChatbotPage.tsx
const { data, error } = await supabase.rpc('match_embeddings_public', {
  query_embedding: queryEmbedding,
  target_user_id: targetUserId,
  match_threshold: 0.3, // Threshold mais permissivo
  match_count: 10
});
```

### 5. Sistema de Logs para Debugging

**Implementação:** Logs detalhados para rastreamento:

```typescript
console.log('🔍 [PublicChatbot] Iniciando busca por contexto:', { userMessage, targetUserId });
console.log('✅ [PublicChatbot] Embedding gerado com sucesso, dimensões:', queryEmbedding.length);
console.log('📊 [PublicChatbot] Resultados da busca:', { totalResults: data?.length || 0 });
console.log('📖 [PublicChatbot] Contexto vetorial obtido:', { hasContext: !!vectorContext });
```

## 📊 Resultados Alcançados

### Antes da Solução

- ❌ 0 resultados na busca vetorial
- ❌ Respostas genéricas sem contexto
- ❌ Erro 404 em funções RPC
- ❌ Usuários anônimos bloqueados

### Depois da Solução

- ✅ 10 resultados encontrados na busca vetorial
- ✅ Contexto de ~9.000 caracteres (2.250 tokens)
- ✅ Respostas precisas baseadas em documentos
- ✅ Acesso público funcionando

### Métricas de Performance

```
🔧 [PublicChatbot] Resposta da RPC: {data: Array(10), error: null, hasData: true, dataLength: 10}
📊 [PublicChatbot] Resultados da busca: {totalResults: 10, results: Array(10)}
✅ [PublicChatbot] Contexto construído com sucesso: {totalChars: 8997, estimatedTokens: 2250}
✅ [PublicChatbot] Resposta da IA obtida: {responseLength: 1340}
```

## 🚀 URLs de Chatbots Públicos Disponíveis

Baseado nos slugs identificados:

| Chatbot | URL | Embeddings | Conteúdo |
|---------|-----|------------|----------|
| LGPD-BOT | `http://localhost:5173/chat/lgpdbot` | 772 | Lei Geral de Proteção de Dados |
| TutFOP 5 | `http://localhost:5173/chat/tutfop5` | 1.100 | Tutorial de Programação |
| Dolesc | `http://localhost:5173/chat/dolesc` | 24 | Conteúdo Específico |
| Ana | `http://localhost:5173/chat/ana` | - | Chatbot Geral |
| Elcy IA | `http://localhost:5173/chat/elcyia` | 1 | Assistente IA |

## 🔧 Scripts de Validação

### Script para Verificar Saúde do Sistema

```sql
-- 1. Verificar função pública existe
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'match_embeddings_public';

-- 2. Verificar embeddings disponíveis
SELECT 
  cb.chatbot_name,
  cb.chatbot_user::text,
  COUNT(ce.id) as total_embeddings
FROM mychatbot cb
LEFT JOIN chatbot_embeddings ce ON cb.chatbot_user::text = ce.chatbot_user::text
GROUP BY cb.chatbot_name, cb.chatbot_user
HAVING COUNT(ce.id) > 0
ORDER BY COUNT(ce.id) DESC;

-- 3. Testar acesso anônimo
SET ROLE anon;
SELECT COUNT(*) as accessible_documents FROM chatbot_documents;
SELECT COUNT(*) as accessible_embeddings FROM chatbot_embeddings;
RESET ROLE;

-- 4. Testar função RPC (substitua o embedding por um real)
SELECT * FROM match_embeddings_public(
  '[0.1,0.2,0.3,...]'::vector, 
  'd0a7d278-b4da-4d34-981d-0b356c2fd21e'::uuid, 
  0.3, 
  5
);
```

## 📋 Checklist para Novos Projetos

### Backend (Supabase)

- [ ] Habilitar RLS em tabelas de embeddings
- [ ] Criar políticas públicas de leitura
- [ ] Implementar função RPC pública com `SECURITY DEFINER`
- [ ] Dar permissões `EXECUTE` para role `anon`
- [ ] Padronizar modelo de embedding (`text-embedding-ada-002`)

### Frontend

- [ ] Usar função RPC pública para usuários anônimos
- [ ] Manter consistência de modelo de embedding
- [ ] Implementar sistema de logs para debugging
- [ ] Configurar threshold de similaridade apropriado (0.3-0.5)
- [ ] Tratar casos de 0 resultados graciosamente

### Validação

- [ ] Testar acesso anônimo via SQL
- [ ] Verificar busca vetorial retorna resultados
- [ ] Confirmar contexto sendo usado na resposta IA
- [ ] Validar URLs públicas funcionando
- [ ] Monitorar logs de erro

## 🎯 Lições Aprendidas

1. **Modelos de Embedding:** Manter consistência é crítico para funcionalidade vetorial
2. **RLS no Supabase:** Requer políticas específicas para acesso público
3. **Funções RPC:** `SECURITY DEFINER` permite execução com privilégios elevados
4. **Debugging:** Logs detalhados são essenciais para identificar problemas
5. **Threshold de Similaridade:** Valores muito altos (>0.5) podem bloquear resultados relevantes

## 📖 Referências

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [PostgreSQL Security Definer](https://www.postgresql.org/docs/current/sql-createfunction.html)

---

**Data da Solução:** 22 de Agosto de 2025  
**Status:** ✅ Implementado e Validado  
**Impacto:** Chatbots públicos funcionais com acesso vetorial completo

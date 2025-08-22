# 🔧 TROUBLESHOOTING: Chatbot Público + Supabase Vector Store

## 🚨 Problema: "0 resultados na busca vetorial"

### Diagnóstico Rápido

```typescript
// Console deve mostrar:
📊 [PublicChatbot] Resultados da busca: {totalResults: 0} // ❌ PROBLEMA
```

### Possíveis Causas

#### 1. Modelo de Embedding Incompatível

**Sintoma:** Embedding gerado mas 0 resultados

```typescript
// ❌ ERRADO: Modelos diferentes
// Embeddings armazenados: text-embedding-ada-002
// Busca frontend: text-embedding-3-small

// ✅ CORRETO: Mesmo modelo
model: 'text-embedding-ada-002'
```

#### 2. Função RPC Não Existe

**Sintoma:** Erro 404 na função `match_embeddings_public`

```sql
-- Verificar se existe
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'match_embeddings_public';

-- Se não existir, criar
CREATE OR REPLACE FUNCTION match_embeddings_public(...);
```

#### 3. Permissões Insuficientes

**Sintoma:** Erro de permissão ou acesso negado

```sql
-- Verificar permissões
SET ROLE anon;
SELECT COUNT(*) FROM chatbot_embeddings; -- Deve funcionar
RESET ROLE;

-- Se falhar, aplicar políticas
CREATE POLICY "Public read access" ON chatbot_embeddings FOR SELECT USING (true);
```

#### 4. Threshold Muito Alto

**Sintoma:** Embeddings existem mas threshold 0.8+ não retorna nada

```typescript
// ❌ Muito restritivo
match_threshold: 0.8

// ✅ Mais permissivo  
match_threshold: 0.3
```

## 🚨 Problema: "Chatbot não encontrado"

### Diagnóstico Inicial

```typescript
// Console deve mostrar:
🔍 [PublicChatbot] Procurando por slug: lgpdbot
🔍 [PublicChatbot] Chatbot encontrado: null // ❌ PROBLEMA
```

### Soluções

#### 1. Verificar Slug Calculation

```sql
-- Ver todos os slugs disponíveis
SELECT 
  chatbot_name,
  LOWER(REGEXP_REPLACE(chatbot_name, '[^a-z0-9]', '', 'g')) as slug_calculado
FROM mychatbot;
```

#### 2. URL Correta

```
✅ http://localhost:5173/chat/lgpdbot
❌ http://localhost:5173/chat/LGPD-BOT
❌ http://localhost:5173/chat/lgpd-bot
```

## 🚨 Problema: "Erro 404 na função RPC"

### Diagnóstico HTTP

```
POST /rest/v1/rpc/match_embeddings_public 404 (Not Found)
```

### Solução Completa

```sql
-- 1. Verificar se função existe
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'match_embeddings_public';

-- 2. Se não existir, criar função
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
SECURITY DEFINER
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

-- 3. Dar permissões
GRANT EXECUTE ON FUNCTION match_embeddings_public TO anon;
GRANT EXECUTE ON FUNCTION match_embeddings_public TO authenticated;
```

## 🚨 Problema: "RLS bloqueia acesso"

### Diagnóstico RLS

```sql
-- Testar acesso anônimo
SET ROLE anon;
SELECT COUNT(*) FROM chatbot_embeddings; -- Se retornar 0, RLS está bloqueando
RESET ROLE;
```

### Solução RLS

```sql
-- Criar políticas públicas
CREATE POLICY "Public read access for mychatbot" ON mychatbot
    FOR SELECT USING (true);

CREATE POLICY "Public read access for chatbot_documents" ON chatbot_documents
    FOR SELECT USING (true);

CREATE POLICY "Public read access for chatbot_embeddings" ON chatbot_embeddings
    FOR SELECT USING (true);
```

## 🚨 Problema: "Usuário não tem embeddings"

### Diagnóstico de Dados

```sql
-- Verificar se usuário tem embeddings
SELECT chatbot_user, COUNT(*) 
FROM chatbot_embeddings 
WHERE chatbot_user = 'target-user-id'
GROUP BY chatbot_user;
```

### Soluções de Dados

1. **Processar documentos** para esse usuário
2. **Testar com outro chatbot** que tem embeddings
3. **Verificar se documentos foram carregados**

## 🛠️ Scripts de Diagnóstico Rápido

### Script Completo de Saúde

```sql
-- Executar este script para diagnóstico completo
SELECT 'DIAGNÓSTICO COMPLETO' as status;

-- 1. Verificar funções RPC
SELECT 'Funções RPC:' as categoria, routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%match%';

-- 2. Verificar políticas
SELECT 'Políticas:' as categoria, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('chatbot_documents', 'chatbot_embeddings', 'mychatbot');

-- 3. Verificar embeddings por usuário
SELECT 'Embeddings:' as categoria, chatbot_user, COUNT(*) as total
FROM chatbot_embeddings 
GROUP BY chatbot_user 
ORDER BY total DESC 
LIMIT 5;

-- 4. Verificar acesso anônimo
SET ROLE anon;
SELECT 'Acesso Anônimo:' as categoria, 
       COUNT(*) as documentos_acessiveis 
FROM chatbot_documents;
RESET ROLE;

-- 5. Verificar chatbots disponíveis
SELECT 'Chatbots:' as categoria, 
       chatbot_name, 
       LOWER(REGEXP_REPLACE(chatbot_name, '[^a-z0-9]', '', 'g')) as slug
FROM mychatbot 
ORDER BY chatbot_name;
```

### Validação Frontend

```typescript
// Adicionar logs temporários para debug
console.log('🔧 Debug Info:', {
  chatbotSlug: chatbotSlug,
  config: config,
  hasEmbedding: !!queryEmbedding,
  embeddingLength: queryEmbedding?.length,
  targetUserId: config?.chatbot_user
});
```

## 📋 Checklist de Resolução

### Backend (Supabase)

- [ ] Função `match_embeddings_public` existe
- [ ] Permissões `EXECUTE` para `anon` concedidas
- [ ] Políticas RLS públicas ativas
- [ ] Extensão `vector` habilitada
- [ ] Embeddings existem para o usuário alvo

### Frontend

- [ ] Modelo de embedding correto (`text-embedding-ada-002`)
- [ ] Função RPC correta (`match_embeddings_public`)
- [ ] Threshold apropriado (0.3-0.5)
- [ ] Logs de debug implementados
- [ ] URL do chatbot correta

### Validação Final

- [ ] Console mostra `totalResults > 0`
- [ ] Console mostra `hasContext: true`
- [ ] Resposta da IA usa contexto dos documentos
- [ ] Sem erros 404 ou de permissão
- [ ] Acesso público funcional

## 🔄 Processo de Debug

1. **Verificar função RPC** existe e tem permissões
2. **Testar acesso anônimo** via SQL
3. **Confirmar embeddings** existem para o usuário
4. **Validar modelo de embedding** é consistente
5. **Ajustar threshold** se necessário
6. **Verificar logs** do console para erros específicos

---

**💡 Dica:** Sempre teste primeiro com usuários que têm muitos embeddings (1000+) e perguntas relacionadas ao conteúdo conhecido.

# 🔍 Diagnóstico: Preview no Modo WEBHOOK

## ❗ **IMPORTANTE: O Preview NÃO chama webhook!**

### 🧠 **Como o Preview Realmente Funciona**

O preview **busca dados já armazenados no Supabase**, NÃO chama webhooks:

#### **🟩 MODO LOCAL** (`VITE_USE_LOCAL_AI=true`)

```typescript
// Busca diretamente na tabela chatbot_documents
const result = await supabase
  .from("chatbot_documents")
  .select("content, filename, upload_date")
  .eq("id", documentId)
  .eq("chatbot_user", user.id)
  .single();
```

#### **🟣 MODO WEBHOOK** (`VITE_USE_LOCAL_AI=false`)

```typescript
// Estratégia 1: Buscar em documents_details
const detailsResult = await supabase
  .from("documents_details")
  .select("content, filename, upload_date")
  .eq("id", documentId)
  .eq("chatbot_user", user.id)
  .single();

// Estratégia 2: Se não encontrar, buscar chunks em documents
const { data: chunks } = await supabase
  .from("documents")
  .select("content, metadata")
  .not("metadata", "is", null);

// Estratégia 3: Fallback com mensagem explicativa
```

## 🔄 **URLs Atuais Configuradas**

```properties
# Upload de documentos (N8N processa e salva)
VITE_WEBHOOK_N8N_INSERT_RAG_URL=https://marte.cirurgia.com.br/webhook/InserirRAG

# Chat/conversas
VITE_WEBHOOK_N8N_URL=https://marte.cirurgia.com.br/webhook/FASTBOT

# Preview: NÃO USA WEBHOOK! Busca no Supabase.
```

## 🚫 **Por que o Preview Pode Estar Dando "null"**

### **Possíveis Causas:**

1. **🗃️ Dados não estão sendo salvos pelo N8N**
   - O webhook `InserirRAG` não está populando `documents_details.content`
   - O webhook não está criando chunks na tabela `documents`

2. **🔒 Problemas de RLS (Row Level Security)**
   - Políticas de segurança bloqueando acesso aos dados
   - User ID não coincidindo entre upload e busca

3. **🆔 Inconsistência de IDs**
   - IDs gerados pelo N8N não coincidindo com IDs da lista
   - User ID sendo salvo de forma diferente

## 🧪 **Como Diagnosticar**

### **Passo 1: Execute o Script de Debug**

1. Abra o navegador em `http://localhost:8081/fastbot/`
2. Vá para "Meus Dados"
3. Abra o Console do Navegador (F12)
4. Copie e cole o arquivo `debug-preview-webhook.js`
5. Substitua `"COLE_AQUI_SEU_USER_ID"` pelo seu user.id real
6. Execute: `debugPreviewWebhook()`

### **Passo 2: Analisar os Resultados**

O script vai mostrar:

- ✅ Se existem documentos em `documents_details`
- ✅ Se o campo `content` está preenchido
- ✅ Se existem chunks em `documents`
- ✅ Se o user.id coincide entre tabelas
- ✅ Se há problemas de RLS

## 🔧 **Possíveis Soluções**

### **📊 Se documents_details está vazio:**

```sql
-- Verificar se N8N está salvando corretamente
SELECT * FROM documents_details WHERE chatbot_user = 'SEU_USER_ID';
```

### **🧩 Se documents tem chunks mas documents_details está vazio:**

```sql
-- Verificar chunks na tabela documents
SELECT id, chatbot_user, metadata, content 
FROM documents 
WHERE chatbot_user = 'SEU_USER_ID' 
LIMIT 5;
```

### **🔒 Se há problemas de RLS:**

```sql
-- Desabilitar RLS temporariamente para teste
ALTER TABLE documents_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
```

## 🎯 **Se Você Quer Fazer Preview via Webhook**

**Atualmente o preview não usa webhook**, mas se quiser implementar:

### **Modificar generatePreview():**

```typescript
// Adicionar uma 4ª estratégia: Buscar via webhook
if (!content) {
  console.log('🌐 Tentando buscar conteúdo via webhook...');
  
  const response = await fetch(`${VITE_WEBHOOK_N8N_URL}/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentId: documentId,
      userId: user.id,
      filename: currentDoc.filename
    })
  });
  
  if (response.ok) {
    const result = await response.json();
    content = result.content || '';
  }
}
```

### **Payload para N8N (se implementar):**

```json
{
  "documentId": "uuid-do-documento",
  "userId": "uuid-do-usuario", 
  "filename": "documento.txt"
}
```

### **Resposta Esperada do N8N:**

```json
{
  "success": true,
  "content": "Conteúdo completo do documento...",
  "filename": "documento.txt",
  "uploadDate": "2025-01-15T10:30:00Z"
}
```

## 📋 **Resumo**

1. **Preview NÃO usa webhook** - busca no Supabase
2. **Execute o debug script** para identificar o problema
3. **Verifique se N8N está salvando** `content` nas tabelas
4. **Confirme que user.id** coincide entre upload e busca
5. **Se necessário**, implemente preview via webhook como mostrado acima

---

**🎯 Próximo passo: Execute o debug e me mostra os resultados!**

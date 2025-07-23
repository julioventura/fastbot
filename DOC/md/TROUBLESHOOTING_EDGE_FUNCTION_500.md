# 🔧 **TROUBLESHOOTING - Erro 500 Edge Function**


## ❌ **ERRO IDENTIFICADO**


```
Edge Function returned a non-2xx status code
FunctionsHttpError: Edge Function returned a non-2xx status code

```


## 🔍 **FERRAMENTAS DE DEBUG IMPLEMENTADAS**


### **1. Debug System Melhorado**

**Novo botão "🔧 Debug"** no DocumentUpload que testa:


- ✅ **Autenticação do usuário**

- ✅ **Variáveis de ambiente** (nova Edge Function `debug-env`)

- ✅ **Conectividade com OpenAI API**

- ✅ **Edge Function generate-embedding**

- ✅ **Edge Function process-embeddings** (se OpenAI estiver configurado)


### **2. Logs Detalhados**

**Console do navegador agora mostra:**


```javascript
🔧 [DEBUG] Iniciando processamento de embeddings: {
  documentId: "uuid-here",
  contentLength: 1234,
  userId: "user-id",
  timestamp: "2025-07-19T20:19:59.000Z"
}

🔧 [DEBUG] Edge Function response completa: {
  data: null,
  error: FunctionsHttpError
}

❌ [DEBUG] Erro no sistema: {
  error: Error,
  message: "Edge Function error: ...",
  stack: "stack trace..."
}

```


### **3. Nova Edge Function de Diagnóstico**

**`debug-env`** - Verifica variáveis de ambiente:


```json
{
  "success": true,
  "environment_check": {
    "openai_configured": true/false,
    "supabase_url_configured": true/false,
    "service_key_configured": true/false,
    "openai_key_preview": "sk-proj-ABC...",
    "openai_api_status": "working" | "error_401" | "connection_failed",
    "timestamp": "2025-07-19T20:00:00.000Z"
  }
}

```


## 🚀 **COMO USAR O DEBUG**


### **Passo 1: Execute o Debug System**


1. Vá para a aba **DOCUMENTOS** no seu chatbot

2. Clique no botão **"🔧 Debug"** 

3. Abra o **Console do navegador** (F12)

4. Veja os logs detalhados


### **Passo 2: Analise os Resultados**

**Se `openai_configured: false`:**


```bash

# Configurar no Supabase Dashboard

# Settings → Edge Functions → Environment Variables
OPENAI_API_KEY=sk-proj-your-key-here

```

**Se `openai_api_status: "error_401"`:**


- ✅ Verificar se a API Key está correta

- ✅ Verificar se a conta OpenAI tem créditos

- ✅ Verificar se a API Key tem permissões

**Se `openai_api_status: "connection_failed"`:**


- ✅ Verificar conectividade de rede

- ✅ Verificar se o Supabase pode acessar APIs externas

**Se `service_key_configured: false`:**


```bash

# Configurar no Supabase Dashboard  
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

```


## 🔧 **DEPLOY DA NOVA FUNÇÃO DEBUG**


```bash

# Deploy da função de debug
supabase functions deploy debug-env


# Ou deploy de todas as funções
supabase functions deploy

```


## 📊 **POSSÍVEIS CAUSAS E SOLUÇÕES**


### **1. Variáveis de Ambiente Ausentes**

**Problema**: Edge Functions não encontram as variáveis

**Solução**:


```bash

# No Supabase Dashboard → Settings → Edge Functions
OPENAI_API_KEY=sk-proj-your-openai-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

```


### **2. OpenAI API Issues**

**Problema**: API Key inválida ou sem créditos

**Verificações**:


- ✅ API Key válida e ativa

- ✅ Conta com créditos suficientes

- ✅ Rate limits não excedidos

- ✅ Modelo `text-embedding-ada-002` acessível


### **3. Supabase RLS Policies**

**Problema**: Políticas bloqueando acesso

**Verificação**:


```sql
-- Verificar se o usuário pode acessar o documento
SELECT * FROM chatbot_documents 
WHERE id = 'document-id' 
AND chatbot_user = 'user-id';

-- Verificar políticas RLS
SELECT * FROM pg_policies 
WHERE tablename IN ('chatbot_documents', 'chatbot_embeddings');

```


### **4. Timeout da Edge Function**

**Problema**: Processamento muito lento

**Soluções**:


- ✅ Reduzir tamanho do documento

- ✅ Verificar conectividade OpenAI

- ✅ Otimizar chunking (menos chunks)


## 🎯 **PRÓXIMOS PASSOS**


1. **Execute o Debug System** usando o botão "🔧 Debug"

2. **Verifique o console** para logs detalhados

3. **Identifique a causa** usando os códigos de status

4. **Configure variáveis** se necessário

5. **Teste novamente** o processamento


## 📝 **EXEMPLO DE DEBUG BEM-SUCEDIDO**


```javascript
✅ [DEBUG] Usuário autenticado: user-123
📊 [DEBUG] Environment check: {
  openai_configured: true,
  openai_api_status: "working",
  supabase_url_configured: true,
  service_key_configured: true
}
📊 [DEBUG] generate-embedding response: { data: {...} }
📊 [DEBUG] process-embeddings response: { 
  data: { success: true, chunks_processed: 3 } 
}
🧹 [DEBUG] Documento de teste removido

```

---


## ⚡ **FERRAMENTAS IMPLEMENTADAS**


- ✅ **Debug System**: Botão "🔧 Debug" completo

- ✅ **Edge Function debug-env**: Verificação de variáveis

- ✅ **Logs detalhados**: Console com informações completas

- ✅ **Teste automático**: Criação e limpeza de documento de teste

**Use essas ferramentas para identificar exatamente onde está o problema!** 🔍

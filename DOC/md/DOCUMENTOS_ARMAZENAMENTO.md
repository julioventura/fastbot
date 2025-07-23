# 📁 **Onde estão armazenados os documentos?**


## 🗄️ **Estrutura de Armazenamento no Supabase**


### **Tabelas Principais**


#### **1. `chatbot_documents`**

**Localização**: Dashboard Supabase → Table Editor → chatbot_documents

**Campos:**


- `id`: UUID único do documento

- `chatbot_user`: ID do usuário (UUID) 

- `filename`: Nome original do arquivo

- `content`: Texto completo do documento

- `file_size`: Tamanho em bytes

- `status`: 'processing' | 'completed' | 'error'

- `upload_date`: Data/hora do upload


#### **2. `chatbot_embeddings`**

**Localização**: Dashboard Supabase → Table Editor → chatbot_embeddings

**Campos:**


- `id`: UUID único do chunk

- `document_id`: Referência ao documento (FK)

- `chatbot_user`: ID do usuário (UUID)

- `chunk_content`: Texto do pedaço (chunk)

- `chunk_index`: Posição do chunk no documento

- `embedding`: Vector de embeddings (1536 dimensões)

- `created_at`: Data/hora de criação


## 🔍 **Como Acessar os Dados**


### **1. Via Dashboard Supabase**


1. Acesse seu painel Supabase

2. Vá em **Table Editor**

3. Selecione a tabela `chatbot_documents` ou `chatbot_embeddings`

4. Use os filtros para encontrar documentos de um usuário específico


### **2. Via SQL Query**


```sql
-- Ver todos os documentos de um usuário
SELECT * FROM chatbot_documents 
WHERE chatbot_user = 'user-uuid-here'
ORDER BY upload_date DESC;

-- Ver embeddings de um documento
SELECT * FROM chatbot_embeddings 
WHERE document_id = 'document-uuid-here'
ORDER BY chunk_index;

-- Contagem de chunks por documento
SELECT 
  d.filename,
  d.status,
  COUNT(e.id) as total_chunks
FROM chatbot_documents d
LEFT JOIN chatbot_embeddings e ON d.id = e.document_id
WHERE d.chatbot_user = 'user-uuid-here'
GROUP BY d.id, d.filename, d.status;

```


### **3. Via API REST**


```javascript
// Buscar documentos do usuário
const { data, error } = await supabase
  .from('chatbot_documents')
  .select('*')
  .eq('chatbot_user', user.id)
  .order('upload_date', { ascending: false });

// Buscar embeddings de um documento
const { data, error } = await supabase
  .from('chatbot_embeddings')
  .select('*')
  .eq('document_id', documentId)
  .order('chunk_index');

```


## 📊 **Monitoramento de Documentos**


### **Status dos Documentos**


- ✅ **completed**: Documento processado, embeddings criados

- ⏳ **processing**: Documento enviado, aguardando processamento

- ❌ **error**: Erro no processamento, embeddings não criados


### **Como Verificar Problemas**


1. **Documento com status 'error'**: 

   - Verifique os logs da Edge Function

   - Teste variáveis de ambiente (OPENAI_API_KEY)

   - Verifique se o texto foi salvo corretamente


2. **Embeddings ausentes**:

   - Verifique a tabela `chatbot_embeddings`

   - Confira se o processamento foi concluído

   - Teste a conectividade com OpenAI API


## 🛠️ **Troubleshooting**


### **Documento não aparece na lista**


```sql
-- Verificar se foi inserido na tabela
SELECT * FROM chatbot_documents 
WHERE filename = 'nome-do-arquivo.txt'
ORDER BY upload_date DESC;

```


### **Embeddings não foram criados**


```sql
-- Verificar embeddings relacionados
SELECT COUNT(*) as total_embeddings
FROM chatbot_embeddings 
WHERE document_id = 'document-id-here';

```


### **Erro 500 na Edge Function**


1. Verificar variáveis de ambiente no Supabase

2. Testar OpenAI API Key

3. Verificar logs da função no Dashboard


## 📍 **Localização Física dos Dados**

**Supabase Cloud:**


- Região: Conforme configuração do projeto

- Backup: Automático conforme plano

- Retenção: Conforme política do projeto

**Acesso Direto:**


- Dashboard: `https://supabase.com/dashboard/project/[project-id]`

- Table Editor: `/editor/[table-name]`

- SQL Editor: `/sql`

---


## 🎯 **Resumo**


Os documentos ficam armazenados em **duas tabelas no Supabase**:


1. **`chatbot_documents`**: Metadados e conteúdo original

2. **`chatbot_embeddings`**: Chunks e vetores para busca semântica

**Para debugar problemas, sempre verifique essas tabelas primeiro!** 🔍

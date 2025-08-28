# 🚨 CORREÇÃO URGENTE - N8N Upload Workflow

## Problema Identificado
- ❌ **ERRO ATUAL**: N8N está criando 151 registros em `documents_details` (um por chunk)
- ❌ **ERRO ATUAL**: Deveria criar apenas 1 registro em `documents_details` por documento
- ✅ **CORRETO**: `documents` deve ter 151 registros (chunks), `documents_details` deve ter 1 registro (documento)

## Estrutura Correta das Tabelas

### documents_details (METADATA do documento)
```sql
-- UM registro por documento enviado
INSERT INTO documents_details (
  id: 'uuid-unico-do-documento',
  chatbot_user: 'uuid-do-usuario',
  filename: 'nome-original-do-arquivo.txt',  -- NÃO timestamp!
  content: 'conteudo-completo-do-arquivo',   -- Texto integral
  file_size: 15420,                          -- Tamanho real em bytes
  upload_date: '2025-08-28T10:44:49.281Z',   -- Data do upload
  status: 'processing' -> 'completed',        -- Status do processamento
  summary: 'resumo-automatico-opcional'       -- Opcional
);
```

### documents (CHUNKS vetorizados)
```sql
-- MÚLTIPLOS registros (um por chunk)
INSERT INTO documents (
  id: 30,  -- ID sequencial do chunk
  content: 'pedaco-1-do-documento...',        -- Texto do chunk
  metadata: {
    "usuario": "uuid-do-usuario",
    "chatbot_name": "LGPD-BOT", 
    "source": "nome-original-do-arquivo.txt",
    "document_id": "uuid-do-documento"         -- Referência ao documents_details
  },
  embedding: [0.029522348, 0.013532871, ...]  -- Vetor de embeddings
);
```

## Fluxo de Processamento N8N (CORRIGIDO)

### 1️⃣ Receber Arquivo
```javascript
// FormData recebido do frontend
{
  data: [arquivo],
  chatbot: "LGPD-BOT",
  userid: "d0a7d278-b4da-4d34-981d-0b356c2fd21e",
  filename: "regulamento_anpd.txt",
  filesize: "15420", 
  filetype: "text/plain",
  timestamp: "2025-08-28T10:44:49.281Z"
}
```

### 2️⃣ Extrair Conteúdo
```javascript
const fileContent = await file.text(); // Conteúdo completo do arquivo
```

### 3️⃣ Criar UM Registro em documents_details
```sql
-- EXECUTAR UMA VEZ POR DOCUMENTO
INSERT INTO documents_details (
  chatbot_user, filename, content, file_size, upload_date, status
) VALUES (
  '{{ $json.userid }}',
  '{{ $json.filename }}',        -- Nome original, NÃO timestamp
  '{{ fileContent }}',           -- Conteúdo completo
  {{ parseInt($json.filesize) }}, -- Converter string para int
  '{{ $json.timestamp }}',
  'processing'
) RETURNING id;
```

### 4️⃣ Chunking e Embeddings
```javascript
const chunks = splitIntoChunks(fileContent); // Dividir em pedaços
const documentId = resultFromStep3.id;       // ID do documento criado

// Para cada chunk:
for (const chunk of chunks) {
  const embedding = await generateEmbedding(chunk);
  
  // INSERIR APENAS EM documents (NÃO em documents_details)
  await insertChunk({
    content: chunk,
    metadata: {
      usuario: userid,
      chatbot_name: chatbot,
      source: filename,           // Nome original
      document_id: documentId     // Referência ao documento
    },
    embedding: embedding
  });
}
```

### 5️⃣ Finalizar Processamento
```sql
-- Atualizar o MESMO registro criado no passo 3
UPDATE documents_details 
SET status = 'completed', updated_at = NOW()
WHERE id = '{{ documentId }}';
```

## Pontos Críticos para Correção

### ❌ O que NÃO fazer:
- Criar registro em `documents_details` para cada chunk
- Usar timestamps como filename
- Inserir chunks em `documents_details`

### ✅ O que fazer:
- Criar UM registro em `documents_details` no início
- Usar filename original do payload
- Inserir chunks apenas em `documents`
- Manter referência entre as tabelas

## Verificação Pós-Correção

### documents_details
```sql
SELECT COUNT(*) FROM documents_details WHERE chatbot_user = 'user-id';
-- Resultado esperado: 1 (por documento enviado)
```

### documents  
```sql
SELECT COUNT(*) FROM documents WHERE metadata->>'usuario' = 'user-id';
-- Resultado esperado: N (número de chunks gerados)
```

## Exemplo de Resultado Correto

Para 1 arquivo de 15KB:
- ✅ `documents_details`: **1 registro** (metadata do documento)
- ✅ `documents`: **151 registros** (chunks com embeddings)

---

**URGENTE**: Implementar essas correções no N8N para evitar criação de registros duplicados em `documents_details`.

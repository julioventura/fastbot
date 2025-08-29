# 🔧 Configuração N8N: Respond to Webhook

## ❌ Problemas na Configuração Atual

### 1. Headers Problemáticos

```json
// ❌ ERRADO - Dados nos headers HTTP
{
  "name": "content",
  "value": "={{ $('Insert Documents').item.json.pageContent }}"
}
```

### 2. Dados nos Headers

Você estava colocando conteúdo do documento nos headers HTTP, causando o erro "Invalid character in header content".

## ✅ Configuração Corrigida

### 1. Response Body (JSON)

```json
{
  "success": true,
  "document_id": $('Detalhes').item.json.id,
  "status": "completed",
  "chunks_processed": $('Insert Documents').item.json.vectorsInserted || 1,
  "message": "Documento processado com sucesso",
  "filename": $('Webhook').item.json.body.original_filename,
  "file_size": $('Webhook').item.json.body.filesize,
  "processing_time_ms": Date.now() - new Date($('Webhook').item.json.body.timestamp).getTime()
}
```

### 2. Headers Limpos

```json
[
  {
    "name": "Content-Type",
    "value": "application/json"
  },
  {
    "name": "Access-Control-Allow-Origin", 
    "value": "*"
  }
]
```

## 🔧 Mudanças Necessárias

### 1. **Adicionar Processamento Base64**

Você precisa adicionar um nó para processar o base64:

```javascript
// Novo nó "Process Base64" antes do Data Loader
const base64Data = $json.body.data;
const base64Content = base64Data.split(',')[1]; // Remove "data:type;base64,"
const buffer = Buffer.from(base64Content, 'base64');

return {
  binary: {
    data: {
      data: buffer,
      mimeType: $json.body.filetype,
      fileName: $json.body.original_filename
    }
  }
};
```

### 2. **Atualizar Data Loader**

Configure o Data Loader para usar dados binários do nó anterior.

### 3. **Verificar Conexões**

- Webhook → Process Base64 → Data Loader → Insert Documents → Limit → Detalhes → Respond to Webhook

## 📋 Passos para Implementar

1. **Remover headers desnecessários** do Respond to Webhook
2. **Manter apenas headers HTTP básicos** (Content-Type, CORS)
3. **Colocar todos os dados no responseBody** como JSON
4. **Adicionar processamento base64** para converter de volta para arquivo
5. **Testar** a resposta no frontend

## 🎯 Resultado Esperado

Depois dessas mudanças, o frontend receberá:

```json
{
  "success": true,
  "document_id": "uuid-gerado",
  "status": "completed",
  "chunks_processed": 15,
  "message": "Documento processado com sucesso"
}
```

E o erro "Invalid character in header content" será resolvido!

# 📝 Especificação das Respostas do Webhook N8N

## ✅ Resposta de Sucesso

```json
{
  "success": true,
  "document_id": "646df4dd-813f-4f50-908d-6f9be7bc65e4",
  "filename": "Manual_Termo_LGPD.txt",
  "status": "completed",
  "chunks_processed": 5,
  "processing_time_ms": 2340,
  "message": "Documento processado com sucesso",
  "timestamp": "2025-08-29T02:47:55.278Z"
}
```

## ❌ Resposta de Erro

```json
{
  "success": false,
  "document_id": "646df4dd-813f-4f50-908d-6f9be7bc65e4",
  "filename": "arquivo_problema.txt",
  "status": "error",
  "error": "Arquivo muito grande ou formato inválido",
  "error_code": "FILE_TOO_LARGE",
  "message": "Falha no processamento do documento",
  "timestamp": "2025-08-29T02:47:55.278Z"
}
```

## 📋 Campos Obrigatórios

### Para Sucesso:
- `success`: `true`
- `document_id`: ID do registro em `documents_details`
- `status`: `"completed"`

### Para Erro:
- `success`: `false`
- `status`: `"error"`
- `error`: Descrição do erro

## 📋 Campos Opcionais (mas recomendados):

- `filename`: Nome do arquivo
- `chunks_processed`: Número de chunks criados
- `processing_time_ms`: Tempo de processamento em ms
- `message`: Mensagem descritiva
- `error_code`: Código do erro (para casos de erro)
- `timestamp`: Data/hora do processamento

## 🔄 Fluxo N8N Recomendado:

1. **Receber arquivo**
   ```sql
   INSERT INTO documents_details (
     id, filename, chatbot_user, status, upload_date, file_size
   ) VALUES (
     '${uuid}', '${filename}', '${userid}', 'processing', NOW(), ${filesize}
   );
   ```

2. **Processar e criar chunks**
   ```sql
   INSERT INTO documents (content, metadata) VALUES ...
   ```

3. **Atualizar status**
   ```sql
   UPDATE documents_details 
   SET status = 'completed', summary = 'Processado via N8N'
   WHERE id = '${document_id}';
   ```

4. **Retornar resposta JSON estruturada**

## 🎯 Vantagens da Implementação:

- ✅ Status atualizado em tempo real
- ✅ Informações detalhadas de processamento
- ✅ Tratamento robusto de erros
- ✅ Interface mais responsiva
- ✅ Logs estruturados para debug

## ⚠️ Códigos de Erro Sugeridos:

- `FILE_TOO_LARGE`: Arquivo muito grande
- `INVALID_FORMAT`: Formato não suportado
- `PROCESSING_FAILED`: Falha no processamento
- `STORAGE_ERROR`: Erro ao salvar
- `EMBEDDING_ERROR`: Erro ao criar embeddings

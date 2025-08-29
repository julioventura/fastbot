# 🚨 Diagnóstico de Problemas - Webhook N8N

## Problema Identificado

O webhook N8N está retornando **HTTP 200** mas com **resposta vazia**, causando o erro:

```
N8N retornou resposta vazia (HTTP 200). Verifique se o webhook está configurado para retornar JSON.
```

## 🔍 Testes Realizados

### 1. Teste de Conectividade

```powershell
Invoke-WebRequest -Uri "https://marte.cirurgia.com.br/webhook/InserirRAG" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"test": "ping"}' -UseBasicParsing
```

**Resultado:**

- ✅ StatusCode: 200 OK
- ❌ Content: (vazio)
- ❌ RawContentLength: 0

### 2. Análise do Problema

O N8N está **aceitando** a requisição mas **não retornando** conteúdo JSON como esperado.

## 🛠️ Possíveis Causas

### 1. **Workflow N8N não configurado para retornar JSON**

- O workflow pode estar processando mas não retornando resposta
- Falta um nó "Respond to Webhook" no final

### 2. **Workflow N8N com erro interno**

- Processamento falha silenciosamente
- N8N retorna 200 mas sem corpo da resposta

### 3. **Configuração incorreta do webhook**

- Webhook pode estar em modo "Fire and Forget"
- Não está configurado para aguardar resposta

## ✅ Estrutura Esperada da Resposta N8N

O frontend espera esta estrutura JSON:

```json
{
  "success": true,
  "document_id": "uuid-gerado",
  "status": "completed", 
  "chunks_processed": 15,
  "message": "Documento processado com sucesso"
}
```

**OU em caso de erro:**

```json
{
  "success": false,
  "error": "Descrição específica do erro",
  "error_code": "CODIGO_ERRO"
}
```

## 🔧 Melhorias Implementadas no Frontend

### 1. Mensagem de Erro Mais Clara

```javascript
// ANTES
throw new Error('N8N retornou resposta vazia');

// DEPOIS  
throw new Error('N8N retornou resposta vazia (HTTP 200). Verifique se o webhook está configurado para retornar JSON.');
```

### 2. Debug Detalhado do FormData

```javascript
console.log('📋 FormData entries:');
for (const [key, value] of formData.entries()) {
  if (value instanceof File) {
    console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
  } else {
    console.log(`  ${key}: ${value}`);
  }
}
```

### 3. Logs Mais Informativos

- ✅ URL do webhook
- ✅ Parâmetros enviados
- ✅ Status HTTP completo
- ✅ Headers da resposta
- ✅ Corpo da resposta (mesmo se vazio)

## 🎯 Próximos Passos

### 1. **Verificar Workflow N8N**

- Garantir que há um nó "Respond to Webhook" no final
- Configurar resposta JSON com estrutura esperada

### 2. **Testar Workflow Manualmente**

- Executar o workflow no N8N com dados de teste
- Verificar se retorna JSON válido

### 3. **Logs do N8N**

- Verificar logs internos do N8N para erros
- Confirmar se o processamento está completo

### 4. **Configuração do Webhook**

- Verificar se está em modo "Wait for Response"
- Confirmar timeout adequado para processamento

## 🚨 Erro Atual no Frontend

```
N8N retornou resposta vazia (HTTP 200). Verifique se o webhook está configurado para retornar JSON.
```

**Causa:** Webhook aceita requisição mas não retorna JSON  
**Solução:** Corrigir configuração do workflow N8N para retornar resposta estruturada

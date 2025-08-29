# Remoção de Fallbacks - DocumentUpload.tsx

## 🎯 Objetivo

Remover TODOS os fallbacks e lógica de sucesso implícita do frontend para que erros reais do webhook sejam reportados ao usuário.

## ❌ Fallbacks Removidos

### 1. Parse JSON com Fallback

**ANTES:**

```javascript
try {
  if (responseText.trim()) {
    result = JSON.parse(responseText);
  } else {
    // FALLBACK: Se não há resposta, assumir sucesso
    result = { success: true };
  }
} catch (jsonError) {
  // FALLBACK: Se não conseguir fazer parse, assumir sucesso
  result = { success: true };
}
```

**DEPOIS:**

```javascript
try {
  if (!responseText.trim()) {
    throw new Error('N8N retornou resposta vazia');
  }
  result = JSON.parse(responseText);
} catch (jsonError) {
  throw new Error(`N8N retornou resposta inválida (não é JSON): "${responseText.substring(0, 100)}..."`);
}
```

### 2. Verificação de Sucesso Implícita

**ANTES:**

```javascript
const isSuccess = result?.success !== false; // Assumia sucesso por padrão
```

**DEPOIS:**

```javascript
if (result.success !== true) {
  const errorMessage = result?.error || result?.message || 'Erro desconhecido do N8N';
  throw new Error(`N8N reportou falha: ${errorMessage}`);
}
```

### 3. Fallback de Salvamento Local

**ANTES:**

```javascript
// FALLBACK: Tentar salvar documento diretamente no banco quando N8N falha
try {
  const { data: fallbackDoc, error: fallbackError } = await supabase
    .from("documents_details")
    .insert({...})
    .select('id')
    .single();
    
  if (!fallbackError && fallbackDoc) {
    fallbackSaved = true;
    toast({ title: "Upload realizado (modo fallback)" });
  }
} catch (fallbackError) {
  console.error('Fallback também falhou:', fallbackError);
}
```

**DEPOIS:**

```javascript
// SEM FALLBACK - Apenas mostra erro real
toast({
  variant: "destructive",
  title: "Erro no upload",
  description: `Não foi possível enviar o arquivo: ${error.message}`,
});
```

## ✅ Validações Adicionadas

### 1. Campos Obrigatórios

```javascript
if (!result.document_id) {
  throw new Error('N8N não retornou document_id na resposta');
}

if (!result.status) {
  throw new Error('N8N não retornou status na resposta');
}
```

### 2. Tipos Corretos

```javascript
status: result.status as "uploading" | "processing" | "completed" | "error",
```

## 🔧 Estrutura de Resposta Esperada do N8N

```json
{
  "success": true,
  "document_id": "uuid-gerado",
  "status": "completed",
  "chunks_processed": 15,
  "message": "Documento processado com sucesso",
  "processing_time_ms": 1234
}
```

**OU em caso de erro:**

```json
{
  "success": false,
  "error": "Erro específico do processamento",
  "error_code": "PROCESSING_FAILED"
}
```

## 🚨 Comportamento Atual

1. **HTTP 200 + success: true** → Sucesso
2. **HTTP 200 + success: false** → Erro (mostra error/message)
3. **HTTP 4xx/5xx** → Erro de rede
4. **Resposta vazia** → Erro ("N8N retornou resposta vazia")
5. **JSON inválido** → Erro (mostra primeiros 100 chars)
6. **Campos obrigatórios ausentes** → Erro específico

## 📋 Checklist de Validação

- [x] Parse JSON rigoroso (sem fallback)
- [x] Verificação de `success === true`
- [x] Validação de campos obrigatórios
- [x] Remoção de fallback de salvamento local
- [x] Erro específico para cada tipo de falha
- [x] Tipos TypeScript corretos
- [x] Remoção de variável `isSuccess` não declarada

## 🎉 Resultado

Agora o frontend reporta EXATAMENTE o erro que o N8N retorna, sem mascarar ou criar sucessos falsos.

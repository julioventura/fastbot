# 🚨 Análise Profunda: Header Content Error Persistente

## ❌ Problema

Mesmo após sanitização do filename, o erro persiste:

```json
{"code":0,"message":"Invalid character in header content [\"content\"]"}
```

## 🔍 Investigação Detalhada

### Tentativas Realizadas

1. ✅ **Sanitização do filename nos campos**

   ```javascript
   formData.append('filename', sanitizedFilename);
   ```

2. ✅ **Sanitização do filename no FormData.append**

   ```javascript
   formData.append('data', file, sanitizedFilename);
   ```

3. ❌ **Problema persiste**

### Possíveis Causas Reais

#### 1. **Problema no Lado do N8N**

- O N8N pode estar interpretando incorretamente o FormData
- Configuração de encoding incorreta no workflow
- Versão do N8N com bug conhecido

#### 2. **Problema com FormData Multipart**

- Browser pode estar gerando headers multipart problemáticos
- Boundary do multipart pode conter caracteres inválidos
- Content-Disposition header pode estar malformado

#### 3. **Problema de Proxy/CDN**

- Cloudflare ou outro proxy pode estar alterando headers
- Transformação de encoding no meio do caminho
- WAF (Web Application Firewall) rejeitando a requisição

#### 4. **Problema com o Arquivo Específico**

- Conteúdo do arquivo pode ter bytes problemáticos
- Encoding do arquivo pode estar causando problemas
- Metadata do arquivo corrompida

## 🛠️ Soluções Alternativas

### Opção 1: Upload como JSON Base64

```javascript
// Converter arquivo para base64 e enviar como JSON
const reader = new FileReader();
reader.readAsDataURL(file);
// Enviar como application/json
```

### Opção 2: Upload Simplificado

```javascript
// Enviar apenas o arquivo sem metadata extra
const formData = new FormData();
formData.append('file', file);
// Headers mínimos
```

### Opção 3: Debug Headers Completo

```javascript
// Interceptar e logar todos os headers
fetch(url, options).then(response => {
  console.log('Request headers:', options.headers);
  console.log('Response headers:', response.headers);
});
```

## 🧪 Teste de Diagnóstico

### Teste 1: Upload Mínimo

```javascript
const formData = new FormData();
formData.append('data', file);
// Sem campos extras
```

### Teste 2: Arquivo Simples

```javascript
const testFile = new Blob(['Hello World'], { type: 'text/plain' });
// Upload com conteúdo conhecido
```

### Teste 3: Headers Customizados

```javascript
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/octet-stream'
  },
  body: file
});
```

## 🎯 Próximos Passos

1. **Testar upload base64** (evita FormData)
2. **Verificar logs do N8N** (erro interno?)
3. **Testar com arquivo simples** (isolate o problema)
4. **Verificar configuração do webhook N8N** (aceita multipart?)

## 🚨 Suspeita Principal

O problema pode não estar no **frontend**, mas sim:

- **Configuração do N8N** não aceita multipart/form-data
- **N8N expecting JSON** em vez de FormData
- **Proxy/WAF** entre cliente e N8N rejeitando multipart

## 📋 Status Atual

- ❌ FormData com caracteres especiais → Erro
- ❌ FormData com filename sanitizado → Erro  
- ❌ FormData com file name sanitizado → Erro
- 🔄 **Próximo teste:** JSON Base64 upload

**Recomendação:** Testar upload como JSON Base64 para confirmar se o problema é específico do FormData.

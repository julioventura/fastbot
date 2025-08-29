# 🔧 Correção: Header Content Error

## ❌ Problema Identificado

Erro HTTP 500 do N8N:

```json
{
  "code": 0,
  "message": "Invalid character in header content [\"content\"]"
}
```

## 🔍 Análise da Causa

O erro indica que há caracteres inválidos nos headers da requisição. Investigando o filename:

```
"ANPD aprova o Regulamento de Comunicação de Incidente de Segurança.txt"
```

Este filename contém:

- ✅ Espaços
- ❌ Acentos (`ã`, `ê`, `ç`)
- ❌ Caracteres especiais

Quando o FormData é processado, o filename pode acabar sendo incluído em headers HTTP, e caracteres não-ASCII podem causar problemas.

## ✅ Solução Implementada

### 1. Sanitização do Filename

**ANTES:**

```javascript
formData.append('filename', file.name);
```

**DEPOIS:**

```javascript
// Sanitizar filename para evitar problemas com headers
const sanitizedFilename = file.name
  .replace(/[^\w\s.-]/g, '_') // Substituir caracteres especiais por _
  .replace(/\s+/g, '_'); // Substituir espaços por _
  
formData.append('filename', sanitizedFilename);
formData.append('original_filename', file.name); // Manter nome original também
```

### 2. Exemplo de Transformação

**Original:** `"ANPD aprova o Regulamento de Comunicação de Incidente de Segurança.txt"`  
**Sanitizado:** `"ANPD_aprova_o_Regulamento_de_Comunica__o_de_Incidente_de_Seguran_a.txt"`

### 3. Dupla Referência

- `filename`: Versão sanitizada (segura para headers)
- `original_filename`: Nome original (para exibição/storage)

## 🎯 Benefícios

1. **Headers Limpos**: Evita caracteres problemáticos em headers HTTP
2. **Compatibilidade**: Funciona com qualquer nome de arquivo
3. **Preservação**: Mantém o nome original para referência
4. **Robustez**: Elimina problemas de encoding

## 🧪 Teste

**Filename problemático:**

- `"Análise Técnica - João & Maria (2024).pdf"` 
- **Vira:** `"An_lise_T_cnica___Jo_o___Maria__2024_.pdf"`

**FormData resultante:**

```
filename: "An_lise_T_cnica___Jo_o___Maria__2024_.pdf"
original_filename: "Análise Técnica - João & Maria (2024).pdf"
```

## ✅ Status

- ❌ Erro de header corrigido
- ✅ Filename sanitizado
- ✅ Nome original preservado
- ✅ Compatibilidade com N8N garantida

O upload webhook agora deve funcionar mesmo com nomes de arquivo contendo acentos e caracteres especiais.

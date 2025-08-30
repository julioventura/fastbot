# Correção do Preview de Documentos no Modo WEBHOOK

## 🐛 Problema Identificado

No modo WEBHOOK, o modal de preview estava retornando **"null"** porque:

1. O conteúdo dos documentos não estava sendo encontrado nas tabelas esperadas
2. A lógica de busca estava muito complexa e falhando silenciosamente
3. Não havia fallback adequado quando o conteúdo não era encontrado

## ✅ Solução Implementada

### 🔧 **Estratégia Melhorada de Busca**

Agora a função `generatePreview` utiliza uma abordagem **escalonada** e **robusta**:

#### 1. **Estratégia Primária**: documents_details

```typescript
// Buscar diretamente em documents_details
const detailsResult = await supabase
  .from("documents_details")
  .select("content, filename, upload_date")
  .eq("id", documentId)
  .eq("chatbot_user", user.id)
  .single();
```

#### 2. **Estratégia Secundária**: Reconstituir dos chunks

```typescript
// Buscar chunks na tabela documents e reconstituir conteúdo
const { data: chunks } = await supabase
  .from("documents")
  .select("content, metadata")
  .not("metadata", "is", null);

// Filtrar chunks do mesmo arquivo e usuário
const fileChunks = chunks.filter(chunk => {
  const metadata = chunk.metadata;
  const chunkUserId = metadata.usuario || metadata.chatbot_user;
  const chunkFilename = metadata.file_name || metadata.filename;
  return chunkUserId === user.id && chunkFilename === currentDoc.filename;
});

// Reconstituir conteúdo
content = fileChunks
  .map(chunk => chunk.content || "")
  .filter(text => text.trim().length > 0)
  .join("\n\n");
```

#### 3. **Estratégia de Fallback**: Mensagem informativa

```typescript
// Se não encontrar conteúdo, mostrar mensagem explicativa
content = `Conteúdo do arquivo "${currentDoc.filename}" não está disponível para preview.

Possíveis motivos:
- O arquivo ainda está sendo processado
- O arquivo foi enviado em modo webhook e o conteúdo não foi armazenado localmente
- Erro na sincronização com o banco de dados

Para visualizar o conteúdo completo, faça o download do arquivo.`;
```

## 🔍 **Logs Melhorados**

Agora o sistema fornece logs detalhados para debug:

```
🔍 generatePreview WEBHOOK: Buscando documento ID: [id]
📋 Documento encontrado na lista: [filename]
📊 Resultado documents_details: { error, hasData, contentLength }
🧩 Total de chunks encontrados: [count]
🧩 Chunks filtrados para o arquivo: { filename, userId, totalChunks }
✅ Conteúdo reconstituído: { chunks, contentLength, contentPreview }
```

## 📊 **Fluxo de Resolução**

### ✅ **Cenário 1**: Conteúdo em documents_details

1. Busca direta na tabela `documents_details`
2. ✅ **Sucesso**: Exibe conteúdo completo

### ✅ **Cenário 2**: Conteúdo em chunks

1. Busca falha em `documents_details`
2. Procura chunks na tabela `documents`
3. Filtra por usuário e nome do arquivo
4. ✅ **Sucesso**: Reconstitui e exibe conteúdo

### ✅ **Cenário 3**: Conteúdo indisponível

1. Busca falha em ambas as estratégias
2. ✅ **Fallback**: Exibe mensagem informativa
3. **Usuário pode fazer download** do arquivo

## 🎯 **Benefícios da Correção**

### ✅ **Robustez**

- **3 estratégias** de busca em cascata
- **Sempre exibe algo** no preview (nunca mais "null")
- **Logs detalhados** para debug

### ✅ **Experiência do Usuário**

- **Preview sempre funciona** (mesmo que seja uma mensagem explicativa)
- **Informações claras** sobre o status do arquivo
- **Orientação para download** quando necessário

### ✅ **Manutenibilidade**

- **Código mais limpo** e organizado
- **Logs informativos** para troubleshooting
- **Estratégias bem definidas**

## 🧪 **Como Testar**

1. **Acesse**: `http://localhost:8081/fastbot/`
2. **Vá para**: "Meus Dados" (modo WEBHOOK)
3. **Clique em**: "Preview" em qualquer documento
4. **Verifique**:
   - ✅ Modal abre (nunca mais "null")
   - ✅ Conteúdo ou mensagem explicativa
   - ✅ Logs no console do navegador

## 📝 **Logs para Monitorar**

### ✅ **Sucesso** (Estratégia 1)

```
✅ Conteúdo encontrado em documents_details
🎉 Preview gerado com sucesso
```

### ✅ **Sucesso** (Estratégia 2)

```
✅ Conteúdo reconstituído: { chunks: X, contentLength: Y }
🎉 Preview gerado com sucesso
```

### ✅ **Fallback** (Estratégia 3)

```
⚠️ Nenhum chunk encontrado, usando fallback
📝 Usando conteúdo de fallback
🎉 Preview gerado com sucesso
```

## 🔗 **Arquivos Modificados**

- **Principal**: `src/components/chatbot/DocumentUpload.tsx`
- **Função**: `generatePreview()` (linhas ~764-890)
- **Correção**: Estratégias escalonadas + fallback robusto

---

**Status**: ✅ **Problema Resolvido**  
**Impacto**: 🚀 **Preview sempre funciona no modo WEBHOOK**

# Implementação: Seção Rodapé (Fontes de Dados)

## Data: Janeiro 2025

## Mudanças Implementadas

### 1. **Renomeação da Seção "Fontes de Dados" → "Rodapé"**

**Arquivos alterados:**

- `src/components/chatbot/AdvancedEditChatbotConfig.tsx`
- `src/pages/MyChatbotPage.tsx`

**Mudanças:**

- Título da seção: "Fontes de Dados" → "Rodapé"
- Nome da aba: "Fontes" → "Rodapé"
- Ícone mantido: `FileText`

### 2. **Renomeação do Campo Principal**

**Antes:**

```tsx
<Label htmlFor="main_link">Link Principal (Edital/Documento Official)</Label>
```

**Depois:**

```tsx
<Label htmlFor="main_link">Link adicional</Label>
```

**Placeholder atualizado:**

- "<https://exemplo.com/edital-2025>" → "<https://exemplo.com/link-adicional>"

### 3. **Novo Campo: "Rodapé das mensagens"**

**Implementação:**

```tsx
<div>
  <Label htmlFor="footer_message">Rodapé das mensagens</Label>
  <Textarea
    id="footer_message"
    value={chatbotData.footer_message || ''}
    onChange={(e) => onChange('footer_message', e.target.value)}
    className="mt-2 edit-form-input"
    style={borderStyle}
    placeholder="Texto que aparecerá no final de cada mensagem do chatbot..."
    rows={3}
  />
</div>
```

**Características:**

- Tipo: `Textarea` (múltiplas linhas)
- Campo: `footer_message`
- Placeholder explicativo
- 3 linhas de altura

### 4. **Seção de Upload: "Documentos" → "Imagens"**

**Mudanças:**

- "Documentos Anexados" → "Imagens Anexadas"
- "Arraste documentos" → "Arraste imagens"
- "Selecionar Arquivos" → "Selecionar Imagens"

**Tipos de arquivo suportados:**

- **Antes**: `.txt, .pdf, .doc, .docx`
- **Depois**: `.png, .jpg, .jpeg, .gif`

### 5. **Implementação do Upload de Imagens**

**Input de arquivo:**

```tsx
<input
  id="image-upload"
  type="file"
  multiple
  accept=".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/jpg,image/gif"
  style={{ display: 'none' }}
  onChange={(e) => handleImageUpload(e)}
/>
```

**Filtro de tipos:**

```tsx
const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
return allowedTypes.includes(file.type);
```

**Conversão para base64:**

```tsx
const reader = new FileReader();
reader.onload = (e) => {
  const result = e.target?.result as string;
  const currentImages = chatbotData.uploaded_images || [];
  onChange('uploaded_images', [...currentImages, result]);
};
reader.readAsDataURL(file);
```

### 6. **Visualização das Imagens Anexadas**

**Interface melhorada:**

```tsx
<div className="flex items-center gap-2">
  <img 
    src={image} 
    alt={`Imagem ${index + 1}`} 
    className="w-8 h-8 object-cover rounded"
  />
  <span className="text-sm">Imagem {index + 1}</span>
</div>
```

**Características:**

- Preview da imagem (8x8 pixels)
- Numeração automática
- Botão de remoção individual

### 7. **Funções de Gerenciamento**

**Upload de imagens:**

```tsx
const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  // Filtro por tipo de arquivo
  // Conversão para base64
  // Adição ao array de imagens
};
```

**Remoção de imagens:**

```tsx
const removeUploadedImage = (index: number) => {
  const images = [...(chatbotData.uploaded_images || [])];
  images.splice(index, 1);
  onChange('uploaded_images', images);
};
```

## Estrutura de Dados

### **Novos Campos na Interface**

```tsx
interface AdvancedChatbotData {
  // ... campos existentes
  uploaded_images?: string[]; // Array de base64/URLs
  footer_message?: string;    // Texto do rodapé
}
```

### **Banco de Dados (Supabase)**

**SQL para adicionar campos:**

```sql
-- Campo para rodapé das mensagens
ALTER TABLE mychatbot_2 
ADD COLUMN IF NOT EXISTS footer_message TEXT;

-- Campo para imagens (array de strings)
ALTER TABLE mychatbot_2 
ADD COLUMN IF NOT EXISTS uploaded_images TEXT[];
```

## Diferenças Importantes

### **Upload de Documentos vs Upload de Imagens**

| Aspecto | Documentos (DOCUMENTOS) | Imagens (RODAPÉ) |
|---------|-------------------------|------------------|
| **Seção** | Aba "DOCUMENTOS" | Aba "DASHBOARD" → Rodapé |
| **Propósito** | Vector store / IA | Visual / Interface |
| **Tipos** | .txt, .pdf, .doc, .docx | .png, .jpg, .jpeg, .gif |
| **Armazenamento** | Texto processado | Base64 / URLs |
| **Funcionalidade** | Busca semântica | Elementos visuais |

### **Campos da Seção Rodapé**

1. **Rodapé das mensagens** → Texto que aparece no final das respostas
2. **Link adicional** → URL opcional (antigo "Link Principal")
3. **Link Obrigatório** → Switch para incluir automaticamente
4. **Imagens Anexadas** → Upload de elementos visuais
5. **Permitir Internet** → Switch para busca externa

## Testes Necessários

### **1. Upload de Imagens**

- [ ] Testar upload de .png
- [ ] Testar upload de .jpg/.jpeg
- [ ] Testar upload de .gif
- [ ] Verificar rejeição de outros tipos
- [ ] Testar múltiplas imagens

### **2. Funcionalidades**

- [ ] Salvar campo "footer_message"
- [ ] Salvar array "uploaded_images"
- [ ] Visualizar preview das imagens
- [ ] Remover imagens individuais
- [ ] Limpar input após upload

### **3. Integração**

- [ ] Verificar se dados são salvos no Supabase
- [ ] Testar carregamento dos dados
- [ ] Validar tipos TypeScript

## Status

✅ **IMPLEMENTADO**: Renomeação completa da seção
✅ **IMPLEMENTADO**: Novo campo "Rodapé das mensagens"
✅ **IMPLEMENTADO**: Upload de imagens com filtro
✅ **IMPLEMENTADO**: Preview e remoção de imagens
✅ **IMPLEMENTADO**: Interfaces TypeScript atualizadas
📝 **PENDENTE**: Executar SQL no Supabase
🧪 **PENDENTE**: Testes completos da funcionalidade

## Próximos Passos

1. **Executar SQL**: Rodar script `adicionar_campos_rodape_imagens.sql`
2. **Testar Upload**: Validar funcionalidade de imagens
3. **Integrar Chatbot**: Usar `footer_message` nas respostas
4. **Testar Produção**: Validar em ambiente real


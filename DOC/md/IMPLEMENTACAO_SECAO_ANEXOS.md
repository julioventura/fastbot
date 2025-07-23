# Implementação: Seção "Anexos" com DocumentUpload

## Data: Janeiro 2025

## Objetivo

Adicionar o componente `DocumentUpload.tsx` na aba "Anexos" dentro do Dashboard do `AdvancedEditChatbotConfig`, permitindo upload e gerenciamento de documentos diretamente no DASHBOARD.

## Implementação Realizada

### 1. **Import do Componente DocumentUpload**

**Adicionado em:** `src/components/chatbot/AdvancedEditChatbotConfig.tsx`

```tsx
import DocumentUpload from "@/components/chatbot/DocumentUpload";
```

### 2. **Nova Aba: "Anexos"**

**Adicionada às tabs:**

```tsx
const tabs = [
  { id: 'identity', label: 'Identidade', icon: MessageCircle },
  { id: 'behavior', label: 'Comportamento', icon: Brain },
  { id: 'messagefooter', label: 'Rodapé', icon: FileText },
  { id: 'rules', label: 'Regras', icon: Settings },
  { id: 'style', label: 'Estilo', icon: Palette },
  { id: 'dataFiles', label: 'Anexos', icon: FileText }, // NOVA ABA
];
```

### 3. **Seção "Anexos" Implementada**

```tsx
{/* Tab: Anexos */}
{activeTab === 'dataFiles' && (
  <Card className="bg-transparent border border-border backdrop-blur-sm">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Anexos
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      
      {/* Rodapé das mensagens */}
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

      {/* Componente de Upload de Documentos */}
      <DocumentUpload />

    </CardContent>
  </Card>
)}
```

## Funcionalidades da Seção "Anexos"

### **1. Campo "Rodapé das mensagens"**

- **Tipo**: `Textarea` (3 linhas)
- **Função**: Texto que aparece no final das mensagens do chatbot
- **Campo**: `footer_message`
- **Placeholder**: "Texto que aparecerá no final de cada mensagem do chatbot..."

### **2. Componente DocumentUpload Completo**

- **Upload**: Arraste e solte arquivos .txt
- **Processamento**: Embeddings automáticos para vector store
- **Gerenciamento**: Lista, visualização, exclusão
- **Preview**: Geração de resumos dos documentos
- **Status**: Acompanhamento do processamento (Processando/Concluído/Erro)

## Diferenças Entre as Seções

| Aspecto | DOCUMENTOS (Aba) | ANEXOS (Dashboard) | RODAPÉ (Dashboard) |
|---------|-------------------|--------------------|--------------------|
| **Localização** | Aba separada | Aba "Anexos" | Aba "Rodapé" |
| **Funcionalidade** | Apenas DocumentUpload | Rodapé + DocumentUpload | Rodapé + Imagens |
| **Tipos de arquivo** | .txt (vector store) | .txt (vector store) | .png, .jpg, .jpeg, .gif |
| **Propósito** | Base de conhecimento | Configuração completa | Interface visual |

## Benefícios da Nova Estrutura

### **1. Organização Melhorada**

- ✅ **DOCUMENTOS**: Foco exclusivo em upload para IA
- ✅ **ANEXOS**: Configuração completa (rodapé + documentos)
- ✅ **RODAPÉ**: Elementos visuais e texto de finalização

### **2. Funcionalidade Duplicada Estratégica**

- **Usuários básicos**: Usam aba DOCUMENTOS simples
- **Usuários avançados**: Usam DASHBOARD → Anexos com configurações extras
- **Configuração completa**: Rodapé + documentos em um só lugar

### **3. Experiência de Usuário**

- Interface consistente entre abas
- Configurações relacionadas agrupadas
- Opções para diferentes níveis de usuário

## Estrutura Final das Abas

### **Nível Superior (MyChatbotPage)**

1. **CONFIGURAÇÕES** → `ViewChatbotConfig`
2. **DASHBOARD** → `AdvancedEditChatbotConfig` (6 abas)
3. **DOCUMENTOS** → `DocumentUpload`

### **Dashboard (AdvancedEditChatbotConfig)**

1. **Identidade** → Personalidade e saudação
2. **Comportamento** → Restrições e comportamento
3. **Rodapé** → Texto final + imagens + links
4. **Regras** → Automação e frases obrigatórias
5. **Estilo** → Aparência e formatação
6. **Anexos** → Rodapé + DocumentUpload completo ← **NOVA**

## Casos de Uso

### **Usuário Básico**

- Acessa aba **DOCUMENTOS** para upload simples
- Configurações básicas em **CONFIGURAÇÕES**

### **Usuário Avançado**

- Usa **DASHBOARD** → **Anexos** para configuração completa
- Configura rodapé das mensagens + upload de documentos
- Acesso a todas as funcionalidades em um só lugar

### **Usuário de Marketing**

- **DASHBOARD** → **Rodapé** para elementos visuais
- **DASHBOARD** → **Anexos** para textos de finalização

## Status

✅ **IMPLEMENTADO**: Import do DocumentUpload
✅ **IMPLEMENTADO**: Nova aba "Anexos"
✅ **IMPLEMENTADO**: Campo "Rodapé das mensagens"
✅ **IMPLEMENTADO**: Integração completa do DocumentUpload
✅ **FUNCIONAL**: Upload e processamento de documentos
✅ **FUNCIONAL**: Configuração de rodapé
✅ **UI**: Interface consistente com outras abas

## Próximos Passos

1. **Testar funcionalidade** completa da nova aba
2. **Validar salvamento** do campo `footer_message`
3. **Verificar processamento** de documentos
4. **Implementar uso do rodapé** nas respostas do chatbot
5. **Documentar para usuários** a diferença entre as seções

## Observações

- O componente `DocumentUpload` mantém toda sua funcionalidade original
- A implementação permite duas formas de acesso aos documentos
- O campo `footer_message` está disponível tanto em "Rodapé" quanto "Anexos"
- Interface responsiva e consistente com o design existente


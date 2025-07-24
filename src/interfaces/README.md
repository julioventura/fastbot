# Interfaces do Chatbot

Este diretório contém as definições de interfaces TypeScript para o sistema de chatbot.

## Estrutura

### `chatbot.ts`

Define as interfaces principais para configuração de chatbots:

- **`BaseChatbotData`**: Interface base com campos essenciais
- **`ChatbotData`**: Interface completa com todos os campos avançados
- **`ChatbotConfigProps`**: Props para componentes de configuração
- **`FallbackAction`**: Tipo para ações de fallback
- **`ListStyle`**: Tipo para estilos de lista

## Uso

```typescript
import { ChatbotData, BaseChatbotData } from '@/interfaces';

// Para componentes que precisam de todos os campos
const MyComponent: React.FC<{ data: ChatbotData }> = ({ data }) => {
  // ...
};

// Para hooks ou componentes que usam apenas campos básicos
const MyHook = (): BaseChatbotData => {
  // ...
};
```

## Hierarquia

```
BaseChatbotData (campos essenciais)
    ↓ extends
ChatbotData (todos os campos)
```

## Arquivos que usam essas interfaces

- `src/pages/MyChatbotPage.tsx` (ChatbotData)
- `src/components/chatbot/AdvancedEditChatbotConfig.tsx` (ChatbotData)
- `src/components/chatbot/EditChatbotConfig.tsx` (BaseChatbotData)
- `src/components/chatbot/ViewChatbotConfig.tsx` (BaseChatbotData)
- `src/hooks/useChatbot.ts` (BaseChatbotData)

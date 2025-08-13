# 🧠 Integração Simples - Short Memory no MyChatbot

## 🎯 Como Adicionar Memória ao Seu Chatbot Atual

### 1️⃣ **Executar SQL no Supabase**

```sql
-- Copie e execute este comando no SQL Editor do Supabase:
CREATE TABLE IF NOT EXISTS conversation_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_activity timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT unique_user_session UNIQUE (user_id, session_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_session_id ON conversation_history(session_id);

-- RLS (Row Level Security)
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations" ON conversation_history
  USING (auth.uid() = user_id);
```

### 2️⃣ **Modificar seu MyChatbot.tsx**

No seu arquivo `src/components/chatbot/MyChatbot.tsx`, adicione estas modificações:

#### **A. Adicionar imports:**

```tsx
// Adicione esta linha no topo do arquivo, junto com os outros imports:
import { supabase } from '@/integrations/supabase/client';
```

#### **B. Adicionar estados para memória:**

```tsx
// Adicione estes estados junto com os outros estados do componente:
const [currentSession, setCurrentSession] = useState<string | null>(null);
const [conversationHistory, setConversationHistory] = useState<any[]>([]);

// Função para gerar sessionId único
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
```

#### **C. Função para salvar mensagem na memória:**

```tsx
// Adicione esta função no seu componente:
const saveToMemory = async (role: 'user' | 'assistant', content: string) => {
  if (!user?.id || !currentSession) return;
  
  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    timestamp: new Date().toISOString()
  };

  // Atualizar estado local
  const updatedHistory = [...conversationHistory, newMessage];
  setConversationHistory(updatedHistory);

  // Manter apenas últimas 5 mensagens
  const recentMessages = updatedHistory.slice(-5);

  try {
    // Salvar no Supabase
    await supabase
      .from('conversation_history')
      .upsert({
        user_id: user.id,
        session_id: currentSession,
        messages: recentMessages,
        last_activity: new Date().toISOString()
      });
      
    console.log('💾 Mensagem salva na memória:', role, content.substring(0, 50) + '...');
  } catch (error) {
    console.warn('❌ Erro ao salvar na memória:', error);
  }
};
```

#### **D. Função para obter contexto:**

```tsx
// Adicione esta função para formatar o contexto:
const getConversationContext = (): string => {
  if (conversationHistory.length === 0) return '';

  const recentMessages = conversationHistory.slice(-5);
  const contextLines = recentMessages.map(msg => 
    `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`
  );

  return `Histórico da conversa recente:\n${contextLines.join('\n')}\n\n`;
};
```

#### **E. Modificar a função sendToWebhook:**

```tsx
// Na sua função sendToWebhook existente, modifique o payload para incluir:
const payload = {
  message: userMessage,
  page: location.pathname,
  pageContext: getPageContext(),
  timestamp: new Date().toISOString(),
  sessionId: currentSession,  // 🧠 NOVO
  userId: user?.id,
  userEmail: user?.email,
  systemMessage: chatbotConfig?.system_message || '',
  
  // 🧠 NOVO: Contexto de memória
  conversationContext: chatbotConfig?.remember_context ? getConversationContext() : '',
  memoryEnabled: chatbotConfig?.remember_context || false,
  
  chatbotConfig: chatbotConfig ? {
    chatbot_name: chatbotConfig.chatbot_name,
    welcome_message: chatbotConfig.welcome_message,
    office_address: chatbotConfig.office_address,
    office_hours: chatbotConfig.office_hours,
    specialties: chatbotConfig.specialties,
    whatsapp: chatbotConfig.whatsapp,
    remember_context: chatbotConfig.remember_context,
    system_message: chatbotConfig.system_message
  } : null
};

// Logo após obter a resposta do bot, adicione:
const botResponse = data.response || data.message || 'Desculpe, não consegui processar sua mensagem.';

// 🧠 SALVAR NA MEMÓRIA se habilitado
if (chatbotConfig?.remember_context && currentSession) {
  await saveToMemory('user', userMessage);
  await saveToMemory('assistant', botResponse);
}
```

#### **F. Inicializar sessão:**

```tsx
// Modifique o useEffect que busca a configuração para também inicializar a sessão:
useEffect(() => {
  if (user && chatState === 'normal') {
    fetchChatbotConfig();
    
    // Inicializar sessão se não existir
    if (!currentSession) {
      const newSession = generateSessionId();
      setCurrentSession(newSession);
      console.log('🆕 Nova sessão iniciada:', newSession);
    }
  }
}, [user, chatState, fetchChatbotConfig, currentSession]);
```

### 3️⃣ **Verificar se está funcionando**

#### **No console do navegador, você deve ver:**

```
🆕 Nova sessão iniciada: session_1734567890_abc123
💾 Mensagem salva na memória: user Olá, como funciona...
💾 Mensagem salva na memória: assistant Olá! Como posso ajudar...
```

#### **No seu webhook N8N, você receberá:**

```json
{
  "conversationContext": "Histórico da conversa recente:\nUsuário: Olá, como funciona?\nAssistente: Olá! Como posso ajudar?",
  "memoryEnabled": true,
  "sessionId": "session_1734567890_abc123"
}
```

### 4️⃣ **Configurar no Painel do Usuário**

Seu usuário já pode habilitar/desabilitar a memória através do campo `remember_context` na configuração do chatbot!

### 🎉 **Pronto!**

Com essas modificações simples, seu chatbot terá:

- ✅ Memória das últimas 5 mensagens
- ✅ Contexto enviado para N8N
- ✅ Controle via campo `remember_context`
- ✅ Dados salvos no Supabase
- ✅ Performance otimizada

**Total de linhas adicionadas:** ~50 linhas
**Complexidade:** Baixa
**Impacto:** Alto (chatbot muito mais inteligente!)

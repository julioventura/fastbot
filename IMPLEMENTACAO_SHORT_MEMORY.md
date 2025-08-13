# 🧠 Implementação de Short-Memory para Chatbot

## 📋 Resumo das Opções

Baseado na análise do seu projeto FastBot, você tem **3 opções principais** para implementar short-memory com as últimas 5 mensagens:

## 🏆 **OPÇÃO RECOMENDADA: Sistema Híbrido (Redis + Supabase)**

### **Arquitetura:**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │      Redis      │    │    Supabase     │
│   (React)       │────│   (Cache Ativo) │────│   (Backup)      │
│                 │    │   TTL: 30min    │    │  (Persistente)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Vantagens:**

- ⚡ **Performance**: Redis para acesso ultra-rápido
- 🗄️ **Persistência**: Supabase como backup confiável
- 🔄 **TTL automático**: Cache expira automaticamente
- 📊 **Escalabilidade**: Suporta milhares de usuários simultâneos

---

## 🛠️ **Implementação Prática**

### **1. Arquivos Criados:**

✅ `src/hooks/useConversationMemory.ts` - Hook principal
✅ `src/api/redis-conversation.ts` - API Redis (simulação)
✅ `supabase/create_conversation_history.sql` - Tabela Supabase
✅ `src/components/chatbot/MyChatbotWithMemory.tsx` - Exemplo de uso

### **2. Passos para Implementar:**

#### **A. Configurar Tabela no Supabase:**

```sql
-- Execute o arquivo: supabase/create_conversation_history.sql
psql -f supabase/create_conversation_history.sql
```

#### **B. Configurar Redis no seu VPS:**

```bash
# Instalar Redis
sudo apt update
sudo apt install redis-server

# Configurar Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Testar
redis-cli ping  # Deve retornar "PONG"
```

#### **C. Atualizar seu Chatbot existente:**

```tsx
// No seu MyChatbot.tsx atual, adicionar:
import { useConversationMemory } from '@/hooks/useConversationMemory';

// Dentro do componente:
const {
  addMessage,
  getContextForChatbot,
  currentSession
} = useConversationMemory({
  maxMessages: 5,
  ttlMinutes: 30
});

// No payload para N8N, adicionar:
const payload = {
  // ... seus campos existentes ...
  conversationContext: getContextForChatbot(), // 🧠 NOVO
  sessionId: currentSession                     // 🧠 NOVO
};

// Após resposta do webhook:
await addMessage('user', userMessage);
await addMessage('assistant', botResponse);
```

---

## 📊 **Configuração no Campo `remember_context`**

Seu projeto já tem o campo `remember_context` na tabela `mychatbot`. Basta usar:

```tsx
// Verificar se memória está habilitada
const useMemory = chatbotConfig?.remember_context ?? false;

if (useMemory) {
  // Aplicar contexto da memória
  conversationContext = getContextForChatbot();
}
```

---

## 🚀 **Benefícios Imediatos**

### **Para o Usuário:**

- 🔄 **Continuidade**: Chatbot "lembra" da conversa
- 🎯 **Contexto**: Respostas mais relevantes
- ⚡ **Velocidade**: Cache Redis = respostas instantâneas

### **Para Você (Desenvolvedor):**

- 📈 **Escalabilidade**: Redis suporta milhares de sessões
- 💾 **Backup**: Supabase garante que nada se perde
- 🛠️ **Flexibilidade**: TTL configurável (30min padrão)
- 📊 **Analytics**: Dados de conversa para análise

### **Para seu N8N:**

- 🧠 **Contexto Rico**: Recebe histórico formatado
- 🔍 **Menos Consultas**: Não precisa buscar histórico
- ⚡ **Performance**: Payload já contém tudo necessário

---

## 📝 **Payload Expandido para N8N**

O webhook N8N receberá:

```json
{
  "message": "Como funciona o tratamento?",
  "conversationContext": "Histórico da conversa recente:\nUsuário: Olá, preciso de ajuda\nAssistente: Olá! Como posso ajudar?\nUsuário: Quero saber sobre implantes\nAssistente: Temos especialistas em implantologia...",
  "memoryEnabled": true,
  "sessionId": "session_1734567890_abc123",
  "conversationStats": {
    "messageCount": 4,
    "userMessages": 2,
    "assistantMessages": 2
  }
}
```

---

## ⚙️ **Configurações Flexíveis**

```tsx
const {
  // Configurações
  maxMessages: 5,        // Últimas N mensagens
  ttlMinutes: 30,        // Cache por X minutos
  enableRedis: true,     // Usar Redis
  enableSupabase: true   // Backup Supabase
} = useConversationMemory({
  maxMessages: 5,    // 📝 Altere aqui para mais/menos mensagens
  ttlMinutes: 60,    // ⏰ Altere aqui para TTL diferente
  enableRedis: true, // 🔴 false = só Supabase
  enableSupabase: true // 🔴 false = só Redis (volátil)
});
```

---

## 🎯 **Próximos Passos**

1. **Execute o SQL** no Supabase para criar a tabela
2. **Configure Redis** no seu VPS
3. **Implemente o hook** no seu MyChatbot.tsx existente
4. **Teste** com um usuário e verifique os logs
5. **Ajuste TTL** e maxMessages conforme necessário

---

## 🔍 **Alternativas Mais Simples**

### **Opção 2: Só Supabase** (Mais simples)

- ✅ Mais fácil de implementar
- ✅ Dados sempre persistentes
- ❌ Mais lento que Redis
- ❌ Mais consultas no DB

### **Opção 3: Só Redis** (Mais rápido, mas volátil)

- ✅ Ultra-rápido
- ✅ Menos complexidade
- ❌ Dados se perdem se Redis reiniciar
- ❌ Não tem backup

---

## 📞 **Suporte**

Se precisar de ajuda na implementação:

1. **Teste primeiro** com dados mock
2. **Verifique logs** no console do navegador  
3. **Monitore** performance do Redis
4. **Ajuste configurações** conforme uso real

A **Opção Híbrida** é a mais robusta e recomendada para produção! 🚀

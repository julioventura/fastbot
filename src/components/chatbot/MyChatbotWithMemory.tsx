/**
 * Integração do useConversationMemory com o componente MyChatbot
 * Exemplo de como implementar a short-memory no chatbot existente
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Maximize2, Minimize2, X, Send, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth/useAuth';
import { useVectorStore } from '@/hooks/useVectorStore';
import { useConversationMemory } from '@/hooks/useConversationMemory';
import { generateSystemMessage } from '@/lib/chatbot-utils';
import { supabase } from '@/integrations/supabase/client';

type ChatState = 'minimized' | 'normal' | 'maximized';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  isLoading?: boolean;
}

interface ChatbotConfig {
  system_instructions: string;
  system_message: string;
  office_address: string;
  office_hours: string;
  specialties: string;
  chatbot_name: string;
  welcome_message: string;
  whatsapp: string;
  remember_context?: boolean; // Campo que controla se deve usar memória
}

const MyChatbotWithMemory = () => {
  // Estados principais do componente
  const [chatState, setChatState] = useState<ChatState>('minimized');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(null);

  // Controle de estilo visual
  const [isElevated] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { user } = useAuth();

  // Hooks
  const { getChatbotContext } = useVectorStore();

  // 🧠 Hook de memória de conversação
  const {
    conversationHistory,
    currentSession,
    addMessage,
    getContextForChatbot,
    getConversationStats,
    initializeSession,
    clearSession
  } = useConversationMemory({
    maxMessages: 5,        // Últimas 5 mensagens
    ttlMinutes: 30,        // Cache por 30 minutos
    enableRedis: true,     // Usar Redis
    enableSupabase: true   // Backup no Supabase
  });

  // Constantes de estilo
  const chatbotBgColor = '#1a1b3a';
  const chatbotTextColor = '#e0e0e0';
  const chatbotShadowLight = 'rgba(147, 51, 234, 0.3)';
  const chatbotShadowDark = 'rgba(0, 0, 0, 0.7)';

  /**
   * Buscar configurações do chatbot do usuário
   */
  const fetchChatbotConfig = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('mychatbot')
        .select('*')
        .eq('chatbot_user', user.id);

      if (error) {
        console.error('Erro ao buscar configuração do chatbot:', error);
        return;
      }

      if (data && data.length > 0) {
        setChatbotConfig(data[0]);
        console.log('🤖 [MyChatbot] Configuração carregada, remember_context:', data[0].remember_context);
      }
    } catch (error) {
      console.error('Erro ao buscar configuração do chatbot:', error);
    }
  }, [user?.id]);

  /**
   * Obter contexto da página atual
   */
  const getPageContext = useCallback((): string => {
    const path = location.pathname;
    const contextMap: Record<string, string> = {
      '/': 'página inicial do FastBot',
      '/my-chatbot': 'página Meu Chatbot do FastBot',
      '/pricing': 'página de preços do FastBot',
      '/features': 'página de recursos do FastBot',
      '/contact': 'página de contato do FastBot'
    };
    return contextMap[path] || `página ${path} do FastBot`;
  }, [location.pathname]);

  /**
   * Resposta local de fallback (quando webhook falha)
   */
  const getBotResponseLocal = useCallback(async (userMessage: string): Promise<string> => {
    const botName = chatbotConfig?.chatbot_name || 'FastBot';

    // Usar dados personalizados se disponível
    if (chatbotConfig) {
      if (chatbotConfig.office_hours && userMessage.toLowerCase().includes('horário')) {
        return `Nosso horário de funcionamento é: ${chatbotConfig.office_hours}`;
      }
      if (chatbotConfig.office_address && userMessage.toLowerCase().includes('endereço')) {
        return `Nosso endereço é: ${chatbotConfig.office_address}`;
      }
      if (chatbotConfig.specialties && userMessage.toLowerCase().includes('especialidade')) {
        return `Nossas especialidades são: ${chatbotConfig.specialties}`;
      }
    }

    const currentPageContext = getPageContext();
    return `Olá! Sou o ${botName}. Como posso ajudá-lo? Você está na ${currentPageContext}.`;
  }, [chatbotConfig, getPageContext]);

  /**
   * Enviar mensagem para webhook N8N com contexto de memória
   */
  const sendToWebhook = useCallback(async (userMessage: string): Promise<string> => {
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL ||
      'https://n8n.cirurgia.com.br/webhook/fastbot-webhook';

    try {
      // 🧠 Obter contexto da memória se habilitado
      let conversationContext = '';
      const useMemory = chatbotConfig?.remember_context ?? false;

      if (useMemory && conversationHistory.length > 0) {
        conversationContext = getContextForChatbot();
        console.log('🧠 [MyChatbot] Usando contexto da memória:', conversationContext.substring(0, 100) + '...');
      }

      // Payload expandido com contexto de memória
      const payload = {
        message: userMessage,
        page: location.pathname,
        pageContext: getPageContext(),
        timestamp: new Date().toISOString(),
        sessionId: currentSession,
        userId: user?.id,
        userEmail: user?.email,
        systemMessage: chatbotConfig ? generateSystemMessage(chatbotConfig) : '',

        // 🧠 Novo: Contexto de memória
        conversationContext: useMemory ? conversationContext : '',
        memoryEnabled: useMemory,
        conversationStats: useMemory ? getConversationStats() : null,

        chatbotConfig: chatbotConfig ? {
          chatbot_name: chatbotConfig.chatbot_name,
          welcome_message: chatbotConfig.welcome_message,
          office_address: chatbotConfig.office_address,
          office_hours: chatbotConfig.office_hours,
          specialties: chatbotConfig.specialties,
          whatsapp: chatbotConfig.whatsapp,
          remember_context: chatbotConfig.remember_context,
          system_message: generateSystemMessage(chatbotConfig)
        } : null
      };

      console.log('🚀 [MyChatbot] Enviando para N8N com memória:', {
        messageLength: userMessage.length,
        hasContext: conversationContext.length > 0,
        memoryEnabled: useMemory,
        sessionId: currentSession
      });

      const response = await fetch(String(webhookUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const botResponse = data.response || data.message || 'Desculpe, não consegui processar sua mensagem.';

      // 🧠 Salvar mensagens na memória se habilitado
      if (useMemory && currentSession) {
        await addMessage('user', userMessage, {
          page: location.pathname,
          sessionId: currentSession,
          userId: user?.id
        });

        await addMessage('assistant', botResponse, {
          page: location.pathname,
          sessionId: currentSession,
          userId: user?.id
        });

        console.log('🧠 [MyChatbot] Mensagens salvas na memória');
      }

      return botResponse;

    } catch (error) {
      console.error('❌ [MyChatbot] Erro ao enviar para webhook:', error);
      return await getBotResponseLocal(userMessage);
    }
  }, [
    chatbotConfig,
    conversationHistory,
    getContextForChatbot,
    currentSession,
    user,
    location.pathname,
    addMessage,
    getConversationStats,
    getBotResponseLocal,
    getPageContext
  ]);

  /**
   * Processar envio de mensagem
   */
  const handleSendMessage = async (): Promise<void> => {
    if (inputValue.trim() === '') return;

    const userMessage = inputValue.trim();

    // Adicionar mensagem do usuário
    const newMessage: Message = { id: Date.now(), text: userMessage, sender: 'user' };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');

    // Adicionar indicador de loading
    const loadingMessage: Message = {
      id: Date.now() + 1,
      text: 'Digitando...',
      sender: 'bot',
      isLoading: true
    };
    setMessages((prev) => [...prev, loadingMessage]);

    // Obter resposta do bot
    const botResponse = await sendToWebhook(userMessage);

    // Substituir loading pela resposta real
    setMessages((prev) => {
      const withoutLoading = prev.filter(msg => !msg.isLoading);
      return [...withoutLoading, { id: Date.now() + 2, text: botResponse, sender: 'bot' }];
    });
  };

  /**
   * Scroll automático
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * Alternar estado do chat
   */
  const toggleChatState = (newState: ChatState) => {
    setChatState(newState);

    // Inicializar sessão quando chat é aberto
    if (newState === 'normal' && !currentSession) {
      initializeSession();
    }
  };

  /**
   * Limpar conversa e reiniciar sessão
   */
  const handleClearConversation = useCallback(async () => {
    setMessages([]);
    await clearSession();
    initializeSession();
    console.log('🧹 [MyChatbot] Conversa limpa e sessão reiniciada');
  }, [clearSession, initializeSession]);

  // Effects
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (user && chatState === 'normal') {
      fetchChatbotConfig();
    }
  }, [user, chatState, fetchChatbotConfig]);

  // Render do componente
  if (chatState === 'minimized') {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          cursor: 'pointer'
        }}
        onClick={() => toggleChatState('normal')}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: chatbotBgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isElevated
              ? `0 8px 25px ${chatbotShadowLight}, 0 0 0 1px rgba(255,255,255,0.1) inset`
              : `0 2px 10px ${chatbotShadowDark}`,
            transition: 'all 0.3s ease',
          }}
        >
          <Bot size={24} color={chatbotTextColor} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: chatState === 'maximized' ? '80vw' : '400px',
        height: chatState === 'maximized' ? '80vh' : '500px',
        backgroundColor: chatbotBgColor,
        borderRadius: '15px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        boxShadow: isElevated
          ? `0 20px 60px ${chatbotShadowLight}, 0 0 0 1px rgba(255,255,255,0.1) inset`
          : `0 10px 30px ${chatbotShadowDark}`,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header com controles */}
      <div style={{
        padding: '15px 20px',
        borderBottom: `1px solid rgba(255,255,255,0.1)`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bot size={20} color={chatbotTextColor} />
          <span style={{ color: chatbotTextColor, fontWeight: 'bold', fontSize: '14px' }}>
            {chatbotConfig?.chatbot_name || 'FastBot'}
          </span>
          {/* 🧠 Indicador de memória */}
          {chatbotConfig?.remember_context && (
            <span style={{
              fontSize: '10px',
              color: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              🧠 Memória Ativa
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '5px' }}>
          {/* Botão para limpar conversa */}
          {conversationHistory.length > 0 && (
            <button
              onClick={handleClearConversation}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '5px',
                fontSize: '12px',
                color: chatbotTextColor,
                opacity: 0.7
              }}
              title="Limpar conversa"
            >
              🧹
            </button>
          )}

          {chatState === 'normal' && (
            <button
              onClick={() => toggleChatState('maximized')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
            >
              <Maximize2 size={18} color={chatbotTextColor} />
            </button>
          )}

          {chatState === 'maximized' && (
            <button
              onClick={() => toggleChatState('normal')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
            >
              <Minimize2 size={18} color={chatbotTextColor} />
            </button>
          )}

          <button
            onClick={() => toggleChatState('minimized')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
          >
            <X size={20} color={chatbotTextColor} />
          </button>
        </div>
      </div>

      {/* Área de mensagens */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', background: chatbotBgColor }}>
        {/* Mostrar estatísticas da conversa (debug) */}
        {chatbotConfig?.remember_context && conversationHistory.length > 0 && (
          <div style={{
            fontSize: '10px',
            color: '#6b7280',
            marginBottom: '10px',
            padding: '5px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '4px'
          }}>
            📊 Sessão: {currentSession?.substring(0, 8)}... |
            Mensagens na memória: {conversationHistory.length} |
            Stats: {JSON.stringify(getConversationStats(), null, 0)}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: '15px',
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                padding: '10px 15px',
                borderRadius: '15px',
                backgroundColor: msg.sender === 'user' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                color: chatbotTextColor,
                fontSize: '14px',
                lineHeight: '1.4',
                wordWrap: 'break-word',
                opacity: msg.isLoading ? 0.7 : 1,
              }}
            >
              {msg.isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>Digitando</span>
                  <div style={{
                    display: 'flex',
                    gap: '2px',
                    animation: 'pulse 1.5s infinite'
                  }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: chatbotTextColor }}></div>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: chatbotTextColor }}></div>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: chatbotTextColor }}></div>
                  </div>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Campo de entrada */}
      <div style={{
        padding: '15px 20px',
        borderTop: `1px solid rgba(255,255,255,0.1)`,
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Digite sua mensagem..."
          style={{
            flex: 1,
            padding: '10px 15px',
            borderRadius: '25px',
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: chatbotTextColor,
            fontSize: '14px',
            outline: 'none'
          }}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || inputValue.trim() === ''}
          style={{
            padding: '10px 15px',
            borderRadius: '25px',
            border: 'none',
            backgroundColor: '#3b82f6',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (isLoading || inputValue.trim() === '') ? 0.5 : 1
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default MyChatbotWithMemory;

/**
 * ==================================
 * MyChatbot
 * ==================================
 * 
 * Componente de chatbot interativo para o FastBot com assistência contextual baseada na arquitetura modular.
 * Suporta múltiplos estados de visualização (minimizado, normal, maximizado) e
 * estilos visuais (alto-relevo ou baixo-relevo). Integra-se com webhook externo
 * para processamento de mensagens, com fallback para respostas locais.
 * 
 * Estados:
 * - chatState: Estado de visualização (minimizado, normal, maximizado)
 * - messages: Histórico de mensagens
 * - inputValue: Controle do campo de entrada
 * - isLoading: Indicador de carregamento de resposta
 * - isElevated: Controle de estilo visual (true=alto-relevo, false=baixo-relevo)
 * 
 * Funções:
 * - getPageContext: Determina contexto da página atual
 * - getInitialMessage: Cria mensagem de boas-vindas contextualizada
 * - sendToWebhook: Envia mensagens para webhook N8N externo
 * - getBotResponseLocal: Gera respostas locais quando webhook falha
 * - scrollToBottom: Auto-scroll para novas mensagens
 * - handleSendMessage: Lógica de processamento de mensagens
 * - toggleChatState: Alterna entre estados de visualização
 * - getChatbotStyle: Gera estilos CSS baseados no estado atual
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Maximize2, Minimize2, X, Send, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth/useAuth';
import { useVectorStore } from '@/hooks/useVectorStore';
import { useConversationMemory } from '@/hooks/useConversationMemory';
import { useShortMemory } from '@/hooks/useShortMemory';
import { supabase } from '@/integrations/supabase/client';
import { loggers } from '@/lib/utils/logger';
import { fetchWithRetry } from '@/lib/utils/retry';

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
  remember_context?: boolean; // 🧠 Campo que controla a memória

  // Configurações de personalidade com valores padrão
  formality_level?: number; // 0-100, padrão: 50
  use_emojis?: boolean; // padrão: false
  paragraph_size?: number; // 0-100, padrão: 20

  // Configurações de comportamento com valores padrão
  source_strictness?: number; // 0-100, padrão: 90
  confidence_threshold?: number; // 0-100, padrão: 80
  fallback_action?: string; // padrão: "human"
  list_style?: string; // padrão: "bullets"
  allow_internet_search?: boolean; // padrão: false

  // Configurações de rodapé com valores padrão
  mandatory_link?: boolean; // padrão: false

  // Configurações de estilo e interação com valores padrão
  response_speed?: number; // 1-100, padrão: 50
  name_usage_frequency?: number; // 1-100, padrão: 30
  ask_for_name?: boolean; // padrão: true

  // Novos campos obrigatórios para configuração avançada
  personality?: string; // padrão: "Profissional, empático e prestativo"
  behavior?: string; // padrão: "Sempre busque entender a necessidade específica do usuário antes de responder. Seja claro e direto, mas mantenha um tom acolhedor"
  style?: string; // padrão: "Comunicação clara e objetiva, evitando jargões técnicos desnecessários"
  interaction?: string; // padrão: "Faça uma pergunta por vez quando precisar de esclarecimentos. Use emojis moderadamente para humanizar a conversa"
  footer?: string; // padrão: "Posso ajudar com mais alguma coisa? 😊"
}

const MyChatbot = () => {
  // Logger centralizado para este componente
  const logger = loggers.chatbot;

  // Estados principais do componente
  const [chatState, setChatState] = useState<ChatState>('minimized');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(null);
  const [initialMessageAdded, setInitialMessageAdded] = useState(false); // Controle para evitar duplicação da mensagem inicial

  // Estados para controle de drag vertical
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [hasDraggedDistance, setHasDraggedDistance] = useState(false);
  const [chatbotVerticalOffset, setChatbotVerticalOffset] = useState(0); // offset em pixels do bottom padrão

  // Estados para controle de drag horizontal (redimensionamento de largura)
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [chatbotWidth, setChatbotWidth] = useState(450); // largura inicial em pixels

  // Estados para controle de movimento lateral (pelo header)
  const [isMovingLaterally, setIsMovingLaterally] = useState(false);
  const [moveStartX, setMoveStartX] = useState(0);
  const [chatbotHorizontalOffset, setChatbotHorizontalOffset] = useState(0); // offset em pixels da posição right padrão

  // Estado para controle da animação eletrificada
  const [isElectrified, setIsElectrified] = useState(false);

  // Controle de estilo visual (alto-relevo vs baixo-relevo)
  const [isElevated] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null); // Referência para o campo de input
  const location = useLocation();
  const { user } = useAuth();

  // Hook para Vector Store - busca semântica nos documentos
  const { getChatbotContext } = useVectorStore();

  // 🚀 Verificar se deve usar processamento local (afeta o uso de memória)
  const useLocalProcessing = import.meta.env.VITE_USE_LOCAL_AI === 'true';

  // 🧠 Hook de memória híbrida (Redis + Supabase) - APENAS para modo local
  const memoryHookResult = useConversationMemory();
  const {
    conversationHistory,
    isLoading: memoryLoading,
    error: memoryError,
    addMessage,
    clearSession,
    getContextForChatbot,
    currentSession
  } = useLocalProcessing ? memoryHookResult : {
    conversationHistory: [],
    isLoading: false,
    error: null,
    addMessage: async () => { },
    clearSession: async () => { },
    getContextForChatbot: () => '',
    currentSession: null
  };

  // 📋 Hook de Short-Memory (LocalStorage) - APENAS para modo local
  const shortMemoryHookResult = useShortMemory(useLocalProcessing ? user?.id : undefined);
  const {
    addToShortMemory,
    getShortMemoryContext,
    hasMessages: hasShortMemoryMessages
  } = useLocalProcessing ? shortMemoryHookResult : {
    addToShortMemory: async () => { },
    getShortMemoryContext: () => '',
    hasMessages: false
  };

  // Estado local para compatibilidade com interface atual
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  // Sincronizar mensagens da memória com interface local (APENAS no modo local)
  useEffect(() => {
    if (!useLocalProcessing) {
      // No modo webhook, manter estado local simples
      return;
    }

    logger.debug('===== EFEITO DE SINCRONIZAÇÃO EXECUTADO =====');
    logger.debug('Mensagens na memória:', { count: conversationHistory.length });

    // Log detalhado das mensagens da memória (apenas em desenvolvimento)
    conversationHistory.forEach((msg, i) => {
      logger.debug(`Memória[${i}]: ${msg.role} - "${msg.content.substring(0, 30)}..."`);
    });

    const formattedMessages = conversationHistory.map((msg, index) => ({
      id: index + 1,
      text: msg.content,
      sender: msg.role === 'user' ? 'user' as const : 'bot' as const
    }));

    logger.debug('Mensagens formatadas para interface:', { count: formattedMessages.length });
    setLocalMessages(formattedMessages);

    logger.debug('===== FIM DA SINCRONIZAÇÃO =====');
  }, [conversationHistory, logger, useLocalProcessing]);

  // Efeito da animação eletrificada no chatbot minimizado
  useEffect(() => {
    if (chatState !== 'minimized') return;

    // Ativar animação eletrificada a cada 10 segundos
    const electrifyInterval = setInterval(() => {
      setIsElectrified(true);

      // Desativar a animação após 2 segundos
      setTimeout(() => {
        setIsElectrified(false);
      }, 2000);
    }, 10000);

    // Primeira animação após 3 segundos (para dar tempo do usuário ver o chatbot)
    const initialTimeout = setTimeout(() => {
      setIsElectrified(true);
      setTimeout(() => {
        setIsElectrified(false);
      }, 2000);
    }, 3000);

    return () => {
      clearInterval(electrifyInterval);
      clearTimeout(initialTimeout);
    };
  }, [chatState]);  // Constantes de estilo para o chatbot
  const chatbotBgColor = '#1a1b3a';
  const chatbotTextColor = '#e0e0e0';
  const chatbotShadowLight = 'rgba(147, 51, 234, 0.2)';
  const chatbotShadowDark = 'rgba(0, 0, 0, 0.4)';

  /**
   * fetchChatbotConfig
   * Busca as configurações do chatbot do usuário atual no Supabase
   * Inclui system_instructions e outras configurações personalizadas
   */
  const fetchChatbotConfig = useCallback(async () => {
    if (!user?.id) return;

    logger.info('Iniciando busca de configuração do chatbot', {
      timestamp: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email
    });

    try {
      const { data, error } = await supabase
        .from('mychatbot')
        .select('*')
        .eq('chatbot_user', user.id);

      if (error) {
        logger.error('Erro ao buscar configuração do chatbot:', error);
        return;
      }

      if (data && data.length > 0) {
        setChatbotConfig(data[0]);
        logger.info('Configuração carregada com sucesso', {
          timestamp: new Date().toISOString(),
          userId: user.id,
          configFound: true,
          chatbotName: data[0].chatbot_name,
          hasSystemMessage: !!data[0].system_instructions,
          systemMessageLength: data[0].system_instructions?.length || 0
        });
      } else {
        logger.warn('Nenhuma configuração encontrada para o usuário', {
          timestamp: new Date().toISOString(),
          userId: user.id,
          configFound: false
        });
      }
    } catch (error) {
      logger.error('Erro inesperado ao buscar configuração:', error);
    }
  }, [user?.id, user?.email, logger]);

  /**
   * generateSystemMessage
   * Gera o system_message final aplicando configurações padrão
   */
  const generateSystemMessage = (config: ChatbotConfig | null): string => {
    // Valores padrão das configurações
    const defaults = {
      formality_level: 70,
      use_emojis: false,
      paragraph_size: 20,
      source_strictness: 90,
      confidence_threshold: 80,
      fallback_action: "human",
      list_style: "bullets",
      allow_internet_search: false,
      mandatory_link: false,
      response_speed: 50,
      name_usage_frequency: 30,
      ask_for_name: true,
      remember_context: true
    };

    // Aplicar valores padrão às configurações
    const formalityLevel = config?.formality_level ?? defaults.formality_level;
    const useEmojis = config?.use_emojis ?? defaults.use_emojis;
    const paragraphSize = config?.paragraph_size ?? defaults.paragraph_size;
    const sourceStrictness = config?.source_strictness ?? defaults.source_strictness;
    const confidenceThreshold = config?.confidence_threshold ?? defaults.confidence_threshold;
    const fallbackAction = config?.fallback_action ?? defaults.fallback_action;
    const listStyle = config?.list_style ?? defaults.list_style;
    const allowInternetSearch = config?.allow_internet_search ?? defaults.allow_internet_search;
    const mandatoryLink = config?.mandatory_link ?? defaults.mandatory_link;
    const responseSpeed = config?.response_speed ?? defaults.response_speed;
    const nameUsageFrequency = config?.name_usage_frequency ?? defaults.name_usage_frequency;
    const askForName = config?.ask_for_name ?? defaults.ask_for_name;
    const rememberContext = config?.remember_context ?? defaults.remember_context;

    // System message base
    const baseMessage = config?.system_instructions ||
      'Você é um assistente virtual profissional e prestativo.';

    // Construir system message completo
    let systemMessage = baseMessage + '\n\nCONFIGURAÇÕES DE COMPORTAMENTO:\n';

    // 1. Personalidade
    systemMessage += `- Nível de formalidade: ${formalityLevel}/100 (`;
    if (formalityLevel <= 30) systemMessage += 'casual e descontraído';
    else if (formalityLevel <= 70) systemMessage += 'equilibrado entre formal e casual';
    else systemMessage += 'formal e profissional';
    systemMessage += ')\n';

    systemMessage += `- Uso de emojis: ${useEmojis ? 'Sim, use emojis adequados nas respostas' : 'Não use emojis nas respostas'}\n`;

    systemMessage += `- Tamanho de parágrafos: ${paragraphSize}/100 (`;
    if (paragraphSize <= 30) systemMessage += 'respostas concisas e diretas';
    else if (paragraphSize <= 70) systemMessage += 'respostas de tamanho médio';
    else systemMessage += 'respostas detalhadas e explicativas';
    systemMessage += ')\n';

    // 2. Comportamento
    systemMessage += `- Rigidez nas fontes: ${sourceStrictness}/100 (`;
    if (sourceStrictness >= 80) systemMessage += 'utilize APENAS informações dos documentos fornecidos';
    else if (sourceStrictness >= 50) systemMessage += 'priorize documentos fornecidos, mas pode usar conhecimento geral';
    else systemMessage += 'use conhecimento geral quando necessário';
    systemMessage += ')\n';

    systemMessage += `- Confiança mínima: ${confidenceThreshold}% (só responda se tiver pelo menos ${confidenceThreshold}% de certeza)\n`;

    systemMessage += `- Ação quando não souber: `;
    switch (fallbackAction) {
      case 'human':
        systemMessage += 'Encaminhe para atendimento humano dizendo "Vou transferir você para um atendente humano"\n';
        break;
      case 'search':
        systemMessage += 'Faça uma busca mais ampla nos documentos\n';
        break;
      default:
        systemMessage += 'Encaminhe para atendimento humano\n';
    }

    systemMessage += `- Estilo de listas: `;
    switch (listStyle) {
      case 'bullets':
        systemMessage += 'Use listas com bullets (•)\n';
        break;
      case 'numbered':
        systemMessage += 'Use listas numeradas (1., 2., 3.)\n';
        break;
      default:
        systemMessage += 'Use listas simples sem marcadores\n';
    }

    systemMessage += `- Busca na internet: ${allowInternetSearch ? 'Permitida quando necessário' : 'Não permitida, use apenas documentos fornecidos'}\n`;

    // IMPORTANTE: Instrução para omitir metadados de fonte
    systemMessage += `\nIMPORTANTE - APRESENTAÇÃO DAS RESPOSTAS:\n`;
    systemMessage += `- NUNCA inclua informações técnicas como "Fonte:", "Similaridade:", porcentagens de similaridade, ou nomes de arquivos nas suas respostas\n`;
    systemMessage += `- NUNCA mostre metadados como "--- Fonte: arquivo.txt (Similaridade: X%) ---"\n`;
    systemMessage += `- Use as informações dos documentos naturalmente, sem revelar de onde vieram\n`;
    systemMessage += `- Responda de forma fluida e natural, como se o conhecimento fosse seu próprio\n`;
    systemMessage += `- Se precisar referenciar algo, use termos gerais como "conforme a legislação" ou "segundo as diretrizes"\n`;

    // 3. Interação
    systemMessage += `- Velocidade de resposta: ${responseSpeed}/100 (`;
    if (responseSpeed <= 30) systemMessage += 'responda de forma muito rápida e direta';
    else if (responseSpeed <= 70) systemMessage += 'responda em velocidade normal';
    else systemMessage += 'tome tempo para respostas mais elaboradas';
    systemMessage += ')\n';

    systemMessage += `- Frequência de uso do nome: ${nameUsageFrequency}/100 (`;
    if (nameUsageFrequency <= 30) systemMessage += 'use o nome do usuário raramente';
    else if (nameUsageFrequency <= 70) systemMessage += 'use o nome do usuário ocasionalmente';
    else systemMessage += 'use o nome do usuário frequentemente';
    systemMessage += ')\n';

    systemMessage += `- Solicitar nome: ${askForName ? 'Sim, pergunte o nome do usuário se não souber' : 'Não solicite o nome do usuário'}\n`;
    systemMessage += `- Lembrar contexto: ${rememberContext ? 'Sim, mantenha o contexto da conversa' : 'Não mantenha contexto entre mensagens'}\n`;

    // 4. Rodapé
    if (!mandatoryLink) {
      systemMessage += '- Não inclua links obrigatórios nas respostas\n';
    }

    return systemMessage;
  };

  /**
   * getPageContext
   * Determina o contexto da página atual com base na URL
   * Usado para personalizar respostas e mensagem inicial
   */
  const getPageContext = location.pathname;

  /**
   * getInitialMessage
   * Cria mensagem de boas-vindas usando a "Mensagem de Saudação" configurada
   * Memorizada com useCallback para evitar re-renders desnecessários
   */
  const getInitialMessage = useCallback(() => {
    // Verificar se há uma mensagem de saudação personalizada configurada
    if (chatbotConfig?.welcome_message) {
      return chatbotConfig.welcome_message;
    } else {
      // Mensagem padrão se não houver welcome_message configurada
      const botName = chatbotConfig?.chatbot_name || 'o assistente virtual';
      return `Olá! Sou ${botName}. Como posso ajudá-lo hoje?`;
    }
  }, [chatbotConfig?.welcome_message, chatbotConfig?.chatbot_name]);

  /**
   * Inicialização de mensagens
   * Carrega a mensagem inicial quando o chat é aberto pela primeira vez
   * No modo webhook (N8N), não usa memória local - apenas interface
   */
  useEffect(() => {
    console.log('🚀 [MyChatbot] useEffect inicialização executado:', {
      chatState,
      conversationHistoryLength: conversationHistory.length,
      initialMessageAdded,
      useLocalProcessing,
      timestamp: new Date().toISOString()
    });

    // Condições para inicialização
    const shouldInitialize = useLocalProcessing
      ? (chatState === 'normal' && conversationHistory.length === 0 && !initialMessageAdded)
      : (chatState === 'normal' && localMessages.length === 0 && !initialMessageAdded);

    if (shouldInitialize) {
      // Primeiro buscar configuração do chatbot, depois adicionar mensagem inicial
      const initializeChat = async () => {
        try {
          // Marcar que a mensagem inicial está sendo processada
          setInitialMessageAdded(true);

          // Buscar configuração primeiro
          await fetchChatbotConfig();

          // Aguardar um pouco para garantir que o estado foi atualizado
          await new Promise(resolve => setTimeout(resolve, 100));

          // Criar mensagem inicial com a configuração carregada
          const initialMessage = getInitialMessage();
          console.log('🤖 [MyChatbot] Adicionando mensagem inicial:', initialMessage.substring(0, 50) + '...');

          if (useLocalProcessing) {
            // Modo local: usar memória
            await addMessage('assistant', initialMessage);
            await addToShortMemory('assistant', initialMessage);
          } else {
            // Modo webhook: apenas interface local
            setLocalMessages([{
              id: 1,
              text: initialMessage,
              sender: 'bot'
            }]);
          }
          console.log('🤖 [MyChatbot] Mensagem inicial adicionada com sucesso!');
        } catch (error) {
          console.error('❌ [MyChatbot] Erro ao inicializar chat:', error);
          // Fallback: adicionar mensagem mesmo sem configuração
          const fallbackMessage = getInitialMessage();

          if (useLocalProcessing) {
            await addMessage('assistant', fallbackMessage);
            await addToShortMemory('assistant', fallbackMessage);
          } else {
            setLocalMessages([{
              id: 1,
              text: fallbackMessage,
              sender: 'bot'
            }]);
          }
        }
      };

      initializeChat();
    }
  }, [chatState, conversationHistory.length, localMessages.length, initialMessageAdded, useLocalProcessing, getInitialMessage, fetchChatbotConfig, addMessage, addToShortMemory]);

  /**
   * sendToWebhook
   * Envia mensagem do usuário para o webhook N8N configurado
   * NOVO: Agora suporta processamento local como alternativa ao N8N
   * Inclui contexto da página atual e outros metadados úteis
   * Em caso de falha, utiliza resposta local como fallback
   */
  const sendToWebhook = async (userMessage: string, preComputedContext?: string): Promise<string> => {
    const requestTimestamp = new Date().toISOString();

    try {
      setIsLoading(true);

      // 🚀 NOVA OPÇÃO: Verificar se deve usar processamento local ao invés do N8N
      const useLocalProcessing = import.meta.env.VITE_USE_LOCAL_AI === 'true';
      const webhookUrl: string | undefined = import.meta.env.VITE_WEBHOOK_N8N_URL as string | undefined;

      if (useLocalProcessing || !webhookUrl) {
        console.log('🤖 [MyChatbot] Usando processamento local (AI + Vector Store):', {
          reason: useLocalProcessing ? 'Configurado para local' : 'Webhook não configurado',
          timestamp: requestTimestamp,
        });

        return await processMessageLocally(userMessage, preComputedContext);
      }

      // Se chegou até aqui, usar N8N
      const payload = {
        message: userMessage,
        userId: user?.id,
        page: location.pathname,
        pageContext: getPageContext,
        timestamp: requestTimestamp,
        chatbot_name: chatbotConfig?.chatbot_name || "",
        sessionId: currentSession,
        userEmail: user?.email,
      };

      // Log do payload sendo enviado
      console.log('🚀 [MyChatbot] Enviando mensagem:', JSON.stringify(payload, null, 2));

      const response = await fetchWithRetry(String(webhookUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }, {
        maxRetries: 3,
        baseDelay: 1000,
        backoffFactor: 2,
        maxDelay: 10000,
        jitter: true,
        retryCondition: (error) => {
          // Retry on network errors, timeouts, or server errors
          const message = error.message.toLowerCase();
          return message.includes('network') ||
            message.includes('fetch') ||
            message.includes('timeout') ||
            message.includes('500') ||
            message.includes('502') ||
            message.includes('503') ||
            message.includes('504');
        }
      });

      const responseTimestamp = new Date().toISOString();

      // Log simplificado da requisição
      console.log('� [MyChatbot] Enviando para Webhook:', {
        url: webhookUrl,
        payloadSize: JSON.stringify(payload).length,
        message: payload.message
      });

      if (!response.ok) {
        // Tentar ler resposta de erro do N8N
        let errorDetails;
        try {
          errorDetails = await response.text();
        } catch {
          errorDetails = 'Não foi possível ler detalhes do erro';
        }

        console.log('⚠️ [MyChatbot] N8N indisponível, usando fallback:', {
          status: response.status,
          fallbackActivated: true
        });
        throw new Error(`Erro HTTP: ${response.status} - ${errorDetails}`);
      }

      const data = await response.json();

      // Log otimizado da resposta do webhook
      console.log('✅ [MyChatbot] Resposta do N8N:', {
        success: true,
        responseTime: Date.now() - Date.parse(requestTimestamp),
        dataReceived: data
      });

      // Processar nova estrutura de resposta do N8N
      // Formato esperado: {"status":"success","message":"...","uuid":"...","response":"..."}
      if (data && typeof data === 'object') {
        // Verificar se é o novo formato estruturado
        if (data.status === 'success' && data.response) {
          console.log('✅ [MyChatbot] Nova estrutura N8N processada:', {
            status: data.status,
            uuid: data.uuid,
            originalMessage: data.message,
            responseLength: data.response.length
          });
          return data.response;
        }

        // Verificar se é array (formato do seu exemplo)
        if (Array.isArray(data) && data.length > 0) {
          const responseData = data[0];
          if (responseData.status === 'success' && responseData.response) {
            console.log('✅ [MyChatbot] Array N8N processado:', {
              status: responseData.status,
              uuid: responseData.uuid,
              responseLength: responseData.response.length
            });
            return responseData.response;
          }
        }

        // Fallback para formato antigo
        if (data.response || data.message) {
          return data.response || data.message;
        }
      }

      // Última opção - resposta padrão
      console.log('⚠️ [MyChatbot] Formato inesperado, usando fallback');
      return 'Obrigado pela sua mensagem! Como posso ajudar você?';

    } catch (error) {
      const errorTimestamp = new Date().toISOString();

      // Log simplificado de erro para fallback
      console.log('🔄 [MyChatbot] Usando resposta local:', {
        reason: 'N8N indisponível',
        fallbackActive: true
      });

      // Fallback para resposta local em caso de erro (AGORA ASSÍNCRONO)
      const fallbackResponse = await getBotResponseLocal(userMessage);

      return fallbackResponse;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * processMessageLocally
   * NOVA FUNÇÃO: Processa mensagens localmente com IA + Vector Store
   * Substitui completamente o N8N quando habilitado
   */
  const processMessageLocally = async (userMessage: string, preComputedContext?: string): Promise<string> => {
    try {
      console.log('🤖 [MyChatbot] =====================================');
      console.log('🤖 [MyChatbot] PROCESSAMENTO LOCAL INICIADO');
      console.log('🤖 [MyChatbot] Mensagem do usuário:', userMessage);
      console.log('🤖 [MyChatbot] =====================================');

      // 1. 🧠 Obter contexto da memória de conversa (últimas 10 mensagens)
      const conversationContext = preComputedContext || getContextForChatbot();
      console.log('🧠 [MyChatbot] ================================');
      console.log('🧠 [MyChatbot] VERIFICANDO CONTEXTO DA MEMÓRIA');
      console.log('🧠 [MyChatbot] Contexto obtido:', {
        hasContext: !!conversationContext,
        contextLength: conversationContext.length,
        isEmpty: conversationContext.trim() === '',
        isPreComputed: !!preComputedContext
      });

      // 2. 📋 Obter contexto da Short-Memory (LocalStorage)
      const shortMemoryContext = getShortMemoryContext();
      console.log('📋 [MyChatbot] ================================');
      console.log('📋 [MyChatbot] VERIFICANDO SHORT-MEMORY');
      console.log('📋 [MyChatbot] Short-Memory:', {
        hasShortMemory: !!shortMemoryContext,
        contextLength: shortMemoryContext.length,
        hasMessages: hasShortMemoryMessages
      });

      if (conversationContext && conversationContext.trim()) {
        console.log('🧠 [MyChatbot] ✅ CONTEXTO HÍBRIDO DISPONÍVEL - Prévia:', conversationContext.substring(0, 80) + '...');
      } else {
        console.log('🧠 [MyChatbot] ⚠️ CONTEXTO HÍBRIDO VAZIO - Primeira mensagem ou erro na memória');
      }

      if (shortMemoryContext && shortMemoryContext.trim()) {
        console.log('📋 [MyChatbot] ✅ SHORT-MEMORY DISPONÍVEL - Prévia:', shortMemoryContext.substring(0, 80) + '...');
      } else {
        console.log('📋 [MyChatbot] ⚠️ SHORT-MEMORY VAZIA');
      }
      console.log('🧠📋 [MyChatbot] ================================');

      // 3. Buscar contexto relevante nos documentos
      console.log('🔍 [MyChatbot] Iniciando busca na base de dados vetorial...');

      // 🧪 TESTE ESPECÍFICO: Se pergunta sobre inscrições, fazer busca mais ampla
      let searchQuery = userMessage;
      let searchThreshold = 3000;

      if (userMessage.toLowerCase().includes('inscri')) {
        console.log('🎯 [MyChatbot] Pergunta sobre INSCRIÇÕES detectada, otimizando busca...');
        searchQuery = 'inscrições data prazo 12 05'; // Termos mais específicos
        searchThreshold = 4000; // Mais contexto
      }

      const vectorContext = await getChatbotContext(searchQuery, searchThreshold);

      if (vectorContext && vectorContext.trim().length > 0) {
        console.log('✅ [MyChatbot] CONTEXTO ENCONTRADO NA BASE VETORIAL!');
        console.log('📄 [MyChatbot] Tamanho do contexto:', vectorContext.length, 'caracteres');
        console.log('📄 [MyChatbot] Prévia do contexto:', vectorContext.substring(0, 200) + '...');
      } else {
        console.log('⚠️ [MyChatbot] NENHUM CONTEXTO ENCONTRADO na base vetorial');
        console.log('⚠️ [MyChatbot] Possíveis motivos:');
        console.log('   - Nenhum documento foi uploadado');
        console.log('   - Documentos não foram processados');
        console.log('   - Query não encontrou similaridade suficiente');
      }

      // 3. Preparar system message personalizado com configurações padrão aplicadas
      const systemMessage = generateSystemMessage(chatbotConfig);

      console.log('📝 [MyChatbot] System message configurado:', systemMessage.substring(0, 100) + '...');

      // 4. Construir prompt contextual para IA (sem system message, que será enviado separadamente)
      let fullPrompt = '';
      console.log('🏗️ [MyChatbot] ===== CONSTRUINDO PROMPT CONTEXTUAL PARA IA =====');

      // 🧠 Adicionar contexto da memória híbrida (Redis + Supabase)
      if (conversationContext && conversationContext.trim().length > 0) {
        fullPrompt += `${conversationContext}\n`;
        console.log('🧠 [MyChatbot] ✅ CONTEXTO HÍBRIDO INCLUÍDO no prompt');
        console.log('🧠 [MyChatbot] Tamanho do contexto híbrido:', conversationContext.length, 'caracteres');
      } else {
        console.log('🧠 [MyChatbot] ❌ CONTEXTO HÍBRIDO NÃO INCLUÍDO (vazio ou nulo)');
      }

      // 📋 Adicionar contexto da Short-Memory (LocalStorage)
      if (shortMemoryContext && shortMemoryContext.trim().length > 0) {
        fullPrompt += `${shortMemoryContext}\n`;
        console.log('📋 [MyChatbot] ✅ SHORT-MEMORY INCLUÍDA no prompt');
        console.log('📋 [MyChatbot] Tamanho da short-memory:', shortMemoryContext.length, 'caracteres');
      } else {
        console.log('📋 [MyChatbot] ❌ SHORT-MEMORY NÃO INCLUÍDA (vazia)');
      }

      if (vectorContext && vectorContext.trim().length > 0) {
        fullPrompt += `INFORMAÇÕES RELEVANTES DOS DOCUMENTOS:\n${vectorContext}\n\n`;
        console.log('✅ [MyChatbot] Contexto vetorial INCLUÍDO no prompt');
      } else {
        console.log('⚠️ [MyChatbot] Prompt SEM contexto vetorial');
      }

      console.log('🏗️ [MyChatbot] PROMPT FINAL - Total de caracteres:', fullPrompt.length);
      console.log('🏗️ [MyChatbot] ===== FIM DA CONSTRUÇÃO DO PROMPT =====');

      // 5. Adicionar informações de configuração do chatbot
      if (chatbotConfig) {
        fullPrompt += 'INFORMAÇÕES ADICIONAIS:\n';
        if (chatbotConfig.office_hours) fullPrompt += `- Horário de atendimento: ${chatbotConfig.office_hours}\n`;
        if (chatbotConfig.office_address) fullPrompt += `- Endereço: ${chatbotConfig.office_address}\n`;
        if (chatbotConfig.specialties) fullPrompt += `- Especialidades: ${chatbotConfig.specialties}\n`;
        if (chatbotConfig.whatsapp) fullPrompt += `- WhatsApp: ${chatbotConfig.whatsapp}\n`;
        fullPrompt += '\n';
      }

      // 6. Adicionar contexto da página atual
      const currentPageContext = getPageContext;
      if (fullPrompt.trim()) {
        fullPrompt += `\n\nOBS: CONTEXTO DA PÁGINA ATUAL - O usuário está atualmente na ${currentPageContext} (URL: ${location.pathname}). Use essa informação para contextualizar suas respostas quando relevante.`;
      } else {
        fullPrompt = `CONTEXTO DA PÁGINA ATUAL - O usuário está atualmente na ${currentPageContext} (URL: ${location.pathname}). Use essa informação para contextualizar suas respostas quando relevante.`;
      }

      // 7. Chamar OpenAI diretamente para gerar resposta
      const openaiResponse = await generateAIResponse(systemMessage, fullPrompt, userMessage);

      console.log('✅ [MyChatbot] Resposta IA gerada localmente:', {
        systemMessageLength: systemMessage.length,
        contextualPromptLength: fullPrompt.length,
        hasVectorContext: !!vectorContext,
        responseLength: openaiResponse.length
      });

      return openaiResponse;

    } catch (error) {
      console.error('❌ [MyChatbot] Erro no processamento local, usando fallback:', error);
      return await getBotResponseLocal(userMessage);
    }
  };

  /**
   * generateAIResponse
   * Chama OpenAI diretamente para gerar resposta baseada no prompt
   * Usa estrutura otimizada com roles 'system' e 'user'
   */
  const generateAIResponse = async (systemMessage: string, contextualPrompt: string, userMessage: string): Promise<string> => {
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!openaiApiKey) {
      throw new Error('OpenAI API key não configurada');
    }

    const response = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: `${contextualPrompt}\n\nPERGUNTA DO USUÁRIO: ${userMessage}\n\nRESPONDA:`
          }
        ],
        max_tokens: 1000,
        temperature: 0.5,
      }),
    }, {
      maxRetries: 3,
      baseDelay: 2000,
      backoffFactor: 2,
      maxDelay: 15000,
      jitter: true,
      retryCondition: (error) => {
        const message = error.message.toLowerCase();
        // Retry on network errors, rate limits, or server errors
        return message.includes('network') ||
          message.includes('timeout') ||
          message.includes('429') ||
          message.includes('rate limit') ||
          message.includes('500') ||
          message.includes('502') ||
          message.includes('503');
      }
    });

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error?.message || JSON.stringify(errorData);
      } catch {
        errorDetails = await response.text();
      }
      throw new Error(`OpenAI API error (${response.status}): ${errorDetails}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta no momento.';
  };

  /**
   * getBotResponseLocal
   * Sistema de fallback com respostas locais contextualizadas
   * Usado quando o webhook N8N não está disponível ou falha
   * NOVO: Integrado com busca vetorial para usar documentos do usuário
   */
  const getBotResponseLocal = async (userMessage: string): Promise<string> => {
    const pageContext = getPageContext;

    try {
      // 🔍 NOVO: Buscar contexto relevante nos documentos do usuário
      console.log('🔍 [MyChatbot] Buscando contexto vetorial para:', userMessage);
      const vectorContext = await getChatbotContext(userMessage, 2000);

      if (vectorContext && vectorContext.trim().length > 0) {
        console.log('✅ [MyChatbot] Contexto encontrado nos documentos:', {
          contextLength: vectorContext.length,
          preview: vectorContext.substring(0, 100) + '...'
        });

        // Usar informações dos documentos para gerar resposta personalizada
        const systemMessage = generateSystemMessage(chatbotConfig);

        return generateContextualResponse(userMessage, vectorContext, systemMessage);
      }
    } catch (error) {
      console.log('⚠️ [MyChatbot] Erro na busca vetorial, usando fallback tradicional:', error);
    }

    // Detectar perguntas sobre contexto da página atual
    if (userMessage.toLowerCase().includes('que página') ||
      userMessage.toLowerCase().includes('qual página') ||
      userMessage.toLowerCase().includes('onde estou') ||
      userMessage.toLowerCase().includes('página é esta') ||
      userMessage.toLowerCase().includes('página estou')) {
      return `Você está atualmente na **${pageContext}**. Esta é a área do FastBot onde você pode gerenciar e configurar seu chatbot!`;
    }

    // Se há configuração personalizada, usar informações do usuário
    if (chatbotConfig) {
      if (chatbotConfig.chatbot_name && userMessage.toLowerCase().includes('nome')) {
        return `Olá! Sou ${chatbotConfig.chatbot_name}. ${chatbotConfig.welcome_message || 'Como posso ajudar você hoje?'}`;
      }
      if (chatbotConfig.office_hours && userMessage.toLowerCase().includes('horário')) {
        return `Nosso horário de atendimento é: ${chatbotConfig.office_hours}`;
      }
      if (chatbotConfig.office_address && userMessage.toLowerCase().includes('endereço')) {
        return `Estamos localizados em: ${chatbotConfig.office_address}`;
      }
      if (chatbotConfig.specialties && userMessage.toLowerCase().includes('especialidade')) {
        return `Nossas especialidades são: ${chatbotConfig.specialties}`;
      }
    }

    // Respostas contextualizadas baseadas na página
    if (location.pathname === '/') {
      if (userMessage.toLowerCase().includes('chatbot') || userMessage.toLowerCase().includes('criar')) {
        return 'Com o FastBot você pode criar um chatbot profissional em apenas 3 minutos! Quer começar agora? Acesse "Meu Chatbot" no menu.';
      }
      if (userMessage.toLowerCase().includes('preço') || userMessage.toLowerCase().includes('valor')) {
        return 'O FastBot é totalmente gratuito! Não há custo para criar e usar seu chatbot. Confira nossa página de Preços para mais detalhes.';
      }
      if (userMessage.toLowerCase().includes('funcionalidade') || userMessage.toLowerCase().includes('recursos')) {
        return 'O FastBot oferece recursos avançados como integração com WhatsApp, respostas inteligentes com IA, customização completa e muito mais!';
      }
    }

    if (location.pathname === '/my-chatbot') {
      if (userMessage.toLowerCase().includes('configurar') || userMessage.toLowerCase().includes('setup')) {
        return 'Para configurar seu chatbot, use os botões acima para fazer upload de documentos, editar configurações ou testar o funcionamento.';
      }
      if (userMessage.toLowerCase().includes('documento') || userMessage.toLowerCase().includes('arquivo')) {
        return 'Você pode fazer upload de documentos PDF, TXT ou DOCX para treinar seu chatbot. Ele aprenderá com o conteúdo dos seus arquivos!';
      }
    }

    if (location.pathname === '/pricing') {
      return 'O FastBot é gratuito para uso eventual! E apenas 60 reais para uso profissional mensal.';
    }

    if (location.pathname === '/features') {
      return 'O FastBot tem recursos incríveis: IA avançada, integração WhatsApp, upload de documentos, customização completa e muito mais! Qual recurso te interessa mais?';
    }

    // Respostas gerais
    const botName = chatbotConfig?.chatbot_name || 'FastBot';
    const responses = [
      `Estou aqui na ${pageContext} para ajudar. Como posso auxiliar você com seu chatbot hoje?`,
      `Vejo que você está na ${pageContext}. Em que posso ajudar com o ${botName}?`,
      `Sou o assistente ${botName}! Posso esclarecer dúvidas sobre criação e configuração de chatbots.`,
      'Precisa de ajuda com seu chatbot? Estou aqui para isso! O que gostaria de saber?',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  /**
   * generateContextualResponse
   * Gera resposta baseada em contexto dos documentos usando IA simples
   * Fallback local inteligente que usa informações relevantes dos documentos
   */
  const generateContextualResponse = (userMessage: string, vectorContext: string, systemMessage: string): string => {
    // Análise básica da intenção do usuário
    const messageLower = userMessage.toLowerCase();
    const currentPageContext = getPageContext;

    // Se pergunta sobre página atual, responder diretamente
    if (messageLower.includes('página') || messageLower.includes('pagina') || messageLower.includes('onde estou') || messageLower.includes('que página')) {
      return `Você está atualmente na **${currentPageContext}** (${location.pathname}). ${vectorContext ? 'Com base nos documentos disponíveis, posso ajudá-lo com informações específicas sobre o conteúdo desta seção.' : 'Como posso ajudá-lo aqui?'}`;
    }

    // Se é uma pergunta específica, tentar extrair resposta relevante do contexto
    if (messageLower.includes('como') || messageLower.includes('que') || messageLower.includes('qual')) {
      // Buscar primeira frase relevante no contexto que possa responder
      const sentences = vectorContext.split(/[.!?]+/).filter(s => s.trim().length > 20);

      // Procurar sentença que contenha palavras-chave da pergunta
      const keywords = userMessage.toLowerCase().split(' ').filter(word => word.length > 3);

      for (const sentence of sentences) {
        const sentenceLower = sentence.toLowerCase();
        const matchCount = keywords.filter(keyword => sentenceLower.includes(keyword)).length;

        if (matchCount >= 2) {
          return `Com base nas informações disponíveis: ${sentence.trim()}.\n\nOBS: Você está na ${currentPageContext}.`;
        }
      }
    }

    // Resposta contextual genérica usando primeiras informações do documento
    const firstSentences = vectorContext.substring(0, 200).trim();
    const botName = chatbotConfig?.chatbot_name || 'Assistente';

    return `Olá! Sou o ${botName}. Com base nas informações que tenho: ${firstSentences}... Posso ajudar com mais detalhes sobre isso?\n\nOBS: Você está atualmente na ${currentPageContext}.`;
  };

  /**
   * scrollToBottom
   * Controla o scroll automático das mensagens
   * Mantém a visualização sempre na mensagem mais recente
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Aplica scroll automático quando novas mensagens são adicionadas
  useEffect(scrollToBottom, [localMessages]);

  // 🎯 Focar no input quando o chat é aberto
  useEffect(() => {
    if (chatState === 'normal' || chatState === 'maximized') {
      // Pequeno delay para garantir que o input esteja renderizado
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else if (chatState === 'minimized') {
      // Reset do controle de mensagem inicial quando minimizado
      setInitialMessageAdded(false);
    }
  }, [chatState]);

  /**
   * handleSendMessage
   * Processa o envio de mensagens do usuário e obtenção de respostas
   * Gerencia estados de loading e atualização da interface
   * Otimizado para usar memória apenas no modo local
   */
  const handleSendMessage = async (): Promise<void> => {
    if (inputValue.trim() === '') return;

    const messageTimestamp = new Date().toISOString();
    const userMessage = inputValue.trim();

    console.log('📤 [MyChatbot] Iniciando envio de mensagem:', {
      timestamp: messageTimestamp,
      userMessage: userMessage,
      messageLength: userMessage.length,
      userId: user?.id,
      chatbotConfigLoaded: !!chatbotConfig,
      currentPage: location.pathname,
      useLocalProcessing
    });

    const currentInput = inputValue;
    setInputValue('');

    // 🎯 Manter foco no input imediatamente após limpar
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    if (useLocalProcessing) {
      // MODO LOCAL: Usar memória híbrida
      console.log('🧠 [MyChatbot] ===== MODO LOCAL: ADICIONANDO À MEMÓRIA =====');
      await addMessage('user', currentInput);
      await addToShortMemory('user', currentInput);

      // Aguardar atualização do estado
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        const conversationContext = getContextForChatbot();
        const botResponse = await sendToWebhook(currentInput, conversationContext);

        await addMessage('assistant', botResponse);
        await addToShortMemory('assistant', botResponse);

        console.log('🧠 [MyChatbot] ===== RESPOSTA ADICIONADA ÀS MEMÓRIAS =====');
      } catch (error) {
        console.error('❌ [MyChatbot] Erro no modo local:', error);
      }
    } else {
      // MODO WEBHOOK: Interface simples sem memória persistente
      console.log('🌐 [MyChatbot] ===== MODO WEBHOOK: INTERFACE SIMPLES =====');

      // Adicionar mensagem do usuário à interface local
      const newUserMessage: Message = {
        id: Date.now(),
        text: currentInput,
        sender: 'user'
      };
      setLocalMessages(prev => [...prev, newUserMessage]);

      try {
        // Enviar direto para webhook sem contexto de memória
        const botResponse = await sendToWebhook(currentInput);

        // Adicionar resposta à interface local
        const newBotMessage: Message = {
          id: Date.now() + 1,
          text: botResponse,
          sender: 'bot'
        };
        setLocalMessages(prev => [...prev, newBotMessage]);

        console.log('🌐 [MyChatbot] ===== RESPOSTA ADICIONADA À INTERFACE =====');
      } catch (error) {
        console.error('❌ [MyChatbot] Erro no modo webhook:', error);

        // Adicionar mensagem de erro à interface
        const errorMessage: Message = {
          id: Date.now() + 1,
          text: 'Desculpe, houve um problema ao processar sua mensagem. Tente novamente.',
          sender: 'bot'
        };
        setLocalMessages(prev => [...prev, errorMessage]);
      }
    }

    // 🎯 Refocar no campo de input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
  };

  /**
   * toggleChatState
   * Alterna entre os estados de visualização do chatbot
   * (minimizado, normal ou maximizado)
   */
  const toggleChatState = (newState: ChatState) => {
    setChatState(newState);
  };

  /**
   * Estilos base comuns para todos os estados do chatbot
   * Define propriedades consistentes independente do modo
   * z-index 50 garante que fique acima do conteúdo mas abaixo de modais/alertas
   */
  const commonChatbotStyles = {
    position: 'fixed',
    zIndex: 50,
    transition: 'all 0.3s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '24px',
    color: chatbotTextColor,
    fontFamily: "'Inter', sans-serif",
  };

  /**
   * Funções de controle de drag vertical do chatbot
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (chatState !== 'minimized') return; // Só permite drag quando minimizado

    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartTime(Date.now());
    setHasDraggedDistance(false);
    e.preventDefault();
    e.stopPropagation(); // Previne o click do container
  };

  /**
   * Funções de controle de redimensionamento horizontal (largura)
   */
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (chatState !== 'normal') return; // Só permite redimensionar no modo normal

    setIsResizing(true);
    setDragStartX(e.clientX);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleResizeMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = dragStartX - e.clientX; // Movimento do mouse para a esquerda aumenta a largura

    // Calcular limites de largura
    const minWidth = 300; // Largura mínima
    const maxWidth = Math.min(window.innerWidth * 0.6, 800); // Máximo 60% da tela ou 800px

    const newWidth = Math.max(minWidth, Math.min(maxWidth, chatbotWidth + deltaX));
    setChatbotWidth(newWidth);
    setDragStartX(e.clientX); // Atualizar posição de referência
  }, [isResizing, dragStartX, chatbotWidth]);

  const handleResizeMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  /**
   * Funções de controle de movimento lateral (pelo header)
   */
  const handleMoveMouseDown = (e: React.MouseEvent) => {
    if (chatState !== 'normal') return; // Só permite mover no modo normal

    setIsMovingLaterally(true);
    setMoveStartX(e.clientX);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMoveMouseMove = useCallback((e: MouseEvent) => {
    if (!isMovingLaterally) return;

    const deltaX = e.clientX - moveStartX; // Movimento normal do mouse

    // Calcular limites horizontais
    const windowWidth = window.innerWidth;
    const chatbotWidthPx = chatbotWidth;
    const baseRight = 20; // Margem direita original

    // O offset aumenta quando move para a ESQUERDA (direção positiva do offset)
    // offset = 0: posição original (20px da direita)
    // offset > 0: mais para a esquerda

    // Limite mínimo: não pode mover para a direita além da posição original
    const minOffset = 0;

    // Limite máximo: pode ir até ter 20px da borda esquerda
    // Quando right = windowWidth - chatbotWidth - 20, o chatbot fica com 20px da esquerda
    // Como right = 20 - offset, então: 20 - offset = windowWidth - chatbotWidth - 20
    // Portanto: offset = 20 - (windowWidth - chatbotWidth - 20) = chatbotWidth + 40 - windowWidth
    const maxOffset = Math.max(0, windowWidth - chatbotWidthPx - 40); // 40 = 20px margem esquerda + 20px margem direita original

    // Inverter deltaX para que movimento para esquerda seja positivo no offset
    const newOffset = Math.max(minOffset, Math.min(maxOffset, chatbotHorizontalOffset - deltaX));
    setChatbotHorizontalOffset(newOffset);
    setMoveStartX(e.clientX); // Atualizar posição de referência
  }, [isMovingLaterally, moveStartX, chatbotHorizontalOffset, chatbotWidth]); const handleMoveMouseUp = useCallback(() => {
    setIsMovingLaterally(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaY = dragStartY - e.clientY; // Invertido: mover mouse para cima = chatbot sobe
    const dragDistance = Math.abs(deltaY);

    // Considera como drag se moveu mais que 5 pixels
    if (dragDistance > 5) {
      setHasDraggedDistance(true);
    }

    // Calcular limites baseados na altura da tela
    const windowHeight = window.innerHeight;
    const chatbotHeight = isElevated ? 64 : 70; // Altura do chatbot (varia conforme estilo)
    const baseBottom = isElevated ? 16 : 122; // Posição bottom base

    // Limite superior: pode subir até quase o topo da tela (deixa 20px de margem)
    const maxUpward = windowHeight - baseBottom - chatbotHeight - 20;

    // Limite inferior: pode descer até quase a parte inferior (deixa 20px de margem)  
    const maxDownward = -(baseBottom - 20);

    const newOffset = Math.max(maxDownward, Math.min(maxUpward, deltaY));
    setChatbotVerticalOffset(newOffset);
  }, [isDragging, dragStartY, isElevated]);

  const handleMouseUp = useCallback(() => {
    const dragDuration = Date.now() - dragStartTime;

    // Reset drag state após um pequeno delay apenas se realmente houve drag
    if (hasDraggedDistance || dragDuration > 200) {
      setTimeout(() => {
        setIsDragging(false);
        setHasDraggedDistance(false);
      }, 50);
    } else {
      // Se foi um click rápido, reset imediatamente
      setIsDragging(false);
      setHasDraggedDistance(false);
    }
  }, [dragStartTime, hasDraggedDistance]);

  const handleChatbotClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const clickDuration = Date.now() - dragStartTime;

    // Só abre o chat se:
    // 1. Não está arrastando OU
    // 2. Foi um clique muito rápido (menos de 200ms) E não moveu distância significativa
    if (!isDragging || (!hasDraggedDistance && clickDuration < 200)) {
      console.log('🖱️ [MyChatbot] Clique válido detectado, abrindo chat');
      toggleChatState('normal');
    } else {
      console.log('🖱️ [MyChatbot] Clique ignorado - foi um drag');
    }
  };

  // Reset do offset quando o chatbot não está minimizado
  useEffect(() => {
    if (chatState !== 'minimized') {
      setChatbotVerticalOffset(0);
    }
  }, [chatState]);

  // Reset da largura quando não está no modo normal
  useEffect(() => {
    if (chatState !== 'normal') {
      setChatbotWidth(450); // Volta para largura padrão
      setChatbotHorizontalOffset(0); // Volta para posição horizontal padrão
    }
  }, [chatState]);

  // Validar posição quando a janela é redimensionada
  useEffect(() => {
    const validatePosition = () => {
      if (chatState !== 'minimized' || chatbotVerticalOffset === 0) return;

      const windowHeight = window.innerHeight;
      const chatbotHeight = isElevated ? 64 : 70;
      const baseBottom = isElevated ? 16 : 122;

      // Recalcular limites
      const maxUpward = windowHeight - baseBottom - chatbotHeight - 20;
      const maxDownward = -(baseBottom - 20);

      // Ajustar posição se estiver fora dos novos limites
      const validOffset = Math.max(maxDownward, Math.min(maxUpward, chatbotVerticalOffset));
      if (validOffset !== chatbotVerticalOffset) {
        setChatbotVerticalOffset(validOffset);
      }
    };

    const validateChatbotWidth = () => {
      if (chatState !== 'normal') return;

      const minWidth = 300;
      const maxWidth = Math.min(window.innerWidth * 0.6, 800);

      // Ajustar largura se estiver fora dos novos limites
      const validWidth = Math.max(minWidth, Math.min(maxWidth, chatbotWidth));
      if (validWidth !== chatbotWidth) {
        setChatbotWidth(validWidth);
      }
    };

    const validateHorizontalOffset = () => {
      if (chatState !== 'normal') return;

      const windowWidth = window.innerWidth;
      const chatbotWidthPx = chatbotWidth;

      // Recalcular limites horizontais usando a mesma lógica
      const minOffset = 0; // Posição original
      const maxOffset = Math.max(0, windowWidth - chatbotWidthPx - 40); // 40 = margens esquerda e direita

      // Ajustar posição horizontal se estiver fora dos novos limites
      const validOffset = Math.max(minOffset, Math.min(maxOffset, chatbotHorizontalOffset));
      if (validOffset !== chatbotHorizontalOffset) {
        setChatbotHorizontalOffset(validOffset);
      }
    };

    const handleResize = () => {
      validatePosition();
      validateChatbotWidth();
      validateHorizontalOffset();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chatState, chatbotVerticalOffset, chatbotWidth, chatbotHorizontalOffset, isElevated]);

  // Event listeners globais para drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Previne seleção de texto durante drag
      document.body.style.cursor = 'grabbing'; // Cursor visual global durante drag
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Event listeners globais para redimensionamento
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, handleResizeMouseMove, handleResizeMouseUp]);

  // Event listeners globais para movimento lateral
  useEffect(() => {
    if (isMovingLaterally) {
      document.addEventListener('mousemove', handleMoveMouseMove);
      document.addEventListener('mouseup', handleMoveMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleMoveMouseMove);
      document.removeEventListener('mouseup', handleMoveMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isMovingLaterally, handleMoveMouseMove, handleMoveMouseUp]);

  // Auto-resize do textarea conforme o conteúdo
  useEffect(() => {
    if (inputRef.current) {
      const textarea = inputRef.current;
      textarea.style.height = 'auto'; // Reset height
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // máximo definido no CSS
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [inputValue]);

  // Event listener para abrir o chatbot externamente
  useEffect(() => {
    const handleOpenChatbot = () => {
      toggleChatState('normal');
    };

    // Adicionar event listener para evento customizado
    window.addEventListener('openChatbot', handleOpenChatbot);

    // Cleanup: remover event listener quando componente for desmontado
    return () => {
      window.removeEventListener('openChatbot', handleOpenChatbot);
    };
  }, []);

  /**
   * getElectrifiedStyles
   * Gera estilos para a animação eletrificada quando o chatbot está minimizado
   */
  const getElectrifiedStyles = () => {
    if (!isElectrified || chatState !== 'minimized') return {};

    return {
      animation: 'electricBorder 1s ease-in',
      boxShadow: `
        0 10px 15px -3px ${chatbotShadowDark}, 
        0 4px 6px -4px ${chatbotShadowDark}, 
        0 0 0 1px rgba(255, 255, 255, 0.1),
        0 0 20px rgba(255, 255, 255, 0.8),
        0 0 40px rgba(147, 51, 234, 0.6),
        inset 0 0 20px rgba(255, 255, 255, 0.2)
      `,
      border: '2px solid rgba(255, 255, 255, 0.9)',
    };
  };

  /**
   * getChatbotStyle
   * Gera estilos específicos para cada estado do chatbot
   * Suporta dois modos visuais: alto-relevo ou baixo-relevo
   */
  const getChatbotStyle = () => {
    // Verificar se está em dispositivo móvel
    const isMobile = window.innerWidth < 768;

    // Estilos específicos para cada estado do chat (minimizado, normal, maximizado)
    // com suporte para os dois modos: alto-relevo (elevated) e baixo-relevo (carved)

    if (isElevated) {
      // Estilos para alto-relevo (elevated)
      switch (chatState) {
        case 'minimized': {
          const baseMinimizedStyle = {
            ...commonChatbotStyles,
            bottom: `${16 + chatbotVerticalOffset}px`, // Posição base + offset do drag
            right: isMobile ? '16px' : '20px', // Ajuste para mobile
            width: isMobile ? '56px' : '64px', // Menor no mobile
            height: isMobile ? '56px' : '64px', // Menor no mobile
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDragging ? 'grabbing' : (hasDraggedDistance ? 'grab' : 'pointer'),
            background: chatbotBgColor,
            boxShadow: `0 10px 15px -3px ${chatbotShadowDark}, 0 4px 6px -4px ${chatbotShadowDark}, 0 0 0 1px rgba(255, 255, 255, 0.1)`,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            // Transição suave para o efeito hover
            transition: 'all 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          };

          // Aplicar estilos eletrificados se a animação estiver ativa
          return {
            ...baseMinimizedStyle,
            ...getElectrifiedStyles(),
          };
        }
        case 'normal':
          return {
            ...commonChatbotStyles,
            bottom: isMobile ? '16px' : '100px', // Ajuste para mobile
            right: isMobile ? '16px' : `${20 + chatbotHorizontalOffset}px`, // Mobile fixo, desktop dinâmico
            width: isMobile ? 'calc(100vw - 32px)' : `${chatbotWidth}px`, // Mobile full width com margem
            height: isMobile ? '60vh' : '80vh', // Menor altura no mobile
            maxHeight: isMobile ? '500px' : '650px', // Menor altura máxima no mobile
            background: chatbotBgColor,
            boxShadow: `0 20px 25px -5px ${chatbotShadowDark}, 0 8px 10px -6px ${chatbotShadowDark}, 0 0 0 1px rgba(255, 255, 255, 0.1)`,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          };
        case 'maximized':
          return {
            ...commonChatbotStyles,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            borderRadius: '0px',
            background: chatbotBgColor,
            boxShadow: 'none',
          };
        default:
          return {};
      }
    } else {
      // Estilos para baixo-relevo (carved) - original
      switch (chatState) {
        case 'minimized':
          return {
            ...commonChatbotStyles,
            bottom: `${122 + chatbotVerticalOffset}px`, // Posição base + offset do drag
            right: isMobile ? '16px' : '20px', // Ajuste para mobile
            width: isMobile ? '56px' : '70px', // Menor no mobile
            height: isMobile ? '56px' : '70px', // Menor no mobile
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDragging ? 'grabbing' : (hasDraggedDistance ? 'grab' : 'pointer'),
            background: `linear-gradient(145deg, ${chatbotBgColor}, ${chatbotShadowLight})`,
            boxShadow: `10px 10px 20px ${chatbotShadowDark}, -10px -10px 20px ${chatbotShadowLight}`,
          };
        case 'normal':
          return {
            ...commonChatbotStyles,
            bottom: isMobile ? '16px' : '100px', // Ajuste para mobile
            right: isMobile ? '16px' : `${20 + chatbotHorizontalOffset}px`, // Mobile fixo, desktop dinâmico
            width: isMobile ? 'calc(100vw - 32px)' : `${chatbotWidth}px`, // Mobile full width com margem
            height: isMobile ? '60vh' : '80vh', // Menor altura no mobile
            maxHeight: isMobile ? '500px' : '650px', // Menor altura máxima no mobile
            background: chatbotBgColor,
            boxShadow: `12px 12px 25px ${chatbotShadowDark}, -12px -12px 25px ${chatbotShadowLight}`,
          };
        case 'maximized':
          return {
            ...commonChatbotStyles,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            borderRadius: '0px',
            background: chatbotBgColor,
            boxShadow: `0 0 0 transparent`,
          };
        default:
          return {};
      }
    }
  };

  /**
   * 🚫 VERIFICAÇÃO DE SEGURANÇA: Não exibir chatbot se usuário não estiver logado
   * O chatbot depende do Supabase para funcionar corretamente
   */
  if (!user) {
    return null;
  }

  /**
   * Renderização do chatbot no estado minimizado
   * Exibe apenas um botão flutuante com ícone
   */
  if (chatState === 'minimized') {
    return (
      <>
        {/* CSS para animação eletrificada */}
        <style>{`
          @keyframes electricBorder {
            0% {
              box-shadow: 
                0 10px 15px -3px ${chatbotShadowDark}, 
                0 4px 6px -4px ${chatbotShadowDark}, 
                0 0 0 1px rgba(255, 255, 255, 0.1);
            }
            
            10% {
              box-shadow: 
                0 10px 15px -3px ${chatbotShadowDark}, 
                0 4px 6px -4px ${chatbotShadowDark}, 
                0 0 0 2px rgba(255, 255, 255, 0.7),
                0 0 8px rgba(255, 255, 255, 0.4),
                0 0 15px rgba(147, 51, 234, 0.3);
            }
            
            50% {
              box-shadow: 
                0 10px 15px -3px ${chatbotShadowDark}, 
                0 4px 6px -4px ${chatbotShadowDark}, 
                0 0 0 3px rgba(255, 255, 255, 0.9),
                0 0 15px rgba(255, 255, 255, 0.7),
                0 0 25px rgba(147, 51, 234, 0.5),
                inset 0 0 12px rgba(255, 255, 255, 0.25);
            }
            
            70% {
              box-shadow: 
                0 10px 15px -3px ${chatbotShadowDark}, 
                0 4px 6px -4px ${chatbotShadowDark}, 
                0 0 0 4px rgba(255, 255, 255, 1),
                0 0 20px rgba(255, 255, 255, 1),
                0 0 35px rgba(147, 51, 234, 0.8),
                inset 0 0 18px rgba(255, 255, 255, 0.4);
            }
            
            80% {
              box-shadow: 
                0 10px 15px -3px ${chatbotShadowDark}, 
                0 4px 6px -4px ${chatbotShadowDark}, 
                0 0 0 3px rgba(255, 255, 255, 0.8),
                0 0 15px rgba(255, 255, 255, 0.8),
                0 0 25px rgba(147, 51, 234, 0.6),
                inset 0 0 12px rgba(255, 255, 255, 0.3);
            }
            
            90% {
              box-shadow: 
                0 10px 15px -3px ${chatbotShadowDark}, 
                0 4px 6px -4px ${chatbotShadowDark}, 
                0 0 0 2px rgba(255, 255, 255, 0.5),
                0 0 8px rgba(255, 255, 255, 0.4),
                0 0 15px rgba(147, 51, 234, 0.3);
            }
            
            100% {
              box-shadow: 
                0 10px 15px -3px ${chatbotShadowDark}, 
                0 4px 6px -4px ${chatbotShadowDark}, 
                0 0 0 1px rgba(255, 255, 255, 0.1);
            }
          }

          /* Ocultar barra de rolagem mantendo a funcionalidade - FORÇADO */
          .chatbot-messages-container {
            scrollbar-width: none !important; /* Firefox */
            -ms-overflow-style: none !important; /* Internet Explorer 10+ */
          }
          
          .chatbot-messages-container::-webkit-scrollbar {
            width: 0px !important; /* Remove width */
            height: 0px !important; /* Remove height */
            background: transparent !important; /* Optional: transparent background */
            display: none !important; /* Hide scrollbar for WebKit browsers */
          }
          
          .chatbot-messages-container::-webkit-scrollbar-track {
            background: transparent !important;
            display: none !important;
          }
          
          .chatbot-messages-container::-webkit-scrollbar-thumb {
            background: transparent !important;
            display: none !important;
          }

          /* CSS Global adicional para garantir ocultação */
          div.chatbot-messages-container {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }

          div.chatbot-messages-container::-webkit-scrollbar,
          div.chatbot-messages-container::-webkit-scrollbar-track,
          div.chatbot-messages-container::-webkit-scrollbar-thumb {
            display: none !important;
            width: 0px !important;
            height: 0px !important;
            background: transparent !important;
          }

          /* Efeito de glow amarelo no hover do widget minimizado */
          .neu-chatbot-minimized:hover {
            box-shadow: 
              0 10px 15px -3px ${chatbotShadowDark}, 
              0 4px 6px -4px ${chatbotShadowDark}, 
              0 0 0 3px rgba(255, 255, 255, 0.3),
              0 0 30px rgba(251, 191, 36, 0.9),
              0 0 60px rgba(251, 191, 36, 0.7),
              0 0 90px rgba(251, 191, 36, 0.5),
              0 0 120px rgba(251, 191, 36, 0.3) !important;
            border: 3px solid rgba(251, 191, 36, 0.9) !important;
            transform: scale(1.08);
          }

          /* Prevenir o efeito hover durante o drag */
          .neu-chatbot-minimized.dragging:hover {
            box-shadow: 
              0 10px 15px -3px ${chatbotShadowDark}, 
              0 4px 6px -4px ${chatbotShadowDark}, 
              0 0 0 1px rgba(255, 255, 255, 0.1) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            transform: none !important;
          }
        `}</style>

        <div
          style={getChatbotStyle()}
          onMouseDown={handleMouseDown}
          onClick={handleChatbotClick}
          role="button"
          aria-label="Abrir chatbot (arraste verticalmente para reposicionar)"
          className={`neu-chatbot-minimized ${isDragging ? 'dragging' : ''}`}
          title="Clique para abrir chatbot • Arraste para reposicionar"
        >
          <Bot size={window.innerWidth < 768 ? 24 : 32} color={chatbotTextColor} />
        </div>
      </>
    );
  }

  /**
   * Renderização do chatbot nos estados normal e maximizado
   * Inclui cabeçalho, área de mensagens e área de entrada
   */
  return (
    <div style={getChatbotStyle()} className="neu-chatbot-container">
      {/* Borda de redimensionamento - apenas no modo normal */}
      {chatState === 'normal' && (
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '8px',
            cursor: 'col-resize',
            backgroundColor: 'transparent',
            zIndex: 10,
            borderTopLeftRadius: '24px',
            borderBottomLeftRadius: '24px',
          }}
          title="Arraste para redimensionar a largura do chatbot"
        >
          {/* Indicador visual sutil da área de redimensionamento */}
          <div
            style={{
              position: 'absolute',
              left: '2px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '3px',
              height: '30px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              opacity: isResizing ? 1 : 0.3,
              transition: 'opacity 0.2s ease',
            }}
          />
        </div>
      )}
      {/* Header do Chatbot */}
      <div
        onMouseDown={handleMoveMouseDown}
        style={{
          padding: '8px 8px', // 75% da altura original (15px * 0.75 = 11.25px)
          borderTopLeftRadius: chatState === 'normal' ? '24px' : '0px',
          borderTopRightRadius: chatState === 'normal' ? '24px' : '0px',
          background: isElevated
            ? `rgba(255, 255, 255, 0.05)`
            : `linear-gradient(145deg, ${chatbotShadowLight}, ${chatbotBgColor})`,
          boxShadow: isElevated
            ? 'none'
            : `inset 5px 5px 10px ${chatbotShadowDark}, inset -5px -5px 10px ${chatbotShadowLight}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          borderBottom: isElevated ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          cursor: chatState === 'normal' ? (isMovingLaterally ? 'grabbing' : 'grab') : 'default',
        }}
        title={chatState === 'normal' ? 'Arraste para mover o chatbot lateralmente' : undefined}
      >
        <div className="flex items-center">
          <Bot size={24} style={{ marginRight: '10px', color: chatbotTextColor }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: chatbotTextColor }}>
            {chatbotConfig?.chatbot_name || 'Assistente Virtual'} {isLoading && <span className="animate-pulse">●</span>}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {chatState === 'normal' && (
            <button
              onClick={() => toggleChatState('maximized')}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
              aria-label="Maximizar chatbot"
            >
              <Maximize2 size={18} color={chatbotTextColor} />
            </button>
          )}
          {chatState === 'maximized' && (
            <button
              onClick={() => toggleChatState('normal')}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
              aria-label="Restaurar chatbot"
            >
              <Minimize2 size={18} color={chatbotTextColor} />
            </button>
          )}
          <button
            onClick={() => toggleChatState('minimized')}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
            aria-label="Minimizar chatbot"
          >
            <X size={20} color={chatbotTextColor} />
          </button>
        </div>
      </div>

      {/* Área de Mensagens - Container de histórico da conversa */}
      <div
        className="chatbot-messages-container"
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '20px',
          background: chatbotBgColor,
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE 10+ */
        }}
      >
        {localMessages.map((msg) => (
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
                maxWidth: msg.sender === 'user' ? '75%' : '100%',
                padding: '10px 15px',
                borderRadius: '18px',
                color: msg.sender === 'user' ? chatbotBgColor : chatbotTextColor,
                background: msg.sender === 'user'
                  ? `linear-gradient(145deg, #06b6d4, #0891b2)`
                  : isElevated
                    ? 'rgba(255, 255, 255, 0.05)'
                    : `linear-gradient(145deg, ${chatbotShadowLight}, ${chatbotBgColor})`,
                boxShadow: isElevated
                  ? '0 2px 5px rgba(0, 0, 0, 0.2)'
                  : `3px 3px 6px ${chatbotShadowDark}, -3px -3px 6px ${chatbotShadowLight}`,
                wordWrap: 'break-word',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                opacity: msg.isLoading ? 0.7 : 1,
                border: isElevated && msg.sender === 'bot' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              }}
            >
              {msg.sender === 'bot' && <Bot size={16} className="inline mr-2 mb-0.5" />}
              {msg.isLoading ? (
                <span className="animate-pulse">Digitando...</span>
              ) : (
                <div
                  style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                  dangerouslySetInnerHTML={{
                    __html: msg.text
                      // Converter URLs em links clicáveis ANTES das quebras de linha
                      .replace(/(https?:\/\/[^\s<>\n\r]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline; cursor: pointer;">$1</a>')
                      .replace(/\n\n/g, '<br/><br/>') // Quebras duplas para parágrafos
                      .replace(/\n/g, '<br/>') // Quebras simples
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negrito
                      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Itálico
                  }}
                />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de Input - Campo de entrada e botão de envio */}
      <div style={{
        padding: '15px 20px',
        borderBottomLeftRadius: chatState === 'normal' ? '24px' : '0px',
        borderBottomRightRadius: chatState === 'normal' ? '24px' : '0px',
        background: isElevated
          ? 'rgba(255, 255, 255, 0.05)'
          : `linear-gradient(145deg, ${chatbotShadowLight}, ${chatbotBgColor})`,
        boxShadow: isElevated
          ? 'none'
          : `inset 5px 5px 10px ${chatbotShadowDark}, inset -5px -5px 10px ${chatbotShadowLight}`,
        display: 'flex',
        alignItems: 'center',
        borderTop: isElevated ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
      }}>
        <textarea
          ref={inputRef}
          id="chatbot-input"
          name="chatbot-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          aria-label="Digite sua mensagem para o chatbot"

          onKeyDown={e => {
            // Só envia mensagem com Ctrl+Enter
            if (e.key === 'Enter' && e.ctrlKey && !isLoading) {
              e.preventDefault(); // Previne comportamento padrão
              void handleSendMessage();
              // 🎯 Manter foco após pressionar Ctrl+Enter
              setTimeout(() => {
                inputRef.current?.focus();
              }, 100);
            }
            // Enter simples e Shift+Enter funcionam normalmente para quebras de linha
            // Não fazemos preventDefault() para permitir comportamento padrão do textarea
          }}

          placeholder={isLoading ? "Aguardando resposta..." : "Sua mensagem (Ctrl+Enter para enviar)"}
          disabled={isLoading}
          rows={1}
          style={{
            flexGrow: 1,
            padding: '12px 15px',
            border: isElevated ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            borderRadius: '12px',
            background: chatbotBgColor,
            color: chatbotTextColor,
            outline: 'none',
            fontSize: '0.9rem',
            marginRight: '10px',
            boxShadow: isElevated
              ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
              : `inset 3px 3px 6px ${chatbotShadowDark}, inset -3px -3px 6px ${chatbotShadowLight}`,
            opacity: isLoading ? 0.6 : 1,
            resize: 'none',
            minHeight: '44px',
            maxHeight: '120px',
            overflow: 'hidden',
            lineHeight: '1.4',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={() => { void handleSendMessage(); }}
          disabled={isLoading}
          style={{
            padding: '10px',
            border: 'none',
            borderRadius: '50%',
            background: isLoading
              ? `linear-gradient(145deg, #64748b, #475569)`
              : `linear-gradient(145deg, #06b6d4, #0891b2)`,
            color: chatbotBgColor,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            boxShadow: isElevated
              ? '0 4px 6px rgba(0, 0, 0, 0.4)'
              : `4px 4px 8px ${chatbotShadowDark}, -4px -4px 8px ${chatbotShadowLight}`,
            transition: 'all 0.2s ease',
            opacity: isLoading ? 0.6 : 1,
          }}
          onMouseDown={(e) => !isLoading && (e.currentTarget.style.boxShadow = isElevated
            ? 'inset 0 2px 4px rgba(0, 0, 0, 0.4)'
            : `inset 2px 2px 4px ${chatbotShadowDark}, inset -2px -2px 4px ${chatbotShadowLight}`)}
          onMouseUp={(e) => !isLoading && (e.currentTarget.style.boxShadow = isElevated
            ? '0 4px 6px rgba(0, 0, 0, 0.4)'
            : `4px 4px 8px ${chatbotShadowDark}, -4px -4px 8px ${chatbotShadowLight}`)}
          aria-label="Enviar mensagem"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default MyChatbot;

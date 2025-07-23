/**
 * ==================================
 * MyChatbot
 * ==================================
 * 
 * Componente de chatbot interativo para o FastBot com assistência contextual baseado na       // Log do payload sendo enviado
      console.log('🚀 [MyChatbot] Enviando para N8N:', {
        payload: JSON.stringify(payload),
        url: webhookUrl,
        size: JSON.stringify(payload).length
      });

      const response = await fetch(String(webhookUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const responseTimestamp = new Date().toISOString();uporta múltiplos estados de visualização (minimizado, normal, maximizado) e
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
import { supabase } from '@/integrations/supabase/client';

type ChatState = 'minimized' | 'normal' | 'maximized';
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  isLoading?: boolean;
}

interface ChatbotConfig {
  system_message: string;
  office_address: string;
  office_hours: string;
  specialties: string;
  chatbot_name: string;
  welcome_message: string;
  whatsapp: string;
}

const MyChatbot = () => {
  // Estados principais do componente
  const [chatState, setChatState] = useState<ChatState>('minimized');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(null);

  // Controle de estilo visual (alto-relevo vs baixo-relevo)
  const [isElevated] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { user } = useAuth();
  
  // Hook para Vector Store - busca semântica nos documentos
  const { getChatbotContext } = useVectorStore();

  // Constantes de estilo para o chatbot
  const chatbotBgColor = '#1a1b3a';
  const chatbotTextColor = '#e0e0e0';
  const chatbotShadowLight = 'rgba(147, 51, 234, 0.3)';
  const chatbotShadowDark = 'rgba(0, 0, 0, 0.7)';

  /**
   * fetchChatbotConfig
   * Busca as configurações do chatbot do usuário atual no Supabase
   * Inclui system_message e outras configurações personalizadas
   */
  const fetchChatbotConfig = useCallback(async () => {
    if (!user?.id) return;

    console.log('🔍 [MyChatbot] Iniciando busca de configuração do chatbot...', {
      timestamp: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email
    });

    try {
      const { data, error } = await supabase
        .from('mychatbot_2')
        .select('*')
        .eq('chatbot_user', user.id);

      if (error) {
        console.error('❌ [MyChatbot] Erro ao buscar configuração do chatbot:', error);
        return;
      }

      if (data && data.length > 0) {
        setChatbotConfig(data[0]);
        console.log('✅ [MyChatbot] Configuração carregada com sucesso:', {
          timestamp: new Date().toISOString(),
          userId: user.id,
          configFound: true,
          chatbotName: data[0].chatbot_name,
          hasSystemMessage: !!data[0].system_message,
          systemMessageLength: data[0].system_message?.length || 0
        });
      } else {
        console.log('⚠️ [MyChatbot] Nenhuma configuração encontrada para o usuário:', {
          timestamp: new Date().toISOString(),
          userId: user.id,
          configFound: false
        });
      }
    } catch (error) {
      console.error('❌ [MyChatbot] Erro inesperado ao buscar configuração:', error);
    }
  }, [user?.id, user?.email]);

  /**
   * getPageContext
   * Determina o contexto da página atual com base na URL
   * Usado para personalizar respostas e mensagem inicial
   */
  const getPageContext = useCallback(() => {
    switch (location.pathname) {
      case '/':
        return 'página inicial do FastBot';
      case '/account':
        return 'página de Conta do FastBot';
      case '/pricing':
        return 'página de Preços do FastBot';
      case '/features':
        return 'página de Funcionalidades do FastBot';
      case '/my-chatbot':
        return 'página Meu Chatbot do FastBot';
      case '/admin':
        return 'página de Administração do FastBot';
      default:
        return 'uma página do FastBot';
    }
  }, [location.pathname]);

  /**
   * getInitialMessage
   * Cria mensagem de boas-vindas personalizada baseada na página atual
   * Memorizada com useCallback para evitar re-renders desnecessários
   */
  const getInitialMessage = useCallback(() => {
    const pageContext = getPageContext();
    const botName = chatbotConfig?.chatbot_name || 'FastBot';
    return `Olá! 👋 Bem-vindo à ${pageContext}. Sou o assistente ${botName} e estou aqui para ajudar você com seu chatbot!`;
  }, [getPageContext, chatbotConfig?.chatbot_name]);

  /**
   * Inicialização de mensagens
   * Carrega a mensagem inicial quando o chat é aberto pela primeira vez
   */
  useEffect(() => {
    if (chatState === 'normal' && messages.length === 0) {
      setMessages([{ id: 1, text: getInitialMessage(), sender: 'bot' }]);
      // Buscar configuração do chatbot quando o chat é aberto
      fetchChatbotConfig();
    }
  }, [chatState, messages.length, getInitialMessage, fetchChatbotConfig]);

  /**
   * sendToWebhook
   * Envia mensagem do usuário para o webhook N8N configurado
   * NOVO: Agora suporta processamento local como alternativa ao N8N
   * Inclui contexto da página atual e outros metadados úteis
   * Em caso de falha, utiliza resposta local como fallback
   */
  const sendToWebhook = async (userMessage: string): Promise<string> => {
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
        
        return await processMessageLocally(userMessage);
      }

      // Se chegou até aqui, usar N8N
      const payload = {
        message: userMessage,
        userId: user?.id,
        pageContext: location.pathname,
        pageName: getPageContext(),
        timestamp: requestTimestamp
      };

      // Log do payload sendo enviado
      console.log('🚀 [MyChatbot] Enviando mensagem:', JSON.stringify(payload, null, 2));

      const response = await fetch(String(webhookUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const responseTimestamp = new Date().toISOString();

      // Log simplificado da requisição
      console.log('� [MyChatbot] Enviando para N8N:', {
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
  const processMessageLocally = async (userMessage: string): Promise<string> => {
    try {
      console.log('🤖 [MyChatbot] =====================================');
      console.log('🤖 [MyChatbot] PROCESSAMENTO LOCAL INICIADO');
      console.log('🤖 [MyChatbot] Mensagem do usuário:', userMessage);
      console.log('🤖 [MyChatbot] =====================================');
      
      // 1. Buscar contexto relevante nos documentos
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
      
      // 2. Preparar system message personalizado
      const systemMessage = chatbotConfig?.system_message || 
        'Você é um assistente virtual profissional e prestativo.';
      
      console.log('📝 [MyChatbot] System message configurado:', systemMessage.substring(0, 100) + '...');
      
      // 3. Construir prompt completo para IA
      let fullPrompt = systemMessage + '\n\n';
      
      if (vectorContext && vectorContext.trim().length > 0) {
        fullPrompt += `INFORMAÇÕES RELEVANTES DOS DOCUMENTOS:\n${vectorContext}\n\n`;
        console.log('✅ [MyChatbot] Contexto vetorial INCLUÍDO no prompt');
      } else {
        console.log('⚠️ [MyChatbot] Prompt SEM contexto vetorial');
      }
      
      // 4. Adicionar informações de configuração do chatbot
      if (chatbotConfig) {
        fullPrompt += 'INFORMAÇÕES ADICIONAIS:\n';
        if (chatbotConfig.office_hours) fullPrompt += `- Horário de atendimento: ${chatbotConfig.office_hours}\n`;
        if (chatbotConfig.office_address) fullPrompt += `- Endereço: ${chatbotConfig.office_address}\n`;
        if (chatbotConfig.specialties) fullPrompt += `- Especialidades: ${chatbotConfig.specialties}\n`;
        if (chatbotConfig.whatsapp) fullPrompt += `- WhatsApp: ${chatbotConfig.whatsapp}\n`;
        fullPrompt += '\n';
      }
      
      fullPrompt += `PERGUNTA DO USUÁRIO: ${userMessage}\n\nRESPONDA:`;
      
      // 5. Chamar OpenAI diretamente para gerar resposta
      const openaiResponse = await generateAIResponse(fullPrompt);
      
      console.log('✅ [MyChatbot] Resposta IA gerada localmente:', {
        promptLength: fullPrompt.length,
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
   */
  const generateAIResponse = async (prompt: string): Promise<string> => {
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key não configurada');
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
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
    const pageContext = getPageContext();

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
        const systemMessage = chatbotConfig?.system_message || 
          `Você é um assistente virtual profissional. Use as informações dos documentos abaixo para responder de forma precisa e útil.`;
        
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
          return `Com base nas informações disponíveis: ${sentence.trim()}.`;
        }
      }
    }
    
    // Resposta contextual genérica usando primeiras informações do documento
    const firstSentences = vectorContext.substring(0, 200).trim();
    const botName = chatbotConfig?.chatbot_name || 'Assistente';
    
    return `Olá! Sou o ${botName}. Com base nas informações que tenho: ${firstSentences}... Posso ajudar com mais detalhes sobre isso?`;
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
  useEffect(scrollToBottom, [messages]);

  /**
   * handleSendMessage
   * Processa o envio de mensagens do usuário e obtenção de respostas
   * Gerencia estados de loading e atualização da interface
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
      currentPage: location.pathname
    });

    const newMessage: Message = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages((prev) => [...prev, newMessage]);
    const currentInput = inputValue;
    setInputValue('');

    // Adicionar mensagem de loading
    const loadingMessage: Message = {
      id: Date.now() + 1,
      text: 'Digitando...',
      sender: 'bot',
      isLoading: true
    };
    setMessages((prev) => [...prev, loadingMessage]);

    // Enviar para webhook N8N e aguardar resposta
    const botResponse = await sendToWebhook(currentInput);

    // Remover mensagem de loading e adicionar resposta real
    setMessages((prev) => {
      const withoutLoading = prev.filter((msg) => !msg.isLoading);
      return [...withoutLoading, {
        id: Date.now() + 2,
        text: botResponse,
        sender: 'bot'
      }];
    });
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
   */
  const commonChatbotStyles = {
    position: 'fixed',
    zIndex: 1000,
    transition: 'all 0.3s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '24px',
    color: chatbotTextColor,
    fontFamily: "'Inter', sans-serif",
  };

  /**
   * getChatbotStyle
   * Gera estilos específicos para cada estado do chatbot
   * Suporta dois modos visuais: alto-relevo ou baixo-relevo
   */
  const getChatbotStyle = () => {
    // Estilos específicos para cada estado do chat (minimizado, normal, maximizado)
    // com suporte para os dois modos: alto-relevo (elevated) e baixo-relevo (carved)

    if (isElevated) {
      // Estilos para alto-relevo (elevated)
      switch (chatState) {
        case 'minimized':
          return {
            ...commonChatbotStyles,
            bottom: '20px',
            right: '20px',
            width: '70px',
            height: '70px',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: chatbotBgColor,
            boxShadow: `0 10px 15px -3px ${chatbotShadowDark}, 0 4px 6px -4px ${chatbotShadowDark}, 0 0 0 1px rgba(255, 255, 255, 0.1)`,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          };
        case 'normal':
          return {
            ...commonChatbotStyles,
            bottom: '20px',
            right: '20px',
            width: 'clamp(300px, 33vw, 450px)',
            height: '80vh',
            maxHeight: '650px',
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
            bottom: '20px',
            right: '20px',
            width: '70px',
            height: '70px',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: `linear-gradient(145deg, ${chatbotBgColor}, ${chatbotShadowLight})`,
            boxShadow: `10px 10px 20px ${chatbotShadowDark}, -10px -10px 20px ${chatbotShadowLight}`,
          };
        case 'normal':
          return {
            ...commonChatbotStyles,
            bottom: '20px',
            right: '20px',
            width: 'clamp(300px, 33vw, 450px)',
            height: '80vh',
            maxHeight: '650px',
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
   * Renderização do chatbot no estado minimizado
   * Exibe apenas um botão flutuante com ícone
   */
  if (chatState === 'minimized') {
    return (
      <div
        style={getChatbotStyle()}
        onClick={() => toggleChatState('normal')}
        role="button"
        aria-label="Abrir chatbot"
        className="neu-chatbot-minimized"
      >
        <Bot size={32} color={chatbotTextColor} />
      </div>
    );
  }

  /**
   * Renderização do chatbot nos estados normal e maximizado
   * Inclui cabeçalho, área de mensagens e área de entrada
   */
  return (
    <div style={getChatbotStyle()} className="neu-chatbot-container">
      {/* Header do Chatbot */}
      <div style={{
        padding: '15px 20px',
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
      }}>
        <div className="flex items-center">
          <Bot size={24} style={{ marginRight: '10px', color: chatbotTextColor }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: chatbotTextColor }}>
            {chatbotConfig?.chatbot_name || 'FastBot'} {isLoading && <span className="animate-pulse">●</span>}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {chatState === 'normal' && (
            <button
              onClick={() => toggleChatState('maximized')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
              aria-label="Maximizar chatbot"
            >
              <Maximize2 size={18} color={chatbotTextColor} />
            </button>
          )}
          {chatState === 'maximized' && (
            <button
              onClick={() => toggleChatState('normal')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
              aria-label="Restaurar chatbot"
            >
              <Minimize2 size={18} color={chatbotTextColor} />
            </button>
          )}
          <button
            onClick={() => toggleChatState('minimized')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
            aria-label="Minimizar chatbot"
          >
            <X size={20} color={chatbotTextColor} />
          </button>
        </div>
      </div>

      {/* Área de Mensagens - Container de histórico da conversa */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', background: chatbotBgColor }}>
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
              {msg.sender === 'user' && <User size={16} className="inline mr-2 mb-0.5" />}
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
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}

          onKeyDown={e => {
            if (e.key === 'Enter' && !isLoading) {
              void handleSendMessage();
            }
          }}

          placeholder={isLoading ? "Aguardando resposta..." : "Digite sua mensagem..."}
          disabled={isLoading}
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

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, Send, ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useVectorStore } from '@/hooks/useVectorStore';
import { fetchWithRetry } from '@/lib/utils/retry';

interface ChatbotConfig {
  chatbot_user: string;
  system_instructions: string;
  system_message: string;
  office_address: string;
  office_hours: string;
  specialties: string;
  chatbot_name: string;
  welcome_message: string;
  whatsapp: string;
  formality_level?: number;
  use_emojis?: boolean;
  paragraph_size?: number;
  source_strictness?: number;
  confidence_threshold?: number;
  fallback_action?: string;
  list_style?: string;
  allow_internet_search?: boolean;
  mandatory_link?: boolean;
  response_speed?: number;
  name_usage_frequency?: number;
  ask_for_name?: boolean;
  remember_context?: boolean;
  personality?: string;
  behavior?: string;
  style?: string;
  interaction?: string;
  footer?: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const PublicChatbotPage: React.FC = () => {
  const { chatbotSlug } = useParams<{ chatbotSlug: string }>();
  const navigate = useNavigate();
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hook para busca vetorial
  const { getChatbotContext } = useVectorStore();

  // Função para criar slug a partir do nome do chatbot
  const createSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD') // Decompor caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (acentos)
      .replace(/ç/g, 'c') // Substituir ç por c
      .replace(/Ç/g, 'c') // Substituir Ç por c
      .replace(/[^a-z0-9]/g, '') // Remover tudo que não for letra ou número
      .trim();
  };  // Função específica para busca vetorial com userId personalizado
  const getChatbotContextForUser = async (userMessage: string, maxTokens: number = 3000, targetUserId: string): Promise<string> => {
    try {
      // Gerar embedding da query usando OpenAI
      const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!openaiApiKey) {
        console.warn('OpenAI API key não configurada, retornando contexto vazio');
        return '';
      }

      // Gerar embedding
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: userMessage,
          model: 'text-embedding-3-small'
        }),
      });

      if (!embeddingResponse.ok) {
        console.warn('Erro ao gerar embedding, retornando contexto vazio');
        return '';
      }

      const embeddingData = await embeddingResponse.json();
      const queryEmbedding = embeddingData.data[0].embedding;

      // Buscar documentos similares
      const { data, error } = await supabase.rpc('match_embeddings', {
        query_embedding: queryEmbedding,
        user_id: targetUserId,
        match_threshold: 0.5,
        match_count: 5
      });

      if (error) {
        console.error('Erro na busca RPC:', error);
        return '';
      }

      if (!data || data.length === 0) {
        return '';
      }

      // Construir contexto
      let context = '';
      let currentTokens = 0;
      const estimatedTokensPerChar = 0.25;

      for (const result of data) {
        const chunkTokens = Math.ceil(result.chunk_text.length * estimatedTokensPerChar);

        if (currentTokens + chunkTokens > maxTokens) {
          break;
        }

        context += result.chunk_text + '\n\n';
        currentTokens += chunkTokens;
      }

      return context.trim();
    } catch (error) {
      console.error('Erro ao buscar contexto:', error);
      return '';
    }
  };

  // Buscar configuração do chatbot
  const fetchChatbotConfig = useCallback(async () => {
    if (!chatbotSlug) {
      setError('Nome do chatbot não fornecido');
      setIsConfigLoading(false);
      return;
    }

    try {
      // Primeiro, buscar todos os chatbots e filtrar pelo slug
      const { data: allChatbots, error } = await supabase
        .from('mychatbot')
        .select('*');

      if (error) {
        console.error('Erro ao buscar configurações:', error);
        setError('Erro ao buscar chatbot');
        setIsConfigLoading(false);
        return;
      }

      // Encontrar o chatbot com o slug correspondente
      const chatbot = allChatbots?.find(bot =>
        bot.chatbot_name && createSlug(bot.chatbot_name) === chatbotSlug
      );

      if (!chatbot) {
        setError('Chatbot não encontrado');
        setIsConfigLoading(false);
        return;
      }

      setConfig(chatbot);

      // Adicionar mensagem de boas-vindas
      if (chatbot.welcome_message) {
        setMessages([{
          id: 1,
          text: chatbot.welcome_message,
          sender: 'bot',
          timestamp: new Date()
        }]);
      } else {
        // Mensagem padrão se não houver welcome_message configurada
        setMessages([{
          id: 1,
          text: `Olá! Sou ${chatbot.chatbot_name || 'o assistente virtual'}. Como posso ajudá-lo hoje?`,
          sender: 'bot',
          timestamp: new Date()
        }]);
      }

    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro ao carregar chatbot');
    } finally {
      setIsConfigLoading(false);
    }
  }, [chatbotSlug]);  // Gerar system message baseado na configuração
  const generateSystemMessage = (config: ChatbotConfig): string => {
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

    const formalityLevel = config.formality_level ?? defaults.formality_level;
    const useEmojis = config.use_emojis ?? defaults.use_emojis;
    const paragraphSize = config.paragraph_size ?? defaults.paragraph_size;
    const sourceStrictness = config.source_strictness ?? defaults.source_strictness;
    const confidenceThreshold = config.confidence_threshold ?? defaults.confidence_threshold;
    const fallbackAction = config.fallback_action ?? defaults.fallback_action;
    const listStyle = config.list_style ?? defaults.list_style;
    const allowInternetSearch = config.allow_internet_search ?? defaults.allow_internet_search;
    const mandatoryLink = config.mandatory_link ?? defaults.mandatory_link;
    const responseSpeed = config.response_speed ?? defaults.response_speed;
    const nameUsageFrequency = config.name_usage_frequency ?? defaults.name_usage_frequency;
    const askForName = config.ask_for_name ?? defaults.ask_for_name;

    let systemMessage = config.system_instructions ||
      'Você é um assistente virtual profissional e prestativo.';

    systemMessage += '\n\nCONFIGURAÇÕES DE COMPORTAMENTO:\n';

    // Personalidade
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

    // Comportamento
    systemMessage += `- Rigidez nas fontes: ${sourceStrictness}/100 (`;
    if (sourceStrictness >= 80) systemMessage += 'utilize APENAS informações dos documentos fornecidos';
    else if (sourceStrictness >= 50) systemMessage += 'priorize documentos fornecidos, mas pode usar conhecimento geral';
    else systemMessage += 'use conhecimento geral quando necessário';
    systemMessage += ')\n';

    systemMessage += `- Confiança mínima: ${confidenceThreshold}% (só responda se tiver pelo menos ${confidenceThreshold}% de certeza)\n`;

    // Instruções importantes para apresentação
    systemMessage += `\nIMPORTANTE - APRESENTAÇÃO DAS RESPOSTAS:\n`;
    systemMessage += `- NUNCA inclua informações técnicas como "Fonte:", "Similaridade:", porcentagens de similaridade, ou nomes de arquivos nas suas respostas\n`;
    systemMessage += `- NUNCA mostre metadados como "--- Fonte: arquivo.txt (Similaridade: X%) ---"\n`;
    systemMessage += `- Use as informações dos documentos naturalmente, sem revelar de onde vieram\n`;
    systemMessage += `- Responda de forma fluida e natural, como se o conhecimento fosse seu próprio\n`;

    // Informações de contato e contexto
    if (config.office_hours) systemMessage += `\nHorário de atendimento: ${config.office_hours}\n`;
    if (config.office_address) systemMessage += `Endereço: ${config.office_address}\n`;
    if (config.specialties) systemMessage += `Especialidades: ${config.specialties}\n`;
    if (config.whatsapp) systemMessage += `WhatsApp: ${config.whatsapp}\n`;

    return systemMessage;
  };

  // Processar mensagem com IA
  const processMessageWithAI = async (userMessage: string): Promise<string> => {
    if (!config) return 'Erro: Configuração não carregada';

    try {
      // Buscar contexto nos documentos
      const vectorContext = await getChatbotContextForUser(userMessage, 3000, config?.chatbot_user || '');

      // Gerar system message
      const systemMessage = generateSystemMessage(config);

      // Construir contexto da conversa
      let conversationContext = '';
      const recentMessages = messages.slice(-6); // Últimas 6 mensagens para contexto

      if (recentMessages.length > 0) {
        conversationContext = 'HISTÓRICO DA CONVERSA:\n';
        recentMessages.forEach(msg => {
          conversationContext += `${msg.sender === 'user' ? 'Usuário' : 'Assistente'}: ${msg.text}\n`;
        });
        conversationContext += '\n';
      }

      // Construir prompt completo
      let fullPrompt = conversationContext;

      if (vectorContext && vectorContext.trim()) {
        fullPrompt += `INFORMAÇÕES RELEVANTES DOS DOCUMENTOS:\n${vectorContext}\n\n`;
      }

      // Adicionar informações adicionais do chatbot
      if (config.office_hours || config.office_address || config.specialties || config.whatsapp) {
        fullPrompt += 'INFORMAÇÕES ADICIONAIS:\n';
        if (config.office_hours) fullPrompt += `- Horário: ${config.office_hours}\n`;
        if (config.office_address) fullPrompt += `- Endereço: ${config.office_address}\n`;
        if (config.specialties) fullPrompt += `- Especialidades: ${config.specialties}\n`;
        if (config.whatsapp) fullPrompt += `- WhatsApp: ${config.whatsapp}\n`;
        fullPrompt += '\n';
      }

      // Chamar OpenAI
      const response = await generateAIResponse(systemMessage, fullPrompt, userMessage);
      return response;

    } catch (error) {
      console.error('Erro no processamento com IA:', error);
      return getBotResponseLocal(userMessage);
    }
  };

  // Função para chamar OpenAI
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
        model: 'gpt-4o-mini',
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
        temperature: 0.7,
      }),
    }, {
      maxRetries: 3,
      baseDelay: 2000,
      backoffFactor: 2,
      maxDelay: 15000,
      jitter: true,
      retryCondition: (error) => {
        const message = error.message.toLowerCase();
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

  // Resposta local de fallback
  const getBotResponseLocal = (userMessage: string): string => {
    if (!config) return 'Como posso ajudá-lo?';

    const messageLower = userMessage.toLowerCase();

    // Respostas baseadas na configuração
    if (config.chatbot_name && messageLower.includes('nome')) {
      return `Sou ${config.chatbot_name}. ${config.welcome_message || 'Como posso ajudar você hoje?'}`;
    }

    if (config.office_hours && (messageLower.includes('horário') || messageLower.includes('funcionamento'))) {
      return `Nosso horário de atendimento é: ${config.office_hours}`;
    }

    if (config.office_address && messageLower.includes('endereço')) {
      return `Estamos localizados em: ${config.office_address}`;
    }

    if (config.specialties && messageLower.includes('especialidade')) {
      return `Nossas especialidades são: ${config.specialties}`;
    }

    if (config.whatsapp && (messageLower.includes('whatsapp') || messageLower.includes('contato'))) {
      return `Você pode entrar em contato conosco pelo WhatsApp: ${config.whatsapp}`;
    }

    // Respostas gerais
    const responses = [
      `Sou ${config.chatbot_name || 'o assistente virtual'}. Como posso ajudá-lo?`,
      'Estou aqui para ajudar. O que você gostaria de saber?',
      'Tem alguma dúvida? Estou pronto para esclarecê-la!',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponse = await processMessageWithAI(userMessage);

      const newBotMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);

      const errorMessage: Message = {
        id: messages.length + 2,
        text: 'Desculpe, ocorreu um erro. Tente novamente.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Focar novamente no input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Auto scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Carregar configuração ao montar o componente
  useEffect(() => {
    fetchChatbotConfig();
  }, [fetchChatbotConfig]);

  // Scroll para o topo ao inicializar a página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Focar no input quando não está carregando
  useEffect(() => {
    if (!isLoading && !isConfigLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading, isConfigLoading]);

  // Loading inicial
  if (isConfigLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Bot size={48} className="mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-300">Carregando chatbot...</p>
        </div>
      </div>
    );
  }

  // Erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center p-8">
          <Bot size={48} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            Chatbot não encontrado
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bot size={32} className="text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {config?.chatbot_name || 'Assistente Virtual'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Assistente inteligente
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ExternalLink size={16} className="mr-1" />
              FastBot
            </button>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 md:p-4 rounded-2xl ${message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                  >
                    {message.sender === 'bot' && (
                      <div className="flex items-center mb-2">
                        <Bot size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {config?.chatbot_name || 'Assistente'}
                        </span>
                      </div>
                    )}
                    <div
                      className="whitespace-pre-wrap text-sm md:text-base"
                      dangerouslySetInnerHTML={{
                        __html: message.text
                          .replace(/(https?:\/\/[^\s<>\n\r]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline hover:text-blue-200">$1</a>')
                          .replace(/\n\n/g, '<br/><br/>')
                          .replace(/\n/g, '<br/>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      }}
                    />
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 md:p-4 rounded-2xl">
                    <div className="flex items-center">
                      <Bot size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">
                        {config?.chatbot_name || 'Assistente'}
                      </span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Sempre visível */}
          <div className="flex-shrink-0 p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex space-x-2 md:space-x-3">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey && !isLoading) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={isLoading ? "Aguardando resposta..." : "Digite sua mensagem... (Ctrl+Enter para enviar)"}
                disabled={isLoading}
                rows={1}
                className="flex-1 p-2 md:p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[2.5rem] md:min-h-[3rem] max-h-32 text-sm md:text-base"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="px-3 md:px-4 py-2 md:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[2.5rem] md:min-w-[3rem]"
              >
                <Send size={16} className="md:hidden" />
                <Send size={20} className="hidden md:block" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Use Ctrl+Enter para enviar sua mensagem
            </p>
          </div>
        </div>
      </div>

      {/* Footer Personalizado - Oculto no mobile */}
      <div className="hidden md:block bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Informações do Chatbot */}
            <div className="flex items-center space-x-3">
              <Bot size={24} className="text-blue-600 dark:text-blue-400" />
              <div className="text-center md:text-left">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {config?.chatbot_name || 'Assistente Virtual'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Assistente inteligente disponível 24/7
                </p>
              </div>
            </div>

            {/* Informações de Contato (se disponíveis) */}
            {(config?.whatsapp || config?.office_hours || config?.office_address) && (
              <div className="text-center md:text-right">
                {config.whatsapp && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    📱 WhatsApp: {config.whatsapp}
                  </p>
                )}
                {config.office_hours && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    🕐 {config.office_hours}
                  </p>
                )}
                {config.office_address && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    📍 {config.office_address}
                  </p>
                )}
              </div>
            )}

            {/* Link para FastBot */}
            <div className="text-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ExternalLink size={14} className="mr-1" />
                Criado com FastBot
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Crie seu próprio chatbot gratuitamente
              </p>
            </div>
          </div>

          {/* Linha divisória e créditos */}
          <div className="border-t border-gray-200 dark:border-gray-600 mt-4 pt-4">
            <div className="flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <p>
                © 2025 FastBot - Plataforma de criação de chatbots inteligentes
              </p>
              <div className="flex items-center space-x-4 mt-2 md:mt-0">
                <span>Powered by OpenAI</span>
                <span>•</span>
                <span>Hospedado com Supabase</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicChatbotPage;

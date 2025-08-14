/**
 * Hook para gerenciar memória de conversação do chatbot
 * Implementa cache híbrido: Redis (ativo) + Supabase (persistente)
 * Integrado com o chatbot existente do FastBot
 */
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    page?: string;
    sessionId?: string;
    userId?: string;
  };
}

export interface ConversationContext {
  sessionId: string;
  userId: string;
  lastActivity: string;
  messages: ConversationMessage[];
  totalMessages: number;
}

interface UseConversationMemoryProps {
  maxMessages?: number; // Padrão: 10 mensagens (5 user + 5 assistant)
  ttlMinutes?: number;  // Padrão: 30 minutos
  enableRedis?: boolean; // Padrão: true
  enableSupabase?: boolean; // Padrão: true
}

export const useConversationMemory = ({
  maxMessages = 10,
  ttlMinutes = 30,
  enableRedis = true,
  enableSupabase = true
}: UseConversationMemoryProps = {}) => {
  
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gerar sessionId único
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Inicializar nova sessão
  const initializeSession = useCallback(() => {
    if (!user?.id) return null;
    
    const sessionId = generateSessionId();
    setCurrentSession(sessionId);
    
    // 🚨 IMPORTANTE: Não limpar o histórico aqui! 
    // Isso estava causando o problema das mensagens sumindo
    console.log('🆕 [ConversationMemory] Nova sessão iniciada:', sessionId);
    console.log('🆕 [ConversationMemory] Histórico será preservado');
    
    return sessionId;
  }, [user?.id, generateSessionId]);

  // Buscar histórico do Redis (simulado com localStorage)
  const fetchFromRedis = useCallback(async (sessionId: string): Promise<ConversationMessage[]> => {
    if (!enableRedis || !user?.id) return [];

    try {
      // Usar localStorage como simulação do Redis
      const cacheKey = `conversation_${user.id}_${sessionId}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const { data, expiry } = JSON.parse(cached);
        
        // Verificar se não expirou
        if (Date.now() < expiry) {
          console.log('💾 [ConversationMemory] Cache hit no localStorage:', data.length, 'mensagens');
          return data;
        } else {
          // Cache expirado, remover
          localStorage.removeItem(cacheKey);
          console.log('⏰ [ConversationMemory] Cache expirado, removido');
        }
      }
      
      console.log('💾 [ConversationMemory] Cache miss no localStorage');
      return [];
    } catch (error) {
      console.warn('⚠️ [ConversationMemory] Erro ao buscar no localStorage:', error);
      return [];
    }
  }, [enableRedis, user?.id]);

  // Salvar no Redis (simulado com localStorage)
  const saveToRedis = useCallback(async (
    sessionId: string, 
    newMessages: ConversationMessage[]
  ): Promise<void> => {
    if (!enableRedis || !user?.id) return;

    try {
      // Usar localStorage como simulação do Redis
      const cacheKey = `conversation_${user.id}_${sessionId}`;
      
      // Recuperar mensagens existentes
      let existingMessages: ConversationMessage[] = [];
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const { data, expiry } = JSON.parse(cached);
        if (Date.now() < expiry) {
          existingMessages = data || [];
        }
      }
      
      // Adicionar novas mensagens
      const allMessages = [...existingMessages, ...newMessages];
      const trimmedMessages = allMessages.slice(-maxMessages); // Últimas N mensagens
      
      const expiry = Date.now() + (ttlMinutes * 60 * 1000); // TTL em milissegundos
      
      const cacheData = {
        data: trimmedMessages,
        expiry,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('💾 [ConversationMemory] Salvo no localStorage:', trimmedMessages.length, 'mensagens total');
    } catch (error) {
      console.warn('⚠️ [ConversationMemory] Erro ao salvar no localStorage:', error);
    }
  }, [enableRedis, user?.id, maxMessages, ttlMinutes]);

  // Buscar histórico do Supabase
  const fetchFromSupabase = useCallback(async (sessionId: string): Promise<ConversationMessage[]> => {
    if (!enableSupabase || !user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('conversation_history')
        .select('messages, last_activity')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .order('last_activity', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return data?.messages || [];
    } catch (error) {
      console.warn('⚠️ [ConversationMemory] Erro ao buscar do Supabase:', error);
      return [];
    }
  }, [enableSupabase, user?.id]);

  // Salvar no Supabase
  const saveToSupabase = useCallback(async (
    sessionId: string, 
    messages: ConversationMessage[]
  ): Promise<void> => {
    if (!enableSupabase || !user?.id) return;

    try {
      const { error } = await supabase
        .from('conversation_history')
        .upsert({
          user_id: user.id,
          session_id: sessionId,
          messages: messages,
          last_activity: new Date().toISOString()
        }, {
          onConflict: 'user_id,session_id'
        });

      if (error) throw error;

      console.log('🗄️ [ConversationMemory] Salvo no Supabase:', messages.length, 'mensagens');
    } catch (error) {
      console.warn('⚠️ [ConversationMemory] Erro ao salvar no Supabase:', error);
    }
  }, [enableSupabase, user?.id]);

  // Carregar histórico da conversação
  const loadConversation = useCallback(async (sessionId?: string): Promise<ConversationMessage[]> => {
    if (!user?.id) return [];

    const targetSessionId = sessionId || currentSession;
    if (!targetSessionId) return [];

    setIsLoading(true);
    setError(null);

    try {
      // Tentar Redis primeiro (mais rápido)
      let messages = await fetchFromRedis(targetSessionId);
      
      // Se Redis vazio, tentar Supabase
      if (messages.length === 0) {
        messages = await fetchFromSupabase(targetSessionId);
      }

      setConversationHistory(messages);
      console.log('📖 [ConversationMemory] Histórico carregado:', messages.length, 'mensagens');
      return messages;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ [ConversationMemory] Erro ao carregar histórico:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentSession, fetchFromRedis, fetchFromSupabase]);

  // Adicionar nova mensagem
  const addMessage = useCallback(async (
    role: 'user' | 'assistant',
    content: string,
    metadata?: ConversationMessage['metadata']
  ): Promise<void> => {
    if (!user?.id || !currentSession) {
      console.log('🧠 [ConversationMemory] ⚠️ addMessage cancelado - user ou session não disponível');
      return;
    }

    const truncatedContent = content.substring(0, 20) + (content.length > 20 ? '...' : '');
    console.log(`🧠 [ConversationMemory] ✅ ADICIONANDO MENSAGEM: ${role} - "${truncatedContent}"`);

    const newMessage: ConversationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata: {
        userId: user.id,
        sessionId: currentSession,
        ...metadata
      }
    };

    // 🔧 CORREÇÃO: Usar função de estado para garantir que temos o estado mais atual
    setConversationHistory(prevHistory => {
      const updatedMessages = [...prevHistory, newMessage];
      console.log('🧠 [ConversationMemory] Total de mensagens após adicionar:', updatedMessages.length);
      console.log('🧠 [ConversationMemory] Mensagens atuais:', updatedMessages.map(m => `${m.role}: ${m.content.substring(0, 20)}...`));
      
      // Manter apenas últimas N mensagens na memória
      const trimmedMessages = updatedMessages.slice(-maxMessages);
      
      if (updatedMessages.length > maxMessages) {
        console.log(`🧠 [ConversationMemory] 📝 Limitando para ${maxMessages} mensagens recentes (tinha ${updatedMessages.length})`);
        return trimmedMessages;
      }
      
      return updatedMessages;
    });

    // Salvar no localStorage de forma assíncrona
    setTimeout(async () => {
      try {
        await saveToRedis(currentSession, [newMessage]); // Salvar apenas a nova mensagem
        console.log('💬 [ConversationMemory] Mensagem salva no localStorage:', role, content.substring(0, 50) + '...');
        
        // 🆕 ADICIONAR: Salvar também no Supabase para backup persistente
        const allMessages = [...conversationHistory, newMessage];
        await saveToSupabase(currentSession, allMessages);
        console.log('🗄️ [ConversationMemory] Mensagem salva no Supabase:', role);
      } catch (error) {
        console.warn('⚠️ [ConversationMemory] Erro ao salvar mensagem:', error);
      }
    }, 0);

  }, [user?.id, currentSession, maxMessages, saveToRedis, conversationHistory, saveToSupabase]);

  // Obter contexto para o chatbot (últimas N mensagens formatadas)
  const getContextForChatbot = useCallback((): string => {
    console.log('🧠 [ConversationMemory] === GERANDO CONTEXTO PARA CHATBOT ===');
    console.log('🧠 [ConversationMemory] Estado atual conversationHistory:', conversationHistory.length, 'mensagens');
    console.log('🧠 [ConversationMemory] Limite máximo (maxMessages):', maxMessages);
    
    // Log das mensagens no estado atual
    console.log('🧠 [ConversationMemory] 📋 ESTADO ATUAL DA MEMÓRIA:');
    conversationHistory.forEach((msg, i) => {
      console.log(`🧠 [ConversationMemory]   ${i + 1}. ${msg.role}: "${msg.content.substring(0, 30)}..."`);
    });
    
    if (conversationHistory.length === 0) {
      console.log('🧠 [ConversationMemory] ⚠️ NENHUMA MENSAGEM NA MEMÓRIA - Retornando contexto vazio');
      return '';
    }

    const recentMessages = conversationHistory.slice(-maxMessages);
    console.log('🧠 [ConversationMemory] Mensagens recentes selecionadas:', recentMessages.length);
    
    const contextLines = recentMessages.map(msg => 
      `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`
    );

    const fullContext = `Histórico da conversa recente:\n${contextLines.join('\n')}\n\n`;
    
    console.log('🧠 [ConversationMemory] ✅ CONTEXTO GERADO - Tamanho:', fullContext.length, 'caracteres');
    console.log('🧠 [ConversationMemory] Prévia do contexto:', fullContext.substring(0, 150) + '...');
    console.log('🧠 [ConversationMemory] === FIM DA GERAÇÃO DE CONTEXTO ===');
    
    return fullContext;
  }, [conversationHistory, maxMessages]);

  // Limpar sessão atual
  const clearSession = useCallback(async (): Promise<void> => {
    if (!currentSession) return;

    // Salvar estado final no Supabase antes de limpar
    if (conversationHistory.length > 0) {
      await saveToSupabase(currentSession, conversationHistory);
    }

    setCurrentSession(null);
    setConversationHistory([]);
    console.log('🧹 [ConversationMemory] Sessão limpa');
  }, [currentSession, conversationHistory, saveToSupabase]);

  // Obter estatísticas da conversa
  const getConversationStats = useCallback(() => {
    return {
      messageCount: conversationHistory.length,
      userMessages: conversationHistory.filter(m => m.role === 'user').length,
      assistantMessages: conversationHistory.filter(m => m.role === 'assistant').length,
      sessionId: currentSession,
      lastActivity: conversationHistory.length > 0 
        ? conversationHistory[conversationHistory.length - 1].timestamp 
        : null
    };
  }, [conversationHistory, currentSession]);

  // Auto-inicializar sessão quando usuário estiver disponível
  useEffect(() => {
    console.log('🔄 [ConversationMemory] useEffect executado:', {
      userId: user?.id,
      hasCurrentSession: !!currentSession,
      timestamp: new Date().toISOString()
    });
    
    if (user?.id && !currentSession) {
      console.log('🧠 [ConversationMemory] Auto-inicializando nova sessão para usuário:', user.id);
      initializeSession();
    } else if (!user?.id) {
      console.log('🧠 [ConversationMemory] Usuário não disponível, aguardando...');
    } else if (currentSession) {
      console.log('🧠 [ConversationMemory] Sessão já existe:', currentSession);
    }
  }, [user?.id, currentSession, initializeSession]);

  return {
    // Estado
    conversationHistory,
    currentSession,
    isLoading,
    error,

    // Ações
    initializeSession,
    loadConversation,
    addMessage,
    clearSession,

    // Utilidades
    getContextForChatbot,
    getConversationStats,

    // Configurações
    maxMessages,
    ttlMinutes
  };
};

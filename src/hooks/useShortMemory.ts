import { useState, useCallback, useEffect } from 'react';
import { loggers } from '@/lib/utils/logger';

// Interface para Short-Memory
export interface ShortMemoryMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  userId?: string;
}

export interface ShortMemoryStats {
  totalMessages: number;
  lastUpdate: Date | null;
  memorySize: number;
}

/**
 * Hook personalizado para gerenciar a Short-Memory do LocalStorage
 * 
 * Funcionalidades:
 * - Carrega automaticamente dados do LocalStorage
 * - Adiciona mensagens à memória
 * - Limpa a memória
 * - Gera contexto para o chatbot
 * - Mantém estatísticas atualizadas
 * - Limita a 50 mensagens por usuário
 * 
 * @param userId - ID do usuário (opcional, se não fornecido usa uma chave padrão)
 */
export const useShortMemory = (userId?: string) => {
  // Logger centralizado para este hook
  const logger = loggers.shortMemory;

  const [shortMemoryData, setShortMemoryData] = useState<ShortMemoryMessage[]>([]);
  const [shortMemoryStats, setShortMemoryStats] = useState<ShortMemoryStats>({
    totalMessages: 0,
    lastUpdate: null,
    memorySize: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Gera a chave única do LocalStorage baseada no usuário
  const getShortMemoryKey = useCallback(() => {
    return userId ? `chatbot_short_memory_${userId}` : 'chatbot_short_memory_default';
  }, [userId]);

  // Carrega dados da Short-Memory do LocalStorage
  const loadShortMemoryData = useCallback(async () => {
    try {
      setIsLoading(true);
      const memoryKey = getShortMemoryKey();
      
      logger.debug('===== CARREGANDO DADOS DA SHORT-MEMORY =====');
      logger.debug('Chave do LocalStorage:', { key: memoryKey });
      
      const storedData = localStorage.getItem(memoryKey);
      
      logger.debug('Dados brutos do localStorage:', { 
        hasData: !!storedData,
        preview: storedData ? storedData.substring(0, 200) + '...' : 'null' 
      });
      
      if (storedData) {
        const parsedData: ShortMemoryMessage[] = JSON.parse(storedData);
        
        logger.debug('Dados parseados:', { messageCount: parsedData.length });
        parsedData.forEach((msg, i) => {
          logger.debug(`Mensagem ${i + 1}: ${msg.role} - "${msg.content.substring(0, 30)}..."`);
        });
        
        setShortMemoryData(parsedData);
        
        // Calcular estatísticas
        const memorySize = new Blob([storedData]).size;
        const lastMessage = parsedData[parsedData.length - 1];
        
        setShortMemoryStats({
          totalMessages: parsedData.length,
          lastUpdate: lastMessage ? new Date(lastMessage.timestamp) : null,
          memorySize
        });
        
        logger.info('Dados carregados:', {
          messages: parsedData.length,
          size: `${(memorySize / 1024).toFixed(2)} KB`,
          lastUpdate: lastMessage?.timestamp,
          userKey: memoryKey
        });
      } else {
        // Nenhum dado encontrado
        setShortMemoryData([]);
        setShortMemoryStats({
          totalMessages: 0,
          lastUpdate: null,
          memorySize: 0
        });
        logger.debug('Nenhum dado encontrado para:', { key: getShortMemoryKey() });
      }
      
      logger.debug('===== FIM DO CARREGAMENTO =====');
    } catch (error) {
      logger.error('Erro ao carregar dados:', error);
      setShortMemoryData([]);
      setShortMemoryStats({
        totalMessages: 0,
        lastUpdate: null,
        memorySize: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, [getShortMemoryKey, logger]);

  // Limpa completamente a Short-Memory
  const clearShortMemory = useCallback(async () => {
    try {
      const memoryKey = getShortMemoryKey();
      localStorage.removeItem(memoryKey);
      setShortMemoryData([]);
      setShortMemoryStats({
        totalMessages: 0,
        lastUpdate: null,
        memorySize: 0
      });
      console.log('🗑️ [useShortMemory] Memória limpa com sucesso para:', memoryKey);
      return true;
    } catch (error) {
      console.error('❌ [useShortMemory] Erro ao limpar memória:', error);
      return false;
    }
  }, [getShortMemoryKey]);

  // Gera contexto formatado para enviar ao chatbot
  const getShortMemoryContext = useCallback(() => {
    if (shortMemoryData.length === 0) {
      console.log('📋 [useShortMemory] Nenhum contexto disponível');
      return '';
    }
    
    // Pegar as últimas 10 mensagens para contexto
    const recentMessages = shortMemoryData.slice(-10);
    
    let context = 'CONTEXTO DA CONVERSA ANTERIOR:\n';
    recentMessages.forEach((msg, index) => {
      const role = msg.role === 'user' ? 'USUÁRIO' : 'ASSISTENTE';
      const timestamp = new Date(msg.timestamp).toLocaleString('pt-BR');
      context += `${index + 1}. [${timestamp}] ${role}: ${msg.content}\n`;
    });
    context += '\n--- FIM DO CONTEXTO ---\n\n';
    
    console.log('📋 [useShortMemory] Contexto gerado:', {
      messagesUsed: recentMessages.length,
      contextLength: context.length,
      preview: context.substring(0, 100) + '...'
    });
    
    return context;
  }, [shortMemoryData]);

  // Adiciona nova mensagem à Short-Memory
  const addToShortMemory = useCallback(async (role: 'user' | 'assistant', content: string) => {
    try {
      logger.debug('===== ADICIONANDO MENSAGEM À SHORT-MEMORY =====');
      logger.debug('Parâmetros:', {
        role,
        contentLength: content.length,
        contentPreview: content.substring(0, 50) + '...',
        userId
      });

      const newMessage: ShortMemoryMessage = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role,
        content: content.trim(),
        timestamp: new Date().toISOString(),
        userId: userId
      };

      logger.debug('Nova mensagem criada:', { messageId: newMessage.id, role, timestamp: newMessage.timestamp });

      const memoryKey = getShortMemoryKey();
      
      // CORREÇÃO: Ler dados atuais do localStorage em vez do estado (que pode estar desatualizado)
      const currentStoredData = localStorage.getItem(memoryKey);
      const currentData = currentStoredData ? JSON.parse(currentStoredData) : [];
      
      logger.debug('Estado atual:', { 
        currentDataLength: currentData.length,
        memoryKey 
      });
      
      const updatedData = [...currentData, newMessage];
      
      logger.debug('Após adicionar:', { updatedDataLength: updatedData.length });
      
      // Manter apenas as últimas 50 mensagens para evitar overflow
      const trimmedData = updatedData.slice(-50);
      
      logger.debug('Após trim:', { trimmedDataLength: trimmedData.length });
      
      // Salvar no LocalStorage
      const dataToStore = JSON.stringify(trimmedData);
      localStorage.setItem(memoryKey, dataToStore);
      
      logger.debug('Dados salvos:', { 
        key: memoryKey,
        dataSize: `${(new Blob([dataToStore]).size / 1024).toFixed(2)} KB`
      });
      
      // Atualizar estado local
      setShortMemoryData(trimmedData);
      
      // Atualizar estatísticas
      const memorySize = new Blob([dataToStore]).size;
      setShortMemoryStats({
        totalMessages: trimmedData.length,
        lastUpdate: new Date(),
        memorySize
      });
      
      logger.info('Mensagem adicionada com sucesso:', {
        role,
        totalMessages: trimmedData.length,
        memorySize: `${(memorySize / 1024).toFixed(2)} KB`,
        messageId: newMessage.id
      });
      
      logger.debug('===== FIM DA ADIÇÃO À SHORT-MEMORY =====');
      
      return newMessage;
    } catch (error) {
      logger.error('Erro ao adicionar mensagem:', error);
      return null;
    }
  }, [getShortMemoryKey, userId, logger]);

  // Carrega dados automaticamente quando o usuário muda
  useEffect(() => {
    if (userId) {
      loadShortMemoryData();
    }
  }, [userId, loadShortMemoryData]);

  return {
    // Dados
    shortMemoryData,
    shortMemoryStats,
    isLoading,
    
    // Funções
    loadShortMemoryData,
    clearShortMemory,
    addToShortMemory,
    getShortMemoryContext,
    getShortMemoryKey,
    
    // Estado útil
    hasMessages: shortMemoryData.length > 0,
    isEmpty: shortMemoryData.length === 0
  };
};

export default useShortMemory;

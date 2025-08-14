import { useState, useCallback, useEffect } from 'react';

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
      
      console.log('🔄 [useShortMemory] ===== CARREGANDO DADOS DA SHORT-MEMORY =====');
      console.log('🔄 [useShortMemory] Chave do LocalStorage:', memoryKey);
      
      const storedData = localStorage.getItem(memoryKey);
      
      console.log('🔄 [useShortMemory] Dados brutos do localStorage:', storedData ? storedData.substring(0, 200) + '...' : 'null');
      
      if (storedData) {
        const parsedData: ShortMemoryMessage[] = JSON.parse(storedData);
        
        console.log('🔄 [useShortMemory] Dados parseados:', parsedData.length, 'mensagens');
        parsedData.forEach((msg, i) => {
          console.log(`🔄 [useShortMemory] Mensagem ${i + 1}: ${msg.role} - "${msg.content.substring(0, 30)}..."`);
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
        
        console.log('📋 [useShortMemory] Dados carregados:', {
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
        console.log('📋 [useShortMemory] Nenhum dado encontrado para:', getShortMemoryKey());
      }
      
      console.log('🔄 [useShortMemory] ===== FIM DO CARREGAMENTO =====');
    } catch (error) {
      console.error('❌ [useShortMemory] Erro ao carregar dados:', error);
      setShortMemoryData([]);
      setShortMemoryStats({
        totalMessages: 0,
        lastUpdate: null,
        memorySize: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, [getShortMemoryKey]);

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
      console.log('🔧 [useShortMemory] ===== ADICIONANDO MENSAGEM À SHORT-MEMORY =====');
      console.log('🔧 [useShortMemory] Role:', role);
      console.log('🔧 [useShortMemory] Content:', content.substring(0, 50) + '...');
      console.log('🔧 [useShortMemory] UserId:', userId);

      const newMessage: ShortMemoryMessage = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role,
        content: content.trim(),
        timestamp: new Date().toISOString(),
        userId: userId
      };

      console.log('🔧 [useShortMemory] Nova mensagem criada:', newMessage);

      const memoryKey = getShortMemoryKey();
      
      // CORREÇÃO: Ler dados atuais do localStorage em vez do estado (que pode estar desatualizado)
      const currentStoredData = localStorage.getItem(memoryKey);
      const currentData = currentStoredData ? JSON.parse(currentStoredData) : [];
      
      console.log('🔧 [useShortMemory] Dados atuais do localStorage:', currentData.length);
      
      const updatedData = [...currentData, newMessage];
      
      console.log('🔧 [useShortMemory] Dados depois de adicionar:', updatedData.length);
      
      // Manter apenas as últimas 50 mensagens para evitar overflow
      const trimmedData = updatedData.slice(-50);
      
      console.log('🔧 [useShortMemory] Dados após trim:', trimmedData.length);
      
      // Salvar no LocalStorage
      const dataToStore = JSON.stringify(trimmedData);
      localStorage.setItem(memoryKey, dataToStore);
      
      console.log('🔧 [useShortMemory] Dados salvos no localStorage com chave:', memoryKey);
      console.log('🔧 [useShortMemory] Dados salvos (preview):', dataToStore.substring(0, 100) + '...');
      
      // Atualizar estado local
      setShortMemoryData(trimmedData);
      
      console.log('🔧 [useShortMemory] Estado local atualizado');
      
      // Atualizar estatísticas
      const memorySize = new Blob([dataToStore]).size;
      setShortMemoryStats({
        totalMessages: trimmedData.length,
        lastUpdate: new Date(),
        memorySize
      });
      
      console.log('➕ [useShortMemory] Mensagem adicionada com sucesso:', {
        role,
        contentLength: content.length,
        totalMessages: trimmedData.length,
        memorySize: `${(memorySize / 1024).toFixed(2)} KB`,
        messageId: newMessage.id
      });
      
      console.log('🔧 [useShortMemory] ===== FIM DA ADIÇÃO À SHORT-MEMORY =====');
      
      return newMessage;
    } catch (error) {
      console.error('❌ [useShortMemory] Erro ao adicionar mensagem:', error);
      return null;
    }
  }, [getShortMemoryKey, userId]); // Removida dependência de shortMemoryData

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

/**
 * ==================================
 * ShortMemoryExporter
 * ==================================
 * 
 * Utilitário para exportar funções da Short-Memory para uso em outros componentes
 * que não são React (como N8N workflows ou scripts externos).
 * 
 * Este módulo oferece uma interface simples para:
 * - Acessar o contexto da short-memory de qualquer usuário
 * - Adicionar mensagens programaticamente
 * - Limpar a memória quando necessário
 * 
 * Uso em N8N ou scripts externos:
 * 
 * ```javascript
 * import { 
 *   getShortMemoryForUser, 
 *   addMessageToShortMemory,
 *   clearShortMemoryForUser 
 * } from './utils/shortMemoryExporter';
 * 
 * // Obter contexto para incluir no prompt do chatbot
 * const context = getShortMemoryForUser(userId);
 * 
 * // Adicionar resposta do N8N à memória
 * addMessageToShortMemory(userId, 'assistant', responseText);
 * ```
 */

import type { ShortMemoryMessage } from '@/hooks/useShortMemory';

/**
 * Gera a chave do LocalStorage para um usuário específico
 */
export const getShortMemoryKeyForUser = (userId?: string): string => {
  return userId ? `chatbot_short_memory_${userId}` : 'chatbot_short_memory_default';
};

/**
 * Obtém dados da Short-Memory para um usuário específico
 */
export const getShortMemoryDataForUser = (userId?: string): ShortMemoryMessage[] => {
  try {
    const memoryKey = getShortMemoryKeyForUser(userId);
    const storedData = localStorage.getItem(memoryKey);
    
    if (storedData) {
      return JSON.parse(storedData) as ShortMemoryMessage[];
    }
    
    return [];
  } catch (error) {
    console.error('❌ [ShortMemoryExporter] Erro ao obter dados:', error);
    return [];
  }
};

/**
 * Gera contexto formatado da Short-Memory para incluir no prompt do chatbot
 */
export const getShortMemoryContextForUser = (userId?: string, maxMessages: number = 10): string => {
  try {
    const messages = getShortMemoryDataForUser(userId);
    
    if (messages.length === 0) {
      return '';
    }
    
    // Pegar as últimas mensagens
    const recentMessages = messages.slice(-maxMessages);
    
    let context = 'CONTEXTO DA CONVERSA ANTERIOR (SHORT-MEMORY):\n';
    recentMessages.forEach((msg, index) => {
      const role = msg.role === 'user' ? 'USUÁRIO' : 'ASSISTENTE';
      const timestamp = new Date(msg.timestamp).toLocaleString('pt-BR');
      context += `${index + 1}. [${timestamp}] ${role}: ${msg.content}\n`;
    });
    context += '\n--- FIM DO CONTEXTO SHORT-MEMORY ---\n\n';
    
    console.log('📋 [ShortMemoryExporter] Contexto gerado para usuário:', {
      userId: userId || 'default',
      messagesUsed: recentMessages.length,
      contextLength: context.length
    });
    
    return context;
  } catch (error) {
    console.error('❌ [ShortMemoryExporter] Erro ao gerar contexto:', error);
    return '';
  }
};

/**
 * Adiciona uma mensagem à Short-Memory de um usuário específico
 */
export const addMessageToShortMemory = (
  userId: string | undefined, 
  role: 'user' | 'assistant', 
  content: string
): boolean => {
  try {
    const newMessage: ShortMemoryMessage = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      userId
    };

    const memoryKey = getShortMemoryKeyForUser(userId);
    const currentData = getShortMemoryDataForUser(userId);
    const updatedData = [...currentData, newMessage];
    
    // Manter apenas as últimas 50 mensagens
    const trimmedData = updatedData.slice(-50);
    
    localStorage.setItem(memoryKey, JSON.stringify(trimmedData));
    
    console.log('➕ [ShortMemoryExporter] Mensagem adicionada:', {
      userId: userId || 'default',
      role,
      contentLength: content.length,
      totalMessages: trimmedData.length,
      messageId: newMessage.id
    });
    
    return true;
  } catch (error) {
    console.error('❌ [ShortMemoryExporter] Erro ao adicionar mensagem:', error);
    return false;
  }
};

/**
 * Limpa a Short-Memory de um usuário específico
 */
export const clearShortMemoryForUser = (userId?: string): boolean => {
  try {
    const memoryKey = getShortMemoryKeyForUser(userId);
    localStorage.removeItem(memoryKey);
    
    console.log('🗑️ [ShortMemoryExporter] Memória limpa para usuário:', userId || 'default');
    return true;
  } catch (error) {
    console.error('❌ [ShortMemoryExporter] Erro ao limpar memória:', error);
    return false;
  }
};

/**
 * Obtém estatísticas da Short-Memory de um usuário
 */
export const getShortMemoryStatsForUser = (userId?: string) => {
  try {
    const messages = getShortMemoryDataForUser(userId);
    const memoryKey = getShortMemoryKeyForUser(userId);
    const storedData = localStorage.getItem(memoryKey);
    
    const stats = {
      totalMessages: messages.length,
      lastUpdate: messages.length > 0 ? new Date(messages[messages.length - 1].timestamp) : null,
      memorySize: storedData ? new Blob([storedData]).size : 0,
      userId: userId || 'default',
      memoryKey
    };
    
    return stats;
  } catch (error) {
    console.error('❌ [ShortMemoryExporter] Erro ao obter estatísticas:', error);
    return {
      totalMessages: 0,
      lastUpdate: null,
      memorySize: 0,
      userId: userId || 'default',
      memoryKey: getShortMemoryKeyForUser(userId)
    };
  }
};

/**
 * Utilitário para debug - lista todas as short-memories no localStorage
 */
export const listAllShortMemories = (): Array<{userId: string, messageCount: number, lastUpdate: Date | null}> => {
  try {
    const allMemories: Array<{userId: string, messageCount: number, lastUpdate: Date | null}> = [];
    
    // Iterar por todas as chaves do localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('chatbot_short_memory_')) {
        const userId = key.replace('chatbot_short_memory_', '');
        const stats = getShortMemoryStatsForUser(userId === 'default' ? undefined : userId);
        
        allMemories.push({
          userId,
          messageCount: stats.totalMessages,
          lastUpdate: stats.lastUpdate
        });
      }
    }
    
    return allMemories;
  } catch (error) {
    console.error('❌ [ShortMemoryExporter] Erro ao listar memórias:', error);
    return [];
  }
};

// Export para uso em N8N ou workflows externos
export const ShortMemoryAPI = {
  getContext: getShortMemoryContextForUser,
  addMessage: addMessageToShortMemory,
  clearMemory: clearShortMemoryForUser,
  getStats: getShortMemoryStatsForUser,
  listAll: listAllShortMemories
};

export default ShortMemoryAPI;

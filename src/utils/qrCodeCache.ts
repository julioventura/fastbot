/**
 * Utilitários para gerenciamento de cache do QR-Code
 * 
 * Este arquivo centraliza as funções de cache do QR-Code para reutilização
 * em diferentes componentes do sistema.
 */

/**
 * Cria um slug a partir do nome do chatbot
 */
export const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD') // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (acentos)
    .replace(/ç/g, 'c') // Substituir ç por c
    .replace(/Ç/g, 'c') // Substituir Ç por c
    .replace(/[^a-z0-9]/g, '') // Remover tudo que não for letra ou número
    .trim();
};

/**
 * Gera a chave de cache para o QR-Code baseada no nome do chatbot
 */
export const getQRCodeCacheKey = (chatbotName: string): string => {
  const slug = createSlug(chatbotName);
  return `qrcode_cache_${slug}`;
};

/**
 * Obtém o QR-Code do cache localStorage
 */
export const getQRCodeFromCache = (chatbotName: string): string | null => {
  try {
    const cacheKey = getQRCodeCacheKey(chatbotName);
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      // Verificar se o cache não expirou (24 horas)
      const isExpired = Date.now() - parsedData.timestamp > 24 * 60 * 60 * 1000;
      if (!isExpired && parsedData.dataUrl) {
        console.log('QR-Code carregado do cache:', cacheKey);
        return parsedData.dataUrl;
      } else if (isExpired) {
        // Remove cache expirado
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.error('Erro ao acessar cache do QR-Code:', error);
  }
  return null;
};

/**
 * Salva o QR-Code no cache localStorage
 */
export const saveQRCodeToCache = (chatbotName: string, dataUrl: string): void => {
  try {
    const cacheKey = getQRCodeCacheKey(chatbotName);
    const cacheData = {
      dataUrl,
      timestamp: Date.now(),
      chatbotName
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log('QR-Code salvo no cache:', cacheKey);
  } catch (error) {
    console.error('Erro ao salvar QR-Code no cache:', error);
  }
};

/**
 * Limpa o cache do QR-Code
 * @param chatbotName - Nome específico do chatbot ou undefined para limpar todos
 * @param oldChatbotName - Nome anterior do chatbot (para limpar cache antigo)
 */
export const clearQRCodeCache = (chatbotName?: string, oldChatbotName?: string): void => {
  try {
    const keysToRemove: string[] = [];

    if (chatbotName) {
      // Remove cache específico do nome atual
      keysToRemove.push(getQRCodeCacheKey(chatbotName));
    }

    if (oldChatbotName && oldChatbotName !== chatbotName) {
      // Remove cache do nome anterior se diferente
      keysToRemove.push(getQRCodeCacheKey(oldChatbotName));
    }

    if (!chatbotName && !oldChatbotName) {
      // Remove todos os caches de QR-Code (cleanup geral)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('qrcode_cache_')) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('Cache do QR-Code removido:', key);
    });

    if (keysToRemove.length === 0) {
      console.log('Nenhum cache de QR-Code encontrado para remoção');
    }
  } catch (error) {
    console.error('Erro ao limpar cache do QR-Code:', error);
  }
};

/**
 * Função específica para ser chamada quando o nome do chatbot é salvo
 * Limpa o cache antigo e prepara para o novo
 */
export const onChatbotNameSaved = (newName: string, oldName?: string): void => {
  console.log('Nome do chatbot salvo - limpando cache do QR-Code...');
  
  // Limpa cache do nome antigo se existir
  if (oldName && oldName !== newName) {
    clearQRCodeCache(undefined, oldName);
  }
  
  // Também limpa cache do nome atual para forçar regeneração
  clearQRCodeCache(newName);
  
  console.log('Cache do QR-Code limpo após salvar nome do chatbot');
};

/**
 * Utilitário para verificar se existe cache válido
 */
export const hasValidQRCodeCache = (chatbotName: string): boolean => {
  return getQRCodeFromCache(chatbotName) !== null;
};

/**
 * Função para obter estatísticas do cache
 */
export const getQRCodeCacheStats = (): { totalCaches: number; keys: string[] } => {
  const keys: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('qrcode_cache_')) {
      keys.push(key);
    }
  }
  
  return {
    totalCaches: keys.length,
    keys
  };
};

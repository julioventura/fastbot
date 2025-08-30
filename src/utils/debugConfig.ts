// Configuração centralizada de logs para desenvolvimento
export const DEBUG_CONFIG = {
  // Logs apenas em modo desenvolvimento
  ENABLED: import.meta.env.DEV,
  
  // Categorias específicas de debug
  CHATBOT_INIT: false,          // Logs de inicialização do chatbot
  DOCUMENT_LOAD: false,         // Logs de carregamento de documentos
  PREVIEW_DEBUG: false,         // Logs de debug do preview
  SCROLL_DEBUG: false,          // Logs de debug do scroll
  WEBHOOK_VERBOSE: false,       // Logs verbosos do webhook
};

// Função helper para logs condicionais
export const debugLog = (category: keyof typeof DEBUG_CONFIG, message: string, ...args: unknown[]) => {
  if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG[category]) {
    console.log(message, ...args);
  }
};

// Função para logs de erro (sempre ativo)
export const errorLog = (message: string, ...args: unknown[]) => {
  console.error(message, ...args);
};

// Função para logs importantes (sempre ativo em produção)
export const infoLog = (message: string, ...args: unknown[]) => {
  console.log(message, ...args);
};

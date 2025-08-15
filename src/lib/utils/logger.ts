/**
 * Sistema de Logging Centralizado e Condicional
 * 
 * Funcionalidades:
 * - Logging condicional baseado no ambiente (DEV/PROD)
 * - Níveis de log configuráveis
 * - Formatação consistente com contexto
 * - Performance otimizada para produção
 */

// Tipos de log disponíveis
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Configuração do logger baseada no ambiente
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Configurações por ambiente
const logConfig = {
  development: {
    enabledLevels: ['debug', 'info', 'warn', 'error'] as LogLevel[],
    enableTimestamp: true,
    enableContext: true,
    enableEmojis: true
  },
  production: {
    enabledLevels: ['warn', 'error'] as LogLevel[], // Apenas logs importantes
    enableTimestamp: false,
    enableContext: false,
    enableEmojis: false
  }
};

const currentConfig = isDevelopment ? logConfig.development : logConfig.production;

// Interface para métodos de log
interface LoggerMethods {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

/**
 * Cria um logger contextualizado
 * @param context - Contexto do logger (ex: 'MyChatbot', 'useShortMemory')
 * @returns Objeto com métodos de log configurados
 */
export const createLogger = (context: string): LoggerMethods => {
  const formatMessage = (level: LogLevel, message: string): string => {
    let formattedMessage = '';
    
    // Adicionar emoji baseado no nível (apenas em dev)
    if (currentConfig.enableEmojis) {
      const emojis = {
        debug: '🔧',
        info: '📋',
        warn: '⚠️',
        error: '❌'
      };
      formattedMessage += `${emojis[level]} `;
    }
    
    // Adicionar contexto
    if (currentConfig.enableContext) {
      formattedMessage += `[${context}] `;
    }
    
    // Adicionar timestamp
    if (currentConfig.enableTimestamp) {
      const timestamp = new Date().toISOString().slice(11, 23); // HH:mm:ss.SSS
      formattedMessage += `${timestamp} `;
    }
    
    formattedMessage += message;
    
    return formattedMessage;
  };

  const createLogMethod = (level: LogLevel) => {
    return (message: string, data?: unknown) => {
      // Verificar se o nível está habilitado
      if (!currentConfig.enabledLevels.includes(level)) {
        return; // Não fazer nada se o nível não estiver habilitado
      }

      const formattedMessage = formatMessage(level, message);
      
      // Escolher método console apropriado
      const consoleMethod = console[level] || console.log;
      
      if (data !== undefined) {
        consoleMethod(formattedMessage, data);
      } else {
        consoleMethod(formattedMessage);
      }
    };
  };

  return {
    debug: createLogMethod('debug'),
    info: createLogMethod('info'),
    warn: createLogMethod('warn'),
    error: createLogMethod('error')
  };
};

// Logger padrão para uso geral
export const logger = createLogger('App');

// Verificar configuração atual (útil para debugging)
export const getLoggerConfig = () => ({
  environment: isDevelopment ? 'development' : 'production',
  config: currentConfig
});

// Utilitários para logs específicos
export const loggers = {
  auth: createLogger('Auth'),
  chatbot: createLogger('MyChatbot'),
  shortMemory: createLogger('useShortMemory'),
  conversationMemory: createLogger('ConversationMemory'),
  vectorStore: createLogger('VectorStore'),
  documentUpload: createLogger('DocumentUpload')
};

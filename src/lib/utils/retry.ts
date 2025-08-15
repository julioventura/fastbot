/**
 * Sistema de Retry Logic Inteligente
 * 
 * Implementa padrões de robustez para operações críticas:
 * - Exponential backoff com jitter
 * - Retry seletivo baseado no tipo de erro
 * - Configuração otimizada por tipo de operação
 * - Logging integrado para monitoramento
 */

import { loggers } from './logger';

const logger = loggers.auth; // Usar logger genérico

// Tipos de erro que justificam retry
export enum RetryableErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  SERVER_ERROR = 'server_error',
  TEMPORARY = 'temporary'
}

// Configurações de retry por tipo de operação
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  backoffFactor: number;
  maxDelay: number;
  jitter: boolean;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

// Configurações pré-definidas para diferentes cenários
export const RETRY_CONFIGS = {
  // Operações críticas (auth, config)
  CRITICAL: {
    maxRetries: 3,
    baseDelay: 1000,
    backoffFactor: 2,
    maxDelay: 8000,
    jitter: true
  } as RetryConfig,

  // APIs externas (N8N, OpenAI)
  EXTERNAL_API: {
    maxRetries: 4,
    baseDelay: 1500,
    backoffFactor: 2,
    maxDelay: 15000,
    jitter: true
  } as RetryConfig,

  // Operações de dados (Supabase)
  DATABASE: {
    maxRetries: 3,
    baseDelay: 800,
    backoffFactor: 1.8,
    maxDelay: 6000,
    jitter: true
  } as RetryConfig,

  // Operações rápidas (cache, localStorage)
  FAST: {
    maxRetries: 2,
    baseDelay: 500,
    backoffFactor: 2,
    maxDelay: 2000,
    jitter: false
  } as RetryConfig
};

/**
 * Determina se um erro é temporário e justifica retry
 */
export const isRetryableError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();

  // Erros de rede
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    errorName.includes('networkerror')
  ) {
    return true;
  }

  // Erros HTTP temporários
  if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
    return true;
  }

  // Rate limiting
  if (message.includes('429') || message.includes('rate limit')) {
    return true;
  }

  // Supabase erros temporários
  if (message.includes('pgrst') && !message.includes('pgrst116')) { // PGRST116 = no rows found (não retry)
    return true;
  }

  // OpenAI erros temporários
  if (message.includes('openai') && (message.includes('timeout') || message.includes('overloaded'))) {
    return true;
  }

  return false;
};

/**
 * Calcula delay com exponential backoff e jitter opcional
 */
const calculateDelay = (
  attempt: number, 
  baseDelay: number, 
  backoffFactor: number, 
  maxDelay: number, 
  useJitter: boolean
): number => {
  const exponentialDelay = baseDelay * Math.pow(backoffFactor, attempt - 1);
  const delay = Math.min(exponentialDelay, maxDelay);
  
  if (useJitter) {
    // Adicionar jitter ±25% para evitar thundering herd
    const jitterRange = delay * 0.25;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;
    return Math.max(100, delay + jitter); // Mínimo 100ms
  }
  
  return delay;
};

/**
 * Executa operação com retry logic inteligente
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  operationName = 'Unknown Operation'
): Promise<T> => {
  const finalConfig: RetryConfig = {
    ...RETRY_CONFIGS.CRITICAL, // Default
    ...config
  };

  const {
    maxRetries,
    baseDelay,
    backoffFactor,
    maxDelay,
    jitter,
    retryCondition = isRetryableError,
    onRetry
  } = finalConfig;

  let lastError: Error;
  const startTime = Date.now();

  logger.debug(`Iniciando operação com retry: ${operationName}`, {
    maxRetries,
    baseDelay,
    backoffFactor
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      
      // Log sucesso (especialmente se teve retries)
      if (attempt > 1) {
        const totalTime = Date.now() - startTime;
        logger.info(`Operação bem-sucedida após ${attempt} tentativas: ${operationName}`, {
          attempt,
          totalTime: `${totalTime}ms`
        });
      } else {
        logger.debug(`Operação bem-sucedida na primeira tentativa: ${operationName}`);
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      
      logger.debug(`Tentativa ${attempt} falhou: ${operationName}`, {
        error: lastError.message,
        attempt,
        maxRetries
      });

      // Verificar se deve tentar novamente
      const shouldRetry = attempt < maxRetries && retryCondition(lastError);
      
      if (!shouldRetry) {
        const totalTime = Date.now() - startTime;
        
        if (attempt === maxRetries) {
          logger.warn(`Todas as tentativas esgotadas: ${operationName}`, {
            attempts: attempt,
            totalTime: `${totalTime}ms`,
            finalError: lastError.message
          });
        } else {
          logger.info(`Erro não retryable, parando tentativas: ${operationName}`, {
            error: lastError.message,
            reason: 'Non-retryable error'
          });
        }
        
        throw lastError;
      }

      // Calcular delay para próxima tentativa
      const delay = calculateDelay(attempt, baseDelay, backoffFactor, maxDelay, jitter);
      
      logger.debug(`Aguardando ${delay}ms antes da próxima tentativa: ${operationName}`, {
        nextAttempt: attempt + 1,
        delay: `${delay}ms`
      });

      // Callback customizado
      if (onRetry) {
        onRetry(lastError, attempt);
      }

      // Aguardar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

/**
 * Variações específicas para diferentes tipos de operação
 */
export const retryOperations = {
  // Para operações críticas (auth, config principal)
  critical: <T>(operation: () => Promise<T>, name?: string) =>
    withRetry(operation, RETRY_CONFIGS.CRITICAL, name || 'Critical Operation'),

  // Para APIs externas (N8N, OpenAI)
  externalAPI: <T>(operation: () => Promise<T>, name?: string) =>
    withRetry(operation, RETRY_CONFIGS.EXTERNAL_API, name || 'External API'),

  // Para operações de banco de dados
  database: <T>(operation: () => Promise<T>, name?: string) =>
    withRetry(operation, RETRY_CONFIGS.DATABASE, name || 'Database Operation'),

  // Para operações rápidas
  fast: <T>(operation: () => Promise<T>, name?: string) =>
    withRetry(operation, RETRY_CONFIGS.FAST, name || 'Fast Operation')
};

/**
 * Wrapper específico para fetch com retry inteligente
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  config: Partial<RetryConfig> = {}
): Promise<Response> => {
  return withRetry(
    async () => {
      const response = await fetch(url, options);
      
      // Considerar códigos de status específicos como erro retryable
      if (!response.ok) {
        const status = response.status;
        const isRetryableStatus = status >= 500 || status === 429 || status === 408;
        
        if (isRetryableStatus) {
          throw new Error(`HTTP ${status}: ${response.statusText}`);
        } else {
          // Erro não retryable (4xx exceto 429 e 408)
          throw new Error(`HTTP ${status}: ${response.statusText} (non-retryable)`);
        }
      }
      
      return response;
    },
    config,
    `Fetch ${url}`
  );
};

// Tipos úteis já exportados acima
// export type { RetryConfig };
// export { RetryableErrorType };

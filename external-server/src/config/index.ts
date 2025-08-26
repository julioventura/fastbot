import 'dotenv/config';

export const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o-mini', // Modelo mais eficiente para webhooks
    maxTokens: 500,
    temperature: 0.7,
  },
  
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },
  
  // Segurança
  security: {
    apiKey: process.env.API_KEY || '',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  },
  
  // Logs
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100, // máximo 100 requests por window
  }
};

// Validação de configurações críticas
export function validateConfig() {
  const required = [
    { key: 'OPENAI_API_KEY', value: config.openai.apiKey },
    { key: 'SUPABASE_URL', value: config.supabase.url },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', value: config.supabase.serviceRoleKey },
  ];
  
  const missing = required.filter(({ value }) => !value);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.map(({ key }) => key).join(', ')}`
    );
  }
  
  return true;
}

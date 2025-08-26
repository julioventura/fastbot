import { CorsOptions } from 'cors';
import { config } from './index';

export const corsConfig: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requests sem origin (ex: mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    // Se * está nas origins permitidas, permitir tudo (desenvolvimento)
    if (config.security.allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Verificar se a origin está na lista permitida
    if (config.security.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Bloquear origin não autorizada
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'Cache-Control'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
  maxAge: 86400 // 24 horas
};

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import type { ApiError } from '../types/index';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log do erro
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Determinar status code
  let statusCode = 500;
  let message = 'Internal server error';

  // Tratar tipos específicos de erro
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.message.includes('not found')) {
    statusCode = 404;
    message = 'Resource not found';
  } else if (error.message.includes('timeout')) {
    statusCode = 408;
    message = 'Request timeout';
  }

  // Resposta padronizada de erro
  const errorResponse: ApiError = {
    success: false,
    error: message,
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString()
  };

  res.status(statusCode).json(errorResponse);
}

// Middleware para capturar erros async
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Middleware de autenticação por API Key
export function authenticateApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  // Se não há API key configurada, pular autenticação (desenvolvimento)
  if (!process.env.API_KEY) {
    return next();
  }
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    logger.warn('Unauthorized API request:', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
      providedKey: apiKey ? `${String(apiKey).substring(0, 8)}...` : 'none'
    });
    
    res.status(401).json({
      success: false,
      error: 'Invalid or missing API key',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  next();
}

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { openaiService } from '../services/openai';
import { dbService } from '../services/database';
import { validateConfig } from '../config/index';
import { logger } from '../utils/logger';
import type { ApiSuccess } from '../types/index';

export const healthRouter = Router();

// Health check básico
healthRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    };

    const response: ApiSuccess<typeof health> = {
      success: true,
      data: health,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

// Health check completo
healthRouter.get(
  '/detailed',
  asyncHandler(async (req: Request, res: Response) => {
    const checks = {
      server: { status: 'OK', message: 'Server is running' },
      config: { status: 'ERROR', message: 'Configuration invalid' },
      database: { status: 'ERROR', message: 'Database connection failed' },
      openai: { status: 'ERROR', message: 'OpenAI connection failed' }
    };

    // Verificar configuração
    try {
      validateConfig();
      checks.config = { status: 'OK', message: 'Configuration valid' };
    } catch (error) {
      checks.config.message = error instanceof Error ? error.message : 'Unknown config error';
      logger.error('Config validation failed:', error);
    }

    // Verificar banco de dados
    try {
      await dbService.testConnection();
      checks.database = { status: 'OK', message: 'Database connection successful' };
    } catch (error) {
      checks.database.message = error instanceof Error ? error.message : 'Unknown database error';
      logger.error('Database health check failed:', error);
    }

    // Verificar OpenAI
    try {
      const openaiResult = await openaiService.testConnection();
      checks.openai = { status: 'OK', message: openaiResult.message };
    } catch (error) {
      checks.openai.message = error instanceof Error ? error.message : 'Unknown OpenAI error';
      logger.error('OpenAI health check failed:', error);
    }

    // Determinar status geral
    const allHealthy = Object.values(checks).every(check => check.status === 'OK');
    const statusCode = allHealthy ? 200 : 503;

    const response = {
      success: allHealthy,
      data: {
        overall: allHealthy ? 'HEALTHY' : 'UNHEALTHY',
        checks,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    res.status(statusCode).json(response);
  })
);

import { Router, Request, Response } from 'express';
import { asyncHandler, authenticateApiKey } from '../middleware/errorHandler';
import { openaiService } from '../services/openai';
import { logger } from '../utils/logger';
import type { ApiSuccess } from '../types/index';

export const chatRouter = Router();

// Endpoint para chat direto (alternativa ao webhook)
chatRouter.post(
  '/message',
  authenticateApiKey,
  asyncHandler(async (req: Request, res: Response) => {
    const { message, systemMessage, userId, sessionId } = req.body;

    if (!message || !systemMessage) {
      res.status(400).json({
        success: false,
        error: 'Message and systemMessage are required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const payload = {
      message,
      systemMessage,
      userId: userId || 'anonymous',
      sessionId: sessionId || Date.now(),
      timestamp: new Date().toISOString(),
      page: req.body.page || '/api',
      pageContext: req.body.pageContext || 'Direct API call'
    };

    const aiResponse = await openaiService.processMessage(payload);

    const response: ApiSuccess<{ response: string; sessionId: number }> = {
      success: true,
      data: {
        response: aiResponse,
        sessionId: payload.sessionId
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

// Endpoint para configurações do chatbot
chatRouter.get(
  '/config/:userId',
  authenticateApiKey,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Implementar busca de configuração
    logger.info('Config request for user:', { userId });

    const response: ApiSuccess<{ message: string }> = {
      success: true,
      data: {
        message: 'Config endpoint - to be implemented'
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

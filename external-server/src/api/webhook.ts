import { Router, Request, Response } from 'express';
import { asyncHandler, authenticateApiKey } from '../middleware/errorHandler';
import { WebhookPayloadSchema, type WebhookResponse, type ApiSuccess } from '../types/index';
import { openaiService } from '../services/openai';
import { dbService } from '../services/database';
import { logger } from '../utils/logger';

export const webhookRouter = Router();

// Webhook principal para integração com N8N
webhookRouter.post(
  '/',
  authenticateApiKey,
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    try {
      // Validar payload usando Zod
      const payload = WebhookPayloadSchema.parse(req.body);
      
      logger.info('Webhook request received:', {
        userId: payload.userId,
        sessionId: payload.sessionId,
        page: payload.page,
        messageLength: payload.message.length
      });

      // Buscar configuração adicional do chatbot (opcional)
      let chatbotConfig = payload.chatbotConfig;
      if (!chatbotConfig && payload.userId) {
        try {
          const dbConfig = await dbService.getChatbotConfig(payload.userId);
          if (dbConfig) {
            chatbotConfig = {
              chatbot_name: dbConfig.chatbot_name || undefined,
              welcome_message: dbConfig.welcome_message || undefined,
              office_address: dbConfig.office_address || undefined,
              office_hours: dbConfig.office_hours || undefined,
              specialties: dbConfig.specialties || undefined,
              whatsapp: dbConfig.whatsapp || undefined,
              system_message: dbConfig.system_message || undefined
            };
          }
        } catch (dbError) {
          logger.warn('Could not fetch chatbot config from DB, using payload data:', {
            userId: payload.userId,
            error: dbError
          });
        }
      }

      // Processar mensagem com OpenAI
      const enrichedPayload = {
        ...payload,
        chatbotConfig: chatbotConfig || payload.chatbotConfig
      };

      const aiResponse = await openaiService.processMessage(enrichedPayload);

      // Salvar log da conversa (opcional)
      try {
        await dbService.saveConversationLog({
          userId: payload.userId,
          sessionId: payload.sessionId,
          message: payload.message,
          response: aiResponse,
          metadata: {
            page: payload.page,
            pageContext: payload.pageContext,
            processingTime: Date.now() - startTime
          }
        });
      } catch (logError) {
        logger.warn('Failed to save conversation log:', { error: logError, userId: payload.userId });
      }

      // Preparar resposta
      const response: WebhookResponse = {
        response: aiResponse,
        metadata: {
          userId: payload.userId,
          sessionId: payload.sessionId,
          timestamp: new Date().toISOString(),
          processed: true
        }
      };

      const processingTime = Date.now() - startTime;
      logger.info('Webhook processed successfully:', {
        userId: payload.userId,
        sessionId: payload.sessionId,
        processingTime,
        responseLength: aiResponse.length
      });

      const successResponse: ApiSuccess<WebhookResponse> = {
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      };

      res.json(successResponse);

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error('Webhook processing failed:', {
        error,
        processingTime,
        body: req.body
      });

      // Se for erro de validação, retornar 400
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Invalid payload format',
          details: error.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      throw error; // Será capturado pelo errorHandler
    }
  })
);

// Webhook de teste simples
webhookRouter.post(
  '/test',
  asyncHandler(async (req: Request, res: Response) => {
    logger.info('Test webhook called:', { body: req.body });
    
    const testResponse: ApiSuccess<{ message: string; echo: unknown }> = {
      success: true,
      data: {
        message: 'Webhook test successful',
        echo: req.body
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(testResponse);
  })
);

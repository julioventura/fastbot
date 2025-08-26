import OpenAI from 'openai';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import type { WebhookPayload, ChatConfig } from '../types/index.js';

class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  // Processar mensagem usando o sistema de prompt personalizado
  async processMessage(payload: WebhookPayload): Promise<string> {
    try {
      const { message, systemMessage, chatbotConfig } = payload;

      // Construir o contexto adicional baseado na configuração do chatbot
      let contextualInfo = '';
      if (chatbotConfig) {
        const info = this.buildContextualInfo(chatbotConfig);
        if (info) {
          contextualInfo = `\n\nInformações contextuais:\n${info}`;
        }
      }

      // Construir mensagens para a API
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `${systemMessage}${contextualInfo}`
        },
        {
          role: 'user',
          content: message
        }
      ];

      logger.info('Processing OpenAI request:', {
        userId: payload.userId,
        sessionId: payload.sessionId,
        messageLength: message.length,
        hasContextualInfo: !!contextualInfo
      });

      // Fazer a chamada para a API
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages,
        max_tokens: config.openai.maxTokens,
        temperature: config.openai.temperature,
        response_format: { type: 'text' }
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error('No response received from OpenAI');
      }

      logger.info('OpenAI response generated:', {
        userId: payload.userId,
        sessionId: payload.sessionId,
        responseLength: response.length,
        tokensUsed: completion.usage?.total_tokens || 0
      });

      return response;

    } catch (error) {
      logger.error('Error processing OpenAI request:', {
        error,
        userId: payload.userId,
        sessionId: payload.sessionId
      });

      if (error instanceof Error) {
        throw new Error(`OpenAI processing failed: ${error.message}`);
      }
      throw new Error('Unknown error in OpenAI processing');
    }
  }

  // Construir informações contextuais baseadas na configuração do chatbot
  private buildContextualInfo(config: ChatConfig): string {
    const info: string[] = [];

    if (config.office_hours) {
      info.push(`Horários de atendimento: ${config.office_hours}`);
    }

    if (config.office_address) {
      info.push(`Endereço: ${config.office_address}`);
    }

    if (config.specialties) {
      info.push(`Especialidades: ${config.specialties}`);
    }

    if (config.whatsapp) {
      info.push(`WhatsApp para contato: ${config.whatsapp}`);
    }

    return info.join('\n');
  }

  // Testar conexão com a API da OpenAI
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const models = await this.openai.models.list();
      
      if (models.data.length > 0) {
        return { 
          success: true, 
          message: `OpenAI connection OK. Available models: ${models.data.length}` 
        };
      }
      
      throw new Error('No models available');
    } catch (error) {
      logger.error('OpenAI connection test failed:', error);
      
      if (error instanceof Error) {
        throw new Error(`OpenAI connection failed: ${error.message}`);
      }
      throw new Error('Unknown error testing OpenAI connection');
    }
  }

  // Gerar embedding (se necessário para busca semântica)
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error('Error generating embedding:', { error, textLength: text.length });
      throw new Error('Failed to generate embedding');
    }
  }
}

export const openaiService = new OpenAIService();

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { Database } from '../types/index.js';
import { logger } from '../utils/logger.js';

class DatabaseService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = createClient<Database>(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            'X-Client-Info': 'fastbot-external-server'
          }
        }
      }
    );
  }

  // Buscar perfil do usuário
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        logger.error('Error fetching user profile:', { error, userId });
        throw new Error(`Failed to fetch user profile: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Database error in getUserProfile:', { error, userId });
      throw error;
    }
  }

  // Buscar configuração do chatbot
  async getChatbotConfig(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('mychatbot')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Registro não encontrado - retornar configuração padrão
          logger.info('No chatbot config found for user, using defaults:', { userId });
          return null;
        }
        logger.error('Error fetching chatbot config:', { error, userId });
        throw new Error(`Failed to fetch chatbot config: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Database error in getChatbotConfig:', { error, userId });
      throw error;
    }
  }

  // Salvar log da conversa (opcional)
  async saveConversationLog(data: {
    userId: string;
    sessionId: number;
    message: string;
    response: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      // Implementar se você quiser salvar logs das conversas
      // Por enquanto, apenas log no sistema
      logger.info('Conversation processed:', {
        userId: data.userId,
        sessionId: data.sessionId,
        messageLength: data.message.length,
        responseLength: data.response.length,
        timestamp: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      logger.error('Error saving conversation log:', { error, data });
      throw error;
    }
  }

  // Testar conexão com o banco
  async testConnection() {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        throw new Error(`Database connection failed: ${error.message}`);
      }

      return { success: true, message: 'Database connection OK' };
    } catch (error) {
      logger.error('Database connection test failed:', error);
      throw error;
    }
  }
}

export const dbService = new DatabaseService();

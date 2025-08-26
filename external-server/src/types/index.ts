import { z } from 'zod';

// Schema para validação do webhook N8N
export const WebhookPayloadSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  page: z.string().optional(),
  pageContext: z.string().optional(),
  timestamp: z.string().datetime(),
  sessionId: z.number(),
  userId: z.string().uuid(),
  userEmail: z.string().email().optional(),
  systemMessage: z.string().min(1, 'System message is required'),
  chatbotConfig: z.object({
    chatbot_name: z.string().optional(),
    welcome_message: z.string().optional(),
    office_address: z.string().optional(),
    office_hours: z.string().optional(),
    specialties: z.string().optional(),
    whatsapp: z.string().optional(),
    system_message: z.string().optional()
  }).optional()
});

export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;

// Resposta do webhook
export interface WebhookResponse {
  response: string;
  message?: string;
  metadata?: {
    userId: string;
    sessionId: number;
    timestamp: string;
    processed: boolean;
  };
}

// Configuração do chat
export interface ChatConfig {
  chatbot_name?: string;
  welcome_message?: string;
  office_address?: string;
  office_hours?: string;
  specialties?: string;
  whatsapp?: string;
  system_message?: string;
}

// Interface para tipos do Supabase (reutilizando do projeto principal)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: number;
          user_id: string;
          name: string | null;
          email: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          name?: string | null;
          email?: string | null;
        };
        Update: {
          name?: string | null;
          email?: string | null;
          updated_at?: string | null;
        };
      };
      mychatbot: {
        Row: {
          id: number;
          user_id: string;
          chatbot_name: string | null;
          welcome_message: string | null;
          system_message: string | null;
          office_address: string | null;
          office_hours: string | null;
          specialties: string | null;
          whatsapp: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          chatbot_name?: string | null;
          welcome_message?: string | null;
          system_message?: string | null;
          office_address?: string | null;
          office_hours?: string | null;
          specialties?: string | null;
          whatsapp?: string | null;
        };
        Update: {
          chatbot_name?: string | null;
          welcome_message?: string | null;
          system_message?: string | null;
          office_address?: string | null;
          office_hours?: string | null;
          specialties?: string | null;
          whatsapp?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
}

// Resposta de erro padronizada
export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
  timestamp: string;
}

// Resposta de sucesso padronizada
export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
}

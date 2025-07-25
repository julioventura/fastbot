/**
 * Interfaces do Chatbot
 * 
 * Este arquivo define as interfaces básicas e estendidas para configuração de chatbots.
 * Organizadas seguindo o padrão de herança para reutilização e manutenibilidade.
 */

/**
 * Interface base do ChatBot
 * Contém os campos essenciais presentes na tabela mychatbot
 */
export interface BaseChatbotData {
  system_instructions?: string;
  system_message: string;
  office_address: string;
  office_hours: string;
  specialties: string;
  chatbot_name: string;
  welcome_message: string;
  whatsapp: string;
}

/**
 * Interface completa do ChatBot
 * Estende a interface base com todos os campos avançados disponíveis
 */
export interface ChatbotData extends BaseChatbotData {
  // Controles de personalidade
  formality_level?: number; // 0-100
  use_emojis?: boolean;
  paragraph_size?: number; // 0-100

  // Controles de escopo
  main_topic?: string;
  allowed_topics?: string[];
  source_strictness?: number; // 0-100
  allow_internet_search?: boolean;

  // Controles de comportamento
  confidence_threshold?: number; // 0-100
  fallback_action?: "human" | "search" | "link";
  response_time_promise?: string;
  fallback_message?: string;

  // Links e documentos
  main_link?: string;
  mandatory_link?: boolean;
  uploaded_documents?: string[];
  uploaded_images?: string[]; // Array de imagens
  footer_message?: string; // Rodapé das mensagens

  // Regras automáticas
  mandatory_phrases?: string[];
  auto_link?: boolean;
  max_list_items?: number;
  list_style?: "numbered" | "bullets" | "simple";

  // Interação
  ask_for_name?: boolean;
  name_usage_frequency?: number; // 0-100
  remember_context?: boolean;
  returning_user_greeting?: string;

  // Configurações avançadas
  response_speed?: number; // 0-100
  debug_mode?: boolean;
  chat_color?: string;
}

/**
 * Interface para props de componentes que recebem dados do chatbot
 */
export interface ChatbotConfigProps {
  chatbotData: ChatbotData;
  isSaving?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
  onChange?: (field: string, value: string | number | boolean | string[]) => void;
  onCancel?: () => void;
}

/**
 * Tipo para fallback actions
 */
export type FallbackAction = "human" | "search" | "link";

/**
 * Tipo para estilos de lista
 */
export type ListStyle = "numbered" | "bullets" | "simple";

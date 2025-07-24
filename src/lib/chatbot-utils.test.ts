import { describe, it, expect } from 'vitest';
import { generateSystemMessage, validateChatbotData } from './chatbot-utils';
import { ChatbotData } from '@/interfaces';

describe('chatbot-utils', () => {
  describe('generateSystemMessage', () => {
    it('deve gerar system_message completo com todos os campos preenchidos', () => {
      const mockData: ChatbotData = {
        system_instructions: "Você é um assistente médico especializado.",
        system_message: "", // Será substituído
        chatbot_name: "Dr. Silva Bot",
        welcome_message: "Olá! Como posso ajudar com sua saúde?",
        office_address: "Rua das Flores, 123",
        office_hours: "8h às 18h",
        specialties: "Cardiologia, Clínica Geral",
        whatsapp: "11999999999",
        formality_level: 80,
        use_emojis: true,
        memorize_user_name: true,
        paragraph_size: 60,
        main_topic: "Saúde e Medicina",
        allowed_topics: ["Cardiologia", "Clínica Geral"],
        source_strictness: 90,
        allow_internet_search: false,
        confidence_threshold: 85,
        fallback_action: "human",
        response_time_promise: "2 horas",
        fallback_message: "Encaminharei sua dúvida para um especialista",
        main_link: "https://clinica.com.br",
        mandatory_link: true,
        uploaded_documents: ["manual.pdf"],
        uploaded_images: ["logo.png"],
        footer_message: "Clínica Dr. Silva - Cuidando da sua saúde",
        mandatory_phrases: ["Consulte sempre um médico"],
        auto_link: true,
        max_list_items: 5,
        list_style: "numbered",
        ask_for_name: true,
        name_usage_frequency: 70,
        remember_context: true,
        returning_user_greeting: "Que bom te ver novamente!",
        response_speed: 80,
        debug_mode: false,
        chat_color: "#2563eb"
      };

      const result = generateSystemMessage(mockData);

      expect(result).toContain("Você é um chatbot de atendimento online via web");
      expect(result).toContain("Dr. Silva Bot");
      expect(result).toContain("Você é um assistente médico especializado.");
      expect(result).toContain("Nível de Formalidade (0-100): 80");
      expect(result).toContain("Memorizar nome do usuário: Sim");
      expect(result).toContain("Uso de emojis nas mensagens: Sim");
      expect(result).toContain("Saúde e Medicina");
      expect(result).toContain("Cardiologia, Clínica Geral");
      expect(result).toContain("RODAPÉ:");
      expect(result).toContain("ESTILO E INTERAÇÃO:");
      expect(result).toContain("INFORMAÇÕES DE CONTATO:");
    });

    it('deve gerar system_message mínimo com poucos campos preenchidos', () => {
      const mockData: ChatbotData = {
        system_instructions: "",
        system_message: "",
        chatbot_name: "Bot Simples",
        welcome_message: "",
        office_address: "",
        office_hours: "",
        specialties: "",
        whatsapp: "",
        formality_level: 50
      };

      const result = generateSystemMessage(mockData);

      expect(result).toContain("Você é um chatbot de atendimento online via web");
      expect(result).toContain("IDENTIDADE E BOAS VINDAS:");
      expect(result).toContain("Bot Simples");
      expect(result).toContain("PERSONALIDADE:");
      expect(result).toContain("Nível de Formalidade (0-100): 50");
      expect(result).not.toContain("INSTRUÇÕES GERAIS:");
    });

    it('deve omitir seções vazias', () => {
      const mockData: ChatbotData = {
        system_instructions: "",
        system_message: "",
        chatbot_name: "Bot Test",
        welcome_message: "",
        office_address: "",
        office_hours: "",
        specialties: "",
        whatsapp: ""
      };

      const result = generateSystemMessage(mockData);

      expect(result).toContain("IDENTIDADE E BOAS VINDAS:");
      expect(result).not.toContain("INSTRUÇÕES GERAIS:");
      expect(result).not.toContain("PERSONALIDADE:");
      expect(result).not.toContain("COMPORTAMENTO:");
      expect(result).not.toContain("RODAPÉ:");
      expect(result).not.toContain("ESTILO E INTERAÇÃO:");
      expect(result).not.toContain("INFORMAÇÕES DE CONTATO:");
    });
  });

  describe('validateChatbotData', () => {
    it('deve retornar true quando há conteúdo suficiente', () => {
      const mockData: ChatbotData = {
        system_instructions: "",
        system_message: "",
        chatbot_name: "Bot Test",
        welcome_message: "",
        office_address: "",
        office_hours: "",
        specialties: "",
        whatsapp: ""
      };

      expect(validateChatbotData(mockData)).toBe(true);
    });

    it('deve retornar false quando não há conteúdo suficiente', () => {
      const mockData: ChatbotData = {
        system_instructions: "",
        system_message: "",
        chatbot_name: "",
        welcome_message: "",
        office_address: "",
        office_hours: "",
        specialties: "",
        whatsapp: ""
      };

      expect(validateChatbotData(mockData)).toBe(false);
    });

    it('deve retornar true quando há system_instructions', () => {
      const mockData: ChatbotData = {
        system_instructions: "Algumas instruções",
        system_message: "",
        chatbot_name: "",
        welcome_message: "",
        office_address: "",
        office_hours: "",
        specialties: "",
        whatsapp: ""
      };

      expect(validateChatbotData(mockData)).toBe(true);
    });
  });
});

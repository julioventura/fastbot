import { http, HttpResponse } from 'msw'

export const chatbotHandlers = [
  // Mock para buscar configuração do chatbot
  http.get('*/rest/v1/mychatbot*', () => {
    return HttpResponse.json({
      data: {
        id: 'mock-chatbot-id',
        user_id: 'mock-user-id',
        chatbot_name: 'Dr. Silva Assistant',
        welcome_message: 'Olá! Como posso ajudar?',
        system_message: 'Você é um assistente virtual',
        office_address: 'Rua das Flores, 123',
        office_hours: '08:00 - 18:00',
        specialties: 'Clínica Geral',
        whatsapp: '11999999999'
      },
      error: null
    })
  }),

  // Mock para salvar configuração do chatbot
  http.post('*/rest/v1/mychatbot*', () => {
    return HttpResponse.json({
      data: {
        id: 'mock-chatbot-id',
        user_id: 'mock-user-id'
      },
      error: null
    })
  }),

  // Mock para atualizar configuração do chatbot
  http.patch('*/rest/v1/mychatbot*', () => {
    return HttpResponse.json({
      data: {
        id: 'mock-chatbot-id',
        user_id: 'mock-user-id'
      },
      error: null
    })
  })
]

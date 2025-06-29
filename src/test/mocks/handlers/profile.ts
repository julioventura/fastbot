import { http, HttpResponse } from 'msw'

export const profileHandlers = [
  // Mock para buscar perfil do usuário
  http.get('*/rest/v1/profiles*', () => {
    return HttpResponse.json({
      data: {
        id: 'mock-profile-id',
        user_id: 'mock-user-id',
        name: 'Dr. João Silva',
        email: 'joao@test.com',
        whatsapp: '11999999999',
        profession: 'Dentista',
        gender: 'M',
        birth_date: '1980-01-01',
        city: 'São Paulo',
        state: 'SP'
      },
      error: null
    })
  }),

  // Mock para salvar perfil do usuário
  http.post('*/rest/v1/profiles*', () => {
    return HttpResponse.json({
      data: {
        id: 'mock-profile-id',
        user_id: 'mock-user-id'
      },
      error: null
    })
  }),

  // Mock para atualizar perfil do usuário
  http.patch('*/rest/v1/profiles*', () => {
    return HttpResponse.json({
      data: {
        id: 'mock-profile-id',
        user_id: 'mock-user-id'
      },
      error: null
    })
  })
]

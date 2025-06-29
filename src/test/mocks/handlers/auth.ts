import { http, HttpResponse } from 'msw'

export const authHandlers = [
  // Mock do login
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        email_confirmed_at: new Date().toISOString()
      }
    })
  }),

  // Mock do cadastro
  http.post('*/auth/v1/signup', () => {
    return HttpResponse.json({
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        email_confirmed_at: null
      }
    })
  }),

  // Mock do logout
  http.post('*/auth/v1/logout', () => {
    return HttpResponse.json({})
  })
]

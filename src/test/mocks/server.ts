import { setupServer } from 'msw/node'
import { authHandlers } from './handlers/auth'
import { chatbotHandlers } from './handlers/chatbot'
import { profileHandlers } from './handlers/profile'

export const server = setupServer(
  ...authHandlers,
  ...chatbotHandlers,
  ...profileHandlers
)

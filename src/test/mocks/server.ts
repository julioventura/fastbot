import { setupServer } from 'msw/node';
import { authHandlers, chatbotHandlers, profileHandlers } from './handlers/index';

export const server = setupServer(
  ...authHandlers,
  ...chatbotHandlers,
  ...profileHandlers
);

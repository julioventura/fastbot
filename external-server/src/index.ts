import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { webhookRouter } from './api/webhook.js';
import { chatRouter } from './api/chat.js';
import { healthRouter } from './api/health.js';
import { errorHandler } from './middleware/errorHandler.js';
import { corsConfig } from './config/cors.js';
import { logger } from './utils/logger.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet());

// CORS configurado
app.use(cors(corsConfig));

// Parse JSON
app.use(express.json({ limit: '10mb' }));

// Parse URL encoded
app.use(express.urlencoded({ extended: true }));

// Logging de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method === 'POST' ? req.body : undefined
  });
  next();
});

// Routes
app.use('/health', healthRouter);
app.use('/webhook', webhookRouter);
app.use('/api/chat', chatRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 FastBot External Server running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

export default app;

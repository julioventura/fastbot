import winston from 'winston';
import { config } from '../config/index.js';

// Configurar formato dos logs
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configurar transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: config.logging.level,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// File transport apenas em produção
if (config.nodeEnv === 'production') {
  transports.push(
    new winston.transports.File({
      filename: config.logging.filePath,
      level: config.logging.level,
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Criar logger
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports,
  // Não sair do processo em caso de erro
  exitOnError: false,
});

// Log de inicialização
logger.info('Logger initialized', {
  level: config.logging.level,
  environment: config.nodeEnv,
  transports: transports.length
});

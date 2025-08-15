/**
 * Demonstração: Como o Logging Condicional Funciona
 * 
 * Este arquivo demonstra a diferença entre produção e desenvolvimento
 * em termos de logging no FastBot.
 */

// Simular ambientes
console.log('='.repeat(60));
console.log('🧪 DEMONSTRAÇÃO: LOGGING CONDICIONAL');
console.log('='.repeat(60));

// Importar o logger
import { loggers, getLoggerConfig } from './src/lib/utils/logger';

const logger = loggers.chatbot;

console.log('\n📊 CONFIGURAÇÃO ATUAL:');
console.log(JSON.stringify(getLoggerConfig(), null, 2));

console.log('\n🔹 LOGS EM DESENVOLVIMENTO:');
console.log('Todos os níveis ativos (debug, info, warn, error)');
logger.debug('Este é um log de debug - visível apenas em DEV');
logger.info('Este é um log de info');
logger.warn('Este é um log de warning');
logger.error('Este é um log de erro');

console.log('\n🔹 LOGS EM PRODUÇÃO:');
console.log('Apenas logs importantes (warn, error)');
console.log('Os logs debug e info são suprimidos automaticamente');

console.log('\n✅ BENEFÍCIOS:');
console.log('• Performance melhorada em produção');
console.log('• Console mais limpo para usuários finais');
console.log('• Logs detalhados mantidos para desenvolvimento');
console.log('• Configuração automática baseada no ambiente');

console.log('\n📈 ANTES (console.log manual):');
console.log('🔧 [useShortMemory] ===== ADICIONANDO MENSAGEM =====');
console.log('🔧 [useShortMemory] Role: user');
console.log('🔧 [useShortMemory] Content: Hello world...');
console.log('🔧 [useShortMemory] ===== FIM =====');

console.log('\n📈 AGORA (logging condicional):');
logger.debug('===== ADICIONANDO MENSAGEM =====');
logger.debug('Parâmetros:', { role: 'user', content: 'Hello world...' });
logger.info('Mensagem adicionada com sucesso');
logger.debug('===== FIM =====');

console.log('\n' + '='.repeat(60));

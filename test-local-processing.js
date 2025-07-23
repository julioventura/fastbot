#!/usr/bin/env node

// Script de teste para validar o processamento local do chatbot
// Execute: node test-local-processing.js

console.log('🧪 TESTE: Processamento Local do FastBot');
console.log('=====================================');

// 1. Verificar variáveis de ambiente
console.log('\n1. 📊 VERIFICANDO CONFIGURAÇÃO:');

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY', 
  'VITE_OPENAI_API_KEY'
];

const optionalEnvVars = [
  'VITE_WEBHOOK_N8N_URL',
  'VITE_USE_LOCAL_AI'
];

console.log('\n  📋 Variáveis Obrigatórias:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const preview = value ? `${value.substring(0, 20)}...` : 'NÃO CONFIGURADA';
  console.log(`    ${status} ${varName}: ${preview}`);
});

console.log('\n  📋 Variáveis Opcionais:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️';
  const display = value || 'não configurada (padrão será usado)';
  console.log(`    ${status} ${varName}: ${display}`);
});

// 2. Verificar modo de processamento
console.log('\n2. 🤖 MODO DE PROCESSAMENTO:');
const useLocalAI = process.env.VITE_USE_LOCAL_AI === 'true';
const webhookUrl = process.env.VITE_WEBHOOK_N8N_URL;

if (useLocalAI) {
  console.log('  ✅ PROCESSAMENTO LOCAL ATIVADO');
  console.log('  📝 O chatbot usará IA local + Vector Store');
  console.log('  🚀 N8N será ignorado completamente');
} else if (webhookUrl) {
  console.log('  ⚙️ PROCESSAMENTO N8N ATIVADO');
  console.log('  📝 O chatbot usará N8N como principal');
  console.log('  🔄 Processamento local como fallback');
} else {
  console.log('  🔄 MODO FALLBACK');
  console.log('  📝 Sem webhook N8N, usará processamento local');
  console.log('  ⚠️ Considere configurar VITE_USE_LOCAL_AI=true');
}

// 3. Verificar dependências
console.log('\n3. 📦 VERIFICANDO DEPENDÊNCIAS:');

const dependencies = [
  { name: '@supabase/supabase-js', required: true },
  { name: 'react', required: true },
  { name: 'lucide-react', required: true }
];

dependencies.forEach(dep => {
  try {
    require.resolve(dep.name);
    console.log(`  ✅ ${dep.name}: Instalado`);
  } catch (error) {
    const status = dep.required ? '❌' : '⚠️';
    console.log(`  ${status} ${dep.name}: NÃO ENCONTRADO`);
  }
});

// 4. Instruções finais
console.log('\n4. 🚀 PRÓXIMOS PASSOS:');
console.log('  1. Configure as variáveis de ambiente necessárias');
console.log('  2. Execute: npm run dev');
console.log('  3. Acesse o chatbot e teste uma mensagem');
console.log('  4. Observe os logs no console do navegador');

console.log('\n📊 LOGS ESPERADOS NO NAVEGADOR:');
if (useLocalAI) {
  console.log('  🤖 [MyChatbot] Usando processamento local (AI + Vector Store)');
  console.log('  🔍 [MyChatbot] Buscando contexto vetorial para: [sua mensagem]');
  console.log('  ✅ [MyChatbot] Resposta IA gerada localmente');
} else {
  console.log('  🚀 [MyChatbot] Enviando para N8N');
  console.log('  ✅ [MyChatbot] Resposta do N8N (ou fallback local)');
}

console.log('\n✨ TESTE CONCLUÍDO!');
console.log('Para mais informações, consulte: PROCESSAMENTO_LOCAL_COMPLETO.md');

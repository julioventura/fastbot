// Script para testar as novas URLs curtas
// Execute no console do navegador

console.log('🧪 Testando novas URLs curtas...');

// Função para testar a nova estrutura de URLs
const testNewUrls = () => {
  const baseUrl = window.location.origin + '/fastbot';
  
  // URLs de teste baseadas na documentação
  const testUrls = [
    'ana',
    'lgpdbot', 
    'tutfop5',
    'drsilva',
    'testebot'
  ];
  
  console.log('🔗 URLs antigas (não funcionam mais):');
  testUrls.forEach(slug => {
    console.log(`❌ ${baseUrl}/chat/${slug}`);
  });
  
  console.log('\n🔗 URLs novas (funcionam):');
  testUrls.forEach(slug => {
    console.log(`✅ ${baseUrl}/${slug}`);
  });
  
  console.log('\n🏠 Rotas do sistema (não são chatbots):');
  const systemRoutes = [
    '', // homepage
    'account',
    'pricing',
    'features', 
    'my-chatbot',
    'configure',
    'base-de-dados',
    'conversation-history',
    'admin'
  ];
  
  systemRoutes.forEach(route => {
    console.log(`🏠 ${baseUrl}/${route}`);
  });
};

// Função para verificar se estamos em uma URL de chatbot
const checkCurrentPage = () => {
  const path = window.location.pathname;
  console.log('\n📍 Página atual:', path);
  
  // Simular a lógica do isPublicChatbotRoute
  const cleanPath = path.replace(/\/$/, '') || '/';
  const systemRoutes = [
    '/fastbot/',
    '/fastbot',
    '/fastbot/account',
    '/fastbot/pricing', 
    '/fastbot/features',
    '/fastbot/my-chatbot',
    '/fastbot/configure',
    '/fastbot/base-de-dados',
    '/fastbot/conversation-history',
    '/fastbot/reset-password',
    '/fastbot/admin',
    '/fastbot/404'
  ];
  
  const isSystemRoute = systemRoutes.includes(cleanPath);
  const pathParts = cleanPath.replace('/fastbot', '').split('/').filter(part => part.length > 0);
  const isPossibleChatbot = pathParts.length === 1 && pathParts[0].length > 0;
  
  console.log('🔍 Análise da URL:');
  console.log('  - Caminho limpo:', cleanPath);
  console.log('  - É rota do sistema?', isSystemRoute);
  console.log('  - Partes do caminho:', pathParts);
  console.log('  - Possível chatbot?', isPossibleChatbot && !isSystemRoute);
  
  if (isPossibleChatbot && !isSystemRoute) {
    console.log('🤖 Esta URL parece ser de um chatbot:', pathParts[0]);
  } else if (isSystemRoute) {
    console.log('🏠 Esta é uma página do sistema');
  } else {
    console.log('❓ URL não reconhecida');
  }
};

// Executar testes
testNewUrls();
checkCurrentPage();

console.log('\n✅ Teste das URLs curtas concluído!');

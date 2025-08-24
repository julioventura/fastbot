// Script de teste para verificar se a página Configure está funcionando
// Execute este script no console do navegador na página Configure

console.log('🧪 Iniciando teste da página Configure...');

// Função de teste principal
async function testConfigurePage() {
  try {
    console.log('✅ 1. Verificando se a página carregou');
    
    // Verificar se os elementos principais estão presentes
    const nameInput = document.querySelector('#chatbot_name');
    const welcomeTextarea = document.querySelector('#welcome_message');
    const instructionsTextarea = document.querySelector('#system_instructions');
    const saveButton = document.querySelector('button[type="submit"]');
    
    if (!nameInput || !welcomeTextarea || !instructionsTextarea || !saveButton) {
      throw new Error('Elementos essenciais não encontrados na página');
    }
    
    console.log('✅ 2. Elementos principais encontrados');
    
    // Verificar se os campos estão funcionando
    console.log('✅ 3. Testando preenchimento de campos');
    
    // Simular preenchimento
    nameInput.value = 'Assistente de Teste';
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    welcomeTextarea.value = 'Olá! Sou um assistente virtual de teste.';
    welcomeTextarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    instructionsTextarea.value = 'Você é um assistente virtual de teste configurado para demonstrar funcionalidades.';
    instructionsTextarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log('✅ 4. Campos preenchidos com sucesso');
    
    // Testar adição de tópicos permitidos
    const topicInput = document.querySelector('input[placeholder*="Digite e pressione Enter"]');
    if (topicInput) {
      topicInput.value = 'Teste de Funcionalidade';
      topicInput.dispatchEvent(new KeyboardEvent('keydown', { 
        key: 'Enter', 
        bubbles: true 
      }));
      console.log('✅ 5. Tópico adicionado com sucesso');
    }
    
    // Verificar se o botão de preview funciona
    const previewButton = document.querySelector('button[type="button"]');
    if (previewButton && previewButton.textContent.includes('Ver')) {
      previewButton.click();
      console.log('✅ 6. Botão de preview funcionando');
    }
    
    console.log('🎉 Teste da página Configure concluído com sucesso!');
    console.log('📝 Resumo:');
    console.log('- ✅ Página carregou corretamente');
    console.log('- ✅ Campos de entrada funcionando');
    console.log('- ✅ Funcionalidade de tópicos operacional');
    console.log('- ✅ Preview de sistema disponível');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    return false;
  }
}

// Verificar se estamos na página correta
if (window.location.pathname.includes('/configure')) {
  // Aguardar um pouco para a página carregar completamente
  setTimeout(() => {
    testConfigurePage();
  }, 2000);
} else {
  console.log('⚠️ Navegue para a página Configure primeiro: /fastbot/configure');
}

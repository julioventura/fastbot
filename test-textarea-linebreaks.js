// Script para testar quebras de linha nos TextAreas
// Execute no console do navegador na página Configure

console.log('🧪 Testando quebras de linha nos TextAreas...');

// Função para testar quebras de linha
const testTextAreaLineBreaks = () => {
  console.log('🔍 Procurando TextAreas...');
  
  // Encontrar os TextAreas
  const welcomeTextarea = document.querySelector('#welcome_message');
  const instructionsTextarea = document.querySelector('#system_instructions');
  
  if (!welcomeTextarea || !instructionsTextarea) {
    console.error('❌ TextAreas não encontrados');
    return false;
  }
  
  console.log('✅ TextAreas encontrados:', {
    welcome_message: welcomeTextarea,
    system_instructions: instructionsTextarea
  });
  
  // Função para testar um TextArea específico
  const testSingleTextArea = (textarea, name) => {
    console.log(`🧪 Testando ${name}...`);
    
    // Simular texto com quebras de linha
    const testText = `Primeira linha
Segunda linha
Terceira linha

Linha após parágrafo vazio`;
    
    // Definir o valor
    textarea.value = testText;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log(`✅ ${name} - Texto definido:`, textarea.value);
    console.log(`✅ ${name} - Número de linhas:`, textarea.value.split('\n').length);
    
    return textarea.value.includes('\n');
  };
  
  // Testar ambos os TextAreas
  const welcomeTest = testSingleTextArea(welcomeTextarea, 'Mensagem de Saudação');
  const instructionsTest = testSingleTextArea(instructionsTextarea, 'Instruções Gerais');
  
  return welcomeTest && instructionsTest;
};

// Função para simular digitação com Enter
const simulateEnterKeyPress = () => {
  console.log('⌨️ Simulando tecla Enter nos TextAreas...');
  
  const textareas = [
    document.querySelector('#welcome_message'),
    document.querySelector('#system_instructions')
  ];
  
  textareas.forEach((textarea, index) => {
    if (textarea) {
      console.log(`⌨️ Testando Enter no TextArea ${index + 1}...`);
      
      // Focar no textarea
      textarea.focus();
      
      // Simular evento de KeyDown para Enter
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true
      });
      
      // Verificar se o evento foi prevenido
      const prevented = !textarea.dispatchEvent(enterEvent);
      
      console.log(`${prevented ? '❌' : '✅'} Enter ${prevented ? 'foi prevenido' : 'foi permitido'} no TextArea ${index + 1}`);
    }
  });
};

// Executar testes
if (window.location.pathname.includes('/configure')) {
  console.log('📍 Estamos na página Configure');
  
  // Aguardar um pouco para a página carregar
  setTimeout(() => {
    const success = testTextAreaLineBreaks();
    console.log(success ? '🎉 Teste de quebras de linha: SUCESSO' : '❌ Teste de quebras de linha: FALHOU');
    
    simulateEnterKeyPress();
    
    console.log('\n📝 Instruções para teste manual:');
    console.log('1. Clique em qualquer TextArea');
    console.log('2. Digite algum texto');
    console.log('3. Pressione Enter');
    console.log('4. Verifique se uma nova linha foi criada');
    console.log('5. Digite mais texto na nova linha');
    
  }, 2000);
} else {
  console.log('⚠️ Navegue para a página Configure primeiro: /fastbot/configure');
}

// Teste simples da página Configure
// Execute no console do navegador

console.log('🧪 Testando página Configure...');

// Verificar elementos principais
const testElements = () => {
  const elements = {
    nameInput: document.querySelector('#chatbot_name'),
    welcomeTextarea: document.querySelector('#welcome_message'),
    instructionsTextarea: document.querySelector('#system_instructions'),
    saveButton: document.querySelector('button[type="submit"]')
  };
  
  console.log('Elementos encontrados:', elements);
  return Object.values(elements).every(el => el !== null);
};

// Simular preenchimento
const fillTestData = () => {
  const nameInput = document.querySelector('#chatbot_name');
  const welcomeTextarea = document.querySelector('#welcome_message');
  const instructionsTextarea = document.querySelector('#system_instructions');
  
  if (nameInput) {
    nameInput.value = 'Assistente de Teste';
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  if (welcomeTextarea) {
    welcomeTextarea.value = 'Olá! Teste funcionando.';
    welcomeTextarea.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  if (instructionsTextarea) {
    instructionsTextarea.value = 'Instruções de teste.';
    instructionsTextarea.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  console.log('✅ Dados de teste preenchidos');
};

// Executar teste
if (testElements()) {
  console.log('✅ Todos os elementos encontrados');
  fillTestData();
  console.log('🎉 Teste concluído! A página está funcionando.');
} else {
  console.log('❌ Alguns elementos não foram encontrados');
}

// Script SIMPLES de diagnóstico do scroll
// Cole no console após abrir o preview

console.clear();
console.log('🔍 Diagnóstico do Preview Scroll');

// Aguardar um pouco para garantir que o DOM está pronto
setTimeout(() => {
  // Buscar o modal
  const modal = document.querySelector('[role="dialog"]');
  console.log('📱 Modal encontrado:', !!modal);
  
  if (!modal) {
    console.error('❌ Modal não encontrado! Abra o preview primeiro.');
    return;
  }
  
  // Buscar todos os elementos com scroll
  const scrollElements = modal.querySelectorAll('*');
  const containers = [];
  
  scrollElements.forEach(el => {
    const style = getComputedStyle(el);
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      containers.push({
        element: el,
        tag: el.tagName,
        classes: el.className,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        canScroll: el.scrollHeight > el.clientHeight
      });
    }
  });
  
  console.log('📦 Containers com scroll encontrados:', containers.length);
  containers.forEach((c, i) => {
    console.log(`${i + 1}. ${c.tag} - ${c.canScroll ? 'PODE' : 'NÃO PODE'} scroll`);
    console.log(`   Classes: ${c.classes}`);
    console.log(`   Altura: ${c.clientHeight}px, Conteúdo: ${c.scrollHeight}px`);
  });
  
  // Pegar o primeiro container que pode fazer scroll
  const scrollContainer = containers.find(c => c.canScroll)?.element;
  
  if (!scrollContainer) {
    console.warn('⚠️ Nenhum container pode fazer scroll!');
    
    // Verificar se há um container principal
    const mainContainer = modal.querySelector('.preview-scroll-container') ||
                          modal.querySelector('[role="textbox"]') ||
                          modal.querySelector('[data-testid="preview-scroll-container"]');
    
    if (mainContainer) {
      console.log('📦 Container principal encontrado:', mainContainer.className);
      console.log('📏 Dimensões:', {
        scrollHeight: mainContainer.scrollHeight,
        clientHeight: mainContainer.clientHeight,
        overflow: getComputedStyle(mainContainer).overflowY
      });
      
      // Forçar scroll mesmo se não deveria
      window.testScroll = () => {
        mainContainer.scrollTop = 100;
        console.log('Scroll forçado para 100px:', mainContainer.scrollTop);
      };
      
      console.log('💡 Use window.testScroll() para forçar scroll');
    }
    return;
  }
  
  console.log('✅ Container de scroll encontrado!');
  
  // Testar scroll
  window.testScrollNow = () => {
    console.log('🧪 Testando scroll...');
    
    // 1. Focar elemento
    scrollContainer.focus();
    console.log('🎯 Focado:', document.activeElement === scrollContainer);
    
    // 2. Scroll programático
    const before = scrollContainer.scrollTop;
    scrollContainer.scrollTop = 100;
    console.log(`📜 Scroll: ${before} → ${scrollContainer.scrollTop}`);
    
    // 3. Evento de teclado
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true
    });
    
    const beforeKey = scrollContainer.scrollTop;
    scrollContainer.dispatchEvent(event);
    
    setTimeout(() => {
      console.log(`⌨️ Teclado: ${beforeKey} → ${scrollContainer.scrollTop}`);
    }, 100);
  };
  
  console.log('💡 Use window.testScrollNow() para testar o scroll');
  
}, 500);

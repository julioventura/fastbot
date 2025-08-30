// Script avançado de teste para o preview scroll
// Execute no console do browser após abrir o preview

console.log('🔍 Testando funcionalidade avançada do preview...');

// Encontrar o container de scroll
const container = document.querySelector('.preview-scroll-container');
console.log('Preview container encontrado:', !!container);

if (container) {
  console.log('✅ Container encontrado');
  console.log('📏 Dimensões:', {
    scrollHeight: container.scrollHeight,
    clientHeight: container.clientHeight,
    scrollTop: container.scrollTop,
    canScroll: container.scrollHeight > container.clientHeight,
    overflow: getComputedStyle(container).overflow,
    overflowY: getComputedStyle(container).overflowY
  });
  
  // Testar foco
  container.focus();
  console.log('🎯 Foco aplicado, elemento ativo:', document.activeElement === container);
  
  // Testar scroll programático
  console.log('🧪 Testando scroll programático...');
  const originalScrollTop = container.scrollTop;
  
  container.scrollBy({ top: 100, behavior: 'instant' });
  setTimeout(() => {
    console.log('� Scroll test resultado:', {
      original: originalScrollTop,
      new: container.scrollTop,
      changed: container.scrollTop !== originalScrollTop
    });
    
    // Testar eventos de teclado
    console.log('⌨️ Testando eventos de teclado...');
    const events = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'];
    
    events.forEach((key, index) => {
      setTimeout(() => {
        const event = new KeyboardEvent('keydown', {
          key: key,
          bubbles: true,
          cancelable: true
        });
        
        const beforeScroll = container.scrollTop;
        container.dispatchEvent(event);
        
        setTimeout(() => {
          const afterScroll = container.scrollTop;
          console.log(`${key}: ${beforeScroll} → ${afterScroll} (${afterScroll !== beforeScroll ? '✅' : '❌'})`);
        }, 100);
      }, index * 500);
    });
  }, 100);
  
  // Testar mouse wheel
  setTimeout(() => {
    console.log('🖱️ Testando mouse wheel...');
    const wheelEvent = new WheelEvent('wheel', {
      deltaY: 100,
      bubbles: true,
      cancelable: true
    });
    
    const beforeWheel = container.scrollTop;
    container.dispatchEvent(wheelEvent);
    
    setTimeout(() => {
      const afterWheel = container.scrollTop;
      console.log(`Mouse wheel: ${beforeWheel} → ${afterWheel} (${afterWheel !== beforeWheel ? '✅' : '❌'})`);
    }, 100);
  }, 3000);
  
} else {
  console.error('❌ Container não encontrado!');
  console.log('🔍 Containers disponíveis:', document.querySelectorAll('[class*="scroll"], [class*="overflow"]'));
}

// Verificar se há conteúdo
const preElement = document.querySelector('.preview-content pre');
if (preElement) {
  console.log('📄 Conteúdo encontrado:', {
    length: preElement.textContent.length,
    height: preElement.offsetHeight,
    preview: preElement.textContent.substring(0, 100) + '...'
  });
} else {
  console.error('❌ Elemento <pre> não encontrado!');
}

// Função para forçar scroll manualmente
window.forcePreviewScroll = (amount = 100) => {
  const container = document.querySelector('.preview-scroll-container');
  if (container) {
    container.scrollTop += amount;
    console.log('🔧 Scroll forçado:', container.scrollTop);
    return true;
  }
  return false;
};

console.log('💡 Use window.forcePreviewScroll(100) para testar scroll manual');

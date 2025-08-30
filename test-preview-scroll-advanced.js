// Script SUPER avançado de teste para o preview scroll
// Execute no console do browser após abrir o preview

console.clear();
console.log('🚀 Testando funcionalidade SUPER avançada do preview...');

// Função para encontrar o container de scroll
function findScrollContainer() {
  // Múltiplas estratégias para encontrar o container
  const selectors = [
    '.preview-scroll-container',
    '[data-testid="preview-scroll-container"]',
    '[role="textbox"]',
    '[aria-label*="Conteúdo do documento"]',
    '.preview-modal-body [class*="overflow-y-auto"]',
    '[role="dialog"] [class*="overflow-y-auto"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.log(`✅ Container encontrado via: ${selector}`);
      return element;
    }
  }
  
  // Último recurso: buscar por overflow dentro do modal
  const modal = document.querySelector('[role="dialog"]');
  if (modal) {
    const scrollElements = modal.querySelectorAll('[class*="overflow-y-auto"]');
    if (scrollElements.length > 0) {
      console.log('✅ Container encontrado via busca no modal');
      return scrollElements[0];
    }
  }
  
  return null;
}

// Encontrar o container
const container = findScrollContainer();
console.log('📦 Preview container encontrado:', !!container);

if (!container) {
  console.error('❌ ERRO: Container não encontrado!');
  console.log('🔍 Debug: Elementos disponíveis...');
  
  // Debug detalhado
  const modal = document.querySelector('[role="dialog"]');
  if (modal) {
    console.log('🔍 Modal encontrado:', modal);
    console.log('🔍 Classes do modal:', modal.className);
    
    // Listar todos os elementos filhos com scroll/overflow
    const scrollElements = modal.querySelectorAll('*');
    const potentialContainers = [];
    
    scrollElements.forEach(el => {
      const style = getComputedStyle(el);
      if (style.overflow.includes('auto') || style.overflow.includes('scroll') ||
          style.overflowY.includes('auto') || style.overflowY.includes('scroll')) {
        potentialContainers.push({
          element: el,
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          overflow: style.overflow,
          overflowY: style.overflowY
        });
      }
    });
    
    console.log('🔍 Containers potenciais:', potentialContainers);
  } else {
    console.log('❌ Modal não encontrado!');
  }
  
  // Sair se não encontrou o container
  console.log('❌ Encerrando teste - container não encontrado');
  window.scrollContainerTest = { error: 'Container não encontrado' };
  console.log('💡 Verifique se o modal de preview está aberto');
} else {
console.log('✅ Container encontrado!');
console.log('📦 Element info:', {
  tagName: container.tagName,
  className: container.className,
  id: container.id,
  innerHTML: container.innerHTML.substring(0, 100) + '...'
});

// Verificar propriedades do container
const computedStyle = getComputedStyle(container);
const containerInfo = {
  // Dimensões
  scrollHeight: container.scrollHeight,
  clientHeight: container.clientHeight,
  offsetHeight: container.offsetHeight,
  scrollTop: container.scrollTop,
  
  // Capacidade de scroll
  canScroll: container.scrollHeight > container.clientHeight,
  scrollDifference: container.scrollHeight - container.clientHeight,
  
  // Estilos CSS
  overflow: computedStyle.overflow,
  overflowY: computedStyle.overflowY,
  height: computedStyle.height,
  maxHeight: computedStyle.maxHeight,
  position: computedStyle.position,
  
  // Propriedades de foco
  tabIndex: container.tabIndex,
  canBeFocused: container.tabIndex >= 0,
  
  // Display e layout
  display: computedStyle.display,
  flexDirection: computedStyle.flexDirection
};

console.log('📏 Container info completo:', containerInfo);

// Verificar se o container realmente pode fazer scroll
if (!containerInfo.canScroll) {
  console.warn('⚠️ AVISO: Container NÃO pode fazer scroll!');
  console.log('💡 Possíveis causas:');
  console.log('   - Conteúdo menor que o container');
  console.log('   - CSS overflow não configurado corretamente');
  console.log('   - Altura do container não limitada');
  
  // Verificar conteúdo
  const content = container.querySelector('pre') || container.querySelector('div');
  if (content) {
    console.log('📄 Info do conteúdo:', {
      scrollHeight: content.scrollHeight,
      offsetHeight: content.offsetHeight,
      textLength: content.textContent.length
    });
  }
} else {
  console.log('✅ Container PODE fazer scroll!');
}

// TESTE 1: Foco
console.log('\n🎯 TESTE 1: Foco');
container.focus();
setTimeout(() => {
  const isFocused = document.activeElement === container;
  console.log('Elemento focado:', isFocused ? '✅' : '❌');
  console.log('Active element:', document.activeElement);
  
  // TESTE 2: Scroll programático
  console.log('\n🧪 TESTE 2: Scroll programático');
  const originalScrollTop = container.scrollTop;
  console.log('Posição inicial:', originalScrollTop);
  
  // Tentar scroll direto
  container.scrollTop = 50;
  console.log('Após scrollTop = 50:', container.scrollTop);
  
  // Tentar scrollBy
  container.scrollBy({ top: 50, behavior: 'instant' });
  console.log('Após scrollBy +50:', container.scrollTop);
  
  // Tentar scrollTo
  container.scrollTo({ top: 100, behavior: 'instant' });
  console.log('Após scrollTo 100:', container.scrollTop);
  
  // Resetar posição
  container.scrollTop = 0;
  
  // TESTE 3: Eventos de teclado
  console.log('\n⌨️ TESTE 3: Eventos de teclado');
  
  const keyTests = [
    { name: 'ArrowDown', key: 'ArrowDown', code: 'ArrowDown' },
    { name: 'ArrowUp', key: 'ArrowUp', code: 'ArrowUp' },
    { name: 'PageDown', key: 'PageDown', code: 'PageDown' },
    { name: 'PageUp', key: 'PageUp', code: 'PageUp' },
    { name: 'Space', key: ' ', code: 'Space' }
  ];
  
  keyTests.forEach((test, index) => {
    setTimeout(() => {
      console.log(`\n🔤 Testando: ${test.name}`);
      
      // Garantir foco
      container.focus();
      
      const beforeScroll = container.scrollTop;
      
      // Criar evento
      const event = new KeyboardEvent('keydown', {
        key: test.key,
        code: test.code,
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window
      });
      
      // Disparar evento
      const dispatched = container.dispatchEvent(event);
      
      setTimeout(() => {
        const afterScroll = container.scrollTop;
        const changed = afterScroll !== beforeScroll;
        
        console.log(`${test.name}: ${beforeScroll} → ${afterScroll}`);
        console.log(`Resultado: ${changed ? '✅ Funcionou' : '❌ Não funcionou'}`);
        console.log(`Event dispatched: ${dispatched}, preventDefault: ${event.defaultPrevented}`);
      }, 100);
      
    }, index * 800);
  });
  
  // TESTE 4: Mouse wheel (após todos os testes de teclado)
  setTimeout(() => {
    console.log('\n🖱️ TESTE 4: Mouse wheel');
    
    container.focus();
    const beforeWheel = container.scrollTop;
    
    const wheelEvent = new WheelEvent('wheel', {
      deltaY: 120,
      deltaMode: 0,
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window
    });
    
    const dispatched = container.dispatchEvent(wheelEvent);
    
    setTimeout(() => {
      const afterWheel = container.scrollTop;
      const changed = afterWheel !== beforeWheel;
      
      console.log(`Mouse wheel: ${beforeWheel} → ${afterWheel}`);
      console.log(`Resultado: ${changed ? '✅ Funcionou' : '❌ Não funcionou'}`);
      console.log(`Event dispatched: ${dispatched}, preventDefault: ${wheelEvent.defaultPrevented}`);
    }, 100);
    
  }, keyTests.length * 800 + 500);
  
}, 200);

// Verificar se há conteúdo
console.log('\n📄 VERIFICAÇÃO DE CONTEÚDO');
const preElement = container.querySelector('pre') || 
                   container.querySelector('[class*="whitespace-pre"]') ||
                   container.querySelector('div');

if (preElement) {
  console.log('✅ Elemento de conteúdo encontrado:', {
    tagName: preElement.tagName,
    className: preElement.className,
    textLength: preElement.textContent.length,
    scrollHeight: preElement.scrollHeight,
    offsetHeight: preElement.offsetHeight,
    preview: preElement.textContent.substring(0, 150) + '...'
  });
} else {
  console.error('❌ Elemento de conteúdo não encontrado!');
}

// Funções utilitárias globais
window.scrollContainerTest = {
  container: container,
  
  forceScroll: (amount = 100) => {
    if (container) {
      const before = container.scrollTop;
      container.scrollTop += amount;
      const after = container.scrollTop;
      console.log(`🔧 Scroll forçado: ${before} → ${after} (diff: ${after - before})`);
      return after - before;
    }
    return 0;
  },
  
  smoothScroll: (targetPosition = 100) => {
    if (container) {
      container.scrollTo({ top: targetPosition, behavior: 'smooth' });
      console.log(`🌊 Scroll suave para: ${targetPosition}px`);
    }
  },
  
  testAllMethods: () => {
    console.log('\n🧪 Testando todos os métodos de scroll...');
    
    const methods = [
      () => container.scrollTop += 50,
      () => container.scrollBy(0, 50),
      () => container.scrollBy({ top: 50 }),
      () => container.scrollTo(0, container.scrollTop + 50),
      () => container.scrollTo({ top: container.scrollTop + 50 })
    ];
    
    methods.forEach((method, index) => {
      setTimeout(() => {
        const before = container.scrollTop;
        method();
        setTimeout(() => {
          const after = container.scrollTop;
          console.log(`Método ${index + 1}: ${before} → ${after} (${after > before ? '✅' : '❌'})`);
        }, 100);
      }, index * 500);
    });
  },
  
  resetScroll: () => {
    if (container) {
      container.scrollTop = 0;
      console.log('🔄 Scroll resetado para o topo');
    }
  },
  
  info: () => {
    console.log('ℹ️ Container info:', containerInfo);
  }
};

console.log('\n💡 Comandos disponíveis:');
console.log('- window.scrollContainerTest.forceScroll(100) // Scroll direto');
console.log('- window.scrollContainerTest.smoothScroll(200) // Scroll suave');
console.log('- window.scrollContainerTest.testAllMethods() // Testar todos os métodos');
console.log('- window.scrollContainerTest.resetScroll() // Voltar ao topo');
console.log('- window.scrollContainerTest.info() // Info do container');

} // Fechamento do else

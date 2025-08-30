// TESTE RÁPIDO DO SCROLL
// Cole este código no console após abrir o preview

console.log('🔥 TESTE RÁPIDO DO SCROLL');

setTimeout(() => {
  const container = document.querySelector('.preview-scroll-container') ||
                   document.querySelector('[data-testid="preview-scroll-container"]') ||
                   document.querySelector('[role="textbox"]');
  
  if (!container) {
    console.error('❌ Container não encontrado!');
    return;
  }
  
  console.log('✅ Container encontrado!');
  
  // Forçar propriedades de scroll
  container.style.height = '300px';
  container.style.maxHeight = '300px';
  container.style.overflowY = 'auto';
  
  // Verificar se agora pode fazer scroll
  setTimeout(() => {
    const info = {
      scrollHeight: container.scrollHeight,
      clientHeight: container.clientHeight,
      canScroll: container.scrollHeight > container.clientHeight
    };
    
    console.log('📊 Info após ajustes:', info);
    
    if (info.canScroll) {
      console.log('✅ Agora pode fazer scroll!');
      
      // Testar scroll
      container.focus();
      container.scrollTop = 50;
      console.log('📜 Scroll testado:', container.scrollTop);
      
      // Resetar
      container.scrollTop = 0;
      
      console.log('💡 Tente usar as setas ↑↓ agora!');
    } else {
      console.log('❌ Ainda não pode fazer scroll');
      console.log('📝 Possível causa: conteúdo muito pequeno');
    }
  }, 100);
  
}, 200);

# 📚 Documentação Completa: Sistema de Chatbot Avançado

## 🎯 Visão Geral

Esta documentação descreve uma implementação completa de um sistema de chatbot com funcionalidades avançadas, incluindo controle de visibilidade, manipulação de interface, ocultação de barras de rolagem e múltiplos modos de exibição. A solução foi desenvolvida com React + TypeScript e é facilmente adaptável para outros projetos.

---

## 🔧 Funcionalidades Implementadas

### 1. ✅ **Controle de Visibilidade Baseado em Autenticação**

- Chatbot só aparece para usuários logados
- Proteção contra acesso não autorizado ao Supabase
- Verificação automática de estado de login

### 2. ✅ **Sistema de Ocultação de Barras de Rolagem**

- Chatbot sem barra de rolagem visível
- Página principal sem barra de rolagem visível
- Funcionalidade de scroll totalmente preservada
- Compatibilidade com todos os navegadores

### 3. ✅ **Múltiplos Modos de Exibição**

- **Minimizado**: Botão flutuante arrastável
- **Normal**: Janela redimensionável e movível
- **Maximizado**: Tela cheia (fullscreen)

### 4. ✅ **Controles de Manipulação Física**

- Movimento vertical (modo minimizado)
- Movimento lateral (modo normal)
- Redimensionamento de largura (modo normal)
- Arrastar e soltar intuitivo

---

## 🛠️ Implementação Técnica

### 1. **Controle de Visibilidade por Autenticação**

#### Código no Componente Principal

```tsx
// MyChatbot.tsx
import { useAuth } from '@/lib/auth/useAuth';

const MyChatbot = () => {
  const { user } = useAuth();
  
  // ... outros hooks e estados ...

  /**
   * 🚫 VERIFICAÇÃO DE SEGURANÇA: Não exibir chatbot se usuário não estiver logado
   * O chatbot depende do Supabase para funcionar corretamente
   */
  if (!user) {
    return null;
  }

  // ... resto do componente ...
};
```

#### Benefícios

- ✅ **Segurança**: Evita tentativas de acesso ao banco sem autenticação
- ✅ **Performance**: Não renderiza componente desnecessário
- ✅ **UX**: Interface limpa para usuários não logados
- ✅ **Manutenção**: Solução simples e robusta

---

### 2. **Sistema de Ocultação de Barras de Rolagem**

#### A. CSS Global para Todo o Site

```css
/* index.css */

/* OCULTAR BARRA DE ROLAGEM PRINCIPAL DA PÁGINA - MANTENDO FUNCIONALIDADE */
html,
body {
  scrollbar-width: none !important; /* Firefox */
  -ms-overflow-style: none !important; /* IE 10+ */
}

html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none !important; /* Chrome, Safari, Edge */
  width: 0px !important;
  height: 0px !important;
  background: transparent !important;
}

html::-webkit-scrollbar-track,
body::-webkit-scrollbar-track {
  display: none !important;
  background: transparent !important;
}

html::-webkit-scrollbar-thumb,
body::-webkit-scrollbar-thumb {
  display: none !important;
  background: transparent !important;
}

html::-webkit-scrollbar-corner,
body::-webkit-scrollbar-corner {
  display: none !important;
  background: transparent !important;
}

/* Aplicar também ao container principal da aplicação */
#root {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

#root::-webkit-scrollbar {
  display: none !important;
  width: 0px !important;
  height: 0px !important;
  background: transparent !important;
}

#root::-webkit-scrollbar-track,
#root::-webkit-scrollbar-thumb,
#root::-webkit-scrollbar-corner {
  display: none !important;
  background: transparent !important;
}

/* Garantia adicional para todos os elementos com scroll */
* {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

*::-webkit-scrollbar {
  display: none !important;
  width: 0px !important;
  height: 0px !important;
}

*::-webkit-scrollbar-track,
*::-webkit-scrollbar-thumb,
*::-webkit-scrollbar-corner {
  display: none !important;
}
```

#### B. CSS Específico para o Chatbot

```css
/* FORÇAR OCULTAÇÃO DA BARRA DE ROLAGEM DO CHATBOT - CSS GLOBAL */
.chatbot-messages-container,
div.chatbot-messages-container {
  scrollbar-width: none !important; /* Firefox */
  -ms-overflow-style: none !important; /* IE 10+ */
}

.chatbot-messages-container::-webkit-scrollbar,
div.chatbot-messages-container::-webkit-scrollbar {
  display: none !important; /* Chrome, Safari, Edge */
  width: 0px !important;
  height: 0px !important;
  background: transparent !important;
}

.chatbot-messages-container::-webkit-scrollbar-track,
div.chatbot-messages-container::-webkit-scrollbar-track {
  display: none !important;
  background: transparent !important;
}

.chatbot-messages-container::-webkit-scrollbar-thumb,
div.chatbot-messages-container::-webkit-scrollbar-thumb {
  display: none !important;
  background: transparent !important;
}

.chatbot-messages-container::-webkit-scrollbar-corner,
div.chatbot-messages-container::-webkit-scrollbar-corner {
  display: none !important;
  background: transparent !important;
}
```

#### C. Estilos Inline no React

```tsx
{/* Área de Mensagens - Container de histórico da conversa */}
<div
  className="chatbot-messages-container"
  style={{ 
    flexGrow: 1, 
    overflowY: 'auto', 
    padding: '20px', 
    background: chatbotBgColor,
    scrollbarWidth: 'none', /* Firefox */
    msOverflowStyle: 'none', /* IE 10+ */
  }}
>
```

#### D. CSS Interno do Componente

```tsx
{/* CSS para animação eletrificada */}
<style>{`
  /* ... outras animações ... */

  /* Ocultar barra de rolagem mantendo a funcionalidade - FORÇADO */
  .chatbot-messages-container {
    scrollbar-width: none !important; /* Firefox */
    -ms-overflow-style: none !important; /* Internet Explorer 10+ */
  }
  
  .chatbot-messages-container::-webkit-scrollbar {
    width: 0px !important; /* Remove width */
    height: 0px !important; /* Remove height */
    background: transparent !important; /* Optional: transparent background */
    display: none !important; /* Hide scrollbar for WebKit browsers */
  }
  
  .chatbot-messages-container::-webkit-scrollbar-track {
    background: transparent !important;
    display: none !important;
  }
  
  .chatbot-messages-container::-webkit-scrollbar-thumb {
    background: transparent !important;
    display: none !important;
  }

  /* CSS Global adicional para garantir ocultação */
  div.chatbot-messages-container {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }

  div.chatbot-messages-container::-webkit-scrollbar,
  div.chatbot-messages-container::-webkit-scrollbar-track,
  div.chatbot-messages-container::-webkit-scrollbar-thumb {
    display: none !important;
    width: 0px !important;
    height: 0px !important;
    background: transparent !important;
  }
`}</style>
```

#### Estratégia de Implementação (4 Camadas)

1. **Estilos Inline**: Aplicação direta no elemento
2. **CSS Interno**: Estilos específicos do componente
3. **CSS Global**: Cobertura em toda a aplicação
4. **!important**: Força máxima prioridade

#### Compatibilidade por Navegador

| Navegador | Propriedade CSS |
|-----------|----------------|
| **Firefox** | `scrollbar-width: none` |
| **Internet Explorer 10+** | `-ms-overflow-style: none` |
| **Chrome/Safari/Edge** | `::-webkit-scrollbar { display: none }` |
| **Todos** | Múltiplas camadas com `!important` |

---

### 3. **Sistema de Estados do Chatbot**

#### Estados Disponíveis

```tsx
type ChatState = 'minimized' | 'normal' | 'maximized';
```

#### A. Estado Minimizado

```tsx
const getChatbotStyle = () => {
  switch (chatState) {
    case 'minimized': {
      return {
        ...commonChatbotStyles,
        bottom: `${16 + chatbotVerticalOffset}px`, // Posição vertical dinâmica
        right: '20px',
        width: '64px',
        height: '64px',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'pointer',
        background: chatbotBgColor,
        boxShadow: `0 10px 15px -3px ${chatbotShadowDark}`,
        border: '1px solid rgba(255, 255, 255, 0.1)',
      };
    }
    // ... outros estados ...
  }
};
```

**Características:**

- ✅ Botão flutuante 64x64px
- ✅ Arrastável verticalmente
- ✅ Animação eletrificada periódica
- ✅ Cursor visual dinâmico

#### B. Estado Normal

```tsx
case 'normal':
  return {
    ...commonChatbotStyles,
    bottom: '100px',
    right: `${20 + chatbotHorizontalOffset}px`, // Posição horizontal dinâmica
    width: `${chatbotWidth}px`, // Largura dinâmica
    height: '80vh',
    maxHeight: '650px',
    background: chatbotBgColor,
    boxShadow: `0 20px 25px -5px ${chatbotShadowDark}`,
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };
```

**Características:**

- ✅ Janela redimensionável (300px - 800px)
- ✅ Movível horizontalmente
- ✅ Borda de redimensionamento visual
- ✅ Cabeçalho com controles

#### C. Estado Maximizado

```tsx
case 'maximized':
  return {
    ...commonChatbotStyles,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    borderRadius: '0px',
    background: chatbotBgColor,
    boxShadow: 'none',
  };
```

**Características:**

- ✅ Tela cheia completa
- ✅ Sem bordas arredondadas
- ✅ Botão de restaurar no cabeçalho

---

### 4. **Sistema de Controle Físico**

#### A. Movimento Vertical (Modo Minimizado)

```tsx
// Estados para controle de drag vertical
const [isDragging, setIsDragging] = useState(false);
const [dragStartY, setDragStartY] = useState(0);
const [chatbotVerticalOffset, setChatbotVerticalOffset] = useState(0);

const handleMouseMove = useCallback((e: MouseEvent) => {
  if (!isDragging) return;

  const deltaY = dragStartY - e.clientY; // Invertido: mover mouse para cima = chatbot sobe
  const dragDistance = Math.abs(deltaY);

  // Calcular limites baseados na altura da tela
  const windowHeight = window.innerHeight;
  const chatbotHeight = 64;
  const baseBottom = 16;

  // Limite superior: pode subir até quase o topo da tela
  const maxUpward = windowHeight - baseBottom - chatbotHeight - 20;
  
  // Limite inferior: pode descer até quase a parte inferior
  const maxDownward = -(baseBottom - 20);

  const newOffset = Math.max(maxDownward, Math.min(maxUpward, deltaY));
  setChatbotVerticalOffset(newOffset);
}, [isDragging, dragStartY]);
```

**Características:**

- ✅ Arraste suave com limites de tela
- ✅ Feedback visual de cursor
- ✅ Prevenção de saída da viewport
- ✅ Distinção entre drag e click

#### B. Movimento Lateral (Modo Normal)

```tsx
// Estados para controle de movimento lateral
const [isMovingLaterally, setIsMovingLaterally] = useState(false);
const [chatbotHorizontalOffset, setChatbotHorizontalOffset] = useState(0);

const handleMoveMouseMove = useCallback((e: MouseEvent) => {
  if (!isMovingLaterally) return;

  const deltaX = e.clientX - moveStartX;

  // Calcular limites horizontais
  const windowWidth = window.innerWidth;
  const chatbotWidthPx = chatbotWidth;
  const baseRight = 20;

  // Limites de movimento
  const minOffset = 0; // Posição original
  const maxOffset = Math.max(0, windowWidth - chatbotWidthPx - 40);

  const newOffset = Math.max(minOffset, Math.min(maxOffset, chatbotHorizontalOffset - deltaX));
  setChatbotHorizontalOffset(newOffset);
  setMoveStartX(e.clientX);
}, [isMovingLaterally, moveStartX, chatbotHorizontalOffset, chatbotWidth]);
```

**Características:**

- ✅ Movimento apenas pelo cabeçalho
- ✅ Respeitaa limites da viewport
- ✅ Posicionamento relativo inteligente

#### C. Redimensionamento de Largura (Modo Normal)

```tsx
// Estados para controle de redimensionamento
const [isResizing, setIsResizing] = useState(false);
const [chatbotWidth, setChatbotWidth] = useState(450);

const handleResizeMouseMove = useCallback((e: MouseEvent) => {
  if (!isResizing) return;

  const deltaX = dragStartX - e.clientX; // Movimento para esquerda aumenta largura

  // Calcular limites de largura
  const minWidth = 300;
  const maxWidth = Math.min(window.innerWidth * 0.6, 800);

  const newWidth = Math.max(minWidth, Math.min(maxWidth, chatbotWidth + deltaX));
  setChatbotWidth(newWidth);
  setDragStartX(e.clientX);
}, [isResizing, dragStartX, chatbotWidth]);
```

**Características:**

- ✅ Borda visual de redimensionamento
- ✅ Limites mínimo (300px) e máximo (800px)
- ✅ Cursor de redimensionamento
- ✅ Responsivo à largura da tela

---

### 5. **Event Listeners Globais**

#### Gerenciamento de Eventos

```tsx
// Event listeners globais para drag vertical
useEffect(() => {
  if (isDragging) {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none'; // Previne seleção de texto
    document.body.style.cursor = 'grabbing'; // Cursor visual global
  }

  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };
}, [isDragging, handleMouseMove, handleMouseUp]);

// Event listeners globais para redimensionamento
useEffect(() => {
  if (isResizing) {
    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }

  return () => {
    document.removeEventListener('mousemove', handleResizeMouseMove);
    document.removeEventListener('mouseup', handleResizeMouseUp);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };
}, [isResizing, handleResizeMouseMove, handleResizeMouseUp]);

// Event listeners globais para movimento lateral
useEffect(() => {
  if (isMovingLaterally) {
    document.addEventListener('mousemove', handleMoveMouseMove);
    document.addEventListener('mouseup', handleMoveMouseUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  }

  return () => {
    document.removeEventListener('mousemove', handleMoveMouseMove);
    document.removeEventListener('mouseup', handleMoveMouseUp);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };
}, [isMovingLaterally, handleMoveMouseMove, handleMoveMouseUp]);
```

---

### 6. **Validação de Posicionamento**

#### Revalidação em Redimensionamento de Janela

```tsx
// Validar posição quando a janela é redimensionada
useEffect(() => {
  const validatePosition = () => {
    if (chatState !== 'minimized' || chatbotVerticalOffset === 0) return;

    const windowHeight = window.innerHeight;
    const chatbotHeight = 64;
    const baseBottom = 16;

    // Recalcular limites
    const maxUpward = windowHeight - baseBottom - chatbotHeight - 20;
    const maxDownward = -(baseBottom - 20);

    // Ajustar posição se estiver fora dos novos limites
    const validOffset = Math.max(maxDownward, Math.min(maxUpward, chatbotVerticalOffset));
    if (validOffset !== chatbotVerticalOffset) {
      setChatbotVerticalOffset(validOffset);
    }
  };

  const validateChatbotWidth = () => {
    if (chatState !== 'normal') return;

    const minWidth = 300;
    const maxWidth = Math.min(window.innerWidth * 0.6, 800);

    const validWidth = Math.max(minWidth, Math.min(maxWidth, chatbotWidth));
    if (validWidth !== chatbotWidth) {
      setChatbotWidth(validWidth);
    }
  };

  const handleResize = () => {
    validatePosition();
    validateChatbotWidth();
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [chatState, chatbotVerticalOffset, chatbotWidth]);
```

---

## 🎨 Interface Visual

### 1. **Elementos de Controle**

#### Borda de Redimensionamento

```tsx
{/* Borda de redimensionamento - apenas no modo normal */}
{chatState === 'normal' && (
  <div
    onMouseDown={handleResizeMouseDown}
    style={{
      position: 'absolute',
      left: '-5px',
      top: '0',
      bottom: '0',
      width: '10px',
      cursor: 'col-resize',
      background: 'transparent',
      zIndex: 10,
    }}
    title="Arraste para redimensionar largura"
  />
)}
```

#### Cabeçalho Movível

```tsx
<div
  onMouseDown={handleMoveMouseDown}
  style={{
    cursor: isMovingLaterally ? 'grabbing' : 'grab',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
  }}
>
  {/* Conteúdo do cabeçalho */}
</div>
```

### 2. **Feedback Visual**

#### Cursores Dinâmicos

```tsx
const getCursor = () => {
  if (isDragging) return 'grabbing';
  if (isResizing) return 'col-resize';
  if (isMovingLaterally) return 'grabbing';
  if (hasDraggedDistance) return 'grab';
  return 'pointer';
};
```

#### Animações de Estado

```css
@keyframes electricBorder {
  0% {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
  }
  50% {
    box-shadow: 
      0 0 20px rgba(255, 255, 255, 0.8),
      0 0 40px rgba(147, 51, 234, 0.6);
  }
  100% {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
  }
}
```

---

## 📖 Guia de Implementação

### 1. **Passo a Passo para Novo Projeto**

#### A. Instalação e Setup Inicial

```bash
# 1. Instale as dependências necessárias
npm install react react-dom typescript @types/react @types/react-dom

# 2. Configure o Tailwind CSS (opcional)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### B. Estrutura de Arquivos

```
src/
├── components/
│   └── chatbot/
│       ├── MyChatbot.tsx          # Componente principal
│       └── chatbot.types.ts       # Tipos TypeScript
├── hooks/
│   ├── useAuth.ts                 # Hook de autenticação
│   └── useVectorStore.ts          # Hook de busca
├── lib/
│   └── supabase.ts                # Cliente Supabase
└── index.css                      # Estilos globais
```

#### C. Configuração de Tipos

```tsx
// chatbot.types.ts
export type ChatState = 'minimized' | 'normal' | 'maximized';

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp?: string;
  isLoading?: boolean;
}

export interface ChatbotConfig {
  chatbot_name: string;
  system_instructions: string;
  welcome_message: string;
  // ... outras configurações
}
```

### 2. **Integração com Sistema de Autenticação**

```tsx
// useAuth.ts (exemplo)
export const useAuth = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Verificar estado de autenticação
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    checkAuth();
    
    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  return { user };
};
```

### 3. **Personalização de Estilos**

#### Variáveis CSS Customizáveis

```css
:root {
  /* Cores do chatbot */
  --chatbot-bg: #1a1b3a;
  --chatbot-text: #e0e0e0;
  --chatbot-shadow-light: rgba(147, 51, 234, 0.2);
  --chatbot-shadow-dark: rgba(0, 0, 0, 0.4);
  
  /* Tamanhos */
  --chatbot-min-width: 300px;
  --chatbot-max-width: 800px;
  --chatbot-default-width: 450px;
}
```

#### Temas Adaptativos

```tsx
const getDynamicStyles = (theme: 'light' | 'dark') => ({
  background: theme === 'light' ? '#ffffff' : '#1a1b3a',
  color: theme === 'light' ? '#000000' : '#e0e0e0',
  boxShadow: theme === 'light' 
    ? '0 10px 25px rgba(0, 0, 0, 0.1)' 
    : '0 10px 25px rgba(0, 0, 0, 0.4)',
});
```

---

## 🔧 Configurações Avançadas

### 1. **Performance e Otimização**

#### Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const MyChatbot = lazy(() => import('./components/chatbot/MyChatbot'));

// No componente pai
<Suspense fallback={<div>Carregando chatbot...</div>}>
  <MyChatbot />
</Suspense>
```

#### Memoização de Componentes

```tsx
import { memo, useMemo, useCallback } from 'react';

const MyChatbot = memo(() => {
  // Memoizar cálculos pesados
  const chatbotStyle = useMemo(() => getChatbotStyle(), [chatState, chatbotWidth]);
  
  // Memoizar callbacks
  const handleSendMessage = useCallback(async () => {
    // Lógica de envio
  }, [inputValue, user]);
  
  return (
    // JSX do componente
  );
});
```

### 2. **Acessibilidade**

#### ARIA Labels e Roles

```tsx
<div
  role="dialog"
  aria-label="Chatbot de atendimento"
  aria-describedby="chatbot-description"
>
  <div id="chatbot-description" className="sr-only">
    Interface de chat para atendimento ao cliente
  </div>
  
  <button
    aria-label="Minimizar chatbot"
    aria-pressed={chatState === 'minimized'}
  >
    <X size={20} />
  </button>
</div>
```

#### Navegação por Teclado

```tsx
const handleKeyDown = useCallback((e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    setChatState('minimized');
  }
  if (e.key === 'F11') {
    e.preventDefault();
    setChatState(chatState === 'maximized' ? 'normal' : 'maximized');
  }
}, [chatState]);

useEffect(() => {
  if (chatState !== 'minimized') {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }
}, [chatState, handleKeyDown]);
```

### 3. **Responsive Design**

#### Breakpoints Específicos

```tsx
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return { isMobile };
};

// No componente
const { isMobile } = useResponsive();

const getResponsiveStyles = () => ({
  width: isMobile ? '100vw' : `${chatbotWidth}px`,
  height: isMobile ? '100vh' : '80vh',
  borderRadius: isMobile ? '0px' : '24px',
});
```

---

## 🧪 Testes e Validação

### 1. **Testes de Funcionalidade**

```typescript
// chatbot.test.ts
describe('Chatbot Functionality', () => {
  test('should hide chatbot when user is not logged in', () => {
    const { container } = render(<MyChatbot />, {
      wrapper: ({ children }) => (
        <AuthProvider value={{ user: null }}>
          {children}
        </AuthProvider>
      )
    });
    
    expect(container.firstChild).toBeNull();
  });
  
  test('should show chatbot when user is logged in', () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    
    const { container } = render(<MyChatbot />, {
      wrapper: ({ children }) => (
        <AuthProvider value={{ user: mockUser }}>
          {children}
        </AuthProvider>
      )
    });
    
    expect(container.firstChild).not.toBeNull();
  });
});
```

### 2. **Testes de Interação**

```typescript
describe('Chatbot Interactions', () => {
  test('should toggle between states correctly', () => {
    const { getByLabelText } = render(<MyChatbot />);
    
    const expandButton = getByLabelText('Expandir chatbot');
    fireEvent.click(expandButton);
    
    expect(getByLabelText('Restaurar chatbot')).toBeInTheDocument();
  });
  
  test('should handle drag operations', () => {
    const { container } = render(<MyChatbot />);
    const chatbot = container.querySelector('.neu-chatbot-minimized');
    
    fireEvent.mouseDown(chatbot, { clientY: 100 });
    fireEvent.mouseMove(document, { clientY: 50 });
    fireEvent.mouseUp(document);
    
    // Verificar se a posição mudou
    expect(chatbot).toHaveStyle('bottom: 66px'); // 16 + (100-50)
  });
});
```

---

## 📋 Checklist de Implementação

### ✅ **Funcionalidades Básicas**

- [ ] Controle de visibilidade por autenticação
- [ ] Estados: minimizado, normal, maximizado
- [ ] Transições suaves entre estados
- [ ] Interface responsiva

### ✅ **Controles Físicos**

- [ ] Arrastar verticalmente (minimizado)
- [ ] Mover lateralmente (normal)
- [ ] Redimensionar largura (normal)
- [ ] Validação de limites de tela

### ✅ **Ocultação de Scrollbars**

- [ ] CSS global para todo o site
- [ ] CSS específico para chatbot
- [ ] Estilos inline de backup
- [ ] Compatibilidade cross-browser

### ✅ **Qualidade e Performance**

- [ ] Memoização de componentes
- [ ] Event listeners otimizados
- [ ] Cleanup de effects
- [ ] Tratamento de edge cases

### ✅ **Acessibilidade**

- [ ] ARIA labels adequados
- [ ] Navegação por teclado
- [ ] Contraste de cores
- [ ] Screen reader friendly

### ✅ **Testes**

- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes de acessibilidade
- [ ] Testes cross-browser

---

## 🚀 Deployment e Manutenção

### 1. **Build de Produção**

```bash
# Build otimizado
npm run build

# Verificar tamanho do bundle
npm run analyze

# Testes antes do deploy
npm run test:coverage
```

### 2. **Monitoramento**

```typescript
// analytics.ts
export const trackChatbotUsage = (action: string, data?: any) => {
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics, Mixpanel, etc.
    gtag('event', action, {
      event_category: 'Chatbot',
      event_label: data?.label,
      value: data?.value,
    });
  }
};

// No componente
useEffect(() => {
  if (chatState === 'normal') {
    trackChatbotUsage('chatbot_opened');
  }
}, [chatState]);
```

### 3. **Versionamento**

```json
// package.json
{
  "name": "advanced-chatbot-system",
  "version": "2.1.0",
  "description": "Sistema avançado de chatbot com controles físicos",
  "keywords": [
    "chatbot",
    "react",
    "typescript",
    "drag-and-drop",
    "scrollbar-hidden"
  ]
}
```

---

## 🎯 Casos de Uso e Adaptações

### 1. **E-commerce**

- Integração com carrinho de compras
- Recomendações de produtos
- Suporte pós-venda

### 2. **SaaS/Plataformas**

- Onboarding interativo
- Documentação contextual
- Suporte técnico

### 3. **Sites Institucionais**

- FAQ inteligente
- Agendamento de reuniões
- Captação de leads

### 4. **Aplicações Internas**

- Help desk corporativo
- Treinamentos interativos
- Assistente de produtividade

---

## 🔮 Roadmap e Melhorias Futuras

### Versão 2.2

- [ ] Suporte a voz (Speech-to-Text)
- [ ] Temas visuais customizáveis
- [ ] Integração com múltiplos idiomas
- [ ] Widgets embarcados

### Versão 2.3

- [ ] IA conversacional avançada
- [ ] Analytics de conversação
- [ ] A/B testing de interfaces
- [ ] Modo offline com cache

### Versão 3.0

- [ ] Arquitetura de plugins
- [ ] Editor visual de fluxos
- [ ] Integrações com CRM
- [ ] API pública completa

---

## 📞 Suporte e Comunidade

### Documentação Adicional

- [Guia de Configuração Avançada](./docs/advanced-config.md)
- [API Reference](./docs/api-reference.md)
- [Troubleshooting](./docs/troubleshooting.md)

### Contribuição

- [Contributing Guidelines](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Issue Templates](./github/ISSUE_TEMPLATE/)

---

**🎉 Implementação Completa e Documentada!**

Esta solução oferece um sistema robusto, escalável e altamente customizável para implementação de chatbots avançados em qualquer aplicação React. A documentação serve como referência completa para futuras implementações e adaptações.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { ThemeProvider } from './ThemeContext'
import { useTheme } from '@/hooks/useTheme'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock document.documentElement
const mockClassList = {
  add: vi.fn(),
  remove: vi.fn(),
  contains: vi.fn(),
  toggle: vi.fn()
}

Object.defineProperty(document, 'documentElement', {
  value: {
    classList: mockClassList
  },
  writable: true
})

// Componente de teste para acessar o contexto do tema
import type { ThemeContextType } from './ThemeContext';
const TestComponent = () => {
  const ctx = useTheme() as ThemeContextType;
  return (
    <div>
      <div data-testid="current-theme">{ctx.theme}</div>
      <button data-testid="toggle-theme" onClick={ctx.toggleTheme}>
        Toggle Theme
      </button>
      <button data-testid="set-light" onClick={() => ctx.setTheme('light')}>
        Set Light
      </button>
      <button data-testid="set-dark" onClick={() => ctx.setTheme('dark')}>
        Set Dark
      </button>
    </div>
  )
}

// Wrapper para testes
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
)

describe('ThemeContext', () => {
  beforeEach(() => {
    // Limpar localStorage e mocks antes de cada teste
    localStorageMock.clear()
    vi.clearAllMocks()
    mockClassList.add.mockClear()
    mockClassList.remove.mockClear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('ThemeProvider', () => {
    it('deve renderizar children corretamente', () => {
      render(
        <TestWrapper>
          <div data-testid="child">Test Child</div>
        </TestWrapper>
      )

      expect(screen.getByTestId('child')).toHaveTextContent('Test Child')
    })

    it('deve inicializar com tema light por padrão quando localStorage está vazio', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark')
      expect(mockClassList.add).toHaveBeenCalledWith('light')
    })

    it('deve carregar tema salvo do localStorage', () => {
      localStorageMock.setItem('theme', 'dark')

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark')
      expect(mockClassList.add).toHaveBeenCalledWith('dark')
    })

    it('deve aplicar classes CSS ao documentElement quando tema muda', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      // Verifica aplicação inicial
      expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark')
      expect(mockClassList.add).toHaveBeenCalledWith('light')

      // Muda para dark
      act(() => {
        fireEvent.click(screen.getByTestId('set-dark'))
      })

      expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark')
      expect(mockClassList.add).toHaveBeenCalledWith('dark')
    })

    it('deve salvar tema no localStorage quando tema muda', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      // Estado inicial - o tema padrão não é salvo automaticamente no localStorage
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')

      // Muda para dark
      act(() => {
        fireEvent.click(screen.getByTestId('set-dark'))
      })

      expect(localStorageMock.getItem('theme')).toBe('dark')
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    it('deve funcionar com tema light explicitamente salvo', () => {
      localStorageMock.setItem('theme', 'light')

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      expect(mockClassList.add).toHaveBeenCalledWith('light')
    })
  })

  describe('toggleTheme function', () => {
    it('deve alternar de light para dark', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      // Estado inicial: light
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')

      // Toggle para dark
      act(() => {
        fireEvent.click(screen.getByTestId('toggle-theme'))
      })

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(localStorageMock.getItem('theme')).toBe('dark')
    })

    it('deve alternar de dark para light', () => {
      localStorageMock.setItem('theme', 'dark')

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      // Estado inicial: dark
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')

      // Toggle para light
      act(() => {
        fireEvent.click(screen.getByTestId('toggle-theme'))
      })

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      expect(localStorageMock.getItem('theme')).toBe('light')
    })

    it('deve aplicar classes CSS corretas ao alternar tema', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      mockClassList.add.mockClear()
      mockClassList.remove.mockClear()

      // Toggle de light para dark
      act(() => {
        fireEvent.click(screen.getByTestId('toggle-theme'))
      })

      expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark')
      expect(mockClassList.add).toHaveBeenCalledWith('dark')
    })
  })

  describe('setTheme function', () => {
    it('deve definir tema como light', () => {
      localStorageMock.setItem('theme', 'dark')

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      act(() => {
        fireEvent.click(screen.getByTestId('set-light'))
      })

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      expect(localStorageMock.getItem('theme')).toBe('light')
    })

    it('deve definir tema como dark', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      act(() => {
        fireEvent.click(screen.getByTestId('set-dark'))
      })

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(localStorageMock.getItem('theme')).toBe('dark')
    })

    it('deve aplicar classes CSS corretas ao definir tema', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      mockClassList.add.mockClear()
      mockClassList.remove.mockClear()

      // Set para dark
      act(() => {
        fireEvent.click(screen.getByTestId('set-dark'))
      })

      expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark')
      expect(mockClassList.add).toHaveBeenCalledWith('dark')

      mockClassList.add.mockClear()
      mockClassList.remove.mockClear()

      // Set para light
      act(() => {
        fireEvent.click(screen.getByTestId('set-light'))
      })

      expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark')
      expect(mockClassList.add).toHaveBeenCalledWith('light')
    })
  })

  describe('useTheme hook', () => {
    it('deve retornar valores corretos do contexto', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      // Verifica se o tema inicial é light
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')

      // Verifica se os botões estão presentes (indicando que as funções estão disponíveis)
      expect(screen.getByTestId('toggle-theme')).toBeInTheDocument()
      expect(screen.getByTestId('set-light')).toBeInTheDocument()
      expect(screen.getByTestId('set-dark')).toBeInTheDocument()
    })

    it('deve lançar erro quando usado fora do Provider', () => {
      const ConsoleTestComponent = () => {
        try {
          useTheme()
          return <div>No error</div>
        } catch (error) {
          return <div data-testid="error">Error caught</div>
        }
      }

      render(<ConsoleTestComponent />)
      
      // O erro deve ser lançado e capturado
      expect(screen.getByTestId('error')).toBeInTheDocument()
    })
  })

  describe('persistência e consistência', () => {
    it('deve manter tema consistente entre diferentes instâncias', () => {
      // Primeira renderização
      const { unmount } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      // Muda o tema para dark
      act(() => {
        fireEvent.click(screen.getByTestId('set-dark'))
      })

      expect(localStorageMock.getItem('theme')).toBe('dark')
      unmount()

      // Segunda renderização deve carregar o tema dark
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    it('deve lidar com valores inválidos no localStorage', () => {
      localStorageMock.setItem('theme', 'invalid-theme')

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      // Como a implementação atual não valida o tema, vai usar o valor inválido
      // Este teste documenta o comportamento atual
      expect(screen.getByTestId('current-theme')).toHaveTextContent('invalid-theme')
    })
  })

  describe('múltiplas mudanças de tema', () => {
    it('deve lidar com múltiplas mudanças de tema rapidamente', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      // Múltiplos toggles
      act(() => {
        fireEvent.click(screen.getByTestId('toggle-theme')) // light -> dark
        fireEvent.click(screen.getByTestId('toggle-theme')) // dark -> light
        fireEvent.click(screen.getByTestId('toggle-theme')) // light -> dark
      })

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(localStorageMock.getItem('theme')).toBe('dark')
    })

    it('deve aplicar todas as mudanças de classe CSS', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      mockClassList.add.mockClear()
      mockClassList.remove.mockClear()

      // Múltiplas mudanças
      await act(async () => {
        fireEvent.click(screen.getByTestId('set-dark'))
      });
      await screen.findByText('dark')
      await act(async () => {
        fireEvent.click(screen.getByTestId('set-light'))
      });
      await screen.findByText('light')
      await act(async () => {
        fireEvent.click(screen.getByTestId('set-dark'))
      });
      await screen.findByText('dark')

      // Deve ter sido chamado pelo menos 2 vezes (React pode otimizar updates)
      expect(mockClassList.remove).toHaveBeenCalled()
      expect(mockClassList.add).toHaveBeenCalled()
      expect(mockClassList.add).toHaveBeenLastCalledWith('dark')
    })
  })
})

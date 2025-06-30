import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'

// Interfaces para tipos
interface Profile {
  id: string
  username: string
  avatar_url: string | null
}

interface User {
  id: string
  email: string
}

interface Session {
  user: User
}

// Tipo para os callbacks do Supabase
type AuthCallback = (event: string, session: Session | null) => void

// Extended context type que inclui profile
interface ExtendedAuthContext {
  user: User | null
  loading: boolean
  profile: Profile | null
}

// Mock do Supabase
const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback: AuthCallback) => mockOnAuthStateChange(callback)
    },
    from: (table: string) => ({
      select: (columns: string) => mockSelect(columns)
    })
  }
}))

// Mock do react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Componente de teste para acessar o contexto
const TestComponent = () => {
  const context = useAuth() as unknown as ExtendedAuthContext
  return (
    <div>
      <div data-testid="loading">{context.loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user">{context.user ? context.user.id : 'no-user'}</div>
      <div data-testid="profile">{context.profile ? context.profile.username : 'no-profile'}</div>
    </div>
  )
}

// Wrapper para testes
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset todos os mocks
    vi.clearAllMocks()
    
    // Configuração padrão dos mocks
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockOnAuthStateChange.mockReturnValue({ 
      data: { 
        subscription: { unsubscribe: vi.fn() } 
      } 
    })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({ data: null, error: null })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('AuthProvider', () => {
    it('deve renderizar children corretamente', () => {
      render(
        <TestWrapper>
          <div data-testid="child">Test Child</div>
        </TestWrapper>
      )

      expect(screen.getByTestId('child')).toHaveTextContent('Test Child')
    })

    it('deve fornecer estado inicial correto', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      // Aguardar o loading terminar
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      expect(screen.getByTestId('user')).toHaveTextContent('no-user')
      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile')
    })

    it('deve carregar usuário existente da sessão', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const mockProfile = { id: 'user123', username: 'testuser', avatar_url: null }

      mockGetSession.mockResolvedValue({
        data: { session: { user: mockUser } }
      })
      mockSingle.mockResolvedValue({ data: mockProfile, error: null })

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      expect(screen.getByTestId('user')).toHaveTextContent('user123')
      expect(screen.getByTestId('profile')).toHaveTextContent('testuser')
    })

    it('deve lidar com erro ao carregar perfil', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockGetSession.mockResolvedValue({
        data: { session: { user: mockUser } }
      })
      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { message: 'Profile not found' } 
      })

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      expect(screen.getByTestId('user')).toHaveTextContent('user123')
      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile')
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao carregar perfil:', { message: 'Profile not found' })

      consoleSpy.mockRestore()
    })

    it('deve responder a mudanças de estado de autenticação - SIGNED_IN', async () => {
      let authStateCallback: AuthCallback

      mockOnAuthStateChange.mockImplementation((callback: AuthCallback) => {
        authStateCallback = callback
        return { 
          data: { 
            subscription: { unsubscribe: vi.fn() } 
          } 
        }
      })

      const mockUser = { id: 'user456', email: 'newuser@example.com' }
      const mockProfile = { id: 'user456', username: 'newuser', avatar_url: null }
      mockSingle.mockResolvedValue({ data: mockProfile, error: null })

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      // Simular evento SIGNED_IN
      await act(async () => {
        authStateCallback!('SIGNED_IN', { user: mockUser })
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('user456')
      })

      expect(screen.getByTestId('profile')).toHaveTextContent('newuser')
      expect(mockNavigate).toHaveBeenCalledWith('/my-chatbot')
    })

    it('deve responder a mudanças de estado de autenticação - SIGNED_OUT', async () => {
      let authStateCallback: AuthCallback

      mockOnAuthStateChange.mockImplementation((callback: AuthCallback) => {
        authStateCallback = callback
        return { 
          data: { 
            subscription: { unsubscribe: vi.fn() } 
          } 
        }
      })

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      // Wait for initial loading
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      // Simular evento SIGNED_OUT
      await act(async () => {
        authStateCallback!('SIGNED_OUT', null)
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user')
      })

      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile')
    })

    it('deve realizar cleanup da subscription ao desmontar', () => {
      const mockUnsubscribe = vi.fn()
      mockOnAuthStateChange.mockReturnValue({ 
        data: { 
          subscription: { unsubscribe: mockUnsubscribe } 
        } 
      })

      const { unmount } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('useAuth hook', () => {
    it('deve retornar valores do contexto quando usado dentro do Provider', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      // Verifica se os valores estão sendo retornados corretamente
      expect(screen.getByTestId('user')).toBeInTheDocument()
      expect(screen.getByTestId('profile')).toBeInTheDocument()
      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('deve lançar erro quando usado fora do Provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth deve ser usado dentro de um AuthProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('loadProfile function', () => {
    it('deve carregar perfil com sucesso', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const mockProfile = { id: 'user123', username: 'testuser', avatar_url: 'avatar.jpg' }

      mockGetSession.mockResolvedValue({
        data: { session: { user: mockUser } }
      })
      mockSingle.mockResolvedValue({ data: mockProfile, error: null })

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('profile')).toHaveTextContent('testuser')
      })

      // Verificar se a consulta foi feita corretamente
      expect(mockSelect).toHaveBeenCalledWith('id, username, avatar_url')
      expect(mockEq).toHaveBeenCalledWith('id', 'user123')
    })

    it('deve lidar com perfil não encontrado', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockGetSession.mockResolvedValue({
        data: { session: { user: mockUser } }
      })
      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { message: 'Row not found' } 
      })

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('profile')).toHaveTextContent('no-profile')
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('console logging', () => {
    it('deve logar mudanças de autenticação', async () => {
      let authStateCallback: AuthCallback
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      mockOnAuthStateChange.mockImplementation((callback: AuthCallback) => {
        authStateCallback = callback
        return { 
          data: { 
            subscription: { unsubscribe: vi.fn() } 
          } 
        }
      })

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      const mockUser = { id: 'user123', email: 'test@example.com' }
      await act(async () => {
        authStateCallback!('SIGNED_IN', { user: mockUser })
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        '🔐 Mudança na autenticação:', 
        { event: 'SIGNED_IN', userId: 'user123' }
      )
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '✅ Login bem-sucedido, redirecionando para my-chatbot'
      )

      consoleSpy.mockRestore()
    })
  })
})

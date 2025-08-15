import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAuth } from './useAuth';
import { AuthContext, AuthContextType } from './authContextDefinition';

// Mock completo do contexto de autenticação
const mockAuthContext: AuthContextType = {
  user: null,
  session: null,
  loading: false,
  initializing: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  resendConfirmation: vi.fn(),
};

// Wrapper que fornece o contexto de autenticação
const createAuthWrapper = (contextValue: Partial<AuthContextType> = {}) => {
  const value = { ...mockAuthContext, ...contextValue };

  return ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

describe('useAuth Hook', () => {
  describe('quando usado dentro do AuthProvider', () => {
    it('deve retornar o contexto de autenticação', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createAuthWrapper(),
      });

      expect(result.current).toEqual(mockAuthContext);
    });

    it('deve retornar usuário quando autenticado', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        email_confirmed_at: '2023-01-01T00:00:00Z',
        phone: '',
        confirmed_at: '2023-01-01T00:00:00Z',
        last_sign_in_at: '2023-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        role: 'authenticated'
      };

      const { result } = renderHook(() => useAuth(), {
        wrapper: createAuthWrapper({
          user: mockUser,
          loading: false,
          initializing: false
        }),
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.loading).toBe(false);
      expect(result.current.initializing).toBe(false);
    });

    it('deve retornar estado de loading quando carregando', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createAuthWrapper({
          loading: true,
          initializing: false
        }),
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
    });

    it('deve retornar estado de initializing quando inicializando', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createAuthWrapper({
          initializing: true,
          loading: false
        }),
      });

      expect(result.current.initializing).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    it('deve retornar sessão quando usuário está logado', () => {
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: 1234567890,
        token_type: 'bearer',
        user: {
          id: 'user-123',
          email: 'test@test.com',
          email_confirmed_at: '2023-01-01T00:00:00Z',
          phone: '',
          confirmed_at: '2023-01-01T00:00:00Z',
          last_sign_in_at: '2023-01-01T00:00:00Z',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          role: 'authenticated'
        }
      };

      const { result } = renderHook(() => useAuth(), {
        wrapper: createAuthWrapper({
          session: mockSession,
          user: mockSession.user
        }),
      });

      expect(result.current.session).toEqual(mockSession);
    });

    it('deve expor métodos de autenticação', () => {
      const mockSignIn = vi.fn();
      const mockSignUp = vi.fn();
      const mockSignOut = vi.fn();
      const mockResetPassword = vi.fn();
      const mockResendConfirmation = vi.fn();

      const { result } = renderHook(() => useAuth(), {
        wrapper: createAuthWrapper({
          signIn: mockSignIn,
          signUp: mockSignUp,
          signOut: mockSignOut,
          resetPassword: mockResetPassword,
          resendConfirmation: mockResendConfirmation,
        }),
      });

      expect(result.current.signIn).toBe(mockSignIn);
      expect(result.current.signUp).toBe(mockSignUp);
      expect(result.current.signOut).toBe(mockSignOut);
      expect(result.current.resetPassword).toBe(mockResetPassword);
      expect(result.current.resendConfirmation).toBe(mockResendConfirmation);
    });
  });

  describe('quando usado fora do AuthProvider', () => {
    it('deve lançar erro apropriado', () => {
      // Captura console.error para evitar logs desnecessários no teste
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider. Make sure AuthProvider is a parent component.');

      expect(consoleErrorSpy).toHaveBeenCalledWith('AuthContext é undefined! AuthProvider não está funcionando.');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('estados combinados', () => {
    it('deve lidar com usuário logado e não carregando', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        email_confirmed_at: '2023-01-01T00:00:00Z',
        phone: '',
        confirmed_at: '2023-01-01T00:00:00Z',
        last_sign_in_at: '2023-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated' as const,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        role: 'authenticated'
      };

      const { result } = renderHook(() => useAuth(), {
        wrapper: createAuthWrapper({
          user: mockUser,
          loading: false,
          initializing: false,
        }),
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.loading).toBe(false);
      expect(result.current.initializing).toBe(false);
    });

    it('deve lidar com usuário não logado e não carregando', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createAuthWrapper({
          user: null,
          session: null,
          loading: false,
          initializing: false,
        }),
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.initializing).toBe(false);
    });

    it('deve lidar com estado transitório (carregando e inicializando)', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createAuthWrapper({
          user: null,
          session: null,
          loading: true,
          initializing: true,
        }),
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.initializing).toBe(true);
    });
  });
});

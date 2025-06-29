import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock do useAuth
const mockUseAuth = vi.fn();
vi.mock('../lib/auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock simplificado do Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
};

vi.mock('../integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Wrapper para testes com React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useChatbot Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('estado inicial', () => {
    it('deve inicializar com estado padrão quando usuário não está logado', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        initializing: false,
      });

      const { useChatbot } = await import('./useChatbot');
      
      const { result } = renderHook(() => useChatbot(), {
        wrapper: createWrapper(),
      });

      expect(result.current.chatbotData).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.updateChatbotData).toBe('function');
      expect(typeof result.current.refetch).toBe('function');
    });

    it('deve não buscar dados quando usuário está inicializando', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        initializing: true,
      });

      const { useChatbot } = await import('./useChatbot');
      
      const { result } = renderHook(() => useChatbot(), {
        wrapper: createWrapper(),
      });

      expect(result.current.chatbotData).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe('fetchChatbotData', () => {
    it('deve buscar dados existentes do chatbot com sucesso', async () => {
      const mockChatbotData = {
        user_id: 'user-123',
        system_message: 'Você é um assistente médico',
        office_address: 'Rua das Flores, 123',
        office_hours: '8h às 18h',
        specialties: 'Cardiologia',
        chatbot_name: 'Dr. Silva Bot',
        welcome_message: 'Olá! Como posso ajudar?',
        whatsapp: '11999999999',
      };

      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        initializing: false,
      });

      // Mock da cadeia de métodos do Supabase
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockChatbotData,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: mockSingle,
          })),
        })),
        insert: vi.fn(),
        update: vi.fn(),
      });

      const { useChatbot } = await import('./useChatbot');
      
      const { result } = renderHook(() => useChatbot(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.chatbotData).toEqual(mockChatbotData);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('mychatbot');
    });

    it('deve tratar erro ao buscar dados', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        initializing: false,
      });

      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection error' },
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: mockSingle,
          })),
        })),
        insert: vi.fn(),
        update: vi.fn(),
      });

      const { useChatbot } = await import('./useChatbot');
      
      const { result } = renderHook(() => useChatbot(), {
        wrapper: createWrapper(),
      });

      // Wait for all retries to complete (hook has retry logic with delays)
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 5000 });

      // After retries are exhausted, error should be set
      await waitFor(() => {
        expect(result.current.error).toBe('Database connection error');
        expect(result.current.chatbotData).toBeNull();
      }, { timeout: 1000 });
    });
  });

  describe('updateChatbotData', () => {
    it('deve retornar early quando usuário não está logado', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        initializing: false,
      });

      const { useChatbot } = await import('./useChatbot');
      
      const { result } = renderHook(() => useChatbot(), {
        wrapper: createWrapper(),
      });

      const updateResult = await result.current.updateChatbotData({
        chatbot_name: 'New Bot',
      });

      expect(updateResult).toBeUndefined();
    });
  });

  describe('refetch', () => {
    it('deve expor função de refetch', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        initializing: false,
      });

      const { useChatbot } = await import('./useChatbot');
      
      const { result } = renderHook(() => useChatbot(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });
});

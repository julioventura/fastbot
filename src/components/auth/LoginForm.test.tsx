import { render, screen, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from './LoginForm';

// Mock do useAuth
const mockSignIn = vi.fn();
const mockResendConfirmation = vi.fn();
vi.mock('@/lib/auth/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    resendConfirmation: mockResendConfirmation,
  }),
}));

// Mock do useToast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('LoginForm Component', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar todos os elementos do formulário', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/seu@email.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/sua senha/i)).toBeInTheDocument();
    });

    it('deve renderizar ícones corretos nos campos', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      // Verifica se os ícones estão presentes através das classes CSS
      const emailContainer = screen.getByLabelText(/email/i).closest('div');
      const passwordContainer = screen.getByLabelText(/senha/i).closest('div');

      expect(emailContainer).toBeInTheDocument();
      expect(passwordContainer).toBeInTheDocument();
    });

    it('deve ter o botão de mostrar/esconder senha', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const toggleButton = screen.getByRole('button', { name: '' });
      expect(toggleButton).toBeInTheDocument();
    });

    it('não deve mostrar o botão de reenvio de confirmação inicialmente', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      expect(screen.queryByText(/reenviar email de confirmação/i)).not.toBeInTheDocument();
    });
  });

  describe('Interações dos Campos', () => {
    it('deve permitir digitar no campo de email', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('deve permitir digitar no campo de senha', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const passwordInput = screen.getByLabelText(/senha/i);
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('deve alternar a visibilidade da senha ao clicar no botão', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const passwordInput = screen.getByLabelText(/senha/i);
      const toggleButton = screen.getByRole('button', { name: '' });

      // Inicialmente deve ser type="password"
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Clica para mostrar
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Clica para esconder novamente
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Validação do Formulário', () => {
    it('deve mostrar erro quando campos estão vazios', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro',
          description: 'Por favor, preencha todos os campos',
        });
      });

      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('deve mostrar erro quando apenas email está preenchido', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro',
          description: 'Por favor, preencha todos os campos',
        });
      });

      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('deve mostrar erro quando apenas senha está preenchida', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro',
          description: 'Por favor, preencha todos os campos',
        });
      });

      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe('Submissão do Formulário', () => {
    it('deve chamar signIn com dados válidos', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        error: null,
      });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('deve mostrar toast de sucesso e chamar onSuccess quando login é bem-sucedido', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        error: null,
      });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Login Bem-Sucedido!',
          description: 'Bem-vindo de volta, test@example.com!',
        });
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('deve mostrar estado de carregamento durante submissão', async () => {
      const user = userEvent.setup();
      mockSignIn.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Verifica estado de carregamento
      expect(screen.getByText(/entrando\.\.\./i)).toBeInTheDocument();
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve mostrar erro de credenciais inválidas', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro ao Fazer Login',
          description: 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.',
          duration: 6000,
        });
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('deve mostrar erro de email não confirmado e botão de reenvio', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        data: null,
        error: { message: 'Email not confirmed' },
      });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Email não confirmado',
          description: 'Você precisa confirmar seu email antes de fazer login. Verifique sua caixa de entrada e clique no link de confirmação.',
          duration: 6000,
        });
      });

      // Verifica se o botão de reenvio apareceu
      expect(screen.getByText(/reenviar email de confirmação/i)).toBeInTheDocument();
    });

    it('deve tratar erro genérico', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        data: null,
        error: { message: 'Generic error' },
      });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro ao Fazer Login',
          description: 'Generic error',
          duration: 6000,
        });
      });
    });

    it('deve tratar exceção durante login', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error('Network error'));

      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro Inesperado',
          description: 'Network error',
        });
      });
    });
  });

  describe('Funcionalidade de Reenvio de Confirmação', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        data: null,
        error: { message: 'Email not confirmed' },
      });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/reenviar email de confirmação/i)).toBeInTheDocument();
      });
    });

    it('deve reenviar confirmação com sucesso', async () => {
      const user = userEvent.setup();
      mockResendConfirmation.mockResolvedValue({
        data: {},
        error: null,
      });

      const resendButton = screen.getByText(/reenviar email de confirmação/i);
      await user.click(resendButton);

      await waitFor(() => {
        expect(mockResendConfirmation).toHaveBeenCalledWith('test@example.com');
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Email reenviado!',
          description: 'Um novo email de confirmação foi enviado. Verifique sua caixa de entrada.',
          duration: 5000,
        });
      });
    });

    it('deve mostrar erro quando reenvio falha', async () => {
      const user = userEvent.setup();
      mockResendConfirmation.mockResolvedValue({
        data: null,
        error: { message: 'Resend failed' },
      });

      const resendButton = screen.getByText(/reenviar email de confirmação/i);
      await user.click(resendButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro ao reenviar confirmação',
          description: 'Resend failed',
        });
      });
    });

    it('deve tratar exceção durante reenvio', async () => {
      const user = userEvent.setup();
      mockResendConfirmation.mockRejectedValue(new Error('Network error'));

      const resendButton = screen.getByText(/reenviar email de confirmação/i);
      await user.click(resendButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro',
          description: 'Ocorreu um erro ao reenviar o email de confirmação',
        });
      });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels associados aos campos', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      expect(emailInput).toHaveAttribute('id', 'email');
      expect(passwordInput).toHaveAttribute('id', 'password');
    });

    it('deve ter autocomplete apropriado nos campos', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    it('deve ter type correto nos campos', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Navegação por Teclado', () => {
    it('deve submeter formulário ao pressionar Enter', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        error: null,
      });

      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('deve permitir navegação por Tab entre campos', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const toggleButton = screen.getByRole('button', { name: '' });
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      // Inicia no primeiro campo
      emailInput.focus();
      expect(emailInput).toHaveFocus();

      // Tab para campo de senha
      await user.tab();
      expect(passwordInput).toHaveFocus();

      // Tab para botão de toggle
      await user.tab();
      expect(toggleButton).toHaveFocus();

      // Tab para botão de submit
      await user.tab();
      expect(submitButton).toHaveFocus();
    });
  });
});

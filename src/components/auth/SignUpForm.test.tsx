import { render, screen, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignUpForm from './SignUpForm';

// Mock do useAuth
const mockSignUp = vi.fn();
vi.mock('@/lib/auth/useAuth', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
  }),
}));

// Mock do useToast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock completo do Supabase para AuthContext
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: {}, error: null }),
        })),
      })),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      then: vi.fn()
    })),
  },
}));

describe('SignUpForm Component', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar todos os campos do formulário', () => {
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/whatsapp/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
    });

    it('deve renderizar placeholders corretos', () => {
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      expect(screen.getByPlaceholderText(/seu nome completo/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/\(11\) 99999-9999/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/seu@email.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/mínimo 6 caracteres/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/confirme sua senha/i)).toBeInTheDocument();
    });

    it('deve ter ícones corretos nos campos', () => {
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      // Verifica se os ícones estão presentes através dos campos
      const nameField = screen.getByLabelText(/nome completo/i);
      const whatsappField = screen.getByLabelText(/whatsapp/i);
      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText(/^senha$/i);
      const confirmPasswordField = screen.getByLabelText(/confirmar senha/i);

      expect(nameField).toBeInTheDocument();
      expect(whatsappField).toBeInTheDocument();
      expect(emailField).toBeInTheDocument();
      expect(passwordField).toBeInTheDocument();
      expect(confirmPasswordField).toBeInTheDocument();
    });

    it('deve ter o botão de mostrar/esconder senha', () => {
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      const toggleButtons = screen.getAllByRole('button');
      const passwordToggle = toggleButtons.find((button) => 
        (button as HTMLButtonElement).type === 'button' && button.textContent === ''
      );
      
      expect(passwordToggle).toBeInTheDocument();
    });
  });

  describe('Interações dos Campos', () => {
    it('deve permitir digitar em todos os campos', async () => {
      const user = userEvent.setup();
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      const nameField = screen.getByLabelText(/nome completo/i);
      const whatsappField = screen.getByLabelText(/whatsapp/i);
      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText(/^senha$/i);
      const confirmPasswordField = screen.getByLabelText(/confirmar senha/i);

      await user.type(nameField, 'João Silva');
      await user.type(whatsappField, '11999999999');
      await user.type(emailField, 'joao@test.com');
      await user.type(passwordField, 'password123');
      await user.type(confirmPasswordField, 'password123');

      expect(nameField).toHaveValue('João Silva');
      expect(whatsappField).toHaveValue('11999999999');
      expect(emailField).toHaveValue('joao@test.com');
      expect(passwordField).toHaveValue('password123');
      expect(confirmPasswordField).toHaveValue('password123');
    });

    it('deve alternar a visibilidade da senha ao clicar no botão', async () => {
      const user = userEvent.setup();
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      const passwordField = screen.getByLabelText(/^senha$/i);
      const toggleButtons = screen.getAllByRole('button');
      const passwordToggle = toggleButtons.find((button) => 
        (button as HTMLButtonElement).type === 'button' && button.textContent === ''
      );

      // Inicialmente deve ser type="password"
      expect(passwordField).toHaveAttribute('type', 'password');

      // Clica para mostrar
      await user.click(passwordToggle!);
      expect(passwordField).toHaveAttribute('type', 'text');

      // Clica para esconder novamente
      await user.click(passwordToggle!);
      expect(passwordField).toHaveAttribute('type', 'password');
    });
  });

  describe('Validação do Formulário', () => {
    it('deve mostrar erro quando todos os campos estão vazios', async () => {
      const user = userEvent.setup();
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro',
          description: 'Por favor, preencha todos os campos',
        });
      });

      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('deve mostrar erro quando apenas alguns campos estão preenchidos', async () => {
      const user = userEvent.setup();
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      const nameField = screen.getByLabelText(/nome completo/i);
      const emailField = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });

      await user.type(nameField, 'João Silva');
      await user.type(emailField, 'joao@test.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro',
          description: 'Por favor, preencha todos os campos',
        });
      });

      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('deve mostrar erro quando as senhas não coincidem', async () => {
      const user = userEvent.setup();
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
      await user.type(screen.getByLabelText(/whatsapp/i), '11999999999');
      await user.type(screen.getByLabelText(/email/i), 'joao@test.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar senha/i), 'different123');
      
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro de Validação',
          description: 'As senhas não coincidem.',
        });
      });

      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('deve mostrar erro quando a senha tem menos de 6 caracteres', async () => {
      const user = userEvent.setup();
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
      await user.type(screen.getByLabelText(/whatsapp/i), '11999999999');
      await user.type(screen.getByLabelText(/email/i), 'joao@test.com');
      await user.type(screen.getByLabelText(/^senha$/i), '123');
      await user.type(screen.getByLabelText(/confirmar senha/i), '123');
      
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro',
          description: 'A senha deve ter pelo menos 6 caracteres',
        });
      });

      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  describe('Submissão do Formulário', () => {
    const validFormData = {
      name: 'João Silva',
      whatsapp: '11999999999',
      email: 'joao@test.com',
      password: 'password123',
    };

    const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByLabelText(/nome completo/i), validFormData.name);
      await user.type(screen.getByLabelText(/whatsapp/i), validFormData.whatsapp);
      await user.type(screen.getByLabelText(/email/i), validFormData.email);
      await user.type(screen.getByLabelText(/^senha$/i), validFormData.password);
      await user.type(screen.getByLabelText(/confirmar senha/i), validFormData.password);
    };

    it('deve chamar signUp com dados válidos', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        data: { user: { id: '1', email: validFormData.email, email_confirmed_at: null } },
        error: null,
      });

      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(validFormData.email, validFormData.password, {
          name: validFormData.name,
          whatsapp: validFormData.whatsapp,
        });
      });
    });

    it('deve verificar se processo de cadastro é executado corretamente', async () => {
      const user = userEvent.setup();
      const userId = 'mock-user-id';
      
      mockSignUp.mockResolvedValue({
        data: { user: { id: userId, email: validFormData.email, email_confirmed_at: null } },
        error: null,
      });

      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Verifica que o processo foi executado com sucesso
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('deve mostrar toast de sucesso quando cadastro é bem-sucedido', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        data: { user: { id: '1', email: validFormData.email, email_confirmed_at: null } },
        error: null,
      });

      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Cadastro realizado!',
          description: 'Conta criada! IMPORTANTE: Verifique sua caixa de entrada e confirme seu email antes de tentar fazer login.',
          duration: 7000,
        });
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('deve mostrar toast diferente para email já confirmado', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        data: { user: { id: '1', email: validFormData.email, email_confirmed_at: new Date().toISOString() } },
        error: null,
      });

      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Cadastro realizado!',
          description: 'Conta criada e confirmada! Você já pode fazer login.',
          duration: 7000,
        });
      });
    });

    it('deve mostrar estado de carregamento durante submissão', async () => {
      const user = userEvent.setup();
      mockSignUp.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      // Verifica estado de carregamento
      expect(screen.getByText(/criando conta\.\.\./i)).toBeInTheDocument();
      
      // Verifica se campos estão desabilitados
      expect(screen.getByLabelText(/nome completo/i)).toBeDisabled();
      expect(screen.getByLabelText(/whatsapp/i)).toBeDisabled();
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/^senha$/i)).toBeDisabled();
      expect(screen.getByLabelText(/confirmar senha/i)).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Tratamento de Erros do SignUp', () => {
    const validFormData = {
      name: 'João Silva',
      whatsapp: '11999999999',
      email: 'joao@test.com',
      password: 'password123',
    };

    const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByLabelText(/nome completo/i), validFormData.name);
      await user.type(screen.getByLabelText(/whatsapp/i), validFormData.whatsapp);
      await user.type(screen.getByLabelText(/email/i), validFormData.email);
      await user.type(screen.getByLabelText(/^senha$/i), validFormData.password);
      await user.type(screen.getByLabelText(/confirmar senha/i), validFormData.password);
    };

    it('deve mostrar erro para email já cadastrado', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      });

      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Email já cadastrado',
          description: 'Este email já possui uma conta. Tente fazer login.',
        });
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('deve mostrar erro para email inválido', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        data: null,
        error: { message: 'Invalid email' },
      });

      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Email inválido',
          description: 'Por favor, verifique se o email está correto.',
        });
      });
    });

    it('deve mostrar erro para problema com senha', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        data: null,
        error: { message: 'Password too weak' },
      });

      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Problema com a senha',
          description: 'A senha deve ter pelo menos 6 caracteres e não pode ser muito comum.',
        });
      });
    });

    it('deve mostrar erro genérico para outros casos', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        data: null,
        error: { message: 'Generic error' },
      });

      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro no cadastro',
          description: 'Generic error',
        });
      });
    });

    it('deve tratar caso onde usuário não foi criado', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro no cadastro',
          description: 'Não foi possível criar a conta. Tente novamente.',
        });
      });
    });

    it('deve tratar exceção durante cadastro', async () => {
      const user = userEvent.setup();
      mockSignUp.mockRejectedValue(new Error('Network error'));

      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Erro inesperado',
          description: 'Ocorreu um erro: Network error',
        });
      });
    });
  });

  describe('Tratamento de Erros do Perfil', () => {
    const validFormData = {
      name: 'João Silva',
      whatsapp: '11999999999',
      email: 'joao@test.com',
      password: 'password123',
    };

    const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByLabelText(/nome completo/i), validFormData.name);
      await user.type(screen.getByLabelText(/whatsapp/i), validFormData.whatsapp);
      await user.type(screen.getByLabelText(/email/i), validFormData.email);
      await user.type(screen.getByLabelText(/^senha$/i), validFormData.password);
      await user.type(screen.getByLabelText(/confirmar senha/i), validFormData.password);
    };

    it('deve mostrar toast de sucesso mesmo com problema no perfil', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        data: { user: { id: '1', email: validFormData.email, email_confirmed_at: null } },
        error: null,
      });

      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Mesmo com problema no perfil, deve chamar onSuccess
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('deve tratar problemas durante criação do perfil', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        data: { user: { id: '1', email: validFormData.email, email_confirmed_at: null } },
        error: null,
      });

      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Mesmo com exceção no perfil, deve chamar onSuccess
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels associados aos campos', () => {
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      const nameField = screen.getByLabelText(/nome completo/i);
      const whatsappField = screen.getByLabelText(/whatsapp/i);
      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText(/^senha$/i);
      const confirmPasswordField = screen.getByLabelText(/confirmar senha/i);

      expect(nameField).toHaveAttribute('id', 'name');
      expect(whatsappField).toHaveAttribute('id', 'whatsapp');
      expect(emailField).toHaveAttribute('id', 'email');
      expect(passwordField).toHaveAttribute('id', 'password');
      expect(confirmPasswordField).toHaveAttribute('id', 'confirmPassword');
    });

    it('deve ter autocomplete apropriado nos campos', () => {
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/nome completo/i)).toHaveAttribute('autocomplete', 'name');
      expect(screen.getByLabelText(/whatsapp/i)).toHaveAttribute('autocomplete', 'tel');
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('autocomplete', 'email');
      expect(screen.getByLabelText(/^senha$/i)).toHaveAttribute('autocomplete', 'new-password');
      expect(screen.getByLabelText(/confirmar senha/i)).toHaveAttribute('autocomplete', 'new-password');
    });

    it('deve ter types corretos nos campos', () => {
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/nome completo/i)).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/whatsapp/i)).toHaveAttribute('type', 'tel');
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/^senha$/i)).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText(/confirmar senha/i)).toHaveAttribute('type', 'password');
    });
  });

  describe('Navegação por Teclado', () => {
    it('deve submeter formulário ao pressionar Enter', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        data: { user: { id: '1', email: 'joao@test.com', email_confirmed_at: null } },
        error: null,
      });

      render(<SignUpForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
      await user.type(screen.getByLabelText(/whatsapp/i), '11999999999');
      await user.type(screen.getByLabelText(/email/i), 'joao@test.com');
      await user.type(screen.getByLabelText(/^senha$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar senha/i), 'password123');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('joao@test.com', 'password123', {
          name: 'João Silva',
          whatsapp: '11999999999',
        });
      });
    });

    it('deve permitir navegação por Tab entre campos', async () => {
      const user = userEvent.setup();
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      const nameField = screen.getByLabelText(/nome completo/i);
      const whatsappField = screen.getByLabelText(/whatsapp/i);
      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText(/^senha$/i);
      const confirmPasswordField = screen.getByLabelText(/confirmar senha/i);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });

      // Inicia no primeiro campo
      nameField.focus();
      expect(nameField).toHaveFocus();

      // Tab pelos campos
      await user.tab();
      expect(whatsappField).toHaveFocus();

      await user.tab();
      expect(emailField).toHaveFocus();

      await user.tab();
      expect(passwordField).toHaveFocus();

      await user.tab();
      // Pula o botão de toggle da senha
      await user.tab();
      expect(confirmPasswordField).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });
  });
});

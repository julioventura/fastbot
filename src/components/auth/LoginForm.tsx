// Componente: LoginForm
// Funcionalidade:
// Este componente renderiza um formulário de login com campos para email e senha.
// Ele gerencia o estado dos campos, a submissão do formulário, a interação com o
// contexto de autenticação para realizar o login, e exibe feedback ao usuário
// através de toasts (notificações). Inclui também a funcionalidade de mostrar/esconder a senha.
//
// Funções e Constantes Principais:
// - LoginFormProps (Interface): Define as propriedades esperadas pelo componente LoginForm.
//   - onSuccess (function): Callback executado quando o login é bem-sucedido.
// - LoginForm (Componente): Componente funcional React que renderiza o formulário.
//   - Props: `onSuccess`.
//   - Estados:
//     - email (string): Armazena o valor do campo de email.
//     - password (string): Armazena o valor do campo de senha.
//     - isLoading (boolean): Indica se o processo de login está em andamento.
//     - showPassword (boolean): Controla a visibilidade da senha.
//   - Hooks:
//     - useAuth(): Para acessar a função `signIn` do contexto de autenticação.
//     - useToast(): Para exibir notificações (toasts) de sucesso ou erro.
//   - Funções:
//     - handleSubmit (async function): Manipula a submissão do formulário.
//       - Valida os campos.
//       - Chama a função `signIn`.
//       - Exibe toasts de feedback.
//       - Chama `onSuccess` em caso de login bem-sucedido.
//     - handleResendConfirmation (async function): Manipula o reenvio do email de confirmação.
//       - Valida o campo de email.
//       - Chama a função `resendConfirmation`.
//       - Exibe toasts de feedback.

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/useAuth";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Interface LoginFormProps
// Define as propriedades que o componente LoginForm aceita.
interface LoginFormProps {
  onSuccess: () => void; // Função a ser chamada quando o login for bem-sucedido.
}

// Componente LoginForm
// Renderiza e gerencia o formulário de login dentro do modal.
export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  // Estado para o campo de email.
  const [email, setEmail] = useState("");

  // Estado para o campo de senha.
  const [password, setPassword] = useState("");

  // Estado para indicar o carregamento durante a submissão.
  const [isLoading, setIsLoading] = useState(false);

  // Estado para controlar a visibilidade da senha.
  const [showPassword, setShowPassword] = useState(false);

  // Estado para controlar se deve mostrar o botão de reenvio de confirmação.
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);

  // Obtém a função signIn do contexto de autenticação.
  const { signIn, resendConfirmation } = useAuth();

  // Obtém a função toast para exibir notificações.
  const { toast } = useToast();

  // Função handleSubmit
  // Chamada quando o formulário é submetido.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previne o comportamento padrão de submissão do formulário.
    
    setIsLoading(true);

    // Validação básica dos campos.
    if (!email || !password) {
      toast({
        variant: "destructive", // Tipo de toast de erro.
        title: "Erro",
        description: "Por favor, preencha todos os campos",
      });
      setIsLoading(false);
      return; // Interrompe a execução se os campos não estiverem preenchidos.
    }

    try {
      // Chamada correta do signIn com 2 parâmetros separados
      const result = await signIn(email, password);

      if (result.error) {
        // Tratamento específico para diferentes tipos de erro
        let errorTitle = "Erro ao Fazer Login";
        let errorDescription = result.error.message || "Credenciais inválidas. Verifique seu email e senha.";
        
        // Verificar se é erro de email não confirmado
        if (result.error.message?.includes("Email not confirmed") || 
            result.error.message?.includes("signup_disabled") ||
            result.error.message?.includes("confirmation")) {
          errorTitle = "Email não confirmado";
          errorDescription = "Você precisa confirmar seu email antes de fazer login. Verifique sua caixa de entrada e clique no link de confirmação.";
          setShowResendConfirmation(true); // Mostrar botão de reenvio
        } else if (result.error.message?.includes("Invalid login credentials")) {
          errorDescription = "Email ou senha incorretos. Verifique suas credenciais e tente novamente.";
          setShowResendConfirmation(false); // Esconder botão de reenvio
        } else {
          setShowResendConfirmation(false); // Esconder botão de reenvio para outros erros
        }
        
        toast({
          variant: "destructive",
          title: errorTitle,
          description: errorDescription,
          duration: 6000, // Mais tempo para ler a mensagem
        });
      } else if (result.data?.user) {
        toast({
          title: "Login Bem-Sucedido!",
          description: `Bem-vindo de volta, ${result.data.user.email}!`,
        });
        onSuccess(); // Chama callback de sucesso
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao Fazer Login",
          description: "Não foi possível completar o login. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro no login:", error);
      let errorMessage = "Ocorreu um erro inesperado.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Erro Inesperado",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para reenviar email de confirmação
  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha o campo de email primeiro",
      });
      return;
    }

    try {
      const result = await resendConfirmation(email);
      
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erro ao reenviar confirmação",
          description: result.error.message || "Não foi possível reenviar o email de confirmação",
        });
      } else {
        toast({
          title: "Email reenviado!",
          description: "Um novo email de confirmação foi enviado. Verifique sua caixa de entrada.",
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao reenviar o email de confirmação",
      });
    }
  };

  // Renderização do formulário de login com o estilo original do modal.
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {/* Campo de Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">Email</Label>
        <div className="relative">
          {/* Ícone de Email */}
          <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-8 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            disabled={isLoading} // Desabilita o campo durante o carregamento.
            autoComplete="email"
          />
        </div>
      </div>
      
      {/* Campo de Senha */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">Senha</Label>
        <div className="relative">
          {/* Ícone de Senha */}
          <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-8 pr-10 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            disabled={isLoading}
            autoComplete="current-password"
          />
          
          {/* Botão para Mostrar/Esconder Senha */}
          <button
            type="button"
            className="absolute right-2 top-2.5 text-muted-foreground hover:text-white transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      {/* Botão de Submissão do Formulário */}
      <Button 
        type="submit" 
        className="w-full bg-[#3b82f6] hover:bg-[#4f9bff] text-white drop-shadow-[0_0_10px_rgba(79,155,255,0.3)] hover:drop-shadow-[0_0_15px_rgba(79,155,255,0.5)] transition-all" 
        disabled={isLoading} // Desabilita o botão durante o carregamento.
      >
        {isLoading ? "Entrando..." : "Entrar"} {/* Texto do botão muda durante o carregamento. */}
      </Button>

      {/* Botão para reenviar confirmação de email - só aparece quando necessário */}
      {showResendConfirmation && (
        <Button 
          type="button"
          variant="outline"
          className="w-full mt-2 border-border bg-transparent text-primary hover:bg-secondary hover:text-primary-foreground transition-all"
          onClick={handleResendConfirmation}
          disabled={isLoading || !email}
        >
          Reenviar Email de Confirmação
        </Button>
      )}
    </form>
  );
};

export default LoginForm;

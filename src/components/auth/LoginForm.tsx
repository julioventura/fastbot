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

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/useAuth";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

// Interface LoginFormProps
// Define as propriedades que o componente LoginForm aceita.
interface LoginFormProps {
  onSuccess: () => void; // Função a ser chamada quando o login for bem-sucedido.
}

// Componente LoginForm
// Renderiza e gerencia o formulário de login.
export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  // Estado para o campo de email.
  const [email, setEmail] = useState("");

  // Estado para o campo de senha.
  const [password, setPassword] = useState("");

  // Estado para indicar o carregamento durante a submissão.
  const [isLoading, setIsLoading] = useState(false);

  // Estado para controlar a visibilidade da senha.
  const [showPassword, setShowPassword] = useState(false);

  // Obtém a função signIn do contexto de autenticação.
  const { signIn } = useAuth();

  // Obtém a função toast para exibir notificações.
  const { toast } = useToast();

  // Obtém a função navigate do react-router-dom para redirecionamento.
  const navigate = useNavigate();

  // Função handleSubmit
  // Chamada quando o formulário é submetido.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previne o comportamento padrão de submissão do formulário.
    console.log("[LoginForm] Botão Entrar clicado. Email:", email); // LOG 1
    setIsLoading(true);

    // Validação básica dos campos.
    if (!email || !password) {
      console.log("[LoginForm] Email ou senha não preenchidos."); // LOG 2

      toast({
        variant: "destructive", // Tipo de toast de erro.
        title: "Erro",
        description: "Por favor, preencha todos os campos",
      });
      setIsLoading(false);
      return; // Interrompe a execução se os campos não estiverem preenchidos.
    }

    try {
      console.log("[LoginForm] Tentando chamar signIn do AuthContext com:", {
        email,
      }); // LOG 3
      // Chamada correta do signIn com 2 parâmetros separados
      const result = await signIn(email, password);
      console.log("[LoginForm] Resultado do signIn:", result); // LOG 4

      if (result.error) {
        console.error("[LoginForm] Erro no login:", result.error.message); // LOG 5
        toast({
          variant: "destructive",
          title: "Erro ao Fazer Login",
          description:
            result.error.message || "Ocorreu um erro ao tentar fazer login.",
        });
      } else if (result.data?.user) {
        console.log(
          "[LoginForm] Login bem-sucedido. Usuário:",
          result.data.user.email
        ); // LOG 6
        toast({
          title: "Login Bem-Sucedido!",
          description: `Bem-vindo de volta, ${result.data.user.email}!`,
        });
        navigate("/my-chatbot"); // Redireciona para a página do chatbot
        if (onSuccess) onSuccess(); // Chamar callback de sucesso se existir
      } else {
        // Caso inesperado onde não há erro mas também não há usuário/sessão
        console.warn(
          "[LoginForm] signIn retornou sem erro mas sem dados de usuário/sessão.",
          result
        ); // LOG 7
        toast({
          variant: "destructive",
          title: "Erro ao Fazer Login",
          description: "Não foi possível completar o login. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("[LoginForm] Erro catastrófico no handleSubmit:", error); // LOG 8
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
      console.log("[LoginForm] Finalizando handleSubmit."); // LOG 9
    }
  };

  // Renderização do formulário de login.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Entre na sua conta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="seu@email.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Sua senha"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Esconder senha" : "Mostrar senha"}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          <div className="text-center">
            <Link
              to="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Não tem uma conta? Cadastre-se
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

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
import { useAuth } from "@/lib/auth/useAuth"; // Hook para autenticação
import { Eye, EyeOff, Mail, Lock } from "lucide-react"; // Ícones
import { useToast } from "@/hooks/use-toast"; // Hook para exibir toasts


// Interface LoginFormProps
// Define as propriedades que o componente LoginForm aceita.
interface LoginFormProps {
  onSuccess: () => void; // Função a ser chamada quando o login for bem-sucedido.
}


// Componente LoginForm
// Renderiza e gerencia o formulário de login.
const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
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


  // Função handleSubmit
  // Chamada quando o formulário é submetido.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previne o comportamento padrão de submissão do formulário.

    // Validação básica dos campos.
    if (!email || !password) {
      toast({
        variant: "destructive", // Tipo de toast de erro.
        title: "Erro",
        description: "Por favor, preencha todos os campos",
      });
      return; // Interrompe a execução se os campos não estiverem preenchidos.
    }

    setIsLoading(true); // Ativa o estado de carregamento.

    try {
      // Tenta realizar o login utilizando a função signIn do contexto.
      const { error } = await signIn(email, password);

      // Se houver um erro retornado pela função signIn.
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao entrar",
          description: error.message || "Verifique suas credenciais e tente novamente",
        });
        return; // Interrompe a execução.
      }

      // Se o login for bem-sucedido.
      toast({
        title: "Bem-vindo de volta!",
        description: "Login realizado com sucesso",
        duration: 3000, // Duração do toast em milissegundos.
      });

      onSuccess(); // Chama a função de callback onSuccess.

    } catch (error) {
      // Captura erros inesperados durante o processo.
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao fazer login",
      });
    } finally {
      setIsLoading(false); // Desativa o estado de carregamento, independentemente do resultado.
    }
  };


  // Renderização do formulário de login.
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
          />
        </div>
      </div>

      {/* Campo de Senha */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">Senha</Label>
        <div className="relative">
          {/* Ícone de Cadeado */}
          <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"} // Alterna o tipo do input para mostrar/esconder senha.
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-8 pr-10 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            disabled={isLoading} // Desabilita o campo durante o carregamento.
          />
          {/* Botão para Mostrar/Esconder Senha */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-gray-700/50"
            onClick={() => setShowPassword(!showPassword)} // Alterna o estado showPassword.
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" /> // Ícone de olho fechado.
            ) : (
              <Eye className="h-4 w-4" /> // Ícone de olho aberto.
            )}
            <span className="sr-only">
              {showPassword ? "Esconder senha" : "Mostrar senha"}
            </span>
          </Button>
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
    </form>
  );
};

export default LoginForm;

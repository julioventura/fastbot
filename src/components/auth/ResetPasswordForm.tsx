// Componente: ResetPasswordForm
// Funcionalidade:
// Este componente renderiza um formulário para solicitar a redefinição de senha.
// O usuário insere seu email e, ao submeter, uma solicitação é enviada
// (através do contexto de autenticação) para que um link de redefinição seja
// enviado para o email fornecido. O componente gerencia o estado do campo de email,
// o estado de carregamento durante a submissão e exibe feedback ao usuário
// através de toasts (notificações).
//
// Funções e Constantes Principais:
// - ResetPasswordFormProps (Interface): Define as propriedades esperadas pelo componente.
//   - onSuccess (function): Callback executado quando a solicitação de redefinição é bem-sucedida.
// - ResetPasswordForm (Componente): Componente funcional React que renderiza o formulário.
//   - Props: `onSuccess`.
//   - Estados:
//     - email (string): Armazena o valor do campo de email.
//     - isLoading (boolean): Indica se o processo de solicitação está em andamento.
//   - Hooks:
//     - useAuth(): Para acessar a função `resetPassword` do contexto de autenticação.
//     - useToast(): Para exibir notificações (toasts) de sucesso ou erro.
//   - Funções:
//     - handleSubmit (async function): Manipula a submissão do formulário.
//       - Valida o campo de email.
//       - Chama a função `resetPassword`.
//       - Exibe toasts de feedback.
//       - Chama `onSuccess` em caso de sucesso na solicitação.

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/AuthContext"; // Hook para autenticação
import { Mail } from "lucide-react"; // Ícone de Email
import { useToast } from "@/hooks/use-toast"; // Hook para exibir toasts


// Interface ResetPasswordFormProps
// Define as propriedades que o componente ResetPasswordForm aceita.
interface ResetPasswordFormProps {
  onSuccess: () => void; // Função a ser chamada quando a solicitação de redefinição for bem-sucedida.
}


// Componente ResetPasswordForm
// Renderiza e gerencia o formulário de solicitação de redefinição de senha.
const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSuccess }) => {
  // Estado para o campo de email.
  const [email, setEmail] = useState("");

  // Estado para indicar o carregamento durante a submissão.
  const [isLoading, setIsLoading] = useState(false);

  // Obtém a função resetPassword do contexto de autenticação.
  const { resetPassword } = useAuth();

  // Obtém a função toast para exibir notificações.
  const { toast } = useToast();


  // Função handleSubmit
  // Chamada quando o formulário é submetido.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previne o comportamento padrão de submissão do formulário.
    
    // Validação básica do campo de email.
    if (!email) {
      toast({
        variant: "destructive", // Tipo de toast de erro.
        title: "Erro",
        description: "Por favor, informe seu email",
      });
      return; // Interrompe a execução se o email não estiver preenchido.
    }
    
    setIsLoading(true); // Ativa o estado de carregamento.
    
    try {
      // Tenta solicitar a redefinição de senha utilizando a função resetPassword do contexto.
      const { error } = await resetPassword(email);
      
      // Se houver um erro retornado pela função resetPassword.
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao recuperar senha",
          description: error.message || "Verifique o email informado e tente novamente",
        });
        return; // Interrompe a execução.
      }
      
      // Se a solicitação for bem-sucedida.
      toast({
        title: "Email de recuperação enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha",
        duration: 5000, // Duração do toast em milissegundos.
      });
      
      onSuccess(); // Chama a função de callback onSuccess.

    } catch (error) {
      // Captura erros inesperados durante o processo.
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao solicitar recuperação de senha",
      });
    } finally {
      setIsLoading(false); // Desativa o estado de carregamento, independentemente do resultado.
    }
  };


  // Renderização do formulário de solicitação de redefinição de senha.
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
      
      {/* Botão de Submissão do Formulário */}
      <Button 
        type="submit" 
        className="w-full bg-[#3b82f6] hover:bg-[#4f9bff] text-white drop-shadow-[0_0_10px_rgba(79,155,255,0.3)] hover:drop-shadow-[0_0_15px_rgba(79,155,255,0.5)] transition-all" 
        disabled={isLoading} // Desabilita o botão durante o carregamento.
      >
        {isLoading ? "Enviando..." : "Enviar link de recuperação"} {/* Texto do botão muda durante o carregamento. */}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;

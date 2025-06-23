// Componente: SignUpForm
// Funcionalidade:
// Este componente renderiza um formulário de cadastro com campos para nome, email,
// WhatsApp, senha e confirmação de senha. Ele gerencia o estado dos campos,
// a submissão do formulário, a interação com o contexto de autenticação para
// realizar o cadastro (signUp) e, em seguida, insere informações adicionais
// do perfil (nome, WhatsApp, email) na tabela 'profiles' do Supabase.
// Exibe feedback ao usuário através de toasts (notificações) e inclui a
// funcionalidade de mostrar/esconder a senha.
//
// Funções e Constantes Principais:
// - SignUpFormProps (Interface): Define as propriedades esperadas pelo componente.
//   - onSuccess (function): Callback executado quando o cadastro é bem-sucedido.
// - DataWithUser (Interface): Define a estrutura esperada para dados contendo um objeto 'user'.
// - isDataWithValidUser (Type Guard): Verifica se um objeto corresponde à interface DataWithUser
//   e se o 'user.id' é uma string. Usado para extrair o ID do usuário quando a sessão pode ser nula
//   (comum durante a confirmação de email).
// - DataWithSession (Interface): Define a estrutura esperada para dados contendo um objeto 'session' com 'user'.
// - isDataWithValidSessionUser (Type Guard): Verifica se um objeto corresponde à interface DataWithSession
//   e se o 'session.user.id' é uma string. Usado para extrair o ID do usuário diretamente da sessão.
// - SignUpForm (Componente): Componente funcional React que renderiza o formulário de cadastro.
//   - Props: `onSuccess`.
//   - Estados:
//     - name (string): Armazena o valor do campo nome.
//     - whatsapp (string): Armazena o valor do campo WhatsApp.
//     - email (string): Armazena o valor do campo de email.
//     - password (string): Armazena o valor do campo de senha.
//     - confirmPassword (string): Armazena o valor do campo de confirmação de senha.
//     - isLoading (boolean): Indica se o processo de cadastro está em andamento.
//     - showPassword (boolean): Controla a visibilidade da senha.
//   - Hooks:
//     - useAuth(): Para acessar a função `signUp` do contexto de autenticação.
//     - useToast(): Para exibir notificações (toasts) de sucesso ou erro.
//   - Funções:
//     - handleSubmit (async function): Manipula a submissão do formulário.
//       - Valida os campos (preenchimento, correspondência de senhas, comprimento da senha).
//       - Chama a função `signUp`.
//       - Tenta obter o `userId` da resposta do `signUp` (priorizando `data.session.user.id` e depois `data.user.id`).
//       - Insere os dados do perfil (nome, whatsapp, email) na tabela 'profiles' do Supabase usando o `userId`.
//       - Exibe toasts de feedback.
//       - Chama `onSuccess` em caso de cadastro bem-sucedido.

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/useAuth";
import { Eye, EyeOff, Mail, Lock, User as UserIcon, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Interface SignUpFormProps
// Define as propriedades que o componente SignUpForm aceita.
interface SignUpFormProps {
  onSuccess: () => void; // Função a ser chamada quando o cadastro for bem-sucedido.
}

// Componente SignUpForm
// Renderiza e gerencia o formulário de cadastro de novos usuários.
const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
  // Estados para os campos do formulário.
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estado para indicar o carregamento durante a submissão.
  const [isLoading, setIsLoading] = useState(false);

  // Estado para controlar a visibilidade da senha.
  const [showPassword, setShowPassword] = useState(false);

  // Obtém a função signUp do contexto de autenticação.
  const { signUp } = useAuth();

  // Obtém a função toast para exibir notificações.
  const { toast } = useToast();

  // Função handleSubmit
  // Chamada quando o formulário de cadastro é submetido.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação dos campos do formulário.
    if (!name || !email || !password || !confirmPassword || !whatsapp) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "As senhas não coincidem.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Tentar fazer signup direto pelo Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      console.log("Resultado do signup:", { data, error });

      // Se houve erro E não é problema de email de confirmação, lançar erro
      if (error && !error.message.includes("confirmation email")) {
        throw error;
      }

      // Se o usuário foi criado (mesmo com erro de email)
      if (data.user) {
        console.log("Usuário criado:", data.user.id);
        
        // Criar perfil imediatamente
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert([{ 
            id: data.user.id,
            name, 
            whatsapp, 
            email, 
            is_student: false, 
            is_professor: false 
          }], {
            onConflict: 'id'
          });

        if (profileError) {
          console.error("Erro ao criar perfil:", profileError);
          toast({
            variant: "destructive",
            title: "Erro ao Salvar Perfil",
            description: "Conta criada, mas houve problema ao salvar o perfil.",
          });
        } else {
          console.log("Perfil criado com sucesso");
        }

        // Mostrar toast de sucesso
        if (error && error.message.includes("confirmation email")) {
          toast({
            title: "Cadastro Realizado!",
            description: "Conta criada com sucesso! Problema com email de confirmação, mas você já pode fazer login.",
          });
        } else {
          toast({
            title: "Cadastro Realizado!",
            description: data.user.email_confirmed_at 
              ? "Conta criada com sucesso!" 
              : "Conta criada! Verifique seu email para confirmar.",
          });
        }

        onSuccess();
      } else {
        // Se não há usuário, algo deu errado
        throw new Error("Falha ao criar usuário - dados não retornados");
      }
      
    } catch (error: unknown) {
      const authError = error as { message?: string };
      console.error("Erro no cadastro:", authError);
      
      let errorMessage = "Ocorreu um erro durante o cadastro.";
      
      if (authError.message?.includes("already registered")) {
        errorMessage = "Este email já está cadastrado.";
      } else if (authError.message?.includes("Password")) {
        errorMessage = "Problema com a senha. Verifique se tem pelo menos 6 caracteres.";
      } else if (authError.message) {
        errorMessage = authError.message;
      }

      toast({
        variant: "destructive",
        title: "Erro no Cadastro",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Renderização do formulário de cadastro com estilo do modal.
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {/* Campo Nome */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-300">Nome Completo</Label>
        <div className="relative">
          <UserIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-8 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Campo WhatsApp */}
      <div className="space-y-2">
        <Label htmlFor="whatsapp" className="text-gray-300">WhatsApp</Label>
        <div className="relative">
          <MessageSquare className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="whatsapp"
            type="tel"
            placeholder="(11) 99999-9999"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="pl-8 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Campo Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">Email</Label>
        <div className="relative">
          <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-8 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Campo Senha */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-8 pr-10 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            disabled={isLoading}
          />
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

      {/* Campo Confirmar Senha */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Senha</Label>
        <div className="relative">
          <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-8 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Botão de Submissão */}
      <Button 
        type="submit" 
        className="w-full bg-[#3b82f6] hover:bg-[#4f9bff] text-white drop-shadow-[0_0_10px_rgba(79,155,255,0.3)] hover:drop-shadow-[0_0_15px_rgba(79,155,255,0.5)] transition-all" 
        disabled={isLoading}
      >
        {isLoading ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
};

export default SignUpForm;

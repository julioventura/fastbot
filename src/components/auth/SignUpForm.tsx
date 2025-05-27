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
import { Eye, EyeOff, Mail, Lock, User as UserIcon, MessageSquare } from "lucide-react"; // Ícones adicionados
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";


// Interface SignUpFormProps
// Define as propriedades que o componente SignUpForm aceita.
interface SignUpFormProps {
  onSuccess: () => void; // Função a ser chamada quando o cadastro for bem-sucedido.
}


// Interface DataWithUser
// Define a estrutura de um objeto que contém um usuário e, opcionalmente, uma sessão.
// Usado para tipar a resposta da função signUp, especialmente em cenários onde a sessão pode ser nula (ex: confirmação de email).
interface DataWithUser {
  user: User; // Objeto User do Supabase.
  session?: Session | null; // Sessão pode ser nula ou opcional.
}


// Type Guard: isDataWithValidUser
// Verifica se o objeto fornecido tem uma propriedade 'user' válida com um 'id' do tipo string.
// Isso é útil para extrair o ID do usuário de forma segura, mesmo que a sessão não esteja presente.
function isDataWithValidUser(obj: unknown): obj is DataWithUser {
  if (typeof obj === 'object' && obj !== null && 'user' in obj) {
    const potentialUser = (obj as { user: unknown }).user;
    if (typeof potentialUser === 'object' && potentialUser !== null && 'id' in potentialUser) {
      return typeof (potentialUser as { id: unknown }).id === 'string';
    }
  }
  return false;
}


// Interface DataWithSession
// Define a estrutura de um objeto que contém uma sessão, onde a sessão obrigatoriamente tem um usuário.
// Usado para tipar a resposta da função signUp quando se espera uma sessão ativa.
interface DataWithSession {
  session: Session & { user: User }; // A sessão deve existir e conter um objeto User.
  user?: User | null; // O usuário também pode estar no nível superior do objeto.
}


// Type Guard: isDataWithValidSessionUser
// Verifica se o objeto fornecido tem uma propriedade 'session' válida,
// e dentro dela, uma propriedade 'user' com um 'id' do tipo string.
// Isso é usado para extrair o ID do usuário diretamente da sessão.
function isDataWithValidSessionUser(obj: unknown): obj is DataWithSession {
  if (typeof obj === 'object' && obj !== null && 'session' in obj) {
    const potentialSession = (obj as { session: unknown }).session;
    if (typeof potentialSession === 'object' && potentialSession !== null && 'user' in potentialSession) {
      const potentialUserInSession = (potentialSession as { user: unknown }).user;
      if (typeof potentialUserInSession === 'object' && potentialUserInSession !== null && 'id' in potentialUserInSession) {
        return typeof (potentialUserInSession as { id: unknown }).id === 'string';
      }
    }
  }
  return false;
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
    e.preventDefault(); // Previne o comportamento padrão de submissão do formulário.

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
        title: "Erro",
        description: "As senhas não coincidem",
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

    setIsLoading(true); // Ativa o estado de carregamento.

    try {
      // Tenta realizar o cadastro utilizando a função signUp do contexto.
      const { data, error } = await signUp(email, password);

      // Se houver um erro retornado pela função signUp.
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: error.message || "Tente novamente com outro email",
        });
        setIsLoading(false);
        return;
      }

      let userId: string | undefined;

      // Lógica para obter o userId da resposta do signUp.
      // Prioridade 1: Verifica se 'data' contém 'session.user.id' (cenário mais direto com sessão ativa).
      if (isDataWithValidSessionUser(data)) {
        userId = data.session.user.id;
      }
      // Prioridade 2: Verifica se 'data' contém 'user.id' diretamente (comum se a sessão for nula, ex: confirmação de email).
      else if (isDataWithValidUser(data)) {
        userId = data.user.id;
        // Loga um aviso se o ID foi obtido de 'data.user' e a sessão não estava presente,
        // o que é um comportamento esperado durante a confirmação de email.
        if (!data.session) {
          console.warn(
            "User ID found directly on data.user, and session was not present. This is typical during email confirmation."
          );
        }
      }

      // Se o userId foi obtido com sucesso, insere os dados do perfil no Supabase.
      if (userId) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            user_id: userId,
            name,
            whatsapp,
            email, // Inclui o email no perfil para consistência.
          },
        ]);

        // Se houver um erro ao inserir o perfil.
        if (profileError) {
          console.error("Error inserting profile:", profileError);
          toast({
            variant: "destructive",
            title: "Erro ao Salvar Perfil",
            description: "Sua conta foi criada, mas houve um erro ao salvar seus dados de perfil. Por favor, tente atualizar em seu perfil mais tarde.",
          });
          // Não retorna aqui, pois a conta foi criada. O usuário pode tentar atualizar o perfil depois.
        }
      } else {
        // Se o userId não pôde ser obtido após o cadastro.
        console.error("User ID could not be obtained after sign up. Data object:", data);
        toast({
          variant: "destructive",
          title: "Erro ao Processar Cadastro",
          description: "Não foi possível obter a identificação do usuário para salvar o perfil.",
        });
        setIsLoading(false); // Interrompe o carregamento.
        return; // Interrompe a execução.
      }

      // Se o cadastro e a inserção do perfil (ou apenas o cadastro, se o perfil falhar) forem bem-sucedidos.
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar sua conta.",
        duration: 5000, // Aumenta a duração do toast.
      });

      onSuccess(); // Chama a função de callback onSuccess.

    } catch (error) {
      // Captura erros inesperados durante o processo.
      console.error("Sign up process error:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao criar sua conta",
      });
    } finally {
      setIsLoading(false); // Desativa o estado de carregamento, independentemente do resultado.
    }
  };


  // Renderização do formulário de cadastro.
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

      {/* Campo WhatsApp */}
      <div className="space-y-2">
        <Label htmlFor="whatsapp" className="text-gray-300">WhatsApp (com DDD)</Label>
        <div className="relative">
          <MessageSquare className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="whatsapp"
            type="tel" // Tipo 'tel' para números de telefone.
            placeholder="Ex: 11912345678"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="pl-8 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Campo Senha */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">Senha (mínimo 6 caracteres)</Label>
        <div className="relative">
          <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-8 pr-10 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            disabled={isLoading}
          />
          {/* Botão para Mostrar/Esconder Senha */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-gray-700/50"
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

      {/* Campo Confirme a Senha */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-300">Confirme a senha</Label>
        <div className="relative">
          <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"} // Consistência na visibilidade da senha.
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-8 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Botão de Submissão do Formulário */}
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

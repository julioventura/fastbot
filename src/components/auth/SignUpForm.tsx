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
import { Link, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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

    setIsLoading(true); // Ativa o estado de carregamento.

    try {
      // Chamada correta do signUp com 3 parâmetros
      const result = await signUp(email, password, name);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erro no Cadastro",
          description: result.error.message || "Ocorreu um erro ao tentar criar a conta.",
        });
      } else if (result.data?.user) {
        toast({
          title: "Cadastro Quase Lá!",
          description: result.data.user.email_confirmed_at ? "Conta criada com sucesso!" : "Verifique seu e-mail para confirmar sua conta.",
        });

        // Inserir dados adicionais no perfil
        const userId = result.data.user.id;
        if (userId) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert([{ 
              id: userId,  // CORREÇÃO: usar 'id' em vez de 'user_id'
              name, 
              whatsapp, 
              email, 
              is_student: false, 
              is_professor: false 
            }], {
              onConflict: 'id'  // CORREÇÃO: conflito por 'id' em vez de 'user_id'
            });

          if (profileError) {
            console.error("Error inserting profile:", profileError);
            toast({
              variant: "destructive",
              title: "Erro ao Salvar Perfil",
              description: "Sua conta foi criada, mas houve um problema ao salvar seus dados de perfil.",
            });
          }
        }
        
        onSuccess();
        navigate('/my-chatbot');
      }
    } catch (error) {
      console.error("Sign up process error:", error);
      let errorMessage = "Ocorreu um erro inesperado durante o cadastro.";
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

  // Renderização do formulário de cadastro.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crie sua conta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  placeholder="Seu nome completo"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="pl-10"
                  placeholder="(11) 99999-9999"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Mínimo 6 caracteres"
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Confirme sua senha"
                  disabled={isLoading}
                  required
                />
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
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Já tem uma conta? Entre
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;

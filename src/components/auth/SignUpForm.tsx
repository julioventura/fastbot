import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/useAuth";
import { Eye, EyeOff, Mail, Lock, User as UserIcon, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SignUpFormProps {
  onSuccess: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação dos campos
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
      // Usar método padrão do Supabase (com SMTP configurado)
      const result = await signUp(email, password, {
        name,
        whatsapp
      });

      if (result.error) {
        // Tratamento específico de erros
        if (result.error.message?.includes("User already registered")) {
          toast({
            variant: "destructive",
            title: "Email já cadastrado",
            description: "Este email já possui uma conta. Tente fazer login.",
          });
        } else if (result.error.message?.includes("Invalid email")) {
          toast({
            variant: "destructive",
            title: "Email inválido",
            description: "Por favor, verifique se o email está correto.",
          });
        } else if (result.error.message?.includes("Password")) {
          toast({
            variant: "destructive",
            title: "Problema com a senha",
            description: "A senha deve ter pelo menos 6 caracteres e não pode ser muito comum.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro no cadastro",
            description: result.error.message || "Não foi possível criar a conta.",
          });
        }
        return;
      }

      // Verificar se o usuário foi criado
      if (!result.data?.user) {
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: "Não foi possível criar a conta. Tente novamente.",
        });
        return;
      }

      // Criar perfil na tabela profiles
      try {
        const profileData = {
          id: result.data.user.id,
          name: name,
          whatsapp: whatsapp,
          email: email,
          is_student: false,
          is_professor: false
        };

        const { data: profileResult, error: profileError } = await supabase
          .from("profiles")
          .insert([profileData])
          .select()
          .single();

        if (profileError) {
          toast({
            title: "Conta criada!",
            description: "Conta criada com sucesso, mas houve problema ao salvar algumas informações do perfil. Você pode atualizar depois.",
          });
        } else {
          toast({
            title: "Cadastro realizado!",
            description: result.data.user.email_confirmed_at 
              ? "Conta criada e confirmada! Você já pode fazer login." 
              : "Conta criada! IMPORTANTE: Verifique sua caixa de entrada e confirme seu email antes de tentar fazer login.",
            duration: 7000, // Mais tempo para o usuário ler a mensagem
          });
        }
      } catch (profileError) {
        toast({
          title: "Conta criada!",
          description: "Conta criada com sucesso, mas houve problema ao salvar o perfil. Você pode atualizar depois.",
        });
      }

      // Sucesso no cadastro
      onSuccess();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: `Ocorreu um erro: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            className="pl-8 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            autoComplete="name"
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
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(11) 99999-9999"
            className="pl-8 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            autoComplete="tel"
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="pl-8 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            autoComplete="email"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Campo Senha */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">
          Senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="pl-8 pr-10 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            autoComplete="new-password"
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
        <Label htmlFor="confirmPassword" className="text-gray-300">
          Confirmar Senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme sua senha"
            className="pl-8 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
            autoComplete="new-password"
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

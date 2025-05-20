import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/AuthContext";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client"; // Certifique-se de importar o supabase

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

    setIsLoading(true);

    try {
      const { data, error } = await signUp(email, password);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: error.message || "Tente novamente com outro email",
        });
        return;
      }

      // Criação do perfil no Supabase
      if (data?.user?.id) {
        await supabase.from("profiles").insert([
          {
            user_id: data.user.id,
            name,
            whatsapp,
            email,
          },
        ]);
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar sua conta",
      });

      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao criar sua conta",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="pl-8 !bg-[#101c36] !focus:bg-[#101c36] !active:bg-[#101c36] !disabled:bg-[#101c36] border-[#2a4980]/50 text-white placeholder:text-gray-400"
          disabled={isLoading}
        />
      </div>
      {/* WhatsApp */}
      <div className="space-y-2">
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input
          id="whatsapp"
          type="text"
          placeholder="Seu WhatsApp"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="pl-8 bg-[#101c36] border-[#2a4980]/50 text-white placeholder:text-gray-400"
          disabled={isLoading}
        />
      </div>
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-8 !bg-[#101c36] !focus:bg-[#101c36] !active:bg-[#101c36] !disabled:bg-[#101c36] border-[#2a4980]/50 text-white placeholder:text-gray-400"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Senha */}
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-8 pr-10 !bg-[#101c36] !focus:bg-[#101c36] !active:bg-[#101c36] !disabled:bg-[#101c36] border-[#2a4980]/50 text-white placeholder:text-gray-400"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
            onClick={() => setShowPassword(!showPassword)}
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

      {/* Confirme a senha */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirme a senha</Label>
        <div className="relative">
          <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-8 !bg-[#101c36] !focus:bg-[#101c36] !active:bg-[#101c36] !disabled:bg-[#101c36] border-[#2a4980]/50 text-white placeholder:text-gray-400"
            disabled={isLoading}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
};

export default SignUpForm;

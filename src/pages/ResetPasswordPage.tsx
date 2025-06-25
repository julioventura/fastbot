import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);

  // Extrair token e type dos parâmetros da URL
  const token = searchParams.get('access_token') || searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    // Verificar se temos um token válido para reset de senha
    if (token && type === 'recovery') {
      setValidToken(true);
      
      // Configurar a sessão com o token de recuperação
      supabase.auth.setSession({
        access_token: token,
        refresh_token: searchParams.get('refresh_token') || '',
      }).then(({ error }) => {
        if (error) {
          console.error('Erro ao configurar sessão:', error);
          toast({
            variant: "destructive",
            title: "Token inválido",
            description: "O link de recuperação é inválido ou expirou. Solicite um novo.",
          });
          setValidToken(false);
        }
      });
    } else {
      toast({
        variant: "destructive",
        title: "Link inválido",
        description: "Este link de recuperação é inválido. Solicite um novo reset de senha.",
      });
      
      // Redirecionar para a página inicial após 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }, [token, type, searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "A confirmação de senha deve ser idêntica à nova senha",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Senha alterada com sucesso!",
        description: "Sua senha foi redefinida. Você já pode fazer login com a nova senha.",
      });

      // Redirecionar para a página inicial após 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao redefinir sua senha. Tente novamente.";
      console.error('Erro ao redefinir senha:', error);
      toast({
        variant: "destructive",
        title: "Erro ao alterar senha",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1629] to-[#0e2d5e] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-[#2a4980]/50 bg-gradient-to-b from-[#0a1629] to-[#0e2d5e] text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-red-400">Link Inválido</CardTitle>
            <CardDescription className="text-gray-300">
              Este link de recuperação é inválido ou expirou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-400 mb-4">
              Você será redirecionado para a página inicial em alguns segundos...
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="w-full bg-[#3b82f6] hover:bg-[#4f9bff]"
            >
              Voltar à Página Inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1629] to-[#0e2d5e] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-[#2a4980]/50 bg-gradient-to-b from-[#0a1629] to-[#0e2d5e] text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white drop-shadow-[0_0_8px_rgba(79,155,255,0.5)]">
            Redefinir Senha
          </CardTitle>
          <CardDescription className="text-gray-300">
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-300">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-8 pr-10 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
                  disabled={isLoading}
                  autoComplete="new-password"
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
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-8 pr-10 bg-gray-700/30 border-[#2a4980]/70 text-white placeholder-gray-500 focus:border-[#4f9bff]"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2.5 text-muted-foreground hover:text-white transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Botão de Submissão */}
            <Button 
              type="submit" 
              className="w-full bg-[#3b82f6] hover:bg-[#4f9bff] text-white drop-shadow-[0_0_10px_rgba(79,155,255,0.3)] hover:drop-shadow-[0_0_15px_rgba(79,155,255,0.5)] transition-all" 
              disabled={isLoading}
            >
              {isLoading ? "Alterando senha..." : "Alterar Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;

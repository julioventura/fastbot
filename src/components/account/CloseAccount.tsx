// Componente: CloseAccount
// Funcionalidade:
// Este componente renderiza um card com opção para fechar/excluir permanentemente a conta do usuário.
// Inclui um modal de confirmação para evitar exclusões acidentais.
// Utiliza componentes de UI do shadcn/ui para a estrutura do card, botão e modal.
//
// Funções e Constantes Principais:
// - CloseAccountProps (Interface): Define as propriedades esperadas pelo componente.
//   - userEmail (string): Email do usuário para identificação na exclusão.
//   - onAccountDeleted (function): Função chamada após exclusão bem-sucedida.
// - CloseAccount (Componente): Componente funcional React que renderiza o card de fechamento de conta.
//   - Props: `userEmail`, `onAccountDeleted`.
// - handleDeleteAccount (função): Executa a exclusão da conta do usuário.

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Interface CloseAccountProps
// Define as propriedades que o componente CloseAccount aceita.
interface CloseAccountProps {
  userEmail: string; // Email do usuário para identificação na exclusão.
  onAccountDeleted: () => Promise<void>; // Função chamada após exclusão bem-sucedida.
}

// Componente CloseAccount
// Renderiza um card com opção para fechar/excluir permanentemente a conta.
const CloseAccount = ({ userEmail, onAccountDeleted }: CloseAccountProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Função para executar a exclusão da conta
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      console.log('Iniciando processo de exclusão da conta...');
      
      // Método 1: Tentar usar a nova função self_delete_user_with_email (mais segura)
      let deleteSuccess = false;
      let errorMessage = '';
      
      try {
        console.log('Tentando exclusão com confirmação de email...');
        const { data, error } = await supabase.rpc('self_delete_user_with_email', {
          confirm_email: userEmail
        });

        console.log('Resposta da função self_delete_user_with_email:', { data, error });

        if (!error && data?.success) {
          console.log('Exclusão bem-sucedida via self_delete_user_with_email');
          deleteSuccess = true;
          toast({
            title: "Conta excluída com sucesso",
            description: "Sua conta e todos os dados foram permanentemente excluídos.",
            variant: "default",
          });
        } else {
          errorMessage = data?.message || error?.message || 'Erro desconhecido na função com email';
          console.log('Falha na função self_delete_user_with_email:', errorMessage);
        }
      } catch (rpcError) {
        console.log('Função self_delete_user_with_email não disponível, tentando função simples...');
        
        // Método 2: Tentar usar a função self_delete_user (sem confirmação de email)
        try {
          const { data, error } = await supabase.rpc('self_delete_user');

          console.log('Resposta da função self_delete_user:', { data, error });

          if (!error && data?.success) {
            console.log('Exclusão bem-sucedida via self_delete_user');
            deleteSuccess = true;
            toast({
              title: "Conta excluída com sucesso",
              description: "Sua conta e todos os dados foram permanentemente excluídos.",
              variant: "default",
            });
          } else {
            errorMessage = data?.message || error?.message || 'Erro desconhecido na função simples';
            console.log('Falha na função self_delete_user:', errorMessage);
          }
        } catch (rpcError2) {
          console.log('Funções RPC não disponíveis, tentando método admin...');
          
          // Método 3: Tentar usar a função admin (como fallback)
          try {
            const { data, error } = await supabase.rpc('simple_delete_user', {
              user_email: userEmail
            });

            console.log('Resposta da função simple_delete_user:', { data, error });

            if (!error && data?.success) {
              console.log('Exclusão bem-sucedida via simple_delete_user');
              deleteSuccess = true;
              toast({
                title: "Conta excluída com sucesso",
                description: "Sua conta foi permanentemente excluída do sistema.",
                variant: "default",
              });
            } else {
              errorMessage = data?.message || error?.message || 'Erro desconhecido na função admin';
              console.log('Falha na função simple_delete_user:', errorMessage);
            }
          } catch (rpcError3) {
            errorMessage = 'Nenhuma função de exclusão disponível no sistema';
            console.log('Todas as funções RPC falharam');
          }
        }
      }

      if (deleteSuccess) {
        console.log('Exclusão concluída com sucesso, executando callback...');
        // Dar um pequeno delay para garantir que a exclusão foi processada
        setTimeout(async () => {
          await onAccountDeleted();
        }, 1000);
      } else {
        console.error('Falha na exclusão da conta:', errorMessage);  
        toast({
          title: "Erro ao excluir conta",
          description: `Não foi possível excluir sua conta: ${errorMessage}. Entre em contato com o suporte.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro geral ao excluir conta:', error);
      toast({
        title: "Erro ao excluir conta",
        description: "Erro inesperado ao tentar excluir a conta. Entre em contato com o suporte.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    // Card principal com estilos de tema.
    <Card className="bg-theme-card border border-theme-accent/50 backdrop-blur-sm text-foreground">
      
      {/* Cabeçalho do Card */}
      <CardHeader>
        <CardTitle className="text-foreground">Fechar Conta</CardTitle>
        <CardDescription className="text-muted-foreground">Excluir permanentemente sua conta de usuário</CardDescription>
      </CardHeader>
      
      {/* Conteúdo do Card */}
      <CardContent className="space-y-4">
        
        {/* Aviso sobre exclusão permanente */}
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <p className="text-sm text-destructive font-medium">
            ⚠️ Ação irreversível
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Esta ação excluirá permanentemente sua conta e todos os dados associados. Não será possível recuperar as informações.
          </p>
        </div>
        
        {/* Modal de confirmação com botão de exclusão */}
        <div className="pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                disabled={isDeleting}
              >
                {isDeleting ? "Excluindo..." : "Fechar a conta"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background border border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">
                  Confirmar exclusão da conta
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Tem certeza de que deseja excluir permanentemente sua conta?
                  <br />
                  <br />
                  <strong>Esta ação não pode ser desfeita e resultará em:</strong>
                  <br />
                  • Exclusão de todos os seus dados pessoais
                  <br />
                  • Remoção de todas as configurações
                  <br />
                  • Perda de acesso permanente à plataforma
                  <br />
                  <br />
                  Email da conta: <strong>{userEmail}</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Excluindo..." : "Sim, excluir conta"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default CloseAccount;
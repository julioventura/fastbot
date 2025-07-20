// Componente: CloseAccount
// Funcional      // Primeiro, verificar TODAS as dependências do usuário
      try {
        const { data: checkData, error: checkError } = await supabase.rpc('check_all_user_dependencies');
        
        if (checkData && checkData.success) {
          console.log('📋 Todas as dependências do usuário encontradas:', checkData);
          console.log('📊 Resumo completo das dependências:', checkData.dependencies);
        } else {
          console.log('⚠️ Erro ao verificar dependências:', checkData || checkError);
        }
      } catch (checkErr) {
        console.log('⚠️ Não foi possível verificar dependências, continuando...', checkErr);
      }
      
      // Tentar a nova função ULTIMATE de exclusão
      console.log('🗑️ Executando exclusão ULTIMATE da conta (trata mychatbot + mychatbot_2 + todas as foreign keys)...');
      const { data, error } = await supabase.rpc('delete_user_account_ultimate');omponente renderiza um card com opção para fechar/excluir permanentemente a conta do usuário.
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
      console.log('🔍 Iniciando processo de exclusão da conta...');
      
      // Primeiro, investigar todas as referências do usuário
      try {
        const { data: checkData, error: checkError } = await supabase.rpc('investigate_user_references');
        
        if (checkData && checkData.success) {
          console.log('� Referências do usuário encontradas:', checkData);
          console.log('📊 Detalhes das referências:', checkData.references_found);
        } else {
          console.log('⚠️ Erro ao verificar referências:', checkData || checkError);
        }
      } catch (checkErr) {
        console.log('⚠️ Não foi possível verificar referências, continuando...', checkErr);
      }
      
      // Tentar a nova função ultra-robusta de exclusão
      console.log('🗑️ Executando exclusão ultra-robusta da conta...');
      const { data, error } = await supabase.rpc('delete_user_account_ultra_safe');
      
      console.log('📤 Resposta da função delete_user_account_ultra_safe:', { data, error });
      
      if (error) {
        console.error('❌ Erro na função RPC:', error);
        throw new Error(`Erro na função RPC: ${error.message}`);
      }
      
      if (data && data.success) {
        console.log('✅ Exclusão bem-sucedida:', data);
        console.log('📈 Detalhes da exclusão:', data.details);
        
        toast({
          title: "Conta excluída com sucesso",
          description: `Sua conta (${data.details?.user_email}) foi permanentemente excluída. Redirecionando...`,
          variant: "default",
        });
        
        // Aguardar um pouco antes do callback para garantir que a exclusão foi processada
        setTimeout(async () => {
          console.log('🚪 Executando logout e redirecionamento...');
          await onAccountDeleted();
        }, 1500);
        
      } else {
        // Função retornou mas com erro
        const errorMsg = data?.message || 'Erro desconhecido na exclusão';
        const errorCode = data?.error_code || 'UNKNOWN_ERROR';
        const sqlError = data?.sql_error || '';
        
        console.error('❌ Falha na exclusão:', data);
        
        let userFriendlyMessage = errorMsg;
        
        if (sqlError.includes('user_roles_granted_by_fkey')) {
          userFriendlyMessage = 'Não é possível deletar a conta porque você concedeu permissões para outros usuários. Entre em contato com o administrador.';
        } else if (sqlError.includes('foreign key')) {
          userFriendlyMessage = 'Não é possível deletar a conta devido a dependências no sistema. Entre em contato com o suporte.';
        }
        
        toast({
          title: "Erro ao excluir conta",
          description: userFriendlyMessage,
          variant: "destructive",
        });
      }
      
    } catch (error: unknown) {
      console.error('💥 Erro geral ao excluir conta:', error);
      
      let errorMessage = 'Erro inesperado ao tentar excluir a conta.';
      
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
        
        // Tratar erros específicos
        if (error.message.includes('user_roles_granted_by_fkey')) {
          errorMessage = 'Não é possível deletar a conta porque você concedeu permissões para outros usuários.';
        }
      }
      
      toast({
        title: "Erro ao excluir conta", 
        description: `${errorMessage} Entre em contato com o suporte se o problema persistir.`,
        variant: "destructive",
      });
      
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default CloseAccount;
import React, { useEffect, useState } from 'react';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';
import { AdminRoleManagement } from '@/components/admin/AdminRoleManagement';
import { useAuth } from '@/lib/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Users, Trash2 } from 'lucide-react';

export const AdminPage = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Primeiro verificar usando a função do banco
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error('Erro ao verificar status de admin:', error);
          // Fallback para verificação por email (compatibilidade)
          const emailBasedAdmin = user.email === 'admin@cirurgia.com.br' || 
                                 user.email === 'suporte@cirurgia.com.br' ||
                                 user.email === 'dolescfo@gmail.com' ||
                                 user.email?.includes('@cirurgia.com.br');
          setIsAdmin(emailBasedAdmin);
        } else {
          setIsAdmin(data);
        }
      } catch (error) {
        console.error('Erro inesperado ao verificar admin:', error);
        // Fallback para verificação por email
        const emailBasedAdmin = user.email === 'dolescfo@gmail.com' ||
                               user.email?.includes('@cirurgia.com.br');
        setIsAdmin(emailBasedAdmin);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você precisa estar logado para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Acesso negado. Esta página é restrita para administradores.
            <br />
            <small className="text-gray-600">
              Usuário atual: {user?.email}
              <br />
              Para se tornar administrador, peça para um admin existente executar:
              <br />
              <code className="bg-gray-100 px-1 rounded text-xs">
                SELECT grant_admin_role('{user?.email}');
              </code>
            </small>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <div className="ml-auto text-sm text-gray-600">
              Logado como: <strong>{user.email}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Gerenciar Usuários
              </TabsTrigger>
              <TabsTrigger value="admins" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Gerenciar Administradores
              </TabsTrigger>
            </TabsList>
            <TabsContent value="users">
              <AdminUserManagement />
            </TabsContent>
            <TabsContent value="admins">
              <AdminRoleManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Importante:</strong> Esta ferramenta foi criada para resolver problemas de deleção 
            de usuários em ambientes Supabase self-hosted. Use apenas quando a interface padrão 
            do Supabase Authentication não funcionar corretamente.
            <br /><br />
            <strong>Backup recomendado:</strong> Sempre faça backup do banco de dados antes de 
            realizar operações de deleção em massa.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

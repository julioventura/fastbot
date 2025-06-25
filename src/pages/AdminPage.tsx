import React from 'react';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';
import { useAuth } from '@/lib/auth/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

export const AdminPage = () => {
  const { user } = useAuth();

  // Verificar se o usuário tem permissão de admin
  // Você pode ajustar esta lógica conforme necessário
  const isAdmin = user?.email === 'admin@cirurgia.com.br' || 
                  user?.email === 'suporte@cirurgia.com.br' ||
                  user?.email?.includes('@cirurgia.com.br');

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
            <small className="text-gray-600">Usuário atual: {user.email}</small>
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
        <AdminUserManagement />
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

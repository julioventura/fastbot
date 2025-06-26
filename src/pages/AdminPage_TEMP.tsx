import React, { useEffect, useState } from 'react';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';
import { AdminRoleManagement } from '@/components/admin/AdminRoleManagement';
import { useAuth } from '@/lib/auth/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Users, Trash2 } from 'lucide-react';

export const AdminPage = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useIsAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-gradient">
        <div className="container mx-auto p-6 max-w-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Verificando permissões...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-theme-gradient">
        <div className="container mx-auto p-6 max-w-2xl">
          <Alert className="border-destructive/50 bg-destructive/10 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              Você precisa estar logado para acessar esta página.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-theme-gradient">
        <div className="container mx-auto p-6 max-w-2xl">
          <Alert className="border-destructive/50 bg-destructive/10 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              Acesso negado. Esta página é restrita para administradores.
              <br />
              <small className="text-muted-foreground">
                Usuário atual: {user?.email}
                <br />
                Para se tornar administrador, peça para um admin existente executar:
                <br />
                <code className="bg-secondary/50 px-1 rounded text-xs text-foreground">
                  SELECT grant_admin_role('{user?.email}');
                </code>
              </small>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-gradient">
      <div className="bg-theme-card/80 backdrop-blur-sm border-b border-border shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
            <div className="ml-auto text-sm text-muted-foreground">
              Logado como: <strong className="text-foreground">{user.email}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50 border border-border">
              <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="h-4 w-4" />
                Gerenciar Usuários
              </TabsTrigger>
              <TabsTrigger value="admins" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
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
        <Alert className="border-accent/50 bg-accent/10 backdrop-blur-sm">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
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

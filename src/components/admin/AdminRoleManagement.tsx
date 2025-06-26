import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Trash2, UserPlus, Shield, Users, AlertTriangle } from 'lucide-react';

interface Admin {
  user_id: string;
  email: string;
  role: string;
  granted_at: string;
  granted_by_email: string | null;
}

export const AdminRoleManagement = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_admins');
      
      if (error) {
        console.error('Erro ao carregar admins:', error);
        setMessage({ type: 'error', text: `Erro ao carregar administradores: ${error.message}` });
        return;
      }

      setAdmins(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      setMessage({ type: 'error', text: 'Erro inesperado ao carregar administradores.' });
    } finally {
      setLoading(false);
    }
  };

  const grantAdminRole = async () => {
    if (!newAdminEmail.trim()) {
      setMessage({ type: 'error', text: 'Por favor, insira um email válido.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.rpc('grant_admin_role', {
        target_email: newAdminEmail.trim()
      });

      if (error) {
        console.error('Erro ao conceder role:', error);
        setMessage({ type: 'error', text: `Erro ao conceder role: ${error.message}` });
        return;
      }

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setNewAdminEmail('');
        loadAdmins(); // Recarregar lista
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      setMessage({ type: 'error', text: 'Erro inesperado ao conceder role de administrador.' });
    } finally {
      setLoading(false);
    }
  };

  const revokeAdminRole = async (email: string) => {
    const confirmed = window.confirm(
      `⚠️ ATENÇÃO: Você está prestes a remover os privilégios de administrador de:\n\n` +
      `Email: ${email}\n\n` +
      `Tem certeza que deseja continuar?`
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.rpc('revoke_admin_role', {
        target_email: email
      });

      if (error) {
        console.error('Erro ao revogar role:', error);
        setMessage({ type: 'error', text: `Erro ao revogar role: ${error.message}` });
        return;
      }

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        loadAdmins(); // Recarregar lista
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      setMessage({ type: 'error', text: 'Erro inesperado ao revogar role de administrador.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  return (
    <Card className="bg-theme-card border border-theme-accent/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Shield className="h-5 w-5 text-primary" />
          Gerenciamento de Administradores
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Gerencie quem tem acesso administrativo ao sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seção para adicionar novo admin */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <UserPlus className="h-4 w-4" />
            Adicionar Novo Administrador
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o email do usuário..."
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && grantAdminRole()}
              className="bg-background border-border text-foreground"
            />
            <Button onClick={grantAdminRole} disabled={loading} className="bg-primary hover:bg-primary/90">
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? 'Adicionando...' : 'Adicionar Admin'}
            </Button>
          </div>
        </div>

        {/* Lista de administradores */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <Users className="h-4 w-4" />
            Administradores Atuais ({admins.length})
          </h3>
          
          {loading && admins.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando administradores...</p>
            </div>
          ) : admins.length === 0 ? (
            <Alert className="border-border bg-secondary/50 backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                Nenhum administrador encontrado. Isso pode indicar que o sistema de roles ainda não foi configurado.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {admins.map((admin) => (
                <div
                  key={admin.user_id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/20 backdrop-blur-sm"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{admin.email}</span>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                        {admin.role}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Concedido em: {new Date(admin.granted_at).toLocaleString('pt-BR')}
                      {admin.granted_by_email && (
                        <span> • Por: {admin.granted_by_email}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => revokeAdminRole(admin.email)}
                    disabled={loading}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instruções SQL */}
        <div className="space-y-4 border-t border-border pt-4">
          <h3 className="text-lg font-semibold text-foreground">Comandos SQL Diretos</h3>
          <div className="bg-secondary/30 p-3 rounded border border-border text-sm font-mono space-y-2">
            <div>
              <strong className="text-foreground">Ver todos os admins:</strong>
              <br />
              <code className="text-primary">SELECT * FROM get_all_admins();</code>
            </div>
            <div>
              <strong className="text-foreground">Adicionar admin:</strong>
              <br />
              <code className="text-primary">SELECT grant_admin_role('email@exemplo.com');</code>
            </div>
            <div>
              <strong className="text-foreground">Remover admin:</strong>
              <br />
              <code className="text-primary">SELECT revoke_admin_role('email@exemplo.com');</code>
            </div>
            <div>
              <strong className="text-foreground">Verificar se é admin:</strong>
              <br />
              <code className="text-primary">SELECT is_admin((SELECT id FROM auth.users WHERE email = 'email@exemplo.com'));</code>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        {message && (
          <Alert className={
            message.type === 'error' 
              ? 'border-destructive/50 bg-destructive/10 backdrop-blur-sm' 
              : message.type === 'success' 
              ? 'border-primary/50 bg-primary/10 backdrop-blur-sm' 
              : 'border-accent/50 bg-accent/10 backdrop-blur-sm'
          }>
            <AlertDescription className={
              message.type === 'error' 
                ? 'text-destructive' 
                : message.type === 'success' 
                ? 'text-primary' 
                : 'text-foreground'
            }>
              {message.text}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

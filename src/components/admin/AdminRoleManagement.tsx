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
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Gerenciamento de Administradores
        </CardTitle>
        <CardDescription>
          Gerencie quem tem acesso administrativo ao sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seção para adicionar novo admin */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Adicionar Novo Administrador
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o email do usuário..."
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && grantAdminRole()}
            />
            <Button onClick={grantAdminRole} disabled={loading}>
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? 'Adicionando...' : 'Adicionar Admin'}
            </Button>
          </div>
        </div>

        {/* Lista de administradores */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Administradores Atuais ({admins.length})
          </h3>
          
          {loading && admins.length === 0 ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando administradores...</p>
            </div>
          ) : admins.length === 0 ? (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Nenhum administrador encontrado. Isso pode indicar que o sistema de roles ainda não foi configurado.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {admins.map((admin) => (
                <div
                  key={admin.user_id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{admin.email}</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {admin.role}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
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
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Comandos SQL Diretos</h3>
          <div className="bg-gray-100 p-3 rounded text-sm font-mono space-y-2">
            <div>
              <strong>Ver todos os admins:</strong>
              <br />
              <code>SELECT * FROM get_all_admins();</code>
            </div>
            <div>
              <strong>Adicionar admin:</strong>
              <br />
              <code>SELECT grant_admin_role('email@exemplo.com');</code>
            </div>
            <div>
              <strong>Remover admin:</strong>
              <br />
              <code>SELECT revoke_admin_role('email@exemplo.com');</code>
            </div>
            <div>
              <strong>Verificar se é admin:</strong>
              <br />
              <code>SELECT is_admin((SELECT id FROM auth.users WHERE email = 'email@exemplo.com'));</code>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        {message && (
          <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Search, AlertTriangle, CheckCircle } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
}

interface RelatedRecords {
  profiles: number;
  dentist_homepage: number;
  mychatbot: number;
  sessions: number;
}

interface UserCheckResult {
  success: boolean;
  user?: UserData;
  related_records?: RelatedRecords;
  message?: string;
}

interface DeleteResult {
  success: boolean;
  message: string;
  deleted_records?: RelatedRecords;
}

export const AdminUserManagement = () => {
  const [email, setEmail] = useState('');
  const [userData, setUserData] = useState<UserCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const checkUser = async () => {
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Por favor, insira um email válido.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setUserData(null);

    try {
      const { data, error } = await supabase.rpc('admin_check_user', {
        user_email: email.trim()
      });

      if (error) {
        console.error('Erro ao verificar usuário:', error);
        setMessage({ type: 'error', text: `Erro ao verificar usuário: ${error.message}` });
        return;
      }

      setUserData(data);
      
      if (!data.success) {
        setMessage({ type: 'info', text: data.message || 'Usuário não encontrado.' });
      } else {
        setMessage({ type: 'success', text: 'Usuário encontrado!' });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      setMessage({ type: 'error', text: 'Erro inesperado ao verificar usuário.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!userData?.user?.email) return;

    const confirmed = window.confirm(
      `⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n` +
      `Você está prestes a deletar permanentemente:\n` +
      `• Usuário: ${userData.user.email}\n` +
      `• ${userData.related_records?.profiles || 0} registro(s) de perfil\n` +
      `• ${userData.related_records?.dentist_homepage || 0} registro(s) de dentista\n` +
      `• ${userData.related_records?.mychatbot || 0} chatbot(s)\n` +
      `• ${userData.related_records?.sessions || 0} sessão(ões) ativa(s)\n\n` +
      `Tem certeza que deseja continuar?`
    );

    if (!confirmed) return;

    setDeleting(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.rpc('admin_delete_user', {
        user_email: userData.user.email
      });

      if (error) {
        console.error('Erro ao deletar usuário:', error);
        setMessage({ type: 'error', text: `Erro ao deletar usuário: ${error.message}` });
        return;
      }

      const result = data as DeleteResult;

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Usuário deletado com sucesso! Registros removidos: ${
            Object.values(result.deleted_records || {}).reduce((a, b) => a + b, 0)
          }` 
        });
        setUserData(null);
        setEmail('');
      } else {
        setMessage({ type: 'error', text: result.message || 'Erro desconhecido ao deletar usuário.' });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      setMessage({ type: 'error', text: 'Erro inesperado ao deletar usuário.' });
    } finally {
      setDeleting(false);
    }
  };

  const checkOrphanedRecords = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.rpc('admin_check_orphaned_records');

      if (error) {
        console.error('Erro ao verificar registros órfãos:', error);
        setMessage({ type: 'error', text: `Erro ao verificar registros órfãos: ${error.message}` });
        return;
      }

      const hasOrphans = data.has_orphans;
      const orphanedRecords = data.orphaned_records;

      if (hasOrphans) {
        setMessage({ 
          type: 'error', 
          text: `Encontrados registros órfãos: ${orphanedRecords.profiles} perfis, ${orphanedRecords.dentist_homepage} dentistas, ${orphanedRecords.mychatbot} chatbots` 
        });
      } else {
        setMessage({ type: 'success', text: 'Nenhum registro órfão encontrado!' });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      setMessage({ type: 'error', text: 'Erro inesperado ao verificar registros órfãos.' });
    } finally {
      setLoading(false);
    }
  };

  const cleanOrphanedRecords = async () => {
    const confirmed = window.confirm(
      '⚠️ Esta ação irá deletar TODOS os registros órfãos do banco de dados.\n\n' +
      'Registros órfãos são dados de perfis, dentistas ou chatbots que não têm um usuário correspondente.\n\n' +
      'Deseja continuar?'
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.rpc('admin_clean_orphaned_records');

      if (error) {
        console.error('Erro ao limpar registros órfãos:', error);
        setMessage({ type: 'error', text: `Erro ao limpar registros órfãos: ${error.message}` });
        return;
      }

      const totalDeleted = data.total_deleted;
      const deletedRecords = data.deleted_records;

      setMessage({ 
        type: 'success', 
        text: `Limpeza concluída! Removidos: ${deletedRecords.profiles} perfis, ${deletedRecords.dentist_homepage} dentistas, ${deletedRecords.mychatbot} chatbots (Total: ${totalDeleted})` 
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
      setMessage({ type: 'error', text: 'Erro inesperado ao limpar registros órfãos.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Gerenciamento de Usuários - Administrativo
          </CardTitle>
          <CardDescription>
            Ferramenta para verificar e deletar usuários em ambientes Supabase self-hosted.
            <br />
            <strong className="text-red-600">⚠️ Use com extrema cautela - deleções são irreversíveis!</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seção de busca de usuário */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. Verificar Usuário</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Digite o email do usuário..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkUser()}
              />
              <Button onClick={checkUser} disabled={loading} variant="outline">
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>

          {/* Resultados da busca */}
          {userData?.success && userData.user && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Dados do Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>ID:</strong> {userData.user.id}</p>
                    <p><strong>Email:</strong> {userData.user.email}</p>
                    <p><strong>Criado em:</strong> {new Date(userData.user.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p><strong>Email confirmado:</strong> {userData.user.email_confirmed_at ? 'Sim' : 'Não'}</p>
                    <p><strong>Último login:</strong> {userData.user.last_sign_in_at ? new Date(userData.user.last_sign_in_at).toLocaleString('pt-BR') : 'Nunca'}</p>
                  </div>
                </div>
                
                {userData.related_records && (
                  <div className="mt-4 p-4 bg-white rounded border">
                    <h4 className="font-semibold mb-2">Registros Relacionados:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <p>Perfis: <strong>{userData.related_records.profiles}</strong></p>
                      <p>Dentistas: <strong>{userData.related_records.dentist_homepage}</strong></p>
                      <p>Chatbots: <strong>{userData.related_records.mychatbot}</strong></p>
                      <p>Sessões: <strong>{userData.related_records.sessions}</strong></p>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <Button 
                    onClick={deleteUser} 
                    disabled={deleting} 
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleting ? 'Deletando...' : 'DELETAR USUÁRIO PERMANENTEMENTE'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seção de manutenção */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">2. Manutenção do Banco</h3>
            <div className="flex gap-2">
              <Button onClick={checkOrphanedRecords} disabled={loading} variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Verificar Registros Órfãos
              </Button>
              <Button onClick={cleanOrphanedRecords} disabled={loading} variant="destructive">
                <CheckCircle className="h-4 w-4 mr-2" />
                Limpar Registros Órfãos
              </Button>
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
    </div>
  );
};

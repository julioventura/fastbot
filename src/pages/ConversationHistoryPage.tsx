import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, Clock, MessageSquare, User, Bot, Info, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useShortMemory } from "@/hooks/useShortMemory";
import { useAuth } from "@/lib/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ConversationHistoryPage: React.FC = () => {
  const [showTechnicalInfo, setShowTechnicalInfo] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [supabaseTotalMessages, setSupabaseTotalMessages] = useState<number>(0);
  const [showingSupabaseMemory, setShowingSupabaseMemory] = useState(false);
  const [supabaseMessages, setSupabaseMessages] = useState<{ id: string; role: string; content: string; timestamp: string }[]>([]);

  const { user } = useAuth();

  // Hook para Short-Memory
  const {
    shortMemoryData,
    shortMemoryStats,
    isLoading: shortMemoryLoading,
    loadShortMemoryData,
    clearShortMemory,
    getShortMemoryKey,
  } = useShortMemory(user?.id);

  // Função para buscar total de mensagens do Supabase
  const fetchSupabaseTotalMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Buscar todas as sessões do usuário e contar mensagens no JSONB
      const { data, error } = await supabase
        .from('conversation_history')
        .select('messages')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao buscar total de mensagens do Supabase:', error);
        return;
      }

      // Contar todas as mensagens de todas as sessões
      let totalMessages = 0;
      if (data) {
        data.forEach(session => {
          if (session.messages && Array.isArray(session.messages)) {
            totalMessages += session.messages.length;
          }
        });
      }

      setSupabaseTotalMessages(totalMessages);
      console.log('📊 [Supabase] Total de mensagens encontradas:', totalMessages, 'em', data?.length || 0, 'sessões');
    } catch (error) {
      console.error('Erro inesperado ao buscar mensagens do Supabase:', error);
    }
  }, [user?.id]);

  // Função para buscar mensagens do Supabase
  const fetchSupabaseMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Buscar todas as sessões ordenadas por última atividade
      const { data, error } = await supabase
        .from('conversation_history')
        .select('messages, last_activity, session_id')
        .eq('user_id', user.id)
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Erro ao buscar mensagens do Supabase:', error);
        return;
      }

      // Extrair todas as mensagens de todas as sessões e ordenar por timestamp
      const allMessages: Array<{
        id: string;
        role: string;
        content: string;
        timestamp: string;
        sessionId: string;
      }> = [];

      if (data) {
        data.forEach(session => {
          if (session.messages && Array.isArray(session.messages)) {
            session.messages.forEach((message: {
              id: string;
              role: string;
              content: string;
              timestamp: string;
            }) => {
              allMessages.push({
                ...message,
                sessionId: session.session_id
              });
            });
          }
        });
      }

      // Ordenar por timestamp (mais recentes primeiro) e limitar a 50
      allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const limitedMessages = allMessages.slice(0, 50);

      setSupabaseMessages(limitedMessages);
      console.log('📊 [Supabase] Mensagens carregadas para exibição:', limitedMessages.length, 'de', allMessages.length, 'total');
    } catch (error) {
      console.error('Erro inesperado ao buscar mensagens do Supabase:', error);
    }
  }, [user?.id]);

  // Carregar dados quando o componente monta
  useEffect(() => {
    if (user?.id) {
      console.log('🔄 [ConversationHistoryPage] Carregando dados da memória para o usuário:', user.id);
      loadShortMemoryData();
      fetchSupabaseTotalMessages();
      fetchSupabaseMessages();
    }
  }, [user?.id, loadShortMemoryData, fetchSupabaseTotalMessages, fetchSupabaseMessages]);

  // Função para confirmar limpeza da memória
  const handleClearMemory = () => {
    clearShortMemory();
    setShowClearConfirmation(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-blue-200">Faça login para ver seu histórico de conversas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header da Página */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <MessageSquare className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Histórico de Conversas</h1>
          </div>
          <p className="text-blue-200/80 text-lg max-w-2xl mx-auto">
            Revise suas conversas anteriores e gerencie sua memória de chatbot
          </p>
        </div>

        {/* Container Principal */}
        <div className="bg-gradient-to-br from-slate-900/80 to-blue-900/20 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Histórico de Conversas</h2>
                <p className="text-blue-300/80 text-sm">Gerencie suas conversas anteriores</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Estatísticas da Short-Memory */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border border-blue-800/50 bg-blue-900/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-8 h-8 mr-2 text-blue-400" />
                      <div>
                        <p className="text-md font-bold text-blue-400">Total de Mensagens</p>
                        <p className="text-lg font-bold text-white">
                          {Math.min(shortMemoryStats.totalMessages, 20)} / {supabaseTotalMessages}
                        </p>
                        <p className="text-xs text-blue-300/70">
                          Short-Memory (máx 20) / Supabase
                        </p>
                      </div>
                    </div>

                    {/* Botão de atualizar no canto superior direito */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        loadShortMemoryData();
                        fetchSupabaseTotalMessages();
                        fetchSupabaseMessages();
                      }}
                      className="p-2 rounded-lg hover:bg-blue-700/30 transition-colors group"
                      title="Atualizar contadores de mensagens"
                    >
                      <RefreshCw className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-green-800/50 bg-green-900/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-8 h-8 mr-2 text-green-400" />
                    <div>
                      <p className="text-md font-bold text-green-400">Última Atualização</p>
                      <p className="text-sm font-bold text-white">
                        {shortMemoryStats.lastUpdate
                          ? shortMemoryStats.lastUpdate.toLocaleString('pt-BR')
                          : 'Nenhuma'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-purple-800/50 bg-purple-900/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Upload className="w-8 h-8 mr-2 text-purple-400" />
                    <div>
                      <p className="text-md font-bold text-purple-400">Tamanho da Memória</p>
                      <p className="text-lg font-bold text-white">
                        {(shortMemoryStats.memorySize / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Mensagens da Short-Memory */}
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center mr-2">
                {/* Botões de alternância Short-Memory / Supabase */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!showingSupabaseMemory) {
                        return;
                      } else {
                        setShowingSupabaseMemory(false);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${!showingSupabaseMemory
                        ? 'bg-green-700/30 border-green-500/50 text-green-300 shadow-lg'
                        : 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:bg-green-900/20 hover:border-green-600/30'
                      }`}
                    title="Ver memória recente (short-memory)"
                  >
                    <span className="text-sm font-medium">Conversa recente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (showingSupabaseMemory) {
                        return;
                      } else {
                        setShowingSupabaseMemory(true);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showingSupabaseMemory
                        ? 'bg-blue-700/30 border-blue-500/50 text-blue-300 shadow-lg'
                        : 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:bg-blue-900/20 hover:border-blue-600/30'
                      }`}
                    title="Ver conversas antigas (Supabase)"
                  >
                    <span className="text-sm font-medium">Conversas antigas</span>
                  </button>
                </div>

                {/* Botão Detalhes */}
                <button
                  type="button"
                  onClick={() => setShowTechnicalInfo(prev => !prev)}
                  className="ml-2 flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors bg-orange-900/20 px-3 py-2 rounded-lg border border-orange-600/30"
                  title="Detalhes da memória recente (short-memory)"
                >
                  <Info className="w-4 h-4" />
                  <span className="text-sm">Detalhes</span>
                </button>
              </div>

              {/* Informações Técnicas */}
              {showTechnicalInfo && (
                <div className="mt-4 space-y-4">
                  <div className="border border-orange-600/50 bg-orange-900/20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-sm text-orange-200 space-y-2">
                      <p><strong className="text-orange-300">Chave do LocalStorage:</strong> {getShortMemoryKey()}</p>
                      <p><strong className="text-orange-300">Limite de Mensagens:</strong> 50 mensagens (mantém as mais recentes)</p>
                      <p><strong className="text-orange-300">Contexto Enviado ao Chatbot:</strong> Últimas 10 mensagens</p>
                      <p><strong className="text-orange-300">Integração:</strong> O contexto da short-memory é automaticamente incluído nas consultas ao chatbot</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista das mensagens */}
              {showingSupabaseMemory ? (
                // Mensagens do Supabase
                supabaseMessages.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto bg-slate-900/50 border border-blue-600/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-sm text-center text-blue-300 mb-3 pb-2 border-b border-blue-600/30">
                      Mensagens da Memória Longa (Supabase) - Últimas 50
                    </div>
                    {supabaseMessages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`p-4 rounded-lg border backdrop-blur-sm ${message.role === 'user'
                            ? 'bg-slate-800/60 border-slate-600/50'
                            : 'bg-blue-900/30 border-blue-700/50'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {message.role === 'user' ? (
                              <User className="w-4 h-4 text-blue-400" />
                            ) : (
                              <Bot className="w-4 h-4 text-blue-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-sm font-medium ${message.role === 'user' ? 'text-blue-300' : 'text-blue-200'
                                }`}>
                                {message.role === 'user' ? 'Usuário' : 'Assistente'}
                              </span>
                              <span className="text-xs text-slate-400">
                                #{index + 1} • {new Date(message.timestamp).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 bg-slate-900/30 rounded-xl border border-slate-700/50">
                    <Bot className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                    <p>Nenhuma mensagem encontrada no Supabase</p>
                  </div>
                )
              ) : (
                // Mensagens da Short-Memory
                shortMemoryData.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto bg-slate-900/50 border border-green-600/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-sm text-center text-green-300 mb-3 pb-2 border-b border-green-600/30">
                      Short-Memory (Últimas 20 mensagens mais recentes)
                    </div>
                    {shortMemoryData.slice(-20).reverse().map((message, index) => {
                      const totalMessages = shortMemoryData.length;
                      const displayIndex = totalMessages - index;

                      return (
                        <div
                          key={message.id}
                          className={`p-4 rounded-lg border backdrop-blur-sm ${message.role === 'user'
                              ? 'bg-slate-800/60 border-slate-600/50'
                              : 'bg-green-900/30 border-green-700/50'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {message.role === 'user' ? (
                                <User className="w-4 h-4 text-green-400" />
                              ) : (
                                <Bot className="w-4 h-4 text-green-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-sm font-medium ${message.role === 'user' ? 'text-green-300' : 'text-green-200'
                                  }`}>
                                  {message.role === 'user' ? 'Usuário' : 'Assistente'}
                                </span>
                                <span className="text-xs text-slate-400">
                                  #{displayIndex} • {new Date(message.timestamp).toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-sm text-slate-300 whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border border-slate-700/50 text-center py-12 text-slate-400 rounded-xl bg-slate-900/30">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                    <p>Nenhuma mensagem na memória recente</p>
                    <p className="text-xs mt-1">Inicie uma conversa no chatbot para ver as mensagens aqui</p>
                  </div>
                )
              )}
            </div>

            {/* Controles da Short-Memory */}
            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowClearConfirmation(true)}
                className="flex items-center gap-2 border-red-500/50 bg-red-900/30 hover:border-red-400/70 hover:bg-red-900/50 backdrop-blur-sm"
                disabled={shortMemoryStats.totalMessages === 0 || shortMemoryLoading}
              >
                <Trash2 className="w-4 h-4" />
                Limpar Memória
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação para Limpar Memória */}
      <Dialog open={showClearConfirmation} onOpenChange={setShowClearConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Confirmar Limpeza da Memória
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja limpar toda a memória recente? Esta ação não pode ser desfeita.
            </p>
            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3">
              <p className="text-sm text-yellow-400">
                <strong>Atenção:</strong> Serão removidas {shortMemoryStats.totalMessages} mensagens do contexto de conversa.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowClearConfirmation(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearMemory}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Confirmar Limpeza
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConversationHistoryPage;

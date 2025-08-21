import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Slider } from "@/components/ui/slider";
// import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Plus, ChevronLeft, ChevronRight, Trash2, RefreshCw, Clock, MessageSquare, User, Bot, Info, ExternalLink, Copy, Check, QrCode, Download } from "lucide-react";
import DocumentUpload from "@/components/chatbot/DocumentUpload";
// import { ChatbotData } from "@/interfaces";
import { ChatbotConfigProps } from "@/interfaces";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useShortMemory } from "@/hooks/useShortMemory";
import { useAuth } from "@/lib/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "qrcode";

const AdvancedEditChatbotConfig: React.FC<ChatbotConfigProps> = ({
  chatbotData,
  isSaving,
  onSubmit,
  onChange,
  onCancel,
  showSystemMessagePreview,
  onPreviewSystemMessage,
  systemMessagePreview,
}) => {
  const [isDark, setIsDark] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showShortMemory, setShowShortMemory] = useState(false);
  const [publicLinkCopied, setPublicLinkCopied] = useState(false);
  const [showTechnicalInfo, setShowTechnicalInfo] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [supabaseTotalMessages, setSupabaseTotalMessages] = useState<number>(0);
  const [showingSupabaseMemory, setShowingSupabaseMemory] = useState(false);
  const [supabaseMessages, setSupabaseMessages] = useState<{ id: string; role: string; content: string; timestamp: string }[]>([]);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const { user } = useAuth();

  // Função para criar slug a partir do nome do chatbot
  const createSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD') // Decompor caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (acentos)
      .replace(/ç/g, 'c') // Substituir ç por c
      .replace(/Ç/g, 'c') // Substituir Ç por c
      .replace(/[^a-z0-9]/g, '') // Remover tudo que não for letra ou número
      .trim();
  };

  // Funções para link público
  const getPublicChatbotUrl = () => {
    if (!chatbotData?.chatbot_name) return '';
    const slug = createSlug(chatbotData.chatbot_name);
    if (!slug) return '';

    const baseUrl = window.location.origin;
    const basePath = window.location.pathname.includes('/fastbot') ? '/fastbot' : '';
    return `${baseUrl}${basePath}/chat/${slug}`;
  };

  const handleCopyPublicLink = async () => {
    const url = getPublicChatbotUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setPublicLinkCopied(true);
      setTimeout(() => setPublicLinkCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      // Fallback para seleção manual
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setPublicLinkCopied(true);
      setTimeout(() => setPublicLinkCopied(false), 2000);
    }
  };

  const handleOpenPublicChatbot = () => {
    const url = getPublicChatbotUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Função para gerar QR-code
  const generateQRCode = async (url: string): Promise<string> => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Erro ao gerar QR-code:', error);
      throw error;
    }
  };

  // Função para abrir modal do QR-code
  const handleShowQRCode = async () => {
    const url = getPublicChatbotUrl();
    if (!url) return;

    try {
      const qrDataUrl = await generateQRCode(url);
      setQrCodeDataUrl(qrDataUrl);
      setShowQRCodeModal(true);
    } catch (error) {
      console.error('Erro ao gerar QR-code:', error);
      alert('Erro ao gerar QR-code. Tente novamente.');
    }
  };

  // Função para baixar o QR-code
  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `qrcode-${createSlug(chatbotData.chatbot_name || 'chatbot')}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  // Hook para Short-Memory
  const {
    shortMemoryData,
    shortMemoryStats,
    isLoading: shortMemoryLoading,
    loadShortMemoryData,
    clearShortMemory,
    getShortMemoryKey,
    hasMessages,
    isEmpty: shortMemoryIsEmpty
  } = useShortMemory(user?.id);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const borderStyle = {
    border: isDark ? "3px solid rgba(255, 255, 255, 0.6)" : "3px solid #000000",
    borderColor: isDark ? "rgba(255, 255, 255, 0.6)" : "#000000",
  };

  // Funções auxiliares para frases obrigatórias
  const addMandatoryPhrase = (phrase: string) => {
    if (
      phrase.trim() &&
      !(chatbotData.mandatory_phrases || []).includes(phrase.trim())
    ) {
      onChange("mandatory_phrases", [
        ...(chatbotData.mandatory_phrases || []),
        phrase.trim(),
      ]);
    }
  };

  const removeMandatoryPhrase = (index: number) => {
    const phrases = [...(chatbotData.mandatory_phrases || [])];
    phrases.splice(index, 1);
    onChange("mandatory_phrases", phrases);
  };


  const addTopic = (topic: string) => {
    if (topic.trim()) {
      onChange("allowed_topics", [
        ...(chatbotData.allowed_topics || []),
        topic.trim(),
      ]);
    }
  };

  const removeTopic = (index: number) => {
    const newTopics = [...(chatbotData.allowed_topics || [])];
    newTopics.splice(index, 1);
    onChange("allowed_topics", newTopics);
  };

  // Funções para upload de imagens
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageFiles = Array.from(files).filter((file) => {
        const allowedTypes = [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/gif",
        ];
        return allowedTypes.includes(file.type);
      });

      imageFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const currentImages = chatbotData.uploaded_images || [];
          onChange("uploaded_images", [...currentImages, result]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Limpar o input para permitir upload do mesmo arquivo novamente
    event.target.value = "";
  };

  const removeUploadedImage = (index: number) => {
    const images = [...(chatbotData.uploaded_images || [])];
    images.splice(index, 1);
    onChange("uploaded_images", images);
  };

  // Funções para preview de imagem
  const openImagePreview = (imageSrc: string) => {
    const imageIndex = (chatbotData.uploaded_images || []).indexOf(imageSrc);
    setPreviewImage(imageSrc);
    setPreviewImageIndex(imageIndex);
    setIsPreviewOpen(true);
  };

  const closeImagePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setPreviewImage(null);
    setPreviewImageIndex(0);
  }, []);

  const navigateImage = useCallback(
    (direction: "prev" | "next") => {
      const images = chatbotData.uploaded_images || [];
      if (images.length <= 1) return;

      let newIndex = previewImageIndex;
      if (direction === "prev") {
        newIndex =
          previewImageIndex > 0 ? previewImageIndex - 1 : images.length - 1;
      } else {
        newIndex =
          previewImageIndex < images.length - 1 ? previewImageIndex + 1 : 0;
      }

      setPreviewImageIndex(newIndex);
      setPreviewImage(images[newIndex]);
    },
    [chatbotData.uploaded_images, previewImageIndex]
  );

  // Suporte a teclado para navegação
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isPreviewOpen) return;

      if (event.key === "ArrowLeft") {
        navigateImage("prev");
      } else if (event.key === "ArrowRight") {
        navigateImage("next");
      } else if (event.key === "Escape") {
        closeImagePreview();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isPreviewOpen, navigateImage, closeImagePreview]);

  // Recarregar dados da Short-Memory quando a seção é ativada ou o usuário muda
  useEffect(() => {
    if (showShortMemory && user?.id) {
      console.log('🔄 [AdvancedEditChatbotConfig] Recarregando dados da memória recente para o usuário:', user.id);
      loadShortMemoryData();
    }
  }, [showShortMemory, user?.id, loadShortMemoryData]);

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

  // Carregar total de mensagens do Supabase quando a seção é ativada
  useEffect(() => {
    if (showShortMemory && user?.id) {
      fetchSupabaseTotalMessages();
      fetchSupabaseMessages();
    }
  }, [showShortMemory, user?.id, fetchSupabaseTotalMessages, fetchSupabaseMessages]);

  // Atualizar contadores automaticamente quando a short-memory muda
  useEffect(() => {
    if (showShortMemory && user?.id && shortMemoryStats.totalMessages > 0) {
      // Pequeno delay para dar tempo do Supabase processar novas mensagens
      const timeoutId = setTimeout(() => {
        fetchSupabaseTotalMessages();
        fetchSupabaseMessages();
      }, 2000); // 2 segundos de delay

      return () => clearTimeout(timeoutId);
    }
  }, [shortMemoryStats.totalMessages, shortMemoryStats.lastUpdate, showShortMemory, user?.id, fetchSupabaseTotalMessages, fetchSupabaseMessages]);

  // Função para confirmar limpeza da memória
  const handleClearMemory = () => {
    clearShortMemory();
    setShowClearConfirmation(false);
  };

  return (
    <div className="space-y-6">

      <form onSubmit={onSubmit} onKeyDown={(e) => {
        // Permite Enter apenas para submissão quando for no botão de submit
        // Bloqueia Enter para evitar submissões acidentais de outros campos
        if (e.key === "Enter" && e.target !== e.currentTarget) {
          const target = e.target as HTMLElement;
          // Permite Enter apenas em botões de submit ou se for Ctrl+Enter
          if (!('type' in target && target.type === "submit") && !e.ctrlKey) {
            e.preventDefault();
          }
        }
      }} className="space-y-6">



        {/* Seção: Identidade do chatbot */}
        <div className="space-y-4 md:space-y-6 border border-gray-600 rounded-lg p-3 md:p-6 bg-blue-950">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* Coluna Esquerda */}
            <div className="space-y-4 md:space-y-6">
              {/* Nome do Chatbot */}
              <div>
                <Label htmlFor="chatbot_name" className="text-sm md:text-base">
                  Nome do Chatbot <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="chatbot_name"
                  value={chatbotData.chatbot_name}
                  onChange={(e) => onChange("chatbot_name", e.target.value)}
                  className="mt-1 md:mt-2 edit-form-input text-sm md:text-base"
                  style={borderStyle}
                  placeholder="Ex: Assistente Virtual Dr. Silva"
                  required
                />
              </div>

              {/* Saudação Personalizada */}
              <div>
                <Label htmlFor="welcome_message" className="text-sm md:text-base">
                  Mensagem de Saudação
                </Label>
                <Textarea
                  id="welcome_message"
                  value={chatbotData.welcome_message}
                  onChange={(e) =>
                    onChange("welcome_message", e.target.value)
                  }
                  className="mt-1 md:mt-2 edit-form-input text-sm md:text-base"
                  style={borderStyle}
                  rows={6}
                  placeholder="Olá! Sou o assistente virtual. Como posso ajudar?"
                />
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-4 md:space-y-6">
              {/* System Message */}
              <div>
                <Label htmlFor="system_instructions" className="text-sm md:text-base">
                  Instruções Gerais{" "}
                </Label>
                <Textarea
                  id="system_instructions"
                  value={chatbotData.system_instructions}
                  onChange={(e) =>
                    onChange("system_instructions", e.target.value)
                  }
                  className="mt-1 md:mt-2 edit-form-input text-sm md:text-base"
                  style={borderStyle}
                  rows={10}
                  placeholder="Você é um assistente virtual especializado em... Suas principais funções são..."
                />
              </div>
            </div>
          </div>

          <div className="border-1 border-gray-500">

            {/* Temas Permitidos */}
            <div className="space-y-2">
              <Label className="text-sm md:text-base">Temas Permitidos</Label>

              {/* Layout responsivo para mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                {/* Seção de Input - Full width no mobile */}
                <div className="md:col-span-1">
                  {/* Input para adicionar temas */}
                  <div className="space-y-2 md:space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite e pressione Enter para adicionar à lista"
                        size={15}
                        onKeyDown={(e) => {
                          // Só processa se for Enter sem modificadores (Ctrl, Shift, Alt)
                          if (e.key === "Enter" && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                            e.preventDefault();
                            e.stopPropagation();
                            const target = e.target as HTMLInputElement;
                            if (target.value.trim()) {
                              addTopic(target.value);
                              target.value = "";
                            }
                          }
                        }}
                        className="edit-form-input text-sm md:text-base"
                        style={borderStyle}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          const input =
                            e.currentTarget.parentElement?.querySelector(
                              "input"
                            );
                          if (input && input.value.trim()) {
                            addTopic(input.value);
                            input.value = "";
                          }
                        }}
                        className="flex-shrink-0"
                      >
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Lista de temas - Full width no mobile */}
                <div className="md:col-span-1">
                  {(chatbotData.allowed_topics || []).length > 0 ? (
                    <div className="flex flex-wrap gap-1 md:gap-2 p-2 md:p-3 border border-gray-600 rounded-lg">
                      {(chatbotData.allowed_topics || []).map(
                        (topic, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 text-xs md:text-sm font-medium text-white border-2 border-blue-500 hover:bg-blue-800/50 transition-colors"
                          >
                            <span className="break-words">{topic}</span>
                            <div
                              className="cursor-pointer flex-shrink-0"
                              onClick={() => removeTopic(index)}
                              title={`Remover tema: ${topic}`}
                            >
                              <X className="w-3 h-3 hover:text-red-400" />
                            </div>
                          </Badge>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-gray-400 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">
                        Nenhum tema adicionado ainda. Use o campo ao lado para
                        adicionar temas permitidos.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Botões Cancelar e Salvar */}
        <div className="flex justify-center items-center w-full gap-5">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="hover-glow-shadow w-full md:w-auto text-sm md:text-base px-4 py-2"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="hover-glow-blue w-full md:w-auto text-sm md:text-base px-4 py-2"
          >
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>


        {/* URL do chatbot público para referência */}
        {chatbotData?.chatbot_name && (
          <div className="p-6 border border-gray-600 rounded-lg bg-blue-950">
            <p className="pl-2 text-sl text-white mb-2">
              URL do seu chatbot público (baseada no nome do chatbot)
            </p>
            <code className="text-xs md:text-2xl bg-green-900 border border-gray-600 p-4 mb-12 rounded-md block w-full overflow-x-auto text-green-400 font-mono">
              {getPublicChatbotUrl()}
            </code>

            {/* Botões do Link Público */}
            <div className="flex flex-col md:flex-row items-left w-full gap-3 mt-4 mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenPublicChatbot}
                disabled={!chatbotData?.chatbot_name}
                className="w-full md:w-auto text-sm md:text-base px-4 py-2 border-green-600 text-green-400 hover-glow-green"
              >
                <ExternalLink size={16} className="mr-2" />
                Abrir Chatbot Público
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleCopyPublicLink}
                disabled={!chatbotData?.chatbot_name}
                className="w-full md:w-auto text-sm md:text-base px-4 py-2 border-blue-600 text-blue-400 hover-glow-blue"
              >
                {publicLinkCopied ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Link Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-2" />
                    Copiar Link Público
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleShowQRCode}
                disabled={!chatbotData?.chatbot_name}
                className="w-full md:w-auto text-sm md:text-base px-4 py-2 border-purple-600 text-purple-400 hover-glow-violet"
              >
                <QrCode size={16} className="mr-2" />
                Ver QR-Code
              </Button>
            </div>

            <p className="text-xs md:text-sm text-gray-400 mt-8">
              💡&nbsp; Esta URL permite que qualquer pessoa converse com seu chatbot sem precisar fazer login
            </p>
            <p className="text-xs md:text-sm text-gray-400 mt-2">
              💡&nbsp; A URL é gerada automaticamente baseada no nome do seu chatbot (sem espaços e acentos)
            </p>
          </div>
        )}


        {/* Base de Dados */}
        <div className="pt-3 md:pt-6"></div>
        <div className="mt-3 md:mt-6 border border-gray-600 rounded-lg bg-blue-950">

          <Card className="bg-transparent border border-border backdrop-blur-sm">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="flex items-center text-lg md:text-xl">Base de Dados</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Gerencie documentos e imagens para enriquecer as respostas do
                chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-6 p-3 md:p-6">

              {/* Upload de Documentos */}
              <div className="space-y-3 md:space-y-6 lg p-2 md:p-6">
                <DocumentUpload />
              </div>

            </CardContent>
          </Card>


        </div>



        {/* Seção: Configurações da Base de Dados */}
        {/* <div className="space-y-6 border border-gray-600 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  📊 Configurações da Base de Dados
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>
                        Rigidez nas Fontes:{" "}
                        {chatbotData.source_strictness || 50}%
                      </Label>
                      <Slider
                        value={[chatbotData.source_strictness || 50]}
                        onValueChange={([value]) =>
                          onChange("source_strictness", value)
                        }
                        max={100}
                        step={1}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Flexível</span>
                        <span>Apenas documentos</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>
                        Confiança Mínima para Resposta:{" "}
                        {chatbotData.confidence_threshold || 70}%
                      </Label>
                      <Slider
                        value={[chatbotData.confidence_threshold || 70]}
                        onValueChange={([value]) =>
                          onChange("confidence_threshold", value)
                        }
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>
                </div>
              </div> */}





        {/* Botões de Ação - Apenas no tab de Configuração */}
        <div className="flex justify-start items-center pt-12 pb-2">

          {/* Botões auxiliares */}
          <div className="flex flex-col md:flex-row justify-center items-center w-full gap-2 md:gap-5">
            <Button
              type="button"
              variant="outline"
              onClick={onPreviewSystemMessage}
              disabled={isSaving}
              className={`${showSystemMessagePreview
                ? 'bg-purple-900 text-white hover:bg-purple-900'
                : 'hover:bg-purple-900'
                } border border-purple-600 px-3 md:px-4 py-2 transition-colors text-xs md:text-sm w-full md:w-auto`}
            >
              {showSystemMessagePreview ? 'Ocultar' : 'Ver'} Instrução Automática
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowShortMemory(prev => !prev)}
              disabled={isSaving}
              className={`${showShortMemory
                ? 'bg-purple-900 text-white hover:bg-purple-900'
                : 'hover:bg-purple-900'
                } border border-purple-600 px-3 md:px-4 py-2 transition-colors text-xs md:text-sm w-full md:w-auto`}
            >
              {showShortMemory ? 'Ocultar' : 'Ver'} Histórico de Conversas
            </Button>
          </div>

        </div>


        {/* Preview do System Message */}
        {showSystemMessagePreview && (
          <div className="mt-3 md:mt-6 p-3 md:p-4 bg-background/50 backdrop-blur-sm rounded-lg border">
            <h3 className="text-base md:text-lg font-semibold ml-2 mb-3">Preview do System Message:</h3>
            <p className="text-xs md:text-sm text-primary ml-2 mt-3 mb-6">
              Conteúdo automático para o "system_message" do chatbot.
            </p>
            <pre className="whitespace-pre-wrap text-xs md:text-sm bg-muted p-3 md:p-4 rounded border max-h-64 md:max-h-96 overflow-y-auto">
              {systemMessagePreview}
            </pre>
          </div>
        )}

        {/* Seção Memória Recente */}
        {showShortMemory && (
          <div className="mt-6 p-4 bg-background/50 backdrop-blur-sm rounded-lg border">
            <h3 className="text-lg font-semibold ml-2 mb-3">Histórico de conversas</h3>
            <p className="text-sm text-primary ml-2 mt-3 mb-6">
              Reveja suas conversas.
            </p>

            {/* Estatísticas da Short-Memory */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border border-blue-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-8 h-8 mr-2 text-blue-600" />
                      <div>
                        <p className="text-md font-bold text-blue-600">Total de Mensagens</p>
                        <p className="text-lg font-bold">
                          {Math.min(shortMemoryStats.totalMessages, 20)} / {supabaseTotalMessages}
                        </p>
                        <p className="text-xs text-gray-500">
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
                      className="p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                      title="Atualizar contadores de mensagens"
                    >
                      <RefreshCw className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-green-800">
                <CardContent className="p-4">

                  <div className="flex items-center gap-2">
                    <Clock className="w-8 h-8 mr-2 text-green-600" />
                    <div>
                      <p className="text-md font-bold text-green-600">Última Atualização</p>
                      <p className="text-lg font-bold">
                        {shortMemoryStats.lastUpdate
                          ? shortMemoryStats.lastUpdate.toLocaleString('pt-BR')
                          : 'Nenhuma'
                        }
                      </p>
                    </div>
                  </div>

                </CardContent>
              </Card>

              <Card className="border border-purple-800">
                <CardContent className="p-4">

                  <div className="flex items-center gap-2">
                    <Upload className="w-8 h-8 mr-2 text-purple-600" />
                    <div>
                      <p className="text-md font-bold text-purple-600">Tamanho da Memória</p>
                      <p className="text-lg font-bold">
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
                {/* Botão de alternância Short-Memory / Supabase */}
                <button
                  type="button"
                  onClick={() => setShowingSupabaseMemory(prev => !prev)}
                  className="flex items-center gap-2 px-3 py-1 rounded-md border transition-colors"
                  style={{
                    backgroundColor: showingSupabaseMemory ? '#1e40af' : '#0F8F0F',
                    borderColor: showingSupabaseMemory ? '#3b82f6' : '#00C000',
                    color: showingSupabaseMemory ? '#ffffff' : '#ffffff'
                  }}
                  title={showingSupabaseMemory ? "Ver memória recente" : "Ver conversas antigas"}
                >
                  <span className="text-sm">
                    {showingSupabaseMemory ? 'Conversas antigas' : 'Conversa recente'}
                  </span>
                </button>

                {/* Botão Detalhes */}
                <button
                  type="button"
                  onClick={() => setShowTechnicalInfo(prev => !prev)}
                  className="ml-2 flex items-center gap-2 text-orange-600 hover:text-yellow-400 transition-colors"
                  title="Detalhes da memória recente (short-memory)"
                >
                  <Info className="w-4 h-4" />
                  <span className="text-sm">Detalhes</span>
                </button>
              </div>


              {/* Informações Técnicas */}
              {showTechnicalInfo && (
                <div className="mt-12 space-y-4">
                  <div className="border border-orange-600 bg-orange-950 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Chave do LocalStorage:</strong> {getShortMemoryKey()}</p>
                      <p><strong>Limite de Mensagens:</strong> 50 mensagens (mantém as mais recentes)</p>
                      <p><strong>Contexto Enviado ao Chatbot:</strong> Últimas 10 mensagens</p>
                      <p><strong>Integração:</strong> O contexto da short-memory é automaticamente incluído nas consultas ao chatbot</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista das mensagens */}

              {/* Exibição condicional: Short-Memory ou Supabase */}
              {showingSupabaseMemory ? (
                // Mensagens do Supabase
                supabaseMessages.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto bg-background border border-gray-600 rounded-lg p-4">
                    <div className="text-sm text-center text-blue-400 mb-3 pb-2 border-b border-gray-600">
                      Mensagens da Memória Longa (Supabase) - Últimas 50
                    </div>
                    {supabaseMessages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg border ${message.role === 'user'
                          ? 'bg-slate-900/80 border-slate-700'
                          : 'bg-slate-800/80 border-slate-600'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {message.role === 'user' ? (
                              <User className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Bot className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-sm font-medium ${message.role === 'user' ? 'text-blue-400' : 'text-blue-300'
                                }`}>
                                {message.role === 'user' ? 'Usuário' : 'Assistente'}
                              </span>
                              <span className="text-xs text-gray-500">
                                #{index + 1} • {new Date(message.timestamp).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bot className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p>Nenhuma mensagem encontrada no Supabase</p>
                  </div>
                )
              ) : (
                // Mensagens da Short-Memory
                shortMemoryData.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto bg-background border border-gray-600 rounded-lg p-4">
                    <div className="text-sm text-center text-green-400 mb-3 pb-2 border-b border-gray-600">
                      Short-Memory (Últimas 20 mensagens mais recentes)
                    </div>
                    {shortMemoryData.slice(-20).reverse().map((message, index) => {
                      // Calcular o número real da mensagem na lista completa (ajustado para ordem reversa)
                      const totalMessages = shortMemoryData.length;
                      const displayIndex = totalMessages - index;
                      const realIndex = totalMessages >= 20 ? (totalMessages - index) : (totalMessages - index);

                      return (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg border ${message.role === 'user'
                            ? 'bg-gray-900/80 border-gray-700'
                            : 'bg-gray-800/80 border-gray-600'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {message.role === 'user' ? (
                                <User className="w-4 h-4 text-green-500" />
                              ) : (
                                <Bot className="w-4 h-4 text-green-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-sm font-medium ${message.role === 'user' ? 'text-green-400' : 'text-green-300'
                                  }`}>
                                  {message.role === 'user' ? 'Usuário' : 'Assistente'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  #{displayIndex} • {new Date(message.timestamp).toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400 whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border border-gray-600 text-center py-8 text-gray-500 rounded-lg">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p>Nenhuma mensagem na memória recente</p>
                    <p className="text-xs mt-1">Inicie uma conversa no chatbot para ver as mensagens aqui</p>
                  </div>
                )
              )}
            </div>


            {/* Controles da Short-Memory */}
            <div className="flex gap-3 my-6">

              {/* <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadShortMemoryData}
                className="flex items-center gap-2" >
                <RefreshCw className="w-4 h-4" />
                Recarregar
              </Button> */}

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowClearConfirmation(true)}
                className="flex items-center gap-2 border-red-500 bg-red-900 hover:border-red-400 hover:bg-red-950"
                disabled={shortMemoryStats.totalMessages === 0 || shortMemoryLoading} >
                <Trash2 className="w-4 h-4" />
                Limpar Memória
              </Button>

            </div>

          </div>
        )}


      </form>

      {/* Modal de Preview de Imagem */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Preview da Imagem{" "}
              {(chatbotData.uploaded_images || []).length > 1 &&
                `(${previewImageIndex + 1} de ${(chatbotData.uploaded_images || []).length
                })`}
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            <div className="flex items-center justify-center p-4 bg-gray-900 rounded-lg">
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview da imagem"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              )}
            </div>

            {/* Botões de navegação */}
            {(chatbotData.uploaded_images || []).length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => navigateImage("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => navigateImage("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-muted-foreground">
              {(chatbotData.uploaded_images || []).length > 1
                ? "Use as setas ou clique fora da imagem para fechar"
                : "Clique fora da imagem ou no botão para fechar"}
            </p>
            <Button variant="outline" onClick={closeImagePreview}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Modal do QR-Code */}
      <Dialog open={showQRCodeModal} onOpenChange={setShowQRCodeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-500" />
              QR-Code do Chatbot Público
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Escaneie este QR-code para acessar o chatbot público
              </p>

              {qrCodeDataUrl && (
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR-Code do Chatbot"
                    className="max-w-full h-auto"
                    style={{ maxWidth: '256px' }}
                  />
                </div>
              )}

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {getPublicChatbotUrl()}
                </p>
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowQRCodeModal(false)}
                className="flex-1"
              >
                Fechar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={downloadQRCode}
                className="flex-1 flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-950"
              >
                <Download className="w-4 h-4" />
                Baixar PNG
              </Button>
            </div>

            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-3">
              <p className="text-xs text-blue-400">
                <strong>💡 Dica:</strong> O QR-code é gerado automaticamente baseado na URL atual do seu chatbot.
                Qualquer pessoa que escaneá-lo poderá conversar com seu chatbot.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default AdvancedEditChatbotConfig;

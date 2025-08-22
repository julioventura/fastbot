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
  const [publicLinkCopied, setPublicLinkCopied] = useState(false);
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

  // Hook para Short-Memory - removido pois agora está em página separada

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

  // Recarregar dados da Short-Memory quando a seção é ativada ou o usuário muda - removido pois agora está em página separada

  // Funções do Supabase removidas - agora estão em página separada

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



        {/* URL do chatbot público para referência */}
        <div id="chatbot_publico">

          {chatbotData?.chatbot_name && (
            <div className="p-6 border border-gray-600 rounded-lg bg-blue-950">
              <p className="pl-2 text-xl text-white mb-4">
                Seu chatbot público
                <br />
                <span className="text-lg text-gray-400 italic">Baseada no nome do chatbot</span>
              </p>

              {/* Layout em duas colunas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Coluna Esquerda - URL e Cópia */}
                <div className="space-y-4 pt-9">
                  <div className="relative">
                    <code className="text-xs md:text-lg bg-green-900 border border-gray-600 p-4 pr-12 rounded-md block w-full overflow-x-auto text-green-400 font-mono">
                      {getPublicChatbotUrl()}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyPublicLink}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md hover:bg-green-800/50 transition-colors"
                      title="Copiar URL para a área de transferência"
                    >
                      {publicLinkCopied ? (
                        <Check size={20} className="text-green-300" />
                      ) : (
                        <Copy size={20} className="text-green-400 hover:text-green-300" />
                      )}
                    </button>
                  </div>

                  {/* Informações sobre a URL */}
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm text-gray-400">
                      💡&nbsp; Esta URL permite que qualquer pessoa converse com seu chatbot sem precisar fazer login
                    </p>
                    <p className="text-xs md:text-sm text-gray-400">
                      💡&nbsp; A URL é gerada automaticamente baseada no nome do seu chatbot (sem espaços e acentos)
                    </p>
                  </div>
                </div>

                {/* Coluna Direita - Botões de Ação */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-white mb-3">Ações Disponíveis</h4>

                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOpenPublicChatbot}
                      disabled={!chatbotData?.chatbot_name}
                      className="w-full text-sm md:text-base px-4 py-2 border-green-600 text-green-400 hover-glow-green"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Abrir Chatbot Público
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCopyPublicLink}
                      disabled={!chatbotData?.chatbot_name}
                      className="w-full text-sm md:text-base px-4 py-2 border-blue-600 text-blue-400 hover-glow-blue"
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
                      className="w-full text-sm md:text-base px-4 py-2 border-purple-600 text-purple-400 hover-glow-violet"
                    >
                      <QrCode size={16} className="mr-2" />
                      Ver QR-Code
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>


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
                <div className="col-span-1 bg-blue-900 border-1 border-blue-600 rounded-md" >
                  {(chatbotData.allowed_topics || []).length > 0 ? (
                    <div className="flex flex-wrap gap-1 md:gap-2 p-2 md:p-3 border border-blue-300 rounded-lg">
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
        <div className="pb-0 flex justify-center items-center w-full gap-5">

          <button
            type="button"
            onClick={onPreviewSystemMessage}
            disabled={isSaving}
            className={`relative px-8 py-4 rounded-xl transition-all duration-300 ease-in-out text-sm font-medium min-w-[200px] ${showSystemMessagePreview
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 transform translate-y-[-1px]'
              : 'bg-slate-900/50 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800/70 hover:border-slate-600/70 backdrop-blur-sm'
              }`}
          >
            <div className="flex items-center justify-center gap-3">
              <Bot className="w-5 h-5" />
              {showSystemMessagePreview ? 'Ocultar' : 'Ver'} Instrução Automática
            </div>
            {showSystemMessagePreview && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse" />
            )}
          </button>

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


        {/* Botão para Instrução Automática */}
        <div className="pt-0 pb-0">


          {/* Conteúdo da Instrução Automática */}
          {showSystemMessagePreview && (
            <div className={`transition-all duration-500 ease-in-out ${showSystemMessagePreview ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4 pointer-events-none'
              }`}>
              <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/20 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 p-6 border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600/20 rounded-lg">
                      <Bot className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Instrução Automática</h3>
                      <p className="text-purple-300/80 text-sm">Instrução gerada a partir do formulário do chatbot</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <pre className="whitespace-pre-wrap text-sm bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 max-h-96 overflow-y-auto text-slate-200 backdrop-blur-sm leading-relaxed">
                    {systemMessagePreview}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

      </form>


      {/* Base de Dados */}
      <div className="pt-3 md:pt-6"></div>
      <div className="mt-3 md:mt-6 border border-gray-600 rounded-lg bg-blue-950">

        <Card className="bg-transparent border border-border backdrop-blur-sm">
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="flex items-center text-lg md:text-xl">Base de Dados</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Adicione arquivos de texto com informações para seu chatbot usar nas conversas
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

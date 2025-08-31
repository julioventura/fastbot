import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, ChevronLeft, ChevronRight, Trash2, RefreshCw, Clock, MessageSquare, User, Info, ExternalLink, Copy, Check, QrCode, Download } from "lucide-react";
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
import {
  createSlug,
  getQRCodeFromCache,
  saveQRCodeToCache,
  clearQRCodeCache,
  onChatbotNameSaved
} from "@/utils/qrCodeCache";

// Extend window interface for QR Code cache function
declare global {
  interface Window {
    clearQRCodeCacheOnSave?: (newName: string, oldName?: string) => void;
  }
}

const AdvancedEditChatbotConfig: React.FC<ChatbotConfigProps> = ({
  chatbotData,
  isSaving,
  onSubmit,
  onChange,
  onCancel,
  showSystemMessagePreview,
  onPreviewSystemMessage,
  systemMessagePreview,
  hideQRCode = false, // Nova propriedade com valor padrão false
}) => {
  const [isDark, setIsDark] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [publicLinkCopied, setPublicLinkCopied] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const { user } = useAuth();
  const navigate = useNavigate();

  // Função para criar slug a partir do nome do chatbot (removida - usando do utils)
  // const createSlug = (name: string): string => {
  //   return name
  //     .toLowerCase()
  //     .normalize('NFD') // Decompor caracteres acentuados
  //     .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (acentos)
  //     .replace(/ç/g, 'c') // Substituir ç por c
  //     .replace(/Ç/g, 'c') // Substituir Ç por c
  //     .replace(/[^a-z0-9]/g, '') // Remover tudo que não for letra ou número
  //     .trim();
  // };

  // Funções para link público
  const getPublicChatbotUrl = useCallback(() => {
    if (!chatbotData?.chatbot_name) return '';
    const slug = createSlug(chatbotData.chatbot_name);
    if (!slug) return '';

    const baseUrl = window.location.origin;
    const basePath = window.location.pathname.includes('/fastbot') ? '/fastbot' : '';
    const url = `${baseUrl}${basePath}/${slug}`;
    return url;
  }, [chatbotData?.chatbot_name]);

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
  const generateQRCode = useCallback(async (url: string, forceRefresh: boolean = false): Promise<string> => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Salvar no cache se há um nome de chatbot
      if (chatbotData?.chatbot_name && !forceRefresh) {
        saveQRCodeToCache(chatbotData.chatbot_name, qrCodeDataUrl);
      }

      return qrCodeDataUrl;
    } catch (error) {
      console.error('Erro ao gerar QR-code:', error);
      throw error;
    }
  }, [chatbotData?.chatbot_name]);

  // Gerar QR-Code automaticamente quando a URL muda (com cache)
  useEffect(() => {
    const generateQRCodeAuto = async () => {
      const url = getPublicChatbotUrl();
      if (!url || !chatbotData?.chatbot_name) {
        setQrCodeDataUrl('');
        return;
      }

      try {
        // Primeiro, tentar obter do cache
        const cachedQRCode = getQRCodeFromCache(chatbotData.chatbot_name);
        if (cachedQRCode) {
          setQrCodeDataUrl(cachedQRCode);
          return;
        }

        // Se não houver cache, gerar novo
        console.log('Gerando novo QR-Code...');
        const qrDataUrl = await generateQRCode(url);
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        console.error('Erro ao gerar QR-code:', error);
        setQrCodeDataUrl('');
      }
    };

    if (chatbotData?.chatbot_name) {
      generateQRCodeAuto();
    } else {
      setQrCodeDataUrl('');
    }
  }, [chatbotData?.chatbot_name, getPublicChatbotUrl, generateQRCode]);

  // Função para baixar o QR-code (com refresh)
  const downloadQRCode = async () => {
    const url = getPublicChatbotUrl();
    if (!url || !chatbotData?.chatbot_name) return;

    try {
      // Força refresh do QR-Code ao baixar
      console.log('Refreshing QR-Code para download...');
      const freshQRCode = await generateQRCode(url, true);

      // Atualiza o estado com o novo QR-Code
      setQrCodeDataUrl(freshQRCode);

      // Atualiza o cache com o novo QR-Code
      saveQRCodeToCache(chatbotData.chatbot_name, freshQRCode);

      // Realiza o download
      const link = document.createElement('a');
      link.download = `qrcode-${createSlug(chatbotData.chatbot_name)}.png`;
      link.href = freshQRCode;
      link.click();

      console.log('QR-Code atualizado e download iniciado');
    } catch (error) {
      console.error('Erro ao refresh/download do QR-code:', error);
      // Fallback: usar o QR-Code atual se houver erro
      if (qrCodeDataUrl) {
        const link = document.createElement('a');
        link.download = `qrcode-${createSlug(chatbotData.chatbot_name)}.png`;
        link.href = qrCodeDataUrl;
        link.click();
      }
    }
  };

  // Hook para Short-Memory - removido pois agora está em página separada

  // Expor função de limpeza de cache globalmente para uso quando salvar chatbot
  useEffect(() => {
    // Disponibilizar função global para limpar cache quando nome do chatbot for salvo
    window.clearQRCodeCacheOnSave = (newName: string, oldName?: string) => {
      onChatbotNameSaved(newName, oldName);
    };

    // Cleanup ao desmontar componente
    return () => {
      delete window.clearQRCodeCacheOnSave;
    };
  }, []);

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


  return (
    // <div className="bg-gradient-to-br from-violet-900 via-blue-900 to-indigo-900 border rounded-lg">
    //   <div className="container mx-auto px-4 py-8">
    //     <div className="max-w-6xl mx-auto space-y-6">

    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-blue-950/30 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto border border-blue-700 rounded-lg bg-blue-900/30 p-6">

          {/* Header da página */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              Meu Chatbot
            </h1>
          </div>

          {/* URL do chatbot público para referência */}
          <div id="chatbot_publico">

            {chatbotData?.chatbot_name && (
              <div className="p-6 border border-slate-600/50 rounded-xl bg-slate-900/60 backdrop-blur-sm shadow-2xl">

                <h4 className="pl-2 text-sl font-medium text-white mb-3">LINK para acessar o seu Chatbot</h4>

                <div className="relative">
                  <code className="mb-10 text-xs md:text-2xl lg:text-3xl bg-green-950 border border-gray-600 p-3 pr-10 rounded-md block w-full overflow-x-auto text-green-400 font-mono font-black">
                    {getPublicChatbotUrl().replace(/^https?:\/\//, "")}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyPublicLink}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md hover:bg-blue-800/50 transition-colors"
                    title="Copiar URL para a área de transferência"
                  >
                    {publicLinkCopied ? (
                      <Check size={16} className="text-green-300" />
                    ) : (
                      <Copy size={16} className="text-green-400 hover:text-green-300" />
                    )}
                  </button>
                </div>


                { }
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Coluna 1 - URL e QR-Code */}
                  <div className="space-y-8">

                    {/* QR-Code - Mostrar apenas se hideQRCode for false */}
                    {!hideQRCode && (
                      <div className="pt-0 space-y-3">

                        <div className="pl-2 text-sl font-medium text-white">QR-CODE para acessar seu Chatbot</div>
                        <div className="bg-blue-900 border border-gray-500/70 rounded-lg p-10 pb-4">

                          {qrCodeDataUrl ? (
                            <div className="space-y-3">
                              <div className="flex justify-center">
                                <div
                                  className="bg-white rounded-xl p-2 shadow-2xl shadow-black/90 transition-all duration-300 hover:scale-95 hover:-rotate-[6deg] hover:shadow-[0_0_24px_8px_rgba(255,255,255,0.7)]"
                                  style={{
                                    display: "inline-block",
                                    transition: "transform 0.3s, box-shadow 0.3s",
                                  }}
                                >
                                  <img
                                    src={qrCodeDataUrl}
                                    alt="Este é o QR-Code do seu Chatbot"
                                    className="w-48 h-48 object-contain"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <QrCode className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                              <p className="text-xs text-slate-400">
                                QR-Code será gerado automaticamente
                              </p>
                            </div>
                          )}

                          {/* Botão Baixar QR-Code - Mostrar apenas se hideQRCode for false */}
                          {!hideQRCode && (
                            <Button
                              type="button"
                              variant="link"
                              onClick={downloadQRCode}
                              className="w-full text-white text-lg mt-12 mb-0 pb-3 hover:border-violet-600 hover:bg-violet-950 hover-glow-violet flex items-center justify-center"
                            >
                              <Download
                                className="mr-3 flex-shrink-0 text-white"
                                size={24}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  minWidth: '24px',
                                  minHeight: '24px'
                                }}
                              />
                              Baixar QR-Code
                            </Button>
                          )}

                        </div>

                      </div>
                    )}

                  </div>

                  {/* Coluna 2 - Botões de Ação */}
                  <div className="pt-0 space-y-8">
                    <h4 className="pl-2 text-sm font-medium text-white">&nbsp;</h4>
                    <div className="space-y-6">

                      {/* Botão Configure seu Chatbot */}
                      {/* <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/base-de-dados")}
                        disabled={!chatbotData?.chatbot_name}
                        className="w-full text-md px-4 py-6 border-red-600 text-red-400 hover:bg-red-950 hover-glow-red"
                      >
                        <ExternalLink size={18} className="mr-2" />
                        Configure seu Chatbot
                      </Button> */}

                      {/* Botão Abrir Chatbot */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleOpenPublicChatbot}
                        disabled={!chatbotData?.chatbot_name}
                        className="w-full text-lg px-4 py-6 border-green-600 text-green-400 hover:bg-green-950 hover-glow-green"
                      >
                        <ExternalLink size={18} className="mr-2" />
                        Abrir Chatbot
                      </Button>

                      {/* Botão Copiar Link */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCopyPublicLink}
                        disabled={!chatbotData?.chatbot_name}
                        className="w-full text-lg px-4 py-6 border-blue-600 text-blue-400 hover:bg-blue-950 hover-glow-blue"
                      >
                        {publicLinkCopied ? (
                          <>
                            <Check size={16} className="mr-2" />
                            Link Copiado!
                          </>
                        ) : (
                          <>
                            <Copy size={16} className="mr-2" />
                            Copiar Link
                          </>
                        )}
                      </Button>

                    </div>
                  </div>

                </div>
              </div>
            )}

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
          {/* <Dialog open={showQRCodeModal} onOpenChange={setShowQRCodeModal}>
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
                    <div className="flex justify-center">
                      <div className="bg-white rounded-xl p-6 shadow-lg shadow-black/10">
                        <img
                          src={qrCodeDataUrl}
                          alt="QR-Code do Chatbot"
                          className="max-w-full h-auto"
                          style={{ maxWidth: '256px' }}
                        />
                      </div>
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
          </Dialog> */}

        </div>
      </div>
    </div>
  );
};

export default AdvancedEditChatbotConfig;

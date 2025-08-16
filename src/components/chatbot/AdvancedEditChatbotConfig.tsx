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
import { Upload, X, Plus, ChevronLeft, ChevronRight, Trash2, RefreshCw, Clock, MessageSquare, User, Bot } from "lucide-react";
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

  const { user } = useAuth();

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

  return (
    <div className="space-y-6">

      <form onSubmit={onSubmit} className="space-y-6">



        {/* Seção: Identidade do chatbot */}
        <div className="space-y-6 border border-gray-600 rounded-lg p-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              {/* Nome do Chatbot */}
              <div>
                <Label htmlFor="chatbot_name">
                  Nome do Chatbot<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="chatbot_name"
                  value={chatbotData.chatbot_name}
                  onChange={(e) => onChange("chatbot_name", e.target.value)}
                  className="mt-2 edit-form-input"
                  style={borderStyle}
                  placeholder="Ex: Assistente Virtual Dr. Silva"
                  required
                />
              </div>

              {/* Saudação Personalizada */}
              <div>
                <Label htmlFor="welcome_message">
                  Mensagem de Saudação
                </Label>
                <Textarea
                  id="welcome_message"
                  value={chatbotData.welcome_message}
                  onChange={(e) =>
                    onChange("welcome_message", e.target.value)
                  }
                  className="mt-2 edit-form-input"
                  style={borderStyle}
                  rows={5}
                  placeholder="Olá! Sou o assistente virtual. Como posso ajudar?"
                />
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              {/* System Message */}
              <div>
                <Label htmlFor="system_instructions">
                  Instruções Gerais{" "}
                </Label>
                <Textarea
                  id="system_instructions"
                  value={chatbotData.system_instructions}
                  onChange={(e) =>
                    onChange("system_instructions", e.target.value)
                  }
                  className="mt-2 edit-form-input"
                  style={borderStyle}
                  rows={10}
                  placeholder="Você é um assistente virtual especializado em... Suas principais funções são..."
                />
              </div>
            </div>
          </div>



          {/* Tema Principal */}
          {/* <div>
            <Label htmlFor="main_topic">Tema Principal</Label>
            <Input
              id="main_topic"
              value={chatbotData.main_topic || ""}
              onChange={(e) => onChange("main_topic", e.target.value)}
              className="mt-2 edit-form-input"
              style={borderStyle}
              placeholder="Ex: Inscrições para Curso de Especialização"
            />
          </div> */}

          {/* Temas Permitidos */}
          <div className="pt-6 space-y-6">
            <Label htmlFor="main_topic">Temas Permitidos</Label>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Coluna Esquerda - Input para adicionar temas */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite um tema e pressione Enter"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTopic((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                    className="edit-form-input"
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
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Coluna Direita - Lista de temas como badges */}
              <div className="space-y-4">
                {(chatbotData.allowed_topics || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-600 rounded-lg">
                    {(chatbotData.allowed_topics || []).map(
                      (topic, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-white border-2 border-blue-500 hover:bg-blue-800/50 transition-colors"
                        >
                          <span>{topic}</span>
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

          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-6"> */}

          {/* Rodapé das mensagens */}
          {/* <div>
                  <Label htmlFor="footer_message">Rodapé das mensagens</Label>
                  <Textarea
                    id="footer_message"
                    value={chatbotData.footer_message || ""}
                    onChange={(e) =>
                      onChange("footer_message", e.target.value)
                    }
                    className="mt-2 edit-form-input"
                    style={borderStyle}
                    placeholder="Texto que aparecerá no final de cada mensagem do chatbot..."
                    rows={3}
                  />
                </div> */}

          {/* </div>
            </div>
          </div> */}

        </div>


        <div className="space-y-6 border border-gray-600 rounded-lg p-6">

          {/* Base de Dados */}
          <Card className="bg-transparent border border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">Base de Dados</CardTitle>
              <CardDescription>
                Gerencie documentos e imagens para enriquecer as respostas do
                chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Upload de Documentos */}
              <div className="space-y-6 lg p-6">
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
        <div className="flex justify-between items-center pt-6">
          {/* Botões auxiliares - Lado Esquerdo */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onPreviewSystemMessage}
              disabled={isSaving}
              className="bg-purple-900 border border-purple-600 px-4 py-2"
            >
              {showSystemMessagePreview ? 'Ocultar' : 'Visualizar'} System Message Gerado
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowShortMemory(prev => !prev)}
              disabled={isSaving}
              className="bg-purple-900 border border-purple-600 px-4 py-2"
            >
              {showShortMemory ? 'Ocultar' : 'Visualizar'} Memória Recente
            </Button>
          </div>

          {/* Botões Cancelar e Salvar - Lado Direito */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </div>

        {/* Preview do System Message */}
        {showSystemMessagePreview && (
          <div className="mt-6 p-4 bg-background/50 backdrop-blur-sm rounded-lg border">
            <h3 className="text-lg font-semibold ml-2 mb-3">Preview do System Message:</h3>
            <p className="text-sm text-primary ml-2 mt-3 mb-6">
              Conteúdo automático para o "system_message" do chatbot.
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded border max-h-96 overflow-y-auto">
              {systemMessagePreview}
            </pre>
          </div>
        )}

        {/* Seção Memória Recente */}
        {showShortMemory && (
          <div className="mt-6 p-4 bg-background/50 backdrop-blur-sm rounded-lg border">
            <h3 className="text-lg font-semibold ml-2 mb-3">Memória Recente:</h3>
            <p className="text-sm text-primary ml-2 mt-3 mb-6">
              Visualize o contexto de conversa recente armazenado no navegador.
            </p>

            {/* Estatísticas da Short-Memory */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-md font-bold text-blue-600">Total de Mensagens</p>
                      <p className="text-lg font-bold">{shortMemoryStats.totalMessages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
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
                    <Upload className="w-4 h-4 text-purple-600" />
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

            {/* Controles da Short-Memory */}
            <div className="flex gap-3 mb-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadShortMemoryData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={clearShortMemory}
                className="flex items-center gap-2"
                disabled={shortMemoryStats.totalMessages === 0 || shortMemoryLoading}
              >
                <Trash2 className="w-4 h-4" />
                Limpar Memória
              </Button>
            </div>

            {/* Lista de Mensagens da Short-Memory */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold">Contexto da Conversa</h4>

              {shortMemoryData.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto bg-background border border-gray-600 rounded-lg p-4">
                  {shortMemoryData.map((message, index) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg border ${message.role === 'user'
                        ? ':bg-gray-900/80 border-gray-700'
                        : 'bg-gray-800/80 border-gray-600'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {message.role === 'user' ? (
                            <User className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Bot className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-medium ${message.role === 'user' ? 'text-gray-400' : 'text-gray-300'
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
                <div className="text-center py-8 border border-dashed border-gray-600 rounded-lg">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum contexto de conversa encontrado na Short-Memory
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    As mensagens aparecerão aqui conforme você conversa com o chatbot
                  </p>
                </div>
              )}
            </div>

            {/* Informações Técnicas */}
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-3">Informações Técnicas</h4>
              <div className="border border-gray-600 bg-background rounded-lg p-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Chave do LocalStorage:</strong> {getShortMemoryKey()}</p>
                  <p><strong>Limite de Mensagens:</strong> 50 mensagens (mantém as mais recentes)</p>
                  <p><strong>Contexto Enviado ao Chatbot:</strong> Últimas 10 mensagens</p>
                  <p><strong>Integração:</strong> O contexto da short-memory é automaticamente incluído nas consultas ao chatbot</p>
                </div>
              </div>
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
    </div >
  );
};

export default AdvancedEditChatbotConfig;

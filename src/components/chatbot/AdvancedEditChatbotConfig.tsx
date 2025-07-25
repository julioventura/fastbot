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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import DocumentUpload from "@/components/chatbot/DocumentUpload";
import { ChatbotData, ChatbotConfigProps } from "@/interfaces";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdvancedEditChatbotConfig: React.FC<ChatbotConfigProps> = ({
  chatbotData,
  isSaving,
  onSubmit,
  onChange,
  onCancel,
}) => {
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState("identity");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const tabs = [
    { id: "identity", label: "Identidade" },
    { id: "behavior", label: "Comportamento" },
    { id: "footer", label: "Rodapé" },
    { id: "style", label: "Estilo" },
    { id: "dataFiles", label: "Anexos" },
  ];

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

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <Card className="bg-transparent border border-border backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {tabs.map((tab) => {
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  size="lg"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-6 py-3 min-w-[140px] justify-center font-medium"
                >
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Tab: Identidade & Saudação */}
        {activeTab === "identity" && (
          <Card className="bg-transparent border border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Identidade & Saudação
              </CardTitle>
              <CardDescription>
                Configure a personalidade e apresentação do seu chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna Esquerda */}
                <div className="space-y-6">
                  {/* System Message */}
                  <div>
                    <Label htmlFor="system_instructions">
                      Instruções Gerais (System Message){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="system_instructions"
                      value={chatbotData.system_instructions}
                      onChange={(e) =>
                        onChange("system_instructions", e.target.value)
                      }
                      className="mt-2 edit-form-input"
                      style={borderStyle}
                      rows={6}
                      placeholder="Você é um assistente virtual especializado em... Suas principais funções são..."
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Instruções base para o comportamento do chatbot. Pode ser
                      simplificado conforme você configura o dashboard.
                    </p>
                  </div>

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

                  {/* Slider de Formalidade */}
                  <div className="space-y-3">
                    <Label>
                      Nível de Formalidade: {chatbotData.formality_level || 50}%
                    </Label>
                    <Slider
                      value={[chatbotData.formality_level || 50]}
                      onValueChange={([value]) =>
                        onChange("formality_level", value)
                      }
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Casual</span>
                      <span>Profissional</span>
                      <span>Acadêmico</span>
                    </div>
                  </div>
                </div>

                {/* Coluna Direita */}
                <div className="space-y-6">
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
                      rows={3}
                      placeholder="Olá! Sou o assistente virtual. Como posso ajudar?"
                    />
                  </div>

                  {/* Switches */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                      <div>
                        <Label>Memorizar Nome do Usuário</Label>
                        <p className="text-xs text-muted-foreground">
                          Personaliza respostas com o nome
                        </p>
                      </div>
                      <Switch
                        checked={chatbotData.memorize_user_name || false}
                        onCheckedChange={(checked) =>
                          onChange("memorize_user_name", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                      <div>
                        <Label>Usar Emojis</Label>
                        <p className="text-xs text-muted-foreground">
                          Adiciona emoticons nas respostas
                        </p>
                      </div>
                      <Switch
                        checked={chatbotData.use_emojis || false}
                        onCheckedChange={(checked) =>
                          onChange("use_emojis", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab: Comportamento */}
        {activeTab === "behavior" && (
          <Card className="bg-transparent border border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Comportamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna Esquerda */}
                <div className="space-y-6">
                  {/* Tema Principal */}
                  <div>
                    <Label htmlFor="main_topic">Tema Principal</Label>
                    <Input
                      id="main_topic"
                      value={chatbotData.main_topic || ""}
                      onChange={(e) => onChange("main_topic", e.target.value)}
                      className="mt-2 edit-form-input"
                      style={borderStyle}
                      placeholder="Ex: Inscrições para Curso de Especialização"
                    />
                  </div>

                  {/* Temas Permitidos */}
                  <div>
                    <Label>Temas Permitidos</Label>

                    {/* Lista de temas com destaque */}
                    {(chatbotData.allowed_topics || []).length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 mt-4 mb-4">
                        {(chatbotData.allowed_topics || []).map(
                          (topic, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate pr-2">
                                {topic}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTopic(index)}
                                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                                title={`Remover tema: ${topic}`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 mb-4 p-4 border border-dashed border-gray-400 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">
                          Nenhum tema adicionado ainda. Use o campo abaixo para
                          adicionar temas permitidos.
                        </p>
                      </div>
                    )}

                    {/* Input para adicionar novos temas */}
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

                  {/* Ação quando não souber */}
                  <div>
                    <Label>Ação quando não souber responder</Label>
                    <Select
                      value={chatbotData.fallback_action || "human"}
                      onValueChange={(value) =>
                        onChange("fallback_action", value)
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="human">
                          Encaminhar para humano
                        </SelectItem>
                        <SelectItem value="search">
                          Sugerir busca manual
                        </SelectItem>
                        <SelectItem value="link">
                          Direcionar para link oficial
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Estilo de Listas */}
                  <div className="mb-6">
                    <Label>Estilo de Listas</Label>
                    <Select
                      value={chatbotData.list_style || "numbered"}
                      onValueChange={(value) => onChange("list_style", value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="numbered">
                          Numerada (1, 2, 3...)
                        </SelectItem>
                        <SelectItem value="bullets">
                          Com bullets (• • •)
                        </SelectItem>
                        <SelectItem value="simple">
                          Simples (sem marcadores)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Máximo de Itens */}
                  <div>
                    <Label htmlFor="max_list_items">
                      Máximo de Itens por Lista
                    </Label>
                    <Input
                      id="max_list_items"
                      type="number"
                      value={chatbotData.max_list_items || 10}
                      onChange={(e) =>
                        onChange("max_list_items", parseInt(e.target.value))
                      }
                      className="mt-2 edit-form-input"
                      style={borderStyle}
                      min="1"
                      max="50"
                    />
                  </div>
                </div>

                {/* Coluna Direita */}
                <div className="space-y-6">
                  {/* Regras Automáticas */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Regras Automáticas
                    </h3>

                    {/* Frases Obrigatórias */}
                    <div className="mb-6">
                      <Label>Frases Obrigatórias (Finalizações)</Label>
                      <div className="flex flex-wrap gap-2 mt-2 mb-2">
                        {(chatbotData.mandatory_phrases || []).map(
                          (phrase, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1 max-w-xs"
                            >
                              <span className="truncate">{phrase}</span>
                              <X
                                className="w-3 h-3 cursor-pointer flex-shrink-0"
                                onClick={() => removeMandatoryPhrase(index)}
                              />
                            </Badge>
                          )
                        )}
                      </div>
                      <Textarea
                        placeholder="Digite uma frase obrigatória e pressione Enter"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            addMandatoryPhrase(
                              (e.target as HTMLTextAreaElement).value
                            );
                            (e.target as HTMLTextAreaElement).value = "";
                          }
                        }}
                        className="edit-form-input"
                        style={borderStyle}
                        rows={2}
                      />
                    </div>

                    {/* Tempo de Retorno */}
                    <div className="mb-6">
                      <Label htmlFor="response_time_promise">
                        Prazo de Retorno Humano
                      </Label>
                      <Input
                        id="response_time_promise"
                        value={chatbotData.response_time_promise || ""}
                        onChange={(e) =>
                          onChange("response_time_promise", e.target.value)
                        }
                        className="mt-2 edit-form-input"
                        style={borderStyle}
                        placeholder="Ex: 1 dia útil"
                      />
                    </div>

                    {/* Mensagem de Encaminhamento */}
                    <div className="mb-6">
                      <Label htmlFor="fallback_message">
                        Mensagem para Encaminhamento
                      </Label>
                      <Textarea
                        id="fallback_message"
                        value={chatbotData.fallback_message || ""}
                        onChange={(e) =>
                          onChange("fallback_message", e.target.value)
                        }
                        className="mt-2 edit-form-input"
                        style={borderStyle}
                        rows={3}
                        placeholder="Não consegui encontrar essa informação. Vou encaminhar sua dúvida..."
                      />
                    </div>

                    {/* Saudação para Usuários Retornantes */}
                    <div>
                      <Label htmlFor="returning_user_greeting">
                        Saudação para Usuários Retornantes
                      </Label>
                      <Textarea
                        id="returning_user_greeting"
                        value={chatbotData.returning_user_greeting || ""}
                        onChange={(e) =>
                          onChange("returning_user_greeting", e.target.value)
                        }
                        className="mt-2 edit-form-input"
                        style={borderStyle}
                        rows={2}
                        placeholder="Olá novamente! Como posso ajudar hoje?"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab: Rodapé */}
        {activeTab === "footer" && (
          <Card className="bg-transparent border border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Rodapé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna Esquerda */}
                {/* <div className="space-y-6 border p-4 border-gray-600 rounded-lg"> */}
                <div className="space-y-6 border p-4">
                  {/* Rodapé das mensagens */}
                  <div>
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
                  </div>

                  {/* Link adicional */}
                  <div>
                    <Label htmlFor="main_link">Link adicional</Label>
                    <Input
                      id="main_link"
                      value={chatbotData.main_link || ""}
                      onChange={(e) => onChange("main_link", e.target.value)}
                      className="mt-2 edit-form-input"
                      style={borderStyle}
                      placeholder="https://Dentistas.com.br"
                    />
                  </div>

                  {/* Switch Link Obrigatório */}
                  <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                    <div>
                      <Label>Link Obrigatório nas Respostas</Label>
                      <p className="text-xs text-muted-foreground">
                        Inclui o link automaticamente
                      </p>
                    </div>
                    <Switch
                      checked={chatbotData.mandatory_link || false}
                      onCheckedChange={(checked) =>
                        onChange("mandatory_link", checked)
                      }
                    />
                  </div>

                  {/* Switch Permitir Internet */}
                  <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                    <div>
                      <Label>Permitir Busca na Internet</Label>
                      <p className="text-xs text-muted-foreground">
                        Quando informações não estiverem nos documentos
                      </p>
                    </div>
                    <Switch
                      checked={chatbotData.allow_internet_search || false}
                      onCheckedChange={(checked) =>
                        onChange("allow_internet_search", checked)
                      }
                    />
                  </div>
                </div>

                {/* Coluna Direita */}
                <div className="space-y-6">
                  {/* Imagens Anexadas */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Imagens Anexadas
                      </h3>

                      {/* Lista de imagens anexadas */}
                      <div className="border border-gray-600 rounded-lg">
                        <div className="flex items-center justify-between p-4 border-b border-gray-600">
                          <Label className="font-medium">
                            Imagens do Chatbot
                          </Label>
                          <span className="text-sm text-muted-foreground">
                            {(chatbotData.uploaded_images || []).length}{" "}
                            imagem(ns)
                          </span>
                        </div>

                        <div className="p-4">
                          {(chatbotData.uploaded_images || []).length > 0 ? (
                            <div className="space-y-3">
                              {(chatbotData.uploaded_images || []).map(
                                (image, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/30"
                                  >
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={image}
                                        alt={`Imagem ${index + 1}`}
                                        className="w-12 h-12 object-cover rounded cursor-pointer transition-opacity hover:opacity-80"
                                        onClick={() => openImagePreview(image)}
                                        title="Clique para visualizar em tamanho maior"
                                      />
                                      <div>
                                        <span className="text-sm font-medium">
                                          Imagem {index + 1}
                                        </span>
                                        <p className="text-xs text-muted-foreground">
                                          Clique na miniatura para ampliar
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeUploadedImage(index)}
                                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                                      title="Remover imagem"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                              <p className="text-sm text-muted-foreground mb-4">
                                Nenhuma imagem anexada ainda
                              </p>
                            </div>
                          )}

                          {/* Upload de imagens */}
                          <div className="mt-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Arraste imagens ou clique para selecionar
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                              Suportados: .png, .jpg, .jpeg, .gif
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                document.getElementById("image-upload")?.click()
                              }
                            >
                              Selecionar Imagens
                            </Button>
                            <input
                              id="image-upload"
                              type="file"
                              multiple
                              accept=".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/jpg,image/gif"
                              style={{ display: "none" }}
                              onChange={(e) => handleImageUpload(e)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab: Estilo & Formatação */}
        {activeTab === "style" && (
          <Card className="bg-transparent border border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Estilo & Formatação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna Esquerda */}
                <div className="space-y-6">
                  {/* Tamanho dos Parágrafos */}
                  <div className="space-y-3">
                    <Label>
                      Tamanho dos Parágrafos: {chatbotData.paragraph_size || 50}
                      %
                    </Label>
                    <Slider
                      value={[chatbotData.paragraph_size || 50]}
                      onValueChange={([value]) =>
                        onChange("paragraph_size", value)
                      }
                      max={100}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Curtos</span>
                      <span>Médios</span>
                      <span>Detalhados</span>
                    </div>
                  </div>

                  {/* Velocidade de Resposta */}
                  <div className="space-y-3">
                    <Label>
                      Velocidade de Resposta: {chatbotData.response_speed || 50}
                      %
                    </Label>
                    <Slider
                      value={[chatbotData.response_speed || 50]}
                      onValueChange={([value]) =>
                        onChange("response_speed", value)
                      }
                      max={100}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Lento</span>
                      <span>Normal</span>
                      <span>Instantâneo</span>
                    </div>
                  </div>

                  {/* Frequência de Uso do Nome */}
                  <div className="space-y-3">
                    <Label>
                      Frequência de Uso do Nome:{" "}
                      {chatbotData.name_usage_frequency || 30}%
                    </Label>
                    <Slider
                      value={[chatbotData.name_usage_frequency || 30]}
                      onValueChange={([value]) =>
                        onChange("name_usage_frequency", value)
                      }
                      max={100}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Raramente</span>
                      <span>Moderadamente</span>
                      <span>Sempre</span>
                    </div>
                  </div>

                  {/* Cor do Chat */}
                  <div>
                    <Label htmlFor="chat_color">Cor Principal do Chat</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="chat_color"
                        type="color"
                        value={chatbotData.chat_color || "#3b82f6"}
                        onChange={(e) => onChange("chat_color", e.target.value)}
                        className="w-16 h-10 p-1 edit-form-input"
                        style={borderStyle}
                      />
                      <Input
                        value={chatbotData.chat_color || "#3b82f6"}
                        onChange={(e) => onChange("chat_color", e.target.value)}
                        className="edit-form-input"
                        style={borderStyle}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                </div>

                {/* Coluna Direita */}
                <div className="space-y-6">
                  {/* Switches de Configuração */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                      <div>
                        <Label>Solicitar Nome</Label>
                        <p className="text-xs text-muted-foreground">
                          Pede nome se não informado
                        </p>
                      </div>
                      <Switch
                        checked={chatbotData.ask_for_name || false}
                        onCheckedChange={(checked) =>
                          onChange("ask_for_name", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                      <div>
                        <Label>Lembrar Contexto</Label>
                        <p className="text-xs text-muted-foreground">
                          Mantém histórico da conversa
                        </p>
                      </div>
                      <Switch
                        checked={chatbotData.remember_context || false}
                        onCheckedChange={(checked) =>
                          onChange("remember_context", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                      <div>
                        <Label>Auto-Link</Label>
                        <p className="text-xs text-muted-foreground">
                          Inclui links automaticamente
                        </p>
                      </div>
                      <Switch
                        checked={chatbotData.auto_link || false}
                        onCheckedChange={(checked) =>
                          onChange("auto_link", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                      <div>
                        <Label>Modo Debug</Label>
                        <p className="text-xs text-muted-foreground">
                          Mostra fontes das respostas
                        </p>
                      </div>
                      <Switch
                        checked={chatbotData.debug_mode || false}
                        onCheckedChange={(checked) =>
                          onChange("debug_mode", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab: Anexos */}
        {activeTab === "dataFiles" && (
          <Card className="bg-transparent border border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Anexos</CardTitle>
              <CardDescription>
                Gerencie documentos e imagens para enriquecer as respostas do
                chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna Esquerda - Upload de Documentos */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Documentos de Texto
                    </h3>
                    <DocumentUpload />
                  </div>
                </div>

                {/* Coluna Direita - Configurações de Fonte */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Documentos de Texto
                    </h3>

                    <div className=" justify-between p-4 border border-gray-600 rounded-lg">

                      {/* Rigidez nas Fontes */}
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

                      <div>
                        {/* Confiança Mínima */}
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

                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3 pt-4">
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
      </form>

      {/* Modal de Preview de Imagem */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Preview da Imagem{" "}
              {(chatbotData.uploaded_images || []).length > 1 &&
                `(${previewImageIndex + 1} de ${
                  (chatbotData.uploaded_images || []).length
                })`}
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
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
    </div>
  );
};

export default AdvancedEditChatbotConfig;

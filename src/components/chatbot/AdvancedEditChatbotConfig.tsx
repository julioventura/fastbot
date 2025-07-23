import React, { useState, useEffect } from "react";
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
import { Upload, X, Plus } from "lucide-react";
import DocumentUpload from "@/components/chatbot/DocumentUpload";

interface AdvancedChatbotData extends ChatbotData {
  // Controles de personalidade
  formality_level?: number; // 0-100
  use_emojis?: boolean;
  memorize_user_name?: boolean;
  paragraph_size?: number; // 0-100

  // Controles de escopo
  main_topic?: string;
  allowed_topics?: string[];
  source_strictness?: number; // 0-100
  allow_internet_search?: boolean;

  // Controles de comportamento
  confidence_threshold?: number; // 0-100
  fallback_action?: "human" | "search" | "link";
  response_time_promise?: string;
  fallback_message?: string;

  // Links e documentos
  main_link?: string;
  mandatory_link?: boolean;
  uploaded_documents?: string[];
  uploaded_images?: string[]; // NOVO: Array de imagens
  footer_message?: string; // NOVO: Rodapé das mensagens

  // Regras automáticas
  mandatory_phrases?: string[];
  auto_link?: boolean;
  max_list_items?: number;
  list_style?: "numbered" | "bullets" | "simple";

  // Interação
  ask_for_name?: boolean;
  name_usage_frequency?: number; // 0-100
  remember_context?: boolean;
  returning_user_greeting?: string;

  // Configurações avançadas
  response_speed?: number; // 0-100
  debug_mode?: boolean;
  chat_color?: string;
}

interface ChatbotData {
  system_message: string;
  office_address: string;
  office_hours: string;
  specialties: string;
  chatbot_name: string;
  welcome_message: string;
  whatsapp: string;
}

interface AdvancedEditChatbotConfigProps {
  chatbotData: AdvancedChatbotData;
  isSaving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (
    field: string,
    value: string | number | boolean | string[]
  ) => void;
  onCancel: () => void;
}

const AdvancedEditChatbotConfig: React.FC<AdvancedEditChatbotConfigProps> = ({
  chatbotData,
  isSaving,
  onSubmit,
  onChange,
  onCancel,
}) => {
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState("identity");

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
              {/* System Message */}
              <div>
                <Label htmlFor="system_message">
                  Instruções Gerais (System Message){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="system_message"
                  value={chatbotData.system_message}
                  onChange={(e) => onChange("system_message", e.target.value)}
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

              {/* Saudação Personalizada */}
              <div>
                <Label htmlFor="welcome_message">Mensagem de Saudação</Label>
                <Textarea
                  id="welcome_message"
                  value={chatbotData.welcome_message}
                  onChange={(e) => onChange("welcome_message", e.target.value)}
                  className="mt-2 edit-form-input"
                  style={borderStyle}
                  rows={3}
                  placeholder="Olá! Sou o assistente virtual. Como posso ajudar?"
                />
              </div>

              {/* Switches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
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

                <div className="flex items-center justify-between p-4 border rounded-lg">
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
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {(chatbotData.allowed_topics || []).map((topic, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {topic}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeTopic(index)}
                      />
                    </Badge>
                  ))}
                </div>
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
                  <Button type="button" size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Rigidez nas Fontes */}
              <div className="space-y-3">
                <Label>
                  Rigidez nas Fontes: {chatbotData.source_strictness || 50}%
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

              {/* Ação quando não souber */}
              <div>
                <Label>Ação quando não souber responder</Label>
                <Select
                  value={chatbotData.fallback_action || "human"}
                  onValueChange={(value) => onChange("fallback_action", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="human">
                      Encaminhar para humano
                    </SelectItem>
                    <SelectItem value="search">Sugerir busca manual</SelectItem>
                    <SelectItem value="link">
                      Direcionar para link oficial
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Divider para separar seções */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Regras Automáticas</h3>
                
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
              {/* Rodapé das mensagens */}
              <div>
                <Label htmlFor="footer_message">Rodapé das mensagens</Label>
                <Textarea
                  id="footer_message"
                  value={chatbotData.footer_message || ""}
                  onChange={(e) => onChange("footer_message", e.target.value)}
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
                  placeholder="https://exemplo.com/link-adicional"
                />
              </div>

              {/* Switch Link Obrigatório */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
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

              {/* Upload de Imagens */}
              <div>
                <Label>Imagens Anexadas</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Arraste imagens ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Suportados: .png, .jpg, .jpeg, .gif
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
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

                {/* Lista de imagens anexadas */}
                {(chatbotData.uploaded_images || []).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {(chatbotData.uploaded_images || []).map((image, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={image}
                            alt={`Imagem ${index + 1}`}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <span className="text-sm">Imagem {index + 1}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadedImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Switch Permitir Internet */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
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
              {/* Tamanho dos Parágrafos */}
              <div className="space-y-3">
                <Label>
                  Tamanho dos Parágrafos: {chatbotData.paragraph_size || 50}%
                </Label>
                <Slider
                  value={[chatbotData.paragraph_size || 50]}
                  onValueChange={([value]) => onChange("paragraph_size", value)}
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
                  Velocidade de Resposta: {chatbotData.response_speed || 50}%
                </Label>
                <Slider
                  value={[chatbotData.response_speed || 50]}
                  onValueChange={([value]) => onChange("response_speed", value)}
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

              {/* Switches de Configuração */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
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

                <div className="flex items-center justify-between p-4 border rounded-lg">
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

                <div className="flex items-center justify-between p-4 border rounded-lg">
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

                <div className="flex items-center justify-between p-4 border rounded-lg">
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
            </CardContent>
          </Card>
        )}

        {/* Tab: Rodapé */}
        {activeTab === "dataFiles" && (
          <Card className="bg-transparent border border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Anexos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Componente de Upload de Documentos */}
              <DocumentUpload />
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
    </div>
  );
};

export default AdvancedEditChatbotConfig;

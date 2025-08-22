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
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus, Bot } from "lucide-react";
import { ChatbotConfigProps } from "@/interfaces";
import { useAuth } from "@/lib/auth/useAuth";

const Configure: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [chatbotData, setChatbotData] = useState({
    chatbot_name: '',
    welcome_message: '',
    system_instructions: '',
    allowed_topics: [] as string[]
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSystemMessagePreview, setShowSystemMessagePreview] = useState(false);
  const [systemMessagePreview, setSystemMessagePreview] = useState('');

  const { user } = useAuth();

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

  const addTopic = (topic: string) => {
    if (topic.trim()) {
      setChatbotData(prev => ({
        ...prev,
        allowed_topics: [...prev.allowed_topics, topic.trim()]
      }));
    }
  };

  const removeTopic = (index: number) => {
    setChatbotData(prev => ({
      ...prev,
      allowed_topics: prev.allowed_topics.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Aqui seria implementada a lógica de salvamento
    setTimeout(() => {
      setIsSaving(false);
      // Mostrar toast de sucesso
    }, 1000);
  };

  const handleChange = (field: string, value: string | string[]) => {
    setChatbotData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreviewSystemMessage = () => {
    setShowSystemMessagePreview(!showSystemMessagePreview);
    if (!showSystemMessagePreview) {
      // Gerar preview da mensagem do sistema
      const preview = `Você é um chatbot de atendimento online via web e deve utilizar as seguintes informações e diretivas:

1. IDENTIDADE E BOAS VINDAS:
- Seu nome é: ${chatbotData.chatbot_name || 'Assistente Virtual'}
- Use como mensagem de boas-vindas: ${chatbotData.welcome_message || 'Olá! Como posso ajudar?'}

2. INSTRUÇÕES GERAIS:
"""
${chatbotData.system_instructions || 'Você é um assistente virtual prestativo e profissional.'}
"""

3. TEMAS PERMITIDOS:
${chatbotData.allowed_topics.length > 0
          ? chatbotData.allowed_topics.map(topic => `- ${topic}`).join('\n')
          : '- Todos os temas são permitidos'
        }

Mantenha sempre um tom profissional e prestativo em suas respostas.`;

      setSystemMessagePreview(preview);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Header da página */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Configure seu Chatbot
            </h1>
            <p className="text-lg text-slate-300 max-w-3xl">
              Configure como ele se apresenta, quais temas pode abordar e suas instruções gerais.
            </p>
          </div>

          {/* Formulário de configuração */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} onKeyDown={(e) => {
              if (e.key === "Enter" && e.target !== e.currentTarget) {
                const target = e.target as HTMLElement;
                if (!('type' in target && target.type === "submit") && !e.ctrlKey) {
                  e.preventDefault();
                }
              }
            }} className="space-y-6">

              <div className="space-y-4 md:space-y-6 border border-purple-400/40 rounded-lg p-3 md:p-6 bg-purple-950/90 backdrop-blur-sm">

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
                        onChange={(e) => handleChange("chatbot_name", e.target.value)}
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
                        onChange={(e) => handleChange("welcome_message", e.target.value)}
                        className="mt-1 md:mt-2 edit-form-input text-sm md:text-base"
                        style={borderStyle}
                        rows={6}
                        placeholder="Olá! Como posso ajudar?"
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
                        onChange={(e) => handleChange("system_instructions", e.target.value)}
                        className="mt-1 md:mt-2 edit-form-input text-sm md:text-base"
                        style={borderStyle}
                        rows={10}
                        placeholder="Você é um assistente virtual e suas principais funções são..."
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
                              onKeyDown={(e) => {
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
                                const input = e.currentTarget.parentElement?.querySelector("input");
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
                      <div className="col-span-1 bg-purple-800/30 border-1 border-purple-400/40 rounded-md backdrop-blur-sm">
                        {chatbotData.allowed_topics.length > 0 ? (
                          <div className="flex flex-wrap gap-1 md:gap-2 p-2 md:p-3 border border-purple-300/40 rounded-lg bg-purple-900/10 backdrop-blur-sm">
                            {chatbotData.allowed_topics.map((topic, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 text-xs md:text-sm font-medium text-white border-2 border-purple-400/60 bg-purple-700/40 hover:bg-purple-600/50 transition-colors backdrop-blur-sm"
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
                            ))}
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

              {/* Botões de ação */}
              <div className="pb-0 flex justify-center items-center w-full gap-5">

                <button
                  type="button"
                  onClick={handlePreviewSystemMessage}
                  disabled={isSaving}
                  className={`relative px-8 py-4 rounded-xl transition-all duration-300 ease-in-out text-sm font-medium min-w-[200px] ${showSystemMessagePreview
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 transform translate-y-[-1px]'
                    : 'bg-slate-900/50 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800/70 hover:border-slate-600/70 backdrop-blur-sm'
                    }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Bot className="w-5 h-5" />
                    {showSystemMessagePreview ? 'Ocultar' : 'Ver'} Instrução Gerada
                  </div>
                  {showSystemMessagePreview && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse" />
                  )}
                </button>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="hover-glow-blue w-full md:w-auto text-sm md:text-base px-4 py-2"
                >
                  {isSaving ? "Salvando..." : "Salvar Configurações"}
                </Button>

              </div>

              {/* Conteúdo da Instrução Gerada */}
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
                          <h3 className="text-xl font-bold text-white">Instrução Gerada</h3>
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

            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Configure;

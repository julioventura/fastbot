import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChatbotData {
  system_message: string;
  office_address: string;
  office_hours: string;
  specialties: string;
  chatbot_name: string;
  welcome_message: string;
  whatsapp: string;
}

interface EditChatbotConfigProps {
  chatbotData: ChatbotData;
  isSaving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCancel: () => void;
}

const EditChatbotConfig: React.FC<EditChatbotConfigProps> = ({
  chatbotData,
  isSaving,
  onSubmit,
  onChange,
  onCancel
}) => {
  // Estado reativo para cor da borda
  const [borderColor, setBorderColor] = useState('rgba(0, 0, 0, 0.5)');
  
  // Detectar mudanças de tema dinamicamente
  useEffect(() => {
    const updateBorderColor = () => {
      // Detecta o tema atual no documentElement
      const isDarkMode = document.documentElement.classList.contains('dark');
      setBorderColor(isDarkMode 
        ? 'rgba(255, 255, 255, 0.6)' // Claro mais intenso para modo escuro
        : 'rgba(0, 0, 0, 0.5)');      // Escuro mais intenso para modo claro
    };

    // Atualiza imediatamente
    updateBorderColor();

    // Observa mudanças na classe do documentElement
    const observer = new MutationObserver(updateBorderColor);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <Card className="bg-transparent border border-border backdrop-blur-sm text-foreground">
      <CardHeader>
        <CardTitle className="text-foreground">Editar Configurações do Chatbot</CardTitle>
        <CardDescription className="text-muted-foreground">
          Personalize as informações e o comportamento do seu chatbot.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* Campo Nome do Chatbot */}
          <div>
            <Label htmlFor="chatbot_name" className="text-foreground">
              Nome do Chatbot<span className="text-red-500">*</span>
            </Label>
            <Input
              id="chatbot_name"
              name="chatbot_name"
              value={chatbotData.chatbot_name}
              onChange={onChange}
              className="text-lg mt-1 p-6 bg-input text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary w-1/2"
              placeholder="Ex: Assistente Virtual Dr. Silva"
              required
              style={{ border: `2px solid ${borderColor}` }}
            />
          </div>
          
          {/* Campo Mensagem de Sistema (Prompt) */}
          <div>
            <Label htmlFor="system_message" className="text-foreground">Instruções Gerais do Chatbot</Label>
            <Textarea
              id="system_message"
              name="system_message"
              value={chatbotData.system_message}
              onChange={onChange}
              className="text-xl mt-1 p-6 bg-input text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
              placeholder="Você é um assistente virtual. Seja cordial e ajude com informações sobre..."
              rows={30}
              style={{ border: `2px solid ${borderColor}` }}
            />
            <p className="mt-1 text-xs text-muted-foreground">Esta mensagem instrui a IA sobre como ela deve se comportar e responder.</p>
          </div>

          {/* Campo WhatsApp */}
          {/* <div>
            <Label htmlFor="whatsapp" className="text-foreground">Número do WhatsApp do chatbot</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              value={chatbotData.whatsapp}
              onChange={onChange}
              className="text-xl mt-1 p-6 bg-input text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
              placeholder="Ex: +55 11 91234-5678"
              style={{ border: `2px solid ${borderColor}` }}
            />
            <p className="mt-1 text-xs text-muted-foreground">Número do WhatsApp do chatbot</p>
          </div> */}

          {/* Campo Mensagem de Boas-vindas */}
          {/* <div>
            <Label htmlFor="welcome_message" className="text-foreground">Mensagem de Boas-vindas (Chatbot)</Label>
            <Textarea
              id="welcome_message"
              name="welcome_message"
              value={chatbotData.welcome_message}
              onChange={onChange}
              className="text-lg mt-1 p-6 bg-input text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
              placeholder="Olá! Sou o assistente virtual do consultório. Como posso ajudar?"
              rows={3}
              style={{ border: `2px solid ${borderColor}` }}
            />
          </div> */}

          {/* Campo Endereço do Consultório */}
          {/* <div>
            <Label htmlFor="office_address" className="text-foreground">Endereço do Consultório</Label>
            <Input
              id="office_address"
              name="office_address"
              value={chatbotData.office_address}
              onChange={onChange}
              className="text-lg mt-1 p-6 bg-input text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
              placeholder="Rua Exemplo, 123, Bairro, Cidade - UF"
              style={{ border: `2px solid ${borderColor}` }}
            />
          </div> */}

          {/* Campo Horários de Atendimento */}
          {/* <div>
            <Label htmlFor="office_hours" className="text-foreground">Horários de Atendimento</Label>
            <Input
              id="office_hours"
              name="office_hours"
              value={chatbotData.office_hours}
              onChange={onChange}
              className="text-xl mt-1 p-6 bg-input text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
              placeholder="Segunda a Sexta, das 08h às 18h"
              style={{ border: `2px solid ${borderColor}` }}
            />
          </div> */}

          {/* Campo Especialidades Atendidas */}
          {/* <div>
            <Label htmlFor="specialties" className="text-foreground">Especialidades Atendidas</Label>
            <Textarea
              id="specialties"
              name="specialties"
              value={chatbotData.specialties}
              onChange={onChange}
              className="text-xl mt-1 p-6 bg-input text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
              placeholder="Clínica Geral, Ortodontia, Implantes..."
              rows={3}
              style={{ border: `2px solid ${borderColor}` }}
            />
          </div> */}


          {/* Botões de Ação do Formulário */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-primary text-primary bg-secondary hover:bg-secondary/80 hover:text-primary"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 text-base rounded-md"
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
};

export default EditChatbotConfig;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChatbotData {
  system_message: string;
  office_address: string;
  office_hours: string;
  specialties: string;
  chatbot_name: string;
  welcome_message: string;
  whatsapp: string;
}

interface ViewChatbotConfigProps {
  chatbotData: ChatbotData;
}

const ViewChatbotConfig: React.FC<ViewChatbotConfigProps> = ({ chatbotData }) => {
  const [borderColor, setBorderColor] = useState('rgba(0, 0, 0, 0.5)');

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
    
  const renderViewData = (label: string, value: string | null | undefined, isRequired: boolean = false) => {
    // Se o campo não é obrigatório e está vazio, não renderiza nada
    if (!isRequired && (!value || value.trim() === '' || value.trim() === ' ')) {
      return null;
    }
    
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        <p className="text-foreground whitespace-pre-wrap break-words">
          {value}
        </p>
      </div>
    );
  };

  // Verifica se deve exibir a segunda coluna
  const shouldShowSecondColumn = chatbotData.welcome_message && chatbotData.welcome_message.trim() !== '' || 
                                 chatbotData.specialties && chatbotData.specialties.trim() !== '';

  return (
    <Card className="bg-transparent border border-border backdrop-blur-sm text-foreground">
      <CardHeader>
        <CardTitle className="text-foreground">Configuração do Chatbot</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 text-lg">
        <div className={`grid gap-x-8 gap-y-6 ${shouldShowSecondColumn ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
          {/* Coluna 1 para dados do chatbot */}
          <div className="space-y-6 p-4 rounded-lg shadow-md bg-card/30" style={{ border: `2px solid ${borderColor}` }}>
            {renderViewData("Nome do Chatbot", chatbotData.chatbot_name, true)}
            {renderViewData("Endereço do Consultório", chatbotData.office_address)}
            {renderViewData("Horários de Atendimento", chatbotData.office_hours)}
            {renderViewData("WhatsApp", chatbotData.whatsapp)}
          </div>
          {/* Coluna 2 para dados do chatbot - condicionalmente exibida */}
          {shouldShowSecondColumn && (
            <div className="space-y-6 p-4 rounded-lg shadow-md bg-card/30" style={{ border: `2px solid ${borderColor}` }}>
              {renderViewData("Mensagem de Boas-vindas (Chatbot)", chatbotData.welcome_message, false)}
              {renderViewData("Especialidades Atendidas", chatbotData.specialties)}
            </div>
          )}
          {/* Mensagem de Sistema ocupando as duas colunas abaixo para maior visibilidade */}
          <div className={`space-y-6 p-4 rounded-lg shadow-md bg-card/30 ${shouldShowSecondColumn ? 'md:col-span-2' : 'md:col-span-1'}`} style={{ border: `2px solid ${borderColor}` }}>
            {renderViewData("Mensagem de Sistema", chatbotData.system_message)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewChatbotConfig;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BaseChatbotData } from "@/interfaces";

interface ViewChatbotConfigProps {
  chatbotData: BaseChatbotData;
}

const ViewChatbotConfig: React.FC<ViewChatbotConfigProps> = ({ chatbotData }) => {
  const [borderColor, setBorderColor] = useState('rgba(0, 0, 0, 0.5)');

  useEffect(() => {
    const updateBorderColor = () => {
      // Detecta se o tema escuro está ativo no elemento raiz
      const isDarkMode = document.documentElement.classList.contains('dark');
      setBorderColor(isDarkMode 
        ? 'rgba(255, 255, 255, 0.6)' // Cor clara para bordas no modo escuro
        : 'rgba(0, 0, 0, 0.5)');      // Cor escura para bordas no modo claro
    };

    // Aplica a cor inicial das bordas
    updateBorderColor();

    // Observa mudanças no atributo class do documentElement para detectar troca de tema
    const observer = new MutationObserver(updateBorderColor);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);
    
  const renderViewData = (label: string, value: string | null | undefined, isRequired: boolean = false) => {
    // Oculta campos opcionais que estão vazios ou contêm apenas espaços
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

  // Determina se a segunda coluna deve ser exibida baseado no conteúdo disponível
  const shouldShowSecondColumn = chatbotData.welcome_message && chatbotData.welcome_message.trim() !== '' || 
                                 chatbotData.specialties && chatbotData.specialties.trim() !== '';

  return (
    <Card className="bg-transparent border border-border backdrop-blur-sm text-foreground">
      <CardHeader>
        <CardTitle className="text-foreground">Configuração do Chatbot</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 text-lg">
        <div className={`grid gap-x-8 gap-y-6 md:grid-cols-2`}>
          {/* Primeira coluna: informações básicas do chatbot */}
          <div className="space-y-6 p-4 rounded-lg shadow-md bg-card/30" style={{ border: `2px solid ${borderColor}` }}>
            {renderViewData("Nome do Chatbot", chatbotData.chatbot_name, true)}
            {renderViewData("Endereço do Consultório", chatbotData.office_address)}
            {renderViewData("Horários de Atendimento", chatbotData.office_hours)}
            {renderViewData("WhatsApp", chatbotData.whatsapp)}
          </div>
          {/* Segunda coluna: informações complementares (exibida apenas se houver conteúdo) */}
          {shouldShowSecondColumn && (
            <div className="space-y-6 p-4 rounded-lg shadow-md bg-card/30" style={{ border: `2px solid ${borderColor}` }}>
              {renderViewData("Mensagem de Boas-vindas (Chatbot)", chatbotData.welcome_message, false)}
              {renderViewData("Especialidades Atendidas", chatbotData.specialties)}
            </div>
          )}
          {/* Seção de mensagem do sistema: ocupa largura total para melhor visualização */}
          <div className={`space-y-6 p-4 rounded-lg shadow-md bg-card/30 ${shouldShowSecondColumn ? 'md:col-span-2' : 'md:col-span-1'}`} style={{ border: `2px solid ${borderColor}` }}>
            {renderViewData("Mensagem de Sistema", chatbotData.system_message)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewChatbotConfig;
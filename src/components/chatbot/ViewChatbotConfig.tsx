import React from "react";
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
  const renderViewData = (label: string, value: string | null | undefined) => (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-400">{label}</h3>
      <p className="text-white whitespace-pre-wrap break-words">
        {value || <span className="text-gray-500 italic">Não informado</span>}
      </p>
    </div>
  );

  return (
    <Card className="bg-transparent border border-[#2a4980]/50 backdrop-blur-sm text-white">
      <CardHeader>
        <CardTitle className="text-white">Configuração do Chatbot</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 text-lg">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Coluna 1 para dados do chatbot */}
          <div className="space-y-6 p-4 border border-[#3b82f6]/70 rounded-lg shadow-md bg-[#0e203e]/30">
            {renderViewData("Nome do Chatbot (Homepage)", chatbotData.chatbot_name)}
            {renderViewData("Endereço do Consultório", chatbotData.office_address)}
            {renderViewData("Horários de Atendimento", chatbotData.office_hours)}
            {renderViewData("WhatsApp", chatbotData.whatsapp)}
          </div>
          {/* Coluna 2 para dados do chatbot */}
          <div className="space-y-6 p-4 border border-[#3b82f6]/70 rounded-lg shadow-md bg-[#0e203e]/30">
            {renderViewData("Mensagem de Boas-vindas (Chatbot)", chatbotData.welcome_message)}
            {renderViewData("Especialidades Atendidas", chatbotData.specialties)}
          </div>
          {/* Mensagem de Sistema ocupando as duas colunas abaixo para maior visibilidade */}
          <div className="md:col-span-2 space-y-6 p-4 border border-[#3b82f6]/70 rounded-lg shadow-md bg-[#0e203e]/30">
            {renderViewData("Mensagem de Sistema (Prompt do Chatbot)", chatbotData.system_message)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewChatbotConfig;
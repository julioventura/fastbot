import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChatbotData {
  system_message: string;
  office_address: string;
  office_hours: string;
  specialties: string;
  chatbot_name: string;
  welcome_message: string;
  whatsapp: string;
}

interface TestChatbotProps {
  chatbotData: ChatbotData;
}

const TestChatbot: React.FC<TestChatbotProps> = ({ chatbotData }) => {
  return (
    <Card className="bg-[#0a1629]/60 border border-[#2a4980]/50 backdrop-blur-sm text-white">
      <CardHeader>
        <CardTitle className="text-white">Testar Chatbot</CardTitle>
        <CardDescription className="text-gray-300">
          Interaja com seu chatbot para testar as configurações.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-center">
            Interface de teste do chatbot será implementada aqui.
            <br />
            <span className="text-sm">Em breve você poderá testar seu chatbot diretamente nesta aba.</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestChatbot;
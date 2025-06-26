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
    <Card className="bg-card/60 border border-border backdrop-blur-sm text-foreground">
      <CardHeader>
        <CardTitle className="text-foreground">Testar Chatbot</CardTitle>
        <CardDescription className="text-muted-foreground">
          Interaja com seu chatbot para testar as configurações.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground text-center">
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
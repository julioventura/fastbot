import React from "react";
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
  return (
    <Card className="bg-[#0a1629]/60 border border-[#2a4980]/50 backdrop-blur-sm text-white">
      <CardHeader>
        <CardTitle className="text-white">Editar Configurações do Chatbot</CardTitle>
        <CardDescription className="text-gray-300">
          Personalize as informações e o comportamento do seu chatbot.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Campo WhatsApp */}
          <div>
            <Label htmlFor="whatsapp" className="text-gray-300">Número do WhatsApp do chatbot</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              value={chatbotData.whatsapp}
              onChange={onChange}
              className="text-xl mt-1 p-6 bg-[#16305d] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
              placeholder="Ex: +55 11 91234-5678"
            />
            <p className="mt-1 text-xs text-gray-400">Número do WhatsApp do chatbot</p>
          </div>

          {/* Campo Nome do Chatbot */}
          <div>
            <Label htmlFor="chatbot_name" className="text-gray-300">Nome do Chatbot (para Homepage)</Label>
            <Input
              id="chatbot_name"
              name="chatbot_name"
              value={chatbotData.chatbot_name}
              onChange={onChange}
              className="text-lg mt-1 p-6 bg-[#16305d] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
              placeholder="Ex: Assistente Virtual Dr. Silva"
            />
          </div>

          {/* Campo Mensagem de Boas-vindas */}
          <div>
            <Label htmlFor="welcome_message" className="text-gray-300">Mensagem de Boas-vindas (Chatbot)</Label>
            <Textarea
              id="welcome_message"
              name="welcome_message"
              value={chatbotData.welcome_message}
              onChange={onChange}
              className="text-lg mt-1 p-6 bg-[#16305d] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
              placeholder="Olá! Sou o assistente virtual do consultório. Como posso ajudar?"
              rows={3}
            />
          </div>

          {/* Campo Endereço do Consultório */}
          <div>
            <Label htmlFor="office_address" className="text-gray-300">Endereço do Consultório</Label>
            <Input
              id="office_address"
              name="office_address"
              value={chatbotData.office_address}
              onChange={onChange}
              className="text-lg mt-1 p-6 bg-[#16305d] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
              placeholder="Rua Exemplo, 123, Bairro, Cidade - UF"
            />
          </div>

          {/* Campo Horários de Atendimento */}
          <div>
            <Label htmlFor="office_hours" className="text-gray-300">Horários de Atendimento</Label>
            <Input
              id="office_hours"
              name="office_hours"
              value={chatbotData.office_hours}
              onChange={onChange}
              className="text-xl mt-1 p-6 bg-[#16305d] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
              placeholder="Segunda a Sexta, das 08h às 18h"
            />
          </div>

          {/* Campo Especialidades Atendidas */}
          <div>
            <Label htmlFor="specialties" className="text-gray-300">Especialidades Atendidas</Label>
            <Textarea
              id="specialties"
              name="specialties"
              value={chatbotData.specialties}
              onChange={onChange}
              className="text-xl mt-1 p-6 bg-[#16305d] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
              placeholder="Clínica Geral, Ortodontia, Implantes..."
              rows={3}
            />
          </div>

          {/* Campo Mensagem de Sistema (Prompt) */}
          <div>
            <Label htmlFor="system_message" className="text-gray-300">Mensagem de Sistema do Chatbot</Label>
            <Textarea
              id="system_message"
              name="system_message"
              value={chatbotData.system_message}
              onChange={onChange}
              className="text-xl mt-1 p-6 bg-[#16305d] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
              placeholder="Você é um assistente virtual. Seja cordial e ajude com informações sobre..."
              rows={30}
            />
            <p className="mt-1 text-xs text-gray-400">Esta mensagem instrui a IA sobre como ela deve se comportar e responder.</p>
          </div>

          {/* Botões de Ação do Formulário */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-[#4f9bff] text-[#60a5fa] bg-blue-800 hover:bg-[#4f9bff]/10 hover:text-[#7caffd]"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-[#3b82f6] hover:bg-[#4f9bff] text-white px-6 py-2 text-base rounded-md drop-shadow-[0_0_8px_rgba(79,155,255,0.3)] hover:drop-shadow-[0_0_12px_rgba(79,155,255,0.5)] transition-all"
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
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BackgroundDecoration from "@/components/account/BackgroundDecoration";
import LoadingScreen from "@/components/account/LoadingScreen";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Importar Tabs

interface ChatbotData {
  system_message: string;
  office_address: string;
  office_hours: string;
  specialties: string;
  chatbot_name: string;
  welcome_message: string;
  // Adicione outros campos conforme necessário
}

const MyChatbotPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chatbotData, setChatbotData] = useState<ChatbotData>({
    system_message: "",
    office_address: "",
    office_hours: "",
    specialties: "",
    chatbot_name: "",
    welcome_message: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("view"); // Estado para controlar a aba ativa

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }

    if (user) {
      const fetchChatbotData = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from("mychatbot")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          if (data) {
            setChatbotData({
              system_message: data.system_message || "",
              office_address: data.office_address || "",
              office_hours: data.office_hours || "",
              specialties: data.specialties || "",
              chatbot_name: data.chatbot_name || "",
              welcome_message: data.welcome_message || "",
            });
          }
        } catch (error) {
          console.error("Erro ao buscar dados do chatbot:", error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar as configurações do seu chatbot.",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchChatbotData();
    }
  }, [user, authLoading, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setChatbotData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const { data: existingData, error: fetchError } = await supabase
        .from("mychatbot")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const dataToSave = {
        ...chatbotData,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (existingData) {
        const { error: updateError } = await supabase
          .from("mychatbot")
          .update(dataToSave)
          .eq("user_id", user.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("mychatbot")
          .insert({ ...dataToSave, created_at: new Date().toISOString() });
        error = insertError;
      }
      
      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Configurações do chatbot salvas.",
      });
      setActiveTab("view"); // Voltar para a aba de visualização após salvar
    } catch (error) {
      console.error("Erro ao salvar dados do chatbot:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações do chatbot.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return <LoadingScreen />;
  }

  const renderViewData = (label: string, value: string | null | undefined) => (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-400">{label}</h3>
      <p className="text-white whitespace-pre-wrap break-words">
        {value || <span className="text-gray-500 italic">Não informado</span>}
      </p>
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a1629] to-[#082756] min-h-screen">
      <BackgroundDecoration />
      
      <div className="container mx-auto py-10 px-4 relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 gradient-text">Meu Chatbot</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#0e203e]/70 border border-[#2a4980]/50 mb-6">
            <TabsTrigger value="view" className="data-[state=active]:bg-[#3b82f6]/30 data-[state=active]:text-white text-gray-300">INSTRUÇÕES</TabsTrigger>
            <TabsTrigger value="edit" className="data-[state=active]:bg-[#3b82f6]/30 data-[state=active]:text-white text-gray-300">EDITAR</TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-[#3b82f6]/30 data-[state=active]:text-white text-gray-300">TESTAR</TabsTrigger>
          </TabsList>

          <TabsContent value="view">
            <Card className="bg-[#0a1629]/60 border border-[#2a4980]/50 backdrop-blur-sm text-white">
              <CardHeader>
                <CardTitle className="text-white">Informações do Chatbot</CardTitle>
                <CardDescription className="text-gray-300">
                  Revise as configurações atuais do seu chatbot e da sua homepage.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Coluna 1 */}
                  <div className="space-y-6 p-4 border border-[#3b82f6]/70 rounded-lg shadow-md bg-[#0e203e]/30">
                    {renderViewData("Nome do Chatbot (Homepage)", chatbotData.chatbot_name)}
                    {renderViewData("Endereço do Consultório", chatbotData.office_address)}
                    {renderViewData("Horários de Atendimento", chatbotData.office_hours)}
                  </div>
                  {/* Coluna 2 */}
                  <div className="space-y-6 p-4 border border-[#3b82f6]/70 rounded-lg shadow-md bg-[#0e203e]/30">
                    {renderViewData("Mensagem de Boas-vindas (Chatbot)", chatbotData.welcome_message)}
                    {renderViewData("Especialidades Atendidas", chatbotData.specialties)}
                  </div>
                  {/* Mensagem de Sistema ocupando as duas colunas abaixo */}
                  <div className="md:col-span-2 space-y-6 p-4 border border-[#3b82f6]/70 rounded-lg shadow-md bg-[#0e203e]/30">
                     {renderViewData("Mensagem de Sistema (Prompt do Chatbot)", chatbotData.system_message)}
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit">
            <Card className="bg-[#0a1629]/60 border border-[#2a4980]/50 backdrop-blur-sm text-white">
              <CardHeader>
                <CardTitle className="text-white">Editar Configurações do Chatbot</CardTitle>
                <CardDescription className="text-gray-300">
                  Personalize as informações e o comportamento do seu chatbot.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="chatbot_name" className="text-gray-300">Nome do Chatbot (para Homepage)</Label>
                    <Input
                      id="chatbot_name"
                      name="chatbot_name"
                      value={chatbotData.chatbot_name}
                      onChange={handleChange}
                      className="mt-1 bg-[#0e203e] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
                      placeholder="Ex: Assistente Virtual Dr. Silva"
                    />
                  </div>

                  <div>
                    <Label htmlFor="welcome_message" className="text-gray-300">Mensagem de Boas-vindas (Chatbot)</Label>
                    <Textarea
                      id="welcome_message"
                      name="welcome_message"
                      value={chatbotData.welcome_message}
                      onChange={handleChange}
                      className="mt-1 bg-[#0e203e] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
                      placeholder="Olá! Sou o assistente virtual do consultório. Como posso ajudar?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="system_message" className="text-gray-300">Mensagem de Sistema (Prompt do Chatbot)</Label>
                    <Textarea
                      id="system_message"
                      name="system_message"
                      value={chatbotData.system_message}
                      onChange={handleChange}
                      className="mt-1 bg-[#0e203e] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
                      placeholder="Você é um assistente virtual de um consultório médico/odontológico. Seja cordial e ajude com informações sobre..."
                      rows={6}
                    />
                    <p className="mt-1 text-xs text-gray-400">Esta mensagem instrui a IA sobre como ela deve se comportar e responder.</p>
                  </div>

                  <div>
                    <Label htmlFor="office_address" className="text-gray-300">Endereço do Consultório</Label>
                    <Input
                      id="office_address"
                      name="office_address"
                      value={chatbotData.office_address}
                      onChange={handleChange}
                      className="mt-1 bg-[#0e203e] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
                      placeholder="Rua Exemplo, 123, Bairro, Cidade - UF"
                    />
                  </div>

                  <div>
                    <Label htmlFor="office_hours" className="text-gray-300">Horários de Atendimento</Label>
                    <Input
                      id="office_hours"
                      name="office_hours"
                      value={chatbotData.office_hours}
                      onChange={handleChange}
                      className="mt-1 bg-[#0e203e] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
                      placeholder="Segunda a Sexta, das 08h às 18h"
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialties" className="text-gray-300">Especialidades Atendidas</Label>
                    <Textarea
                      id="specialties"
                      name="specialties"
                      value={chatbotData.specialties}
                      onChange={handleChange}
                      className="mt-1 bg-[#0e203e] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
                      placeholder="Clínica Geral, Ortodontia, Implantes..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button 
                      type="button" // Para não submeter o formulário
                      variant="outline"
                      onClick={() => setActiveTab("view")} // Volta para a aba de visualização
                      className="border-[#4f9bff] text-[#60a5fa] hover:bg-[#4f9bff]/10 hover:text-[#7caffd]"
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyChatbotPage;
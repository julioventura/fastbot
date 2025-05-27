// Componente: MyChatbotPage
// Funcionalidade:
// Esta página permite que usuários autenticados visualizem, configurem e testem
// as informações e o comportamento do seu chatbot personalizado.
// Ela busca dados da tabela 'mychatbot' no Supabase, permite a edição
// através de um formulário, e salva as alterações de volta no banco de dados.
// A interface é organizada em abas para visualização das instruções, edição das configurações e teste do chatbot.
//
// Funções e Constantes Principais:
// - MyChatbotPage (Componente): Componente funcional principal da página.
// - user (const): Objeto contendo informações do usuário autenticado, obtido do hook useAuth.
// - authLoading (const): Booleano indicando se o estado de autenticação ainda está carregando, obtido do hook useAuth.
// - navigate (const): Função para navegação programática, obtida do hook useNavigate.
// - toast (const): Função para exibir notificações (toasts), obtida do hook useToast.
// - ChatbotData (interface): Define a estrutura dos dados para as configurações do chatbot.
// - chatbotData (estado): Objeto que armazena os dados de configuração do chatbot.
// - setChatbotData (função de estado): Atualiza o estado chatbotData.
// - isLoading (estado): Booleano que controla a exibição do indicador de carregamento dos dados do chatbot.
// - setIsLoading (função de estado): Atualiza o estado isLoading.
// - isSaving (estado): Booleano que controla a exibição do indicador de salvamento e desabilita o botão de salvar.
// - setIsSaving (função de estado): Atualiza o estado isSaving.
// - activeTab (estado): String que controla qual aba (visualização, edição, teste) está atualmente ativa.
// - setActiveTab (função de estado): Atualiza o estado activeTab.
// - useEffect (hook):
//   - Responsável por verificar o estado de autenticação do usuário. Se não estiver autenticado, redireciona para a home.
//   - Se autenticado, busca os dados do chatbot do Supabase através da função interna fetchChatbotData.
// - fetchChatbotData (função interna no useEffect): Função assíncrona para buscar os dados de configuração do chatbot.
// - handleChange (função): Manipulador de eventos para atualizar o estado 'chatbotData' quando os valores dos inputs do formulário mudam.
// - handleSubmit (função): Manipulador de eventos para o envio do formulário de edição, salvando os dados no Supabase.
// - renderViewData (função): Função auxiliar para renderizar os campos de dados na aba de visualização.

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interface ChatbotData
// Define a estrutura dos dados para as configurações do chatbot.
interface ChatbotData {
  system_message: string; // Mensagem de sistema (prompt) para a IA do chatbot.
  office_address: string; // Endereço do consultório/escritório.
  office_hours: string;   // Horários de atendimento.
  specialties: string;    // Especialidades atendidas.
  chatbot_name: string;   // Nome do chatbot (exibido na homepage).
  welcome_message: string; // Mensagem de boas-vindas do chatbot.
  whatsapp: string; // Novo campo
}

// Componente MyChatbotPage
// Componente funcional principal da página de configuração do chatbot.
const MyChatbotPage: React.FC = () => {
  // --- Hooks e Contextos ---
  // user: Objeto do usuário autenticado.
  // authLoading: Estado de carregamento da autenticação (renomeado de 'loading' do useAuth).
  const { user, loading: authLoading } = useAuth();

  // navigate: Função para navegação programática.
  const navigate = useNavigate();

  // toast: Função para exibir notificações (toasts).
  const { toast } = useToast();


  // --- Estados do Componente ---
  // chatbotData: Armazena os dados de configuração do chatbot.
  const [chatbotData, setChatbotData] = useState<ChatbotData>({
    system_message: "",
    office_address: "",
    office_hours: "",
    specialties: "",
    chatbot_name: "",
    welcome_message: "",
    whatsapp: "", // Novo campo
  });

  // isLoading: Controla a exibição do indicador de carregamento dos dados do chatbot.
  const [isLoading, setIsLoading] = useState(true);

  // isSaving: Controla a exibição do indicador de salvamento e desabilita o botão de salvar.
  const [isSaving, setIsSaving] = useState(false);

  // activeTab: Controla qual aba (visualização, edição, teste) está atualmente ativa.
  const [activeTab, setActiveTab] = useState("view"); // Inicia na aba de visualização.


  // --- Efeito useEffect para Carregamento Inicial, Autenticação e Busca de Dados ---
  // Executado na montagem do componente e quando 'user', 'authLoading', 'navigate' ou 'toast' mudam.
  // Responsável por:
  // 1. Redirecionar para a home se o usuário não estiver autenticado e o carregamento da auth tiver terminado.
  // 2. Buscar os dados do chatbot do Supabase se o usuário estiver autenticado.
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/"); // Redireciona se não houver usuário e o carregamento da autenticação terminou.
    }

    if (user) {
      // --- Função fetchChatbotData ---
      // Busca os dados de configuração do chatbot associados ao usuário logado na tabela 'mychatbot' do Supabase.
      const fetchChatbotData = async () => {
        setIsLoading(true); // Inicia o estado de carregamento dos dados do chatbot.
        try {
          const { data, error } = await supabase
            .from("mychatbot") // Tabela 'mychatbot'.
            .select("*")      // Seleciona todas as colunas.
            .eq("user_id", user.id) // Filtra pelo ID do usuário logado.
            .single(); // Espera um único registro.

          // Trata erro na busca, ignorando o erro 'PGRST116' (nenhum registro encontrado),
          // que é esperado se o usuário ainda não configurou o chatbot.
          if (error && error.code !== 'PGRST116') {
            throw error; // Lança outros erros para serem tratados pelo catch.
          }

          // Se dados forem encontrados, atualiza o estado 'chatbotData'.
          // Caso contrário, 'chatbotData' manterá seus valores iniciais (strings vazias).
          if (data) {
            setChatbotData({
              system_message: data.system_message || "",
              office_address: data.office_address || "",
              office_hours: data.office_hours || "",
              specialties: data.specialties || "",
              chatbot_name: data.chatbot_name || "",
              welcome_message: data.welcome_message || "",
              whatsapp: data.whatsapp || "", // Novo campo
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
          setIsLoading(false); // Finaliza o estado de carregamento dos dados do chatbot.
        }
      };
      fetchChatbotData(); // Chama a função para buscar os dados.
    }
  }, [user, authLoading, navigate, toast]); // Dependências do useEffect.


  // --- Função handleChange ---
  // Manipulador de eventos para atualizar o estado 'chatbotData' quando os valores dos inputs ou textareas do formulário mudam.
  // Utiliza o atributo 'name' do campo do input/textarea para atualizar a propriedade correspondente no estado 'chatbotData'.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setChatbotData(prevData => ({ ...prevData, [name]: value }));
  };


  // --- Função handleSubmit ---
  // Manipulador de eventos para o envio do formulário de edição das configurações do chatbot.
  // Salva (insere um novo registro ou atualiza um existente) os dados na tabela 'mychatbot' do Supabase.
  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit');

    e.preventDefault(); // Previne o comportamento padrão de submissão do formulário (recarregar a página).
    if (!user) return; // Retorna se não houver usuário (proteção adicional).

    setIsSaving(true); // Ativa o estado de salvamento (para feedback visual e desabilitar o botão).
    try {
      // Verifica se já existe um registro para o usuário para decidir entre INSERT ou UPDATE.

      console.log("user_id = ", user.id);

      const { data: existingData, error: fetchError } = await supabase
        .from("mychatbot")
        .select("id") // Seleciona apenas o ID para verificar a existência, otimizando a query.
        .eq("user_id", user.id)
        .single();

      // Trata erro na busca, ignorando 'PGRST116' (nenhum registro encontrado).
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Prepara os dados para salvar, incluindo o user_id e a data de atualização.
      const dataToSave = {
        ...chatbotData,
        user_id: user.id,
        updated_at: new Date().toISOString(), // Define a data de atualização para o momento atual.
      };

      let supabaseError; // Variável para armazenar o erro da operação de insert ou update.

      // Se já existe um registro (existingData não é null), atualiza (UPDATE).
      if (existingData) {
        const { error } = await supabase
          .from("mychatbot")
          .update(dataToSave)
          .eq("user_id", user.id); // Condição para atualizar o registro correto.
        supabaseError = error;
      } else {
        // Se não existe, insere um novo registro (INSERT), incluindo a data de criação.
        const { error } = await supabase
          .from("mychatbot")
          .insert({ ...dataToSave, created_at: new Date().toISOString() }); // Adiciona created_at para novos registros.
        supabaseError = error;
      }
      
      if (supabaseError) throw supabaseError; // Se houver erro na operação de banco de dados, lança-o.

      // Exibe notificação de sucesso.
      toast({
        title: "Sucesso!",
        description: "Configurações do chatbot salvas.",
      });
      setActiveTab("view"); // Muda para a aba de visualização após salvar com sucesso.
    } catch (error) {
      console.error("Erro ao salvar dados do chatbot:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações do chatbot.",
      });
    } finally {
      setIsSaving(false); // Finaliza o estado de salvamento, independentemente do resultado.
    }
  };


  // --- Condicional de Carregamento Global ---
  // Exibe a tela de carregamento se a autenticação inicial ou os dados do chatbot ainda estiverem carregando.
  if (authLoading || isLoading) {
    return <LoadingScreen />;
  }


  // --- Função renderViewData ---
  // Função auxiliar para renderizar os campos de dados na aba de visualização ("view").
  // Exibe o valor fornecido ou uma mensagem padrão ("Não informado") se o valor for nulo ou vazio.
  const renderViewData = (label: string, value: string | null | undefined) => (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-400">{label}</h3>
      <p className="text-white whitespace-pre-wrap break-words">
        {value || <span className="text-gray-500 italic">Não informado</span>}
      </p>
    </div>
  );


  // --- Renderização do Componente ---
  // Estrutura JSX da página MyChatbotPage, incluindo o sistema de abas e os formulários.
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a1629] to-[#082756] min-h-screen">
      <BackgroundDecoration />
      
      <div className="container mx-auto py-10 px-4 relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 gradient-text">Meu Chatbot</h1>
        
        {/* Sistema de Abas para organizar o conteúdo */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#0e203e]/70 border border-[#2a4980]/50 mb-6">
            <TabsTrigger value="view" className="data-[state=active]:bg-[#3b82f6]/30 data-[state=active]:text-white text-gray-300">INSTRUÇÕES</TabsTrigger>
            <TabsTrigger value="edit" className="data-[state=active]:bg-[#3b82f6]/30 data-[state=active]:text-white text-gray-300">EDITAR</TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-[#3b82f6]/30 data-[state=active]:text-white text-gray-300">TESTAR</TabsTrigger>
          </TabsList>

          {/* Conteúdo da Aba de Visualização ("view") */}
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
                  {/* Coluna 1 para dados do chatbot */}
                  <div className="space-y-6 p-4 border border-[#3b82f6]/70 rounded-lg shadow-md bg-[#0e203e]/30">
                    {renderViewData("Nome do Chatbot (Homepage)", chatbotData.chatbot_name)}
                    {renderViewData("Endereço do Consultório", chatbotData.office_address)}
                    {renderViewData("Horários de Atendimento", chatbotData.office_hours)}
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
          </TabsContent>

          {/* Conteúdo da Aba de Edição ("edit") */}
          <TabsContent value="edit">
            <Card className="bg-[#0a1629]/60 border border-[#2a4980]/50 backdrop-blur-sm text-white">
              <CardHeader>
                <CardTitle className="text-white">Editar Configurações do Chatbot</CardTitle>
                <CardDescription className="text-gray-300">
                  Personalize as informações e o comportamento do seu chatbot.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Formulário de Edição das Configurações */}
                <form onSubmit={handleSubmit} className="space-y-6">

                
                  {/* Campo WhatsApp */}
                  <div>
                    <Label htmlFor="whatsapp" className="text-gray-300">Número do WhatsApp do chatbot</Label>
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      value={chatbotData.whatsapp}
                      onChange={handleChange}
                      className="mt-1 bg-[#0e203e] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
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
                      onChange={handleChange}
                      className="mt-1 bg-[#0e203e] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
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
                      onChange={handleChange}
                      className="mt-1 bg-[#0e203e] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
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
                      onChange={handleChange}
                      className="mt-1 bg-[#0e203e] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
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
                      onChange={handleChange}
                      className="mt-1 bg-[#0e203e] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
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
                      onChange={handleChange}
                      className="mt-1 bg-[#0e203e] border-[#2a4980]/70 text-white placeholder:text-gray-500 focus:ring-[#4f9bff] focus:border-[#4f9bff]"
                      placeholder="Clínica Geral, Ortodontia, Implantes..."
                      rows={3}
                    />
                  </div>


                  {/* Campo Mensagem de Sistema (Prompt) */}
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
                                    

                  {/* Botões de Ação do Formulário (Cancelar e Salvar) */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      type="button" // Define como tipo 'button' para não submeter o formulário ao clicar.
                      variant="outline"
                      onClick={() => setActiveTab("view")} // Volta para a aba de visualização ao cancelar.
                      className="border-[#4f9bff] text-[#60a5fa] hover:bg-[#4f9bff]/10 hover:text-[#7caffd]"
                      disabled={isSaving} // Desabilita o botão de cancelar enquanto estiver salvando.
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" // Botão principal para submeter o formulário.
                      className="bg-[#3b82f6] hover:bg-[#4f9bff] text-white px-6 py-2 text-base rounded-md drop-shadow-[0_0_8px_rgba(79,155,255,0.3)] hover:drop-shadow-[0_0_12px_rgba(79,155,255,0.5)] transition-all"
                      disabled={isSaving} // Desabilita o botão de salvar enquanto uma operação de salvamento estiver em progresso.
                    >
                      {isSaving ? "Salvando..." : "Salvar Configurações"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conteúdo da Aba de Teste ("chat") - Placeholder para implementação futura */}
          {/* 
          <TabsContent value="chat">
            <Card className="bg-[#0a1629]/60 border border-[#2a4980]/50 backdrop-blur-sm text-white">
              <CardHeader>
                <CardTitle className="text-white">Testar Chatbot</CardTitle>
                <CardDescription className="text-gray-300">
                  Interaja com seu chatbot para testar as configurações.
                </CardDescription>
              </CardHeader>
              <CardContent>
                // A interface de chat será implementada aqui.
              </CardContent>
            </Card>
          </TabsContent> 
          */}
        </Tabs>
      </div>
    </div>
  );
};

export default MyChatbotPage;
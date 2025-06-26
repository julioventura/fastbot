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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BackgroundDecoration from "@/components/account/BackgroundDecoration";
import LoadingScreen from "@/components/account/LoadingScreen";
import ViewChatbotConfig from "@/components/chatbot/ViewChatbotConfig";
import EditChatbotConfig from "@/components/chatbot/EditChatbotConfig";
import TestChatbot from "@/components/chatbot/TestChatbot";

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

  // --- Função handleCancel ---
  // Manipulador para o botão de cancelar, que simplesmente muda a aba ativa de volta para "view".
  const handleCancel = () => {
    setActiveTab("view");
  };

  // --- Condicional de Carregamento Global ---
  // Exibe a tela de carregamento se a autenticação inicial ou os dados do chatbot ainda estiverem carregando.
  if (authLoading || isLoading) {
    return <LoadingScreen />;
  }


  // --- Renderização do Componente ---
  // Estrutura JSX da página MyChatbotPage, incluindo o sistema de abas e os formulários.
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a1629] to-[#082756] min-h-screen">
      <BackgroundDecoration />
      
    {/* Decoração de fundo inline para garantir que seja renderizada */}
      <div className="absolute inset-0 z-0">
        {/* Gradiente principal horizontal */}
        <div className="absolute inset-0 bg-theme-gradient"></div>
        
        {/* Elementos decorativos sutis */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-2xl opacity-50"></div>
        <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-primary/8 rounded-full blur-xl opacity-40"></div>
        
        {/* Grade sutil de pontos para textura */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>
      
      <div className="container mx-auto py-10 px-4 relative z-10">
        <h1 className="text-center text-3xl md:text-4xl font-bold mb-8 gradient-text">Meu Chatbot</h1>
        
        {/* Sistema de Abas para organizar o conteúdo */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/70 border border-border mb-6">
            <TabsTrigger value="view" className="data-[state=active]:bg-primary/30 data-[state=active]:text-primary-foreground text-muted-foreground">INSTRUÇÕES</TabsTrigger>
            <TabsTrigger value="edit" className="data-[state=active]:bg-primary/30 data-[state=active]:text-primary-foreground text-muted-foreground">EDITAR</TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-primary/30 data-[state=active]:text-primary-foreground text-muted-foreground">TESTAR</TabsTrigger>
          </TabsList>

          <TabsContent value="view">
            <ViewChatbotConfig chatbotData={chatbotData} />
          </TabsContent>

          <TabsContent value="edit">
            <EditChatbotConfig
              chatbotData={chatbotData}
              isSaving={isSaving}
              onSubmit={handleSubmit}
              onChange={handleChange}
              onCancel={handleCancel}
            />
          </TabsContent>

          <TabsContent value="chat">
            <TestChatbot chatbotData={chatbotData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyChatbotPage;
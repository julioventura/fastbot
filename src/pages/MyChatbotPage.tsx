import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BackgroundDecoration from "@/components/account/BackgroundDecoration";
import LoadingScreen from "@/components/account/LoadingScreen";
import AdvancedEditChatbotConfig from "@/components/chatbot/AdvancedEditChatbotConfig";
import { ChatbotData } from "@/interfaces";
import { generateSystemMessage, validateChatbotData } from "@/lib/chatbot-utils";

const MyChatbotPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [chatbotData, setChatbotData] = useState<ChatbotData>({
    system_instructions: "",
    system_message: "",
    office_address: "",
    office_hours: "",
    specialties: "",
    chatbot_name: "",
    welcome_message: "",
    whatsapp: "",
    // Valores padrão dos novos campos
    formality_level: 50,
    use_emojis: false,
    memorize_user_name: false,
    paragraph_size: 50,
    main_topic: "",
    allowed_topics: [],
    source_strictness: 50,
    allow_internet_search: false,
    confidence_threshold: 70,
    fallback_action: 'human',
    response_time_promise: "",
    fallback_message: "",
    main_link: "",
    mandatory_link: false,
    uploaded_documents: [],
    mandatory_phrases: [],
    auto_link: false,
    max_list_items: 10,
    list_style: 'numbered',
    ask_for_name: false,
    name_usage_frequency: 30,
    remember_context: false,
    returning_user_greeting: "",
    response_speed: 50,
    debug_mode: false,
    chat_color: '#3b82f6',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSystemMessagePreview, setShowSystemMessagePreview] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }

    if (user) {
      const fetchChatbotData = async () => {
        setIsLoading(true);
        try {
          // CORREÇÃO: Remover .single() para evitar erro 406 quando não há registros
          const { data, error } = await supabase
            .from("mychatbot")
            .select("*")
            .eq("chatbot_user", user.id);

          if (error) {
            throw error;
          }

          // Verificar se há registros
          if (data && data.length > 0) {
            setChatbotData({
              system_instructions: data[0].system_instructions || "",
              system_message: data[0].system_message || "",
              office_address: data[0].office_address || "",
              office_hours: data[0].office_hours || "",
              specialties: data[0].specialties || "",
              chatbot_name: data[0].chatbot_name || "",
              welcome_message: data[0].welcome_message || "",
              whatsapp: data[0].whatsapp || "",
              // Campos avançados
              formality_level: data[0].formality_level || 50,
              use_emojis: data[0].use_emojis || false,
              memorize_user_name: data[0].memorize_user_name || false,
              paragraph_size: data[0].paragraph_size || 50,
              main_topic: data[0].main_topic || "",
              allowed_topics: data[0].allowed_topics || [],
              source_strictness: data[0].source_strictness || 50,
              allow_internet_search: data[0].allow_internet_search || false,
              confidence_threshold: data[0].confidence_threshold || 70,
              fallback_action: data[0].fallback_action || 'human',
              response_time_promise: data[0].response_time_promise || "",
              fallback_message: data[0].fallback_message || "",
              main_link: data[0].main_link || "",
              mandatory_link: data[0].mandatory_link || false,
              uploaded_documents: data[0].uploaded_documents || [],
              uploaded_images: data[0].uploaded_images || [],
              footer_message: data[0].footer_message || "",
              mandatory_phrases: data[0].mandatory_phrases || [],
              auto_link: data[0].auto_link || false,
              max_list_items: data[0].max_list_items || 10,
              list_style: data[0].list_style || 'numbered',
              ask_for_name: data[0].ask_for_name || false,
              name_usage_frequency: data[0].name_usage_frequency || 30,
              remember_context: data[0].remember_context || false,
              returning_user_greeting: data[0].returning_user_greeting || "",
              response_speed: data[0].response_speed || 50,
              debug_mode: data[0].debug_mode || false,
              chat_color: data[0].chat_color || "#3b82f6",
            });
          } else {
            // Nenhum registro encontrado - inicializar com valores padrão
            setChatbotData({
              system_instructions: "",
              system_message: "Você é um chatbot assistente de IA e atende respondendo com as diretivas e dados desta instrução e dos arquivos anexados à base de dados.",
              office_address: "",
              office_hours: "",
              specialties: "",
              chatbot_name: "Meu Chatbot",
              welcome_message: "",
              whatsapp: "",
              // Valores padrão para campos avançados
              formality_level: 50,
              use_emojis: false,
              memorize_user_name: false,
              paragraph_size: 50,
              main_topic: "",
              allowed_topics: [],
              source_strictness: 50,
              allow_internet_search: false,
              confidence_threshold: 70,
              fallback_action: 'human',
              response_time_promise: "",
              fallback_message: "",
              main_link: "",
              mandatory_link: false,
              uploaded_documents: [],
              uploaded_images: [],
              footer_message: "",
              mandatory_phrases: [],
              auto_link: false,
              max_list_items: 10,
              list_style: 'numbered',
              ask_for_name: false,
              name_usage_frequency: 30,
              remember_context: false,
              returning_user_greeting: "",
              response_speed: 50,
              debug_mode: false,
              chat_color: "#3b82f6",
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

  const handleChange = (field: string, value: string | number | boolean | string[]) => {
    setChatbotData(prevData => ({ ...prevData, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // CORREÇÃO: Remover .single() para evitar erro 406 quando não há registros
      const { data: existingData, error: fetchError } = await supabase
        .from("mychatbot")
        .select("id")
        .eq("chatbot_user", user.id);

      if (fetchError) {
        throw fetchError;
      }

      // Gerar system_message automaticamente baseado nos dados preenchidos
      const generatedSystemMessage = validateChatbotData(chatbotData) 
        ? generateSystemMessage(chatbotData)
        : chatbotData.system_message; // Manter o original se não houver dados suficientes

      const dataToSave = {
        ...chatbotData,
        system_message: generatedSystemMessage, // Substituir pelo gerado automaticamente
        chatbot_user: user.id,
        updated_at: new Date().toISOString(),
      };

      let supabaseError;

      // Verificar se há registros existentes
      if (existingData && existingData.length > 0) {
        const { error } = await supabase
          .from("mychatbot")
          .update(dataToSave)
          .eq("chatbot_user", user.id);
        supabaseError = error;
      } else {
        const { error } = await supabase
          .from("mychatbot")
          .insert({ ...dataToSave, created_at: new Date().toISOString() });
        supabaseError = error;
      }
      
      if (supabaseError) throw supabaseError;

      // Atualizar o estado local com o system_message gerado
      setChatbotData(prev => ({
        ...prev,
        system_message: generatedSystemMessage
      }));

      toast({
        title: "Sucesso!",
        description: "Configurações do chatbot salvas com system_message gerado automaticamente.",
      });
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

  const handleCancel = () => {
    // Função mantida para compatibilidade com AdvancedEditChatbotConfig
  };

  const handlePreviewSystemMessage = () => {
    setShowSystemMessagePreview(!showSystemMessagePreview);
  };

  // Gerar preview do system_message em tempo real
  const systemMessagePreview = validateChatbotData(chatbotData) 
    ? generateSystemMessage(chatbotData)
    : "Preencha pelo menos um campo para gerar o system_message automaticamente.";

  if (authLoading || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative overflow-hidden bg-theme-gradient min-h-screen">
      <BackgroundDecoration />
      
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-theme-gradient"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-2xl opacity-50"></div>
        <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-primary/8 rounded-full blur-xl opacity-40"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>
      
      <div className="container mx-auto py-10 px-4 relative z-10">
        <h1 className="text-center text-3xl md:text-4xl font-bold mb-8 gradient-text">Meu Chatbot</h1>
        
        {/* Botão para Preview do System Message */}
        <div className="mb-6 text-center">
          <button
            onClick={handlePreviewSystemMessage}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {showSystemMessagePreview ? 'Ocultar' : 'Visualizar'} System Message Gerado
          </button>
        </div>

        {/* Preview do System Message */}
        {showSystemMessagePreview && (
          <div className="mb-8 p-4 bg-background/50 backdrop-blur-sm rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">Preview do System Message:</h3>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded border max-h-96 overflow-y-auto">
              {systemMessagePreview}
            </pre>
            <p className="text-sm text-muted-foreground mt-2">
              💡 Este será o conteúdo gerado automaticamente para o campo "system_message" ao salvar.
            </p>
          </div>
        )}
        
        <AdvancedEditChatbotConfig
          chatbotData={chatbotData}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onCancel={handleCancel}
        />

      </div>
    </div>
  );
};

export default MyChatbotPage;
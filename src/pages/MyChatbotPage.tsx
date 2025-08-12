import React, { useEffect, useState, useCallback } from "react";
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
    system_message: "Você é um chatbot assistente de IA e atende respondendo com as diretivas e dados desta instrução e dos arquivos anexados à base de dados.",
    office_address: "",
    office_hours: "",
    specialties: "",
    chatbot_name: "Meu Chatbot",
    welcome_message: "",
    whatsapp: "",
    // Valores padrão dos novos campos
    formality_level: 50,
    use_emojis: false,
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
    chat_color: '#3b82f6',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSystemMessagePreview, setShowSystemMessagePreview] = useState(false);

  // Efeito para garantir que a página inicie no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Memoized function to fetch chatbot data
  const fetchChatbotData = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("mychatbot")
        .select("*")
        .eq("chatbot_user", user.id);

      if (error) {
        throw error;
      }

      // Verificar se há registros
      if (data && data.length > 0) {
        const record = data[0];
        setChatbotData({
          system_instructions: record.system_instructions || "",
          system_message: record.system_message || "Você é um chatbot assistente de IA e atende respondendo com as diretivas e dados desta instrução e dos arquivos anexados à base de dados.",
          office_address: record.office_address || "",
          office_hours: record.office_hours || "",
          specialties: record.specialties || "",
          chatbot_name: record.chatbot_name || "Meu Chatbot",
          welcome_message: record.welcome_message || "",
          whatsapp: record.whatsapp || "",
          // Campos avançados
          formality_level: record.formality_level ?? 50,
          use_emojis: record.use_emojis ?? false,
          paragraph_size: record.paragraph_size ?? 50,
          main_topic: record.main_topic || "",
          allowed_topics: record.allowed_topics || [],
          source_strictness: record.source_strictness ?? 50,
          allow_internet_search: record.allow_internet_search ?? false,
          confidence_threshold: record.confidence_threshold ?? 70,
          fallback_action: record.fallback_action || 'human',
          response_time_promise: record.response_time_promise || "",
          fallback_message: record.fallback_message || "",
          main_link: record.main_link || "",
          mandatory_link: record.mandatory_link ?? false,
          uploaded_documents: record.uploaded_documents || [],
          uploaded_images: record.uploaded_images || [],
          footer_message: record.footer_message || "",
          mandatory_phrases: record.mandatory_phrases || [],
          auto_link: record.auto_link ?? false,
          max_list_items: record.max_list_items ?? 10,
          list_style: record.list_style || 'numbered',
          ask_for_name: record.ask_for_name ?? false,
          name_usage_frequency: record.name_usage_frequency ?? 30,
          remember_context: record.remember_context ?? false,
          returning_user_greeting: record.returning_user_greeting || "",
          response_speed: record.response_speed ?? 50,
          debug_mode: record.debug_mode ?? false,
          chat_color: record.chat_color || "#3b82f6",
        });
      }
      // If no records found, keep default values already set in state
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
  }, [user?.id, toast]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
      return;
    }

    if (user) {
      fetchChatbotData();
    }
  }, [user, authLoading, navigate, fetchChatbotData]);

  const handleChange = useCallback((field: string, value: string | number | boolean | string[]) => {
    setChatbotData(prevData => ({ ...prevData, [field]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Usuário não autenticado.",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Check for existing records
      const { data: existingData, error: fetchError } = await supabase
        .from("mychatbot")
        .select("id")
        .eq("chatbot_user", user.id);

      if (fetchError) {
        throw fetchError;
      }

      // Generate system_message automatically based on filled data
      const generatedSystemMessage = validateChatbotData(chatbotData) 
        ? generateSystemMessage(chatbotData)
        : chatbotData.system_message;

      const dataToSave = {
        ...chatbotData,
        system_message: generatedSystemMessage,
        chatbot_user: user.id,
        updated_at: new Date().toISOString(),
      };

      // Update or insert based on existing records
      if (existingData && existingData.length > 0) {
        const { error } = await supabase
          .from("mychatbot")
          .update(dataToSave)
          .eq("chatbot_user", user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("mychatbot")
          .insert({ ...dataToSave, created_at: new Date().toISOString() });
        
        if (error) throw error;
      }

      // Update local state with generated system_message
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
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: `Não foi possível salvar as configurações do chatbot: ${errorMessage}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = useCallback(() => {
    // Function maintained for compatibility with AdvancedEditChatbotConfig
    // Could implement reset to original values if needed
  }, []);

  const handlePreviewSystemMessage = useCallback(() => {
    setShowSystemMessagePreview(prev => !prev);
  }, []);

  // Generate preview of system_message in real time
  const systemMessagePreview = validateChatbotData(chatbotData) 
    ? generateSystemMessage(chatbotData)
    : "Preencha pelo menos um campo para gerar o system_message automaticamente.";

  if (authLoading || isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null; // This should not happen due to navigation redirect, but good for safety
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
            type="button"
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
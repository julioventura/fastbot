import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BackgroundDecoration from "@/components/account/BackgroundDecoration";
import LoadingScreen from "@/components/account/LoadingScreen";
import AdvancedEditChatbotConfig from "@/components/chatbot/AdvancedEditChatbotConfig";
import DocumentUpload from "@/components/chatbot/DocumentUpload";

interface ChatbotData {
  system_message: string;
  office_address: string;
  office_hours: string;
  specialties: string;
  chatbot_name: string;
  welcome_message: string;
  whatsapp: string;
  // Novos campos do dashboard avançado
  formality_level?: number;
  use_emojis?: boolean;
  memorize_user_name?: boolean;
  paragraph_size?: number;
  main_topic?: string;
  allowed_topics?: string[];
  source_strictness?: number;
  allow_internet_search?: boolean;
  confidence_threshold?: number;
  fallback_action?: 'human' | 'search' | 'link';
  response_time_promise?: string;
  fallback_message?: string;
  main_link?: string;
  mandatory_link?: boolean;
  uploaded_documents?: string[];
  uploaded_images?: string[]; // NOVO: Array de imagens
  footer_message?: string; // NOVO: Rodapé das mensagens
  mandatory_phrases?: string[];
  auto_link?: boolean;
  max_list_items?: number;
  list_style?: 'numbered' | 'bullets' | 'simple';
  ask_for_name?: boolean;
  name_usage_frequency?: number;
  remember_context?: boolean;
  returning_user_greeting?: string;
  response_speed?: number;
  debug_mode?: boolean;
  chat_color?: string;
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
  const [activeTab, setActiveTab] = useState("view");

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
            .from("mychatbot_2")
            .select("*")
            .eq("chatbot_user", user.id);

          if (error) {
            throw error;
          }

          // Verificar se há registros
          if (data && data.length > 0) {
            setChatbotData({
              system_message: data[0].system_message || "",
              office_address: data[0].office_address || "",
              office_hours: data[0].office_hours || "",
              specialties: data[0].specialties || "",
              chatbot_name: data[0].chatbot_name || "",
              welcome_message: data[0].welcome_message || "",
              whatsapp: data[0].whatsapp || "",
            });
          } else {
            // Nenhum registro encontrado - inicializar com valores padrão
            setChatbotData({
              system_message: "Você é um chatbot assistente de IA e atende respondendo com as diretivas e dados desta instrução e dos arquivos anexados à base de dados.",
              office_address: "",
              office_hours: "",
              specialties: "",
              chatbot_name: "Meu Chatbot",
              welcome_message: "",
              whatsapp: "",
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
        .from("mychatbot_2")
        .select("id")
        .eq("chatbot_user", user.id);

      if (fetchError) {
        throw fetchError;
      }

      const dataToSave = {
        ...chatbotData,
        chatbot_user: user.id,
        updated_at: new Date().toISOString(),
      };

      let supabaseError;

      // Verificar se há registros existentes
      if (existingData && existingData.length > 0) {
        const { error } = await supabase
          .from("mychatbot_2")
          .update(dataToSave)
          .eq("chatbot_user", user.id);
        supabaseError = error;
      } else {
        const { error } = await supabase
          .from("mychatbot_2")
          .insert({ ...dataToSave, created_at: new Date().toISOString() });
        supabaseError = error;
      }
      
      if (supabaseError) throw supabaseError;

      toast({
        title: "Sucesso!",
        description: "Configurações do chatbot salvas.",
      });
      setActiveTab("view");
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
    setActiveTab("view");
  };

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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="view">
            <AdvancedEditChatbotConfig
              chatbotData={chatbotData}
              isSaving={isSaving}
              onSubmit={handleSubmit}
              onChange={handleChange}
              onCancel={handleCancel}
            />
          </TabsContent>
        </Tabs>

        
      </div>
    </div>
  );
};

export default MyChatbotPage;
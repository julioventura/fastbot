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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
    chatbot_name: "",
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
  const [showConfigModal, setShowConfigModal] = useState(false);

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
          chatbot_name: record.chatbot_name || "",
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

  // Verificar se o nome do chatbot foi preenchido após carregar os dados
  useEffect(() => {
    if (!isLoading && !chatbotData.chatbot_name?.trim()) {
      setShowConfigModal(true);
    }
  }, [isLoading, chatbotData.chatbot_name]);

  const handleNavigateToBaseDeDados = () => {
    setShowConfigModal(false);
    navigate("/base-de-dados");
  };

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
      console.log('💾 [MyChatbotPage] Iniciando salvamento do chatbot...', {
        userId: user.id,
        timestamp: new Date().toISOString(),
        dataFields: Object.keys(chatbotData)
      });

      // Generate system_message automatically based on filled data
      const generatedSystemMessage = validateChatbotData(chatbotData)
        ? generateSystemMessage(chatbotData)
        : "Você é um chatbot assistente de IA e atende respondendo com as diretivas e dados desta instrução e dos arquivos anexados à base de dados.";

      const currentTimestamp = new Date().toISOString();
      const dataToSave = {
        ...chatbotData,
        system_message: generatedSystemMessage,
        chatbot_user: user.id,
        updated_at: currentTimestamp,
      };

      console.log('📊 [MyChatbotPage] Dados preparados para salvamento:', {
        hasSystemMessage: !!generatedSystemMessage,
        systemMessageLength: generatedSystemMessage?.length || 0,
        chatbotUser: user.id,
        fieldsToSave: Object.keys(dataToSave)
      });

      // NOVA ABORDAGEM: Verificar explicitamente se existe e depois decidir
      console.log('🔍 [MyChatbotPage] Verificando existência de registro...');
      const { data: existingRecords, error: checkError } = await supabase
        .from("mychatbot")
        .select("id, created_at")
        .eq("chatbot_user", user.id);

      if (checkError) {
        console.error('❌ [MyChatbotPage] Erro ao verificar registros existentes:', checkError);
        throw checkError;
      }

      let operationResult;
      const recordExists = existingRecords && existingRecords.length > 0;

      console.log('📋 [MyChatbotPage] Status do registro:', {
        exists: recordExists,
        recordCount: existingRecords?.length || 0,
        existingId: recordExists ? existingRecords[0].id : null
      });

      if (recordExists) {
        // ATUALIZAR registro existente
        console.log('🔄 [MyChatbotPage] Atualizando registro existente...');
        const { data: updateData, error: updateError } = await supabase
          .from("mychatbot")
          .update(dataToSave)
          .eq("chatbot_user", user.id)
          .select();

        if (updateError) {
          console.error('❌ [MyChatbotPage] Erro no UPDATE:', updateError);
          throw updateError;
        }

        operationResult = { data: updateData, operation: 'UPDATE' };
      } else {
        // INSERIR novo registro
        console.log('➕ [MyChatbotPage] Inserindo novo registro...');
        // Removendo created_at explícito - deixar o banco gerenciar com DEFAULT NOW()
        const insertData = {
          ...dataToSave,
          // created_at será definido automaticamente pelo banco
        };

        const { data: insertResult, error: insertError } = await supabase
          .from("mychatbot")
          .insert(insertData)
          .select();

        if (insertError) {
          console.error('❌ [MyChatbotPage] Erro no INSERT:', insertError);

          // Se falhou no INSERT, pode ser race condition - tentar UPDATE como fallback
          if (insertError.message?.includes('duplicate') || insertError.message?.includes('unique') || insertError.code === '23505') {
            console.log('🔄 [MyChatbotPage] Race condition detectada! Tentando UPDATE como fallback...');

            const { data: fallbackData, error: fallbackError } = await supabase
              .from("mychatbot")
              .update(dataToSave)
              .eq("chatbot_user", user.id)
              .select();

            if (fallbackError) {
              console.error('❌ [MyChatbotPage] Erro no fallback UPDATE:', fallbackError);
              throw fallbackError;
            }

            operationResult = { data: fallbackData, operation: 'UPDATE_FALLBACK' };
            console.log('✅ [MyChatbotPage] Fallback UPDATE realizado com sucesso');
          } else {
            throw insertError;
          }
        } else {
          operationResult = { data: insertResult, operation: 'INSERT' };
        }
      }

      console.log('✅ [MyChatbotPage] Operação realizada com sucesso:', {
        operation: operationResult.operation,
        recordsAffected: operationResult.data?.length || 0,
        success: true
      });

      // Update local state with generated system_message
      setChatbotData(prev => ({
        ...prev,
        system_message: generatedSystemMessage
      }));

      toast({
        title: "SUCESSO",
        description: "Configurações salvas!",
      });

      console.log('🎉 [MyChatbotPage] Salvamento concluído com sucesso');

    } catch (error) {
      console.error("❌ [MyChatbotPage] Erro ao salvar dados do chatbot:", error);

      // Análise detalhada do erro para melhor debug
      const errorDetails = {
        type: typeof error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        userId: user?.id,
        timestamp: new Date().toISOString(),
        errorObject: error // Incluir o objeto completo para debug
      };

      console.error('📋 [MyChatbotPage] Detalhes do erro:', errorDetails);

      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      // Mensagem mais específica para diferentes tipos de erro
      let userMessage = `Não foi possível salvar as configurações do chatbot: ${errorMessage}`;

      // Verificar tipos específicos de erro
      if (errorMessage.includes('409') || errorMessage.includes('conflict') || errorMessage.includes('duplicate')) {
        userMessage = "Erro de conflito ao salvar (409). Aguarde alguns segundos e tente novamente.";
      } else if (errorMessage.includes('23505') || errorMessage.includes('unique_violation')) {
        userMessage = "Erro de violação de constraint única. Recarregue a página e tente novamente.";
      } else if (errorMessage.includes('permission') || errorMessage.includes('access')) {
        userMessage = "Erro de permissão. Verifique se você está logado corretamente.";
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (errorMessage.includes('timeout')) {
        userMessage = "Timeout na operação. Tente novamente em alguns segundos.";
      }

      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: userMessage,
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
    <div>
      <BackgroundDecoration />

      {/* <div className="absolute inset-0 z-0"> */}
      {/* <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl opacity-30"></div> */}
      {/* <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-2xl opacity-50"></div> */}
      {/* </div> */}

      {/* Botão para Preview do System Message */}
      <div >
        <AdvancedEditChatbotConfig
          chatbotData={chatbotData}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onCancel={handleCancel}
          showSystemMessagePreview={showSystemMessagePreview}
          onPreviewSystemMessage={handlePreviewSystemMessage}
          systemMessagePreview={systemMessagePreview}
          hideQRCode={!chatbotData.chatbot_name?.trim()} // Ocultar QR Code se o nome não estiver preenchido
        />


      </div>

      {/* Modal de Configuração */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">
              Configure seu Chatbot
            </DialogTitle>
            <DialogDescription className="text-center mt-4">
              Configure os dados do seu chatbot na seção "Meus Dados"
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleNavigateToBaseDeDados}
              className="px-8 py-2"
            >
              Configurar
            </Button>
          </div>
        </DialogContent>
      </Dialog>



    </div>
  );
};

export default MyChatbotPage;
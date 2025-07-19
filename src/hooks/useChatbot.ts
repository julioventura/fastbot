import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../lib/auth/useAuth';

interface ChatbotData {
  system_message: string;
  office_address: string;
  office_hours: string;
  specialties: string;
  chatbot_name: string;
  welcome_message: string;
  whatsapp: string;
}

interface SupabaseError {
  message: string;
  code?: string;
}

const RETRY_DELAY = 1000; // 1 segundo
const MAX_RETRIES = 3;

export const useChatbot = () => {
  const { user, initializing } = useAuth();
  const [chatbotData, setChatbotData] = useState<ChatbotData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchAttempted = useRef(false);
  const retryCount = useRef(0);

  const fetchChatbotData = useCallback(async (isRetry = false) => {
    if (!user?.id || initializing) return;

    if (!isRetry) {
      setLoading(true);
      setError(null);
      retryCount.current = 0;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('mychatbot_2')
        .select('*')
        .eq('chatbot_user', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Nenhum registro encontrado - criar um novo
          const newChatbot = {
            chatbot_user: user.id,
            system_message: '',
            office_address: '',
            office_hours: '',
            specialties: '',
            chatbot_name: '',
            welcome_message: '',
            whatsapp: '',
          };

          const { data: newData, error: insertError } = await supabase
            .from('mychatbot_2')
            .insert([newChatbot])
            .select()
            .single();

          if (insertError) throw insertError;
          setChatbotData(newData);
        } else {
          throw fetchError;
        }
      } else {
        setChatbotData(data);
      }

      retryCount.current = 0; // Reset retry count on success
    } catch (err: unknown) {
      const error = err as SupabaseError;
      console.error('Erro ao buscar dados do chatbot:', error);
      
      // Retry logic
      if (retryCount.current < MAX_RETRIES && !isRetry) {
        retryCount.current++;
        console.log(`Tentativa ${retryCount.current} de ${MAX_RETRIES} em ${RETRY_DELAY}ms`);
        
        setTimeout(() => {
          fetchChatbotData(true);
        }, RETRY_DELAY * retryCount.current); // Delay crescente
      } else {
        setError(error.message || 'Erro ao carregar dados do chatbot');
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  }, [user?.id, initializing]);

  const updateChatbotData = async (updates: Partial<ChatbotData>) => {
    if (!user?.id || !chatbotData) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('mychatbot_2')
        .update(updates)
        .eq('chatbot_user', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setChatbotData(data);
      return { success: true, error: null };
    } catch (err: unknown) {
      const error = err as SupabaseError;
      console.error('Erro ao atualizar chatbot:', error);
      setError(error.message || 'Erro ao salvar dados');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchAttempted.current && user?.id && !initializing) {
      fetchAttempted.current = true;
      fetchChatbotData();
    }
  }, [user?.id, initializing, fetchChatbotData]);

  // Reset quando user muda
  useEffect(() => {
    if (!user) {
      setChatbotData(null);
      setError(null);
      fetchAttempted.current = false;
    }
  }, [user]);

  return {
    chatbotData,
    loading,
    error,
    updateChatbotData,
    refetch: () => {
      fetchAttempted.current = false;
      fetchChatbotData();
    }
  };
};
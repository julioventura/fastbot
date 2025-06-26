import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth/useAuth';

export const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Verificar usando a função do banco
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error('Erro ao verificar status de admin:', error);
          // Fallback para verificação por email (compatibilidade)
          const emailBasedAdmin = user.email === 'dolescfo@gmail.com' ||
                                 user.email?.includes('@cirurgia.com.br');
          setIsAdmin(emailBasedAdmin);
        } else {
          setIsAdmin(data);
        }
      } catch (error) {
        console.error('Erro inesperado ao verificar admin:', error);
        // Fallback para verificação por email
        const emailBasedAdmin = user.email === 'dolescfo@gmail.com' ||
                               user.email?.includes('@cirurgia.com.br');
        setIsAdmin(emailBasedAdmin);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};

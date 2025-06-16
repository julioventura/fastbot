import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../lib/auth/useAuth';

interface Profile {
  id: string;
  name: string;
}

interface SupabaseError {
  message: string;
  code?: string;
}

export const useProfile = () => {
  const { user, initializing } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id || initializing) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Buscando perfil por profiles.id:', user.id);
      
      // Apenas BUSCAR o perfil - sem tentar criar
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar perfil:', fetchError);
        
        if (fetchError.code === 'PGRST116') {
          // Perfil não existe - usar dados temporários do auth
          console.log('Perfil não encontrado no banco, usando dados do auth');
          const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário';
          
          setProfile({ 
            id: user.id, 
            name: userName 
          });
          setError('Perfil não criado automaticamente ainda');
        } else {
          throw fetchError;
        }
      } else {
        console.log('Perfil encontrado:', data);
        setProfile(data);
      }
      
    } catch (err: unknown) {
      const error = err as SupabaseError;
      console.error('Erro ao buscar perfil:', error);
      
      // Fallback sempre funciona
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário';
      setProfile({ 
        id: user.id, 
        name: userName 
      });
      setError(error.message || 'Usando dados temporários do usuário');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email, user?.user_metadata?.name, initializing]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
};
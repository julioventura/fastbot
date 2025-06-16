import React, { useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import { AuthContextType, AuthResponse } from './authContextDefinition';
import { AuthContext } from './context';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('AuthProvider renderizando...'); // Debug
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Erro ao buscar sessão:', error);
          } else {
            setSession(session);
            setUser(session?.user ?? null);
          }
          setInitializing(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro inesperado ao buscar sessão:', error);
        if (mounted) {
          setInitializing(false);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          console.log('Auth state changed:', event, session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      const authError = error as AuthError;
      return { data: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) throw error;

      // Criar perfil se o usuário foi criado com sucesso
      if (data.user && !data.user.email_confirmed_at) {
        // Para usuários que precisam confirmar email, criamos perfil depois
        console.log('Usuário criado, aguardando confirmação de email');
      } else if (data.user) {
        // Usuário criado e confirmado, criar perfil imediatamente
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: data.user.id,  // CORREÇÃO: usar 'id' em vez de 'user_id'
              name: name,
            }
          ], {
            onConflict: 'id'  // CORREÇÃO: conflito por 'id' em vez de 'user_id'
          });

        if (profileError) {
          console.error('Erro ao criar perfil no signup:', profileError);
        }
      }

      return { data, error: null };
    } catch (error) {
      const authError = error as AuthError;
      return { data: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    initializing,
    signIn,
    signUp,
    signOut,
  };

  console.log('AuthProvider contexto value:', contextValue); // Debug

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

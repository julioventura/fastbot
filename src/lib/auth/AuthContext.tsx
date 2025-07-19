import React, { useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import { AuthContextType, AuthResponse } from './authContextDefinition';
import { AuthContext } from './context';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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
      console.log('Tentando fazer login com:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Resposta do login:', { data, error });
      
      if (error) {
        console.log('Erro detalhado do login:', error);
        throw error;
      }
      return { data, error: null };
    } catch (error) {
      const authError = error as AuthError;
      console.log('Erro capturado no signIn:', authError);
      return { data: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: { name?: string; whatsapp?: string }): Promise<AuthResponse> => {
    setLoading(true);
    try {
      console.log('Tentando criar conta para:', email);
      
      // Para desenvolvimento, usar localhost:8080 (porta configurada do Vite)
      // Para produção, usar window.location.origin
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: userData?.name || '',
            whatsapp: userData?.whatsapp || ''
          }
        }
      });

      console.log('Resposta do signUp:', { 
        data, 
        error,
        userConfirmed: data?.user?.email_confirmed_at,
        userCreated: data?.user?.created_at,
        redirectUrl
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      const authError = error as AuthError;
      console.log('Erro capturado no signUp:', authError);
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

  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      // Para desenvolvimento, usar localhost:8080 (porta configurada do Vite)
      // Para produção, usar window.location.origin
      const redirectUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:8081/#reset-password'
        : `${window.location.origin}/#reset-password`;
        
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      console.log('Reset password solicitado para:', email, 'Redirect URL:', redirectUrl);
      
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      return { error: authError };
    }
  };

  const resendConfirmation = async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      return { error: authError };
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
    resetPassword,
    resendConfirmation,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

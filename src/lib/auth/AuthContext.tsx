import React, { useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
// Importa o contexto e o tipo do novo arquivo de definição
import { AuthContext, AuthContextType } from "./authContextDefinition";
import type { User, Session, AuthError, SignUpWithPasswordCredentials, SignInWithPasswordCredentials } from '@supabase/supabase-js';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      }
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (credentials: SignUpWithPasswordCredentials): Promise<{ data: { user: User | null; session: Session | null }; error: AuthError | null }> => {
    const response = await supabase.auth.signUp(credentials);
    return response;
  };

  const signIn = async (credentials: SignInWithPasswordCredentials): Promise<{ data: { user: User | null; session: Session | null }; error: AuthError | null }> => {
    const response = await supabase.auth.signInWithPassword(credentials);
    return response;
  };

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    const response = await supabase.auth.signOut();
    return response;
  };

  const value: AuthContextType = {
    user,
    session,
    uuid: user?.id,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : null}
    </AuthContext.Provider>
  );
};

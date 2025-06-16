import { createContext } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';

// Interface para o valor do contexto
export interface AuthResponse {
  data: { user: User | null; session: Session | null } | null;
  error: AuthError | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initializing: boolean; // Novo estado para carregamento inicial
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, name: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}

// Inicialize e exporte o contexto
export const AuthContext = createContext<AuthContextType | null>(null);
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
  signUp: (email: string, password: string, userData?: { name?: string; whatsapp?: string }) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  resendConfirmation: (email: string) => Promise<{ error: AuthError | null }>;
}

// Inicialize e exporte o contexto
export const AuthContext = createContext<AuthContextType | null>(null);
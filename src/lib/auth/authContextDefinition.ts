import { createContext } from 'react';
import type { User, Session, AuthError, SignUpWithPasswordCredentials, SignInWithPasswordCredentials } from '@supabase/supabase-js';

// Interface para o valor do contexto
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  uuid: string | undefined;
  loading: boolean; // ADICIONAR ESTA LINHA
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<{ data: { user: User | null; session: Session | null }; error: AuthError | null }>;
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<{ data: { user: User | null; session: Session | null }; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

// Inicialize e exporte o contexto
export const AuthContext = createContext<AuthContextType | null>(null);
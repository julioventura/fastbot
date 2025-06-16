import { createContext } from 'react';
import { AuthContextType } from './authContextDefinition';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
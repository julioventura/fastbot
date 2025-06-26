import { createContext } from 'react';

export type ThemePalette = 
  | 'blue-dark'
  | 'blue-light'
  | 'purple-dark'
  | 'purple-light'
  | 'gray-dark'
  | 'gray-light';

export interface ThemeContextType {
  theme: ThemePalette;
  setTheme: (theme: ThemePalette) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

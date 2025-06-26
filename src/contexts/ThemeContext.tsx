import React, { useEffect, useState } from 'react';
import { ThemeContext, ThemePalette, ThemeContextType } from './theme-context';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemePalette>('blue-dark');

  // Carregar tema do localStorage na inicialização
  useEffect(() => {
    const savedTheme = localStorage.getItem('fastbot-theme') as ThemePalette;
    if (savedTheme && ['blue-dark', 'blue-light', 'purple-dark', 'purple-light', 'gray-dark', 'gray-light'].includes(savedTheme)) {
      console.log('🎨 Tema carregado do localStorage:', savedTheme);
      setThemeState(savedTheme);
    } else {
      console.log('🎨 Aplicando tema padrão:', 'blue-dark');
      // Aplicar tema padrão imediatamente
      const root = document.documentElement;
      root.classList.add('theme-blue-dark');
    }
  }, []);

  // Aplicar tema ao HTML e salvar no localStorage
  useEffect(() => {
    console.log('🎨 Aplicando tema:', theme);
    const root = document.documentElement;
    
    // Remover todas as classes de tema anteriores
    root.classList.remove('theme-blue-dark', 'theme-blue-light', 'theme-purple-dark', 'theme-purple-light', 'theme-gray-dark', 'theme-gray-light');
    
    // Adicionar a classe do tema atual
    root.classList.add(`theme-${theme}`);
    console.log('🎨 Classe aplicada ao HTML:', `theme-${theme}`);
    
    // Salvar no localStorage
    localStorage.setItem('fastbot-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemePalette) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const themes: ThemePalette[] = ['blue-dark', 'blue-light', 'purple-dark', 'purple-light', 'gray-dark', 'gray-light'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

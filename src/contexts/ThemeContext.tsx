import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type ThemePalette = 'blue-dark' | 'blue-light' | 'purple-dark' | 'purple-light' | 'gray-dark' | 'gray-light';

interface ThemeContextType {
  theme: ThemePalette;
  setTheme: (theme: ThemePalette) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemePalette>('blue-dark');
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Função para carregar tema do localStorage
  const loadThemeFromStorage = useCallback(() => {
    const savedTheme = localStorage.getItem('theme-preference') as ThemePalette;
    if (savedTheme && ['blue-dark', 'blue-light', 'purple-dark', 'purple-light', 'gray-dark', 'gray-light'].includes(savedTheme)) {
      console.log('🎨 Tema carregado do localStorage:', savedTheme);
      return savedTheme;
    }
    return 'blue-dark';
  }, []);

  // Função para carregar tema do perfil do usuário
  const loadThemeFromProfile = useCallback(async (userId: string) => {
    try {
      console.log('🔍 Carregando tema do perfil para usuário:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('theme_preference')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Erro ao carregar tema do perfil:', error);
        return loadThemeFromStorage();
      }

      if (data?.theme_preference) {
        console.log('✅ Tema carregado do perfil:', data.theme_preference);
        return data.theme_preference as ThemePalette;
      }

      return loadThemeFromStorage();
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar tema:', error);
      return loadThemeFromStorage();
    }
  }, [loadThemeFromStorage]);

  // Função para salvar tema no perfil
  const saveThemeToProfile = useCallback(async (userId: string, newTheme: ThemePalette) => {
    try {
      console.log('💾 Salvando tema no perfil:', { userId, newTheme });
      
      const { error } = await supabase
        .from('profiles')
        .update({ theme_preference: newTheme })
        .eq('id', userId);

      if (error) {
        console.error('❌ Erro ao salvar tema no perfil:', error);
      } else {
        console.log('✅ Tema salvo no perfil com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar tema:', error);
    }
  }, []);

  // Aplicar tema no CSS
  const applyTheme = useCallback((newTheme: ThemePalette) => {
    document.documentElement.setAttribute('data-theme', newTheme);
    console.log('🎨 Tema aplicado:', newTheme);
  }, []);

  // Função principal para definir tema
  const setTheme = useCallback(async (newTheme: ThemePalette) => {
    console.log('🔄 Mudando tema para:', newTheme);
    
    setThemeState(newTheme);
    applyTheme(newTheme);
    
    // Salvar no localStorage sempre
    localStorage.setItem('theme-preference', newTheme);
    
    // Salvar no perfil se usuário estiver logado
    if (currentUserId) {
      await saveThemeToProfile(currentUserId, newTheme);
    }
  }, [currentUserId, applyTheme, saveThemeToProfile]);

  // Monitorar mudanças na sessão do usuário
  useEffect(() => {
    let mounted = true;

    const initializeTheme = async () => {
      try {
        // Verificar sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;

        if (!mounted) return;

        setCurrentUserId(userId);

        let initialTheme: ThemePalette;

        if (userId) {
          // Usuário logado: carregar tema do perfil
          initialTheme = await loadThemeFromProfile(userId);
        } else {
          // Usuário não logado: carregar do localStorage
          initialTheme = loadThemeFromStorage();
        }

        setThemeState(initialTheme);
        applyTheme(initialTheme);
        setIsInitialized(true);

        console.log('🚀 Tema inicializado:', { userId, initialTheme });
      } catch (error) {
        console.error('❌ Erro na inicialização do tema:', error);
        const fallbackTheme = loadThemeFromStorage();
        setThemeState(fallbackTheme);
        applyTheme(fallbackTheme);
        setIsInitialized(true);
      }
    };

    // Inicializar tema
    initializeTheme();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const userId = session?.user?.id || null;
      console.log('🔐 Mudança na autenticação:', { event, userId });

      setCurrentUserId(userId);

      if (event === 'SIGNED_IN' && userId) {
        // Usuário fez login: carregar tema do perfil
        const profileTheme = await loadThemeFromProfile(userId);
        setThemeState(profileTheme);
        applyTheme(profileTheme);
      } else if (event === 'SIGNED_OUT') {
        // Usuário saiu: usar tema do localStorage
        const storageTheme = loadThemeFromStorage();
        setThemeState(storageTheme);
        applyTheme(storageTheme);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [loadThemeFromProfile, loadThemeFromStorage, applyTheme]);

  // Aplicar tema inicial no primeiro render
  useEffect(() => {
    if (!isInitialized) {
      const initialTheme = loadThemeFromStorage();
      applyTheme(initialTheme);
    }
  }, [isInitialized, loadThemeFromStorage, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

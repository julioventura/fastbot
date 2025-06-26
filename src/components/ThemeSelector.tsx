import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Palette, Moon, Sun, Sunset } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { ThemePalette } from '@/contexts/theme-context';

interface ThemeOption {
  id: ThemePalette;
  name: string;
  description: string;
  icon: React.ReactNode;
  preview: {
    primary: string;
    secondary: string;
    background: string;
  };
}

const themeOptions: ThemeOption[] = [
  {
    id: 'blue-dark',
    name: 'Azul modo escuro',
    description: 'Tema escuro com tons de azul',
    icon: <Moon className="h-4 w-4 text-blue-400" />,
    preview: {
      primary: '#3B82F6',
      secondary: '#1E293B',
      background: '#0F172A'
    }
  },
  {
    id: 'blue-light',
    name: 'Azul modo claro',
    description: 'Tema claro com tons de azul',
    icon: <Sun className="h-4 w-4 text-blue-600" />,
    preview: {
      primary: '#3B82F6',
      secondary: '#F1F5F9',
      background: '#FFFFFF'
    }
  },
  {
    id: 'purple-dark',
    name: 'Púrpura modo escuro',
    description: 'Tema escuro com tons de púrpura',
    icon: <Moon className="h-4 w-4 text-purple-400" />,
    preview: {
      primary: '#A855F7',
      secondary: '#2E1065',
      background: '#1E1B4B'
    }
  },
  {
    id: 'purple-light',
    name: 'Púrpura modo claro',
    description: 'Tema claro com tons de púrpura',
    icon: <Sun className="h-4 w-4 text-purple-600" />,
    preview: {
      primary: '#A855F7',
      secondary: '#FAF5FF',
      background: '#FFFFFF'
    }
  },
  {
    id: 'gray-dark',
    name: 'Cinza modo escuro',
    description: 'Tema escuro com tons de cinza',
    icon: <Moon className="h-4 w-4 text-gray-400" />,
    preview: {
      primary: '#F8FAFC',
      secondary: '#374151',
      background: '#111827'
    }
  },
  {
    id: 'gray-light',
    name: 'Cinza modo claro',
    description: 'Tema claro com tons de cinza',
    icon: <Sun className="h-4 w-4 text-gray-600" />,
    preview: {
      primary: '#1F2937',
      secondary: '#F9FAFB',
      background: '#FFFFFF'
    }
  }
];

interface ThemeSelectorProps {
  children?: React.ReactNode;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ children }) => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: ThemePalette) => {
    setTheme(newTheme);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Palette className="h-4 w-4 mr-2" />
            Configurar tema
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Escolha seu tema
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {themeOptions.map((option) => (
            <div
              key={option.id}
              className={`
                relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105
                ${theme === option.id 
                  ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50'
                }
              `}
              onClick={() => handleThemeChange(option.id)}
            >
              {/* Preview visual do tema */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex gap-1">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: option.preview.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: option.preview.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: option.preview.background }}
                  />
                </div>
                {option.icon}
              </div>
              
              {/* Informações do tema */}
              <div className="space-y-1">
                <h3 className="font-medium text-foreground">{option.name}</h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              
              {/* Indicador de seleção */}
              {theme === option.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSelector;

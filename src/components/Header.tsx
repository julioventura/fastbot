import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from "@/lib/auth/useAuth";
import { NavLink } from 'react-router-dom';
import ThemeSelector from '@/components/ThemeSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, MessageSquare, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState("up");
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? "down" : "up";

      if (direction !== scrollDirection &&
        (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10) &&
        scrollY > 20) {
        setScrollDirection(direction);
      }
      setLastScrollY(scrollY);
    };

    window.addEventListener("scroll", updateScrollDirection, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollDirection);
  }, [scrollDirection, lastScrollY]);

  return scrollDirection;
};

const Header = () => {
  const scrollDirection = useScrollDirection();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup" | "reset">("login");
  const { user, signOut, loading: authLoading } = useAuth();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id) // Corrigido: coluna correta é 'id'
            .maybeSingle();

          if (error) {
            console.error('Erro na consulta de perfil:', error);
            setUserName(user.email?.split('@')[0] || 'Usuário');
            return;
          }

          if (data?.name) {
            setUserName(data.name);
          } else {
            setUserName(user.email?.split('@')[0] || 'Usuário');
          }
        } catch (error) {
          console.error('Erro ao buscar nome do usuário:', error);
          setUserName(user.email?.split('@')[0] || 'Usuário');
        }
      } else {
        setUserName("");
      }
    };

    fetchUserName();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUserName("");
      window.location.href = '/';
    } catch (error) {
      console.error("Erro durante o processo de saída:", error);
      setUserName("");
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <header className={`header-modern sticky transition-transform duration-300 ease-in-out ${scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"} top-0 z-50 shadow-sm bg-background/95 backdrop-blur-md border-b border-border`}>
      
      <div className="container mx-auto px-4 h-16 md:h-20">
        <div className="flex items-center justify-between h-full">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center space-x-2 group">
              <div>
                <span className="text-lg text-primary/90 font-bold -mt-1">
                  Dentistas.com.br /&nbsp;
                </span>
                <span className="text-2xl md:text-3xl font-black text-primary group-hover:text-primary/95 transition-colors">
                  Ana
                </span>
              </div>
            </NavLink>
          </div>

          {/* Navigation Menu - Center */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) => 
                `transition-all duration-300 text-base leading-none flex items-center ${
                  isActive 
                    ? "text-primary nav-active-item" 
                    : "text-muted-foreground hover:text-primary font-medium"
                }`
              }
              style={({ isActive }) => 
                isActive ? { fontWeight: '950' } : {}
              }
            >
              Início
            </NavLink>
            
            {user && (
              <>
                <NavLink
                  to="/account"
                  className={({ isActive }) => 
                    `transition-all duration-300 text-base leading-none flex items-center ${
                      isActive 
                        ? "text-primary nav-active-item" 
                        : "text-muted-foreground hover:text-primary font-medium"
                    }`
                  }
                  style={({ isActive }) => 
                    isActive ? { fontWeight: '950' } : {}
                  }
                >
                  Minha Conta
                </NavLink>
                <NavLink
                  to="/my-chatbot"
                  className={({ isActive }) => 
                    `transition-all duration-300 text-base leading-none flex items-center ${
                      isActive 
                        ? "text-primary nav-active-item" 
                        : "text-muted-foreground hover:text-primary font-medium"
                    }`
                  }
                  style={({ isActive }) => 
                    isActive ? { fontWeight: '950' } : {}
                  }
                >
                  Meu Chatbot
                </NavLink>
              </>
            )}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">

            <ThemeSelector />
            
            {authLoading ? (
              <div className="text-muted-foreground text-sm">Carregando...</div>
            ) : !user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setAuthModalTab("login");
                    setIsAuthModalOpen(true);
                  }}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => {
                    setAuthModalTab("signup");
                    setIsAuthModalOpen(true);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full font-medium shadow-sm"
                >
                  Cadastre-se GRÁTIS
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">{userName || user.email}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-lg">
                  <DropdownMenuItem asChild>
                    <NavLink to="/account" className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:bg-primary/10 hover:text-primary">
                      <User className="h-4 w-4" />
                      <span>Minha Conta</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink to="/my-chatbot" className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:bg-primary/10 hover:text-primary">
                      <MessageSquare className="h-4 w-4" />
                      <span>Meu Chatbot</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-3 py-2 text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        key={authModalTab}
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        defaultTab={authModalTab}
      />
    </header>
  );
};

export default Header;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from "@/lib/auth/useAuth";
import { NavLink } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, MessageSquare, ChevronDown, Home, Menu, X, History, Database, Settings } from 'lucide-react';
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
  // Configuração do comportamento do header
  // true = header sempre fixo no topo
  // false = header se esconde quando rola para baixo
  const header_fixo = true;

  const scrollDirection = useScrollDirection();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup" | "reset">("login");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
            // Extrair apenas o primeiro nome
            const firstName = data.name.split(' ')[0];
            setUserName(firstName);
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
      window.location.href = '/fastbot/';
    } catch (error) {
      console.error("Erro durante o processo de saída:", error);
      setUserName("");
      localStorage.clear();
      window.location.href = '/fastbot/';
    }
  };

  return (
    <header
      className={`header-modern sticky top-0 z-50 shadow-sm bg-background/95 backdrop-blur-md border-b border-border ${header_fixo
        ? 'transform-none' // Header fixo - garante que não há transformações
        : `transition-transform duration-300 ease-in-out ${scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"}` // Header com auto-hide
        }`}
      style={header_fixo ? { transform: 'none !important' } : {}}
    >      <div className="container mx-auto px-4 h-16 md:h-20">
        <div className="flex items-center justify-between h-full">

          {/* Logo Section */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center space-x-2 group">
              <div className="text-blue-500 hover:text-yellow-300">
                <span className="text-xs md:text-sm  font-bold -mt-1">
                  Dentistas.com.br /&nbsp;
                </span>
                <span className="text-lg md:text-xl font-black">
                  Fastbot
                </span>
              </div>
            </NavLink>
          </div>

          {/* Navigation Menu - Center - Desktop Only */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* <NavLink
              to="/"
              className={({ isActive }) =>
                `transition-all duration-300 text-base leading-none flex items-center ${isActive
                  ? "text-white nav-active-item"
                  : "text-muted-foreground hover:text-primary font-medium"
                }`
              }
              style={({ isActive }) =>
                isActive ? { fontWeight: '950' } : {}
              }
            >
              Início
            </NavLink> */}

            {user && (
              <>
                <NavLink
                  to="/my-chatbot"
                  className={({ isActive }) =>
                    `transition-all duration-300 text-base leading-none flex items-center ${isActive
                      ? "text-white nav-active-item"
                      : "hover-glow-yellow p-3 rounded-sm text-muted-foreground hover:text-white hover:border-1 hover:border-primary hover:bg-primary/90 font-medium"
                    }`
                  }
                  style={({ isActive }) =>
                    isActive ? { fontWeight: '950' } : {}
                  }
                >
                  Meu Chatbot
                </NavLink>

                {/* <NavLink
                  to="/configure"
                  className={({ isActive }) =>
                    `transition-all duration-300 text-base leading-none flex items-center ${isActive
                      ? "text-white nav-active-item"
                      : "text-muted-foreground hover:text-primary font-medium"
                    }`
                  }
                  style={({ isActive }) =>
                    isActive ? { fontWeight: '950' } : {}
                  }
                >
                  Configuração
                </NavLink> */}

                <NavLink
                  to="/base-de-dados"
                  className={({ isActive }) =>
                    `transition-all duration-300 text-base leading-none flex items-center ${isActive
                      ? "text-white nav-active-item"
                      : "hover-glow-yellow p-3 rounded-sm text-muted-foreground hover:text-white hover:border-1 hover:border-primary hover:bg-primary/90 font-medium"
                    }`
                  }
                  style={({ isActive }) =>
                    isActive ? { fontWeight: '950' } : {}
                  }
                >
                  Configuração
                </NavLink>

                {/* <NavLink
                  to="/conversation-history"
                  className={({ isActive }) =>
                    `transition-all duration-300 text-base leading-none flex items-center ${isActive
                      ? "text-white nav-active-item"
                      : "text-muted-foreground hover:text-white  font-medium"
                    }`
                  }
                  style={({ isActive }) =>
                    isActive ? { fontWeight: '950' } : {}
                  }
                >
                  Minhas Conversas
                </NavLink> */}

              </>
            )}
          </nav>

          {/* Mobile Menu Button - Mobile Only */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Auth Section - Desktop Only */}
          <div className="hidden md:flex items-center space-x-4">

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
                  className="hover-glow-green bg-green-700 hover:bg-green-500 text-white px-6 py-2 rounded-full font-medium shadow-sm"

                >
                  Entrar
                </Button>
                <Button
                  onClick={() => {
                    setAuthModalTab("signup");
                    setIsAuthModalOpen(true);
                  }}
                  className="hover-glow-blue bg-blue-700 hover:bg-blue-500 text-primary-foreground px-6 py-2 rounded-full font-medium shadow-sm"
                >
                  Cadastre-se GRÁTIS
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hover-glow-yellow flex items-center space-x-2 text-muted-foreground hover:text-white hover:bg-primary/90">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">{userName || user.email}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-lg">

                  <DropdownMenuItem asChild>
                    <NavLink to="/" className="flex items-center space-x-2 px-3 py-2 text-foreground hover:bg-blue-950 hover:text-white">
                      <Home className="h-4 w-4" />
                      <span>Início</span>
                    </NavLink>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border" />

                  <DropdownMenuItem asChild>
                    <NavLink to="/my-chatbot"
                      className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Meu Chatbot</span>
                    </NavLink>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border" />

                  <DropdownMenuItem asChild>
                    <NavLink to="/base-de-dados" className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:bg-primary/10 hover:text-primary">
                      <Database className="h-4 w-4" />
                      <span>Configuração</span>
                    </NavLink>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border" />

                  <DropdownMenuItem asChild>
                    <NavLink to="/conversation-history" className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:bg-primary/10 hover:text-primary">
                      <History className="h-4 w-4" />
                      <span>Minhas Conversas</span>
                    </NavLink>
                  </DropdownMenuItem>

                  {/* <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuSeparator className="bg-border" /> */}
                  <DropdownMenuSeparator className="bg-border" />

                  <DropdownMenuItem asChild>
                    <NavLink to="/account" className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:bg-primary/10 hover:text-primary">
                      <User className="h-4 w-4" />
                      <span>Minha Conta</span>
                    </NavLink>
                  </DropdownMenuItem>


                  <DropdownMenuSeparator className="bg-border" />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-3 py-2 text-foreground hover:bg-destructive/10 hover:text-red-700 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile Menu - Mobile Only */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-lg">
            <div className="container mx-auto px-4 py-4 space-y-4">

              {/* Navigation Links */}
              <div className="space-y-2">
                <NavLink
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded-lg transition-all duration-300 ${isActive
                      ? "bg-primary/20 text-primary font-bold"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                    }`
                  }
                >
                  Início
                </NavLink>

                {user && (
                  <>
                    <NavLink
                      to="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block py-2 px-4 rounded-lg transition-all duration-300 ${isActive
                          ? "bg-primary/20 text-primary font-bold"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        }`
                      }
                    >
                      Minha Conta
                    </NavLink>
                    <NavLink
                      to="/my-chatbot"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block py-2 px-4 rounded-lg transition-all duration-300 ${isActive
                          ? "bg-primary/20 text-primary font-bold"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        }`
                      }
                    >
                      Meu Chatbot
                    </NavLink>

                    <NavLink
                      to="/base-de-dados"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block py-2 px-4 rounded-lg transition-all duration-300 ${isActive
                          ? "bg-primary/20 text-primary font-bold"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        }`
                      }
                    >
                      Configuração
                    </NavLink>

                    <NavLink
                      to="/conversation-history"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block py-2 px-4 rounded-lg transition-all duration-300 ${isActive
                          ? "bg-primary/20 text-primary font-bold"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        }`
                      }
                    >
                      Histórico de Conversas
                    </NavLink>
                  </>
                )}
              </div>

              {/* Auth Buttons */}
              <div className="border-t border-border pt-4 space-y-2">
                {!user ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setAuthModalTab("login");
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                      Entrar
                    </Button>
                    <Button
                      onClick={() => {
                        setAuthModalTab("signup");
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium"
                    >
                      Cadastre-se GRÁTIS
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border">
                      {userName || user.email}
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50/10"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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

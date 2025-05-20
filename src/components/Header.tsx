import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/lib/auth/AuthContext';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Custom hook to track scroll direction
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
    return () => {
      window.removeEventListener("scroll", updateScrollDirection);
    };
  }, [scrollDirection, lastScrollY]);

  return scrollDirection;
};

const Header = () => {
  const scrollDirection = useScrollDirection();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('name')
            .eq('user_id', user.id)
            .single();

          if (data && data.name) {
            setUserName(data.name);
          } else {
            // Usa o email como fallback se não tiver nome
            const emailName = user.email?.split('@')[0] || "";
            setUserName(emailName);
          }
        } catch (error) {
          console.error("Erro ao buscar nome do usuário:", error);
          // Usa o email como fallback se houver erro
          const emailName = user.email?.split('@')[0] || "";
          setUserName(emailName);
        }
      } else {
        setUserName("");
      }
    };

    fetchUserName();
  }, [user]);

  // Função para truncar o nome se for maior que 10 caracteres
  const firstLetter = (name: string) => {
    if (name.length <= 10) return name;
    return name.substring(0, 10) + "...";
  };

  const handleSignOut = async () => {
    try {
      // Tente limpar o estado do cliente primeiro, independentemente da resposta do servidor
      // Isso garante que limpamos a sessão local mesmo que o servidor rejeite a solicitação

      // 1. Limpar quaisquer tokens remanescentes do Supabase no localStorage
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      }

      // 2. Use o signOut do contexto de autenticação, se disponível (deve limpar o estado do contexto)
      if (typeof signOut === 'function') {
        try {
          await signOut();
        } catch (contextError) {
          console.log("Erro no signOut do contexto, continuando a limpeza:", contextError);
        }
      }

      // 3. Agora tente o signout do Supabase (pode falhar com 403, mas já limpamos)
      try {
        await supabase.auth.signOut();
      } catch (supabaseError) {
        console.log("Erro no signOut do Supabase (esperado se a sessão for inválida):", supabaseError);
      }

      // 4. Redefinir o estado local do componente
      setUserName("");

      // 5. Forçar um recarregamento completo para garantir que todo o estado seja limpo
      window.location.href = '/';

    } catch (error) {
      console.error("Erro durante o processo de saída:", error);

      // Mesmo em caso de erro fatal, tente forçar um estado limpo
      setUserName("");
      localStorage.clear(); // Limpeza mais agressiva
      window.location.href = '/';
    }
  };

  return (
    <div className='bg-black'>
      <header
        className={`sticky transition-transform duration-300 ease-in-out ${scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
          } top-0 z-50 bg-gradient-to-r from-[#0a1629] to-[#0e2d5e] backdrop-blur-md border-b border-[#2a4980]/40 shadow-lg shadow-[#0063F7]/10`}
        style={{ backgroundColor: '#000' }} // Fallback for any transparency or gaps
      >
        {/* Glowing wireframe grid overlay */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="w-full h-full grid grid-cols-12">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="border-l border-[#4f9bff]/30"></div>
            ))}
          </div>
        </div>

        <div className="container relative z-10 mx-auto px-4 flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2 group">
              <span className="font-bold text-2xl text-white 
              [text-shadow:0_0_8px_#4f9bff,0_0_20px_rgba(0,99,247,0.8)]
              group-hover:text-[#4f9bff] 
              group-hover:[text-shadow:0_0_12px_#4f9bff,0_0_25px_rgba(0,99,247,0.9)]
              transition-all duration-300">
                FastBot
              </span>
            </a>
          </div>

          <nav className="hidden md:flex items-center space-x-8">

            <Link
              to="/"
              className="text-sm font-medium text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all"
            >
              Início
            </Link>

            {/* Novo link para a página de Recursos */}
            <Link
              to="/features"
              className="text-sm font-medium text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all"
            >
              Recursos
            </Link>

            {/* Link atualizado para a página de Preços */}
            <Link
              to="/pricing"
              className="text-sm font-medium text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all"
            >
              Preços
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-[#4f9bff]/80 text-white bg-[#0a1629]/70 hover:bg-[#4f9bff]/20 hover:border-[#4f9bff] hover:drop-shadow-[0_0_10px_rgba(79,155,255,0.5)] transition-all"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Minha conta
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-[#0a1629] border-2 border-[#4f9bff] shadow-lg rounded-lg p-1"
                >
                  <DropdownMenuItem
                    className="rounded-md px-4 py-2 text-white font-medium bg-transparent hover:bg-[#2563eb]/80 hover:text-white focus:bg-[#2563eb] focus:text-white transition-colors"
                    asChild
                  >
                    <Link to="/account">Minha conta</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-md px-4 py-2 text-white font-medium bg-transparent hover:bg-[#2563eb]/80 hover:text-white focus:bg-[#2563eb] focus:text-white transition-colors"
                    onSelect={(e) => {
                      e.preventDefault();
                      handleSignOut();
                    }}
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="hidden md:inline-flex border-[#4f9bff]/80 text-white bg-[#0a1629]/70 hover:bg-[#4f9bff]/20 hover:border-[#4f9bff] hover:drop-shadow-[0_0_10px_rgba(79,155,255,0.5)] transition-all"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Entrar
                </Button>
                <Button
                  className="bg-[#3b82f6] hover:bg-[#4f9bff] text-white drop-shadow-[0_0_10px_rgba(79,155,255,0.3)] hover:drop-shadow-[0_0_15px_rgba(79,155,255,0.5)] transition-all"
                  onClick={() => {
                    setIsAuthModalOpen(true);
                  }}
                >
                  Cadastre-se
                </Button>
              </>
            )}

            {user && (
              <div
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#3b82f6] border-2 border-[#4f9bff] shadow-[0_0_10px_rgba(79,155,255,0.3)] ml-2"
                title={userName}
              >
                <span className="text-white font-bold text-lg select-none">
                  {firstLetter(userName)[0]?.toUpperCase()}
                </span>
              </div>
            )}

          </div>


        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
        />
      </header>
    </div>
  );
};

export default Header;

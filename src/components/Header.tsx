import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/lib/auth/AuthContext';
import { Link, NavLink } from 'react-router-dom'; // Certifique-se que NavLink está importado se for usar para active states
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Bot, Coins } from 'lucide-react'; // Certifique-se que LogOut está importado
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

  // Função para truncar o nome mantendo palavras iniciais inteiras que caibam no limite
  const truncate = (name: string): string => {
    const limit = 15; // Limite máximo de caracteres para a parte do texto

    if (!name) {
      return ""; // Retorna string vazia se o nome for nulo ou indefinido
    }

    const trimmedName = name.trim(); // Remove espaços extras no início e fim

    // Se o nome ajustado (sem espaços extras) já é curto o suficiente, retorna ele
    if (trimmedName.length <= limit) {
      return trimmedName;
    }

    // O nome é mais longo que o limite, então "..." provavelmente será necessário.
    const words = trimmedName.split(/\s+/); // Divide o nome em palavras, tratando múltiplos espaços

    // Caso especial: se não houver palavras após o trim (improvável se trimmedName não for vazio)
    if (words.length === 0) {
      return "";
    }

    // Caso especial: a primeira palavra sozinha já é muito longa
    if (words[0].length > limit) {
      // Trunca a primeira palavra para caber com "..."
      const cutLength = limit - 3; // Deixa espaço para "..."
      if (cutLength < 1) {
        // Se não há espaço nem para um caractere + "...", apenas corta o nome original no limite
        return trimmedName.substring(0, limit);
      }
      return words[0].substring(0, cutLength) + "...";
    }

    let textPart = "";
    for (const word of words) {
      const potentialTextPart = textPart + (textPart ? " " : "") + word;
      if (potentialTextPart.length <= limit) {
        textPart = potentialTextPart; // Adiciona a palavra se ainda couber
      } else {
        // Adicionar esta palavra excederia o limite.
        // `textPart` já contém a maior string de palavras inteiras que cabe.
        break;
      }
    }

    // Reconstrói o nome completo normalizado para comparação
    const normalizedFullName = words.join(" ");

    if (textPart.length < normalizedFullName.length) {
      // Se `textPart` é mais curto que o nome completo normalizado,
      // significa que nem todas as palavras couberam. Adiciona "...".
      return textPart;
    } else {
      // `textPart` é o nome completo normalizado e já sabemos que `textPart.length <= limit`.
      // Isso significa que o conteúdo inteiro cabe dentro do limite.
      return textPart;
    }
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
            <NavLink
              to="/"
              className={({ isActive }) => `text-sm font-medium ${isActive ? "text-white drop-shadow-[0_0_8px_rgba(79,155,255,0.7)]" : "text-gray-300"} hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all`}
            >
              Início
            </NavLink>


            {!user && ( // Mostrar apenas se o usuário NÃO estiver logado
              <NavLink
                to="/features"
                className={({ isActive }) => `text-sm font-medium ${isActive ? "text-white drop-shadow-[0_0_8px_rgba(79,155,255,0.7)]" : "text-gray-300"} hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all`}
              >
                Recursos
              </NavLink>
            )}


            {!user && ( // Mostrar apenas se o usuário NÃO estiver logado
              <NavLink
                to="/pricing"
                className={({ isActive }) => `text-sm font-medium ${isActive ? "text-white drop-shadow-[0_0_8px_rgba(79,155,255,0.7)]" : "text-gray-300"} hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all`}
              >
                Preços
              </NavLink>
            )}


            {user && ( // Mostrar apenas se o usuário estiver logado
              <NavLink
                to="/my-chatbot"
                className={({ isActive }) => `text-sm font-medium ${isActive ? "text-white drop-shadow-[0_0_8px_rgba(79,155,255,0.7)]" : "text-gray-300"} hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all`}
              >
                Meu Chatbot
              </NavLink>
            )}

          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-[#4f9bff]/80 text-white bg-[#0a1629]/70 hover:bg-blue-400 hover:border-[#4f9bff]  transition-all px-3 py-2 rounded-md"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {/* Usando userName do estado para exibir o nome truncado ou o email */}
                    <span className="hidden sm:inline">{truncate(userName)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-[#0a1629] border-2 border-[#2a4980]/80 shadow-xl rounded-lg p-1 backdrop-blur-sm" // Ajustado border e adicionado backdrop-blur
                >
                  <DropdownMenuItem
                    className="cursor-pointer rounded-md px-3 py-2 text-gray-200 hover:!bg-[#2a4980]/70 hover:!text-white focus:!bg-[#2a4980]/70 focus:!text-white transition-colors flex items-center"
                    asChild
                  >
                    <Link to="/account">
                      <User className="mr-3 h-6 w-6" />
                      Minha Conta
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer rounded-md px-3 py-2 text-gray-200 hover:!bg-[#2a4980]/70 hover:!text-white focus:!bg-[#2a4980]/70 focus:!text-white transition-colors flex items-center"
                    asChild
                  >
                    <Link to="/my-chatbot">
                    <Coins className="mr-3 h-6 w-6" />
                      Meu Créditos
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer rounded-md px-3 py-2 text-red-400 hover:!bg-[#2a4980]/70 hover:!text-red-300 focus:!bg-[#2a4980]/70 focus:!text-red-300 transition-colors flex items-center"
                  >
                    <LogOut className="mr-3 h-6 w-6" />
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

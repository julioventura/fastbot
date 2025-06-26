// Componente: Header
// Funcionalidade:
// Este componente renderiza o cabeçalho da aplicação. Ele é fixo no topo da página
// e possui um comportamento retrátil que o esconde ao rolar a página para baixo e
// o exibe ao rolar para cima. Inclui o logo, links de navegação (que mudam
// dependendo do estado de autenticação do usuário), e botões de ação como
// "Entrar", "Cadastre-se" ou um menu dropdown para usuários logados com opções
// como "Minha Conta", "Meus Créditos" e "Sair".
// Utiliza um modal para autenticação (AuthModal).

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from "@/lib/auth/useAuth";
import { Link, NavLink } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Bot, Coins, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '../hooks/useProfile';
import { useIsAdmin } from '../hooks/useIsAdmin';

// Custom Hook: useScrollDirection
// Determina a direção do scroll da página (para cima ou para baixo).
// Utilizado para controlar a visibilidade retrátil do Header.
const useScrollDirection = () => {
  // scrollDirection: Estado que armazena a direção atual do scroll ('up' ou 'down').
  const [scrollDirection, setScrollDirection] = useState("up");

  // lastScrollY: Estado que armazena a última posição vertical do scroll conhecida.
  const [lastScrollY, setLastScrollY] = useState(0);


  // useEffect para adicionar e limpar o event listener de scroll.
  // Atualiza a direção do scroll com base na comparação da posição atual com a anterior.
  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset; // Posição vertical atual do scroll.
      const direction = scrollY > lastScrollY ? "down" : "up"; // Determina a direção.

      // Condições para atualizar a direção:
      // 1. A direção mudou.
      // 2. Houve um movimento significativo (mais de 10 pixels).
      // 3. O scroll não está no topo absoluto da página (scrollY > 20).
      if (direction !== scrollDirection &&
        (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10) &&
        scrollY > 20) {
        setScrollDirection(direction);
      }
      setLastScrollY(scrollY); // Atualiza a última posição conhecida.
    };

    // Adiciona o event listener ao montar o componente.
    // 'passive: true' melhora a performance de scroll.
    window.addEventListener("scroll", updateScrollDirection, { passive: true });

    // Remove o event listener ao desmontar o componente para evitar memory leaks.
    return () => {
      window.removeEventListener("scroll", updateScrollDirection);
    };
  }, [scrollDirection, lastScrollY]); // Dependências do useEffect.

  return scrollDirection; // Retorna a direção atual do scroll.
};


// Componente Header
// Renderiza o cabeçalho principal da aplicação.
const Header = () => {
  // scrollDirection: Obtém a direção atual do scroll da página.
  const scrollDirection = useScrollDirection();

  // isAuthModalOpen: Estado para controlar a visibilidade do modal de autenticação.
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup" | "reset">("login");

  // user: Objeto do usuário autenticado.
  // signOut: Função para deslogar o usuário.
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error } = useProfile();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  // userName: Estado para armazenar o nome do usuário a ser exibido.
  const [userName, setUserName] = useState("");

  // useEffect para buscar o nome do perfil do usuário.
  // Executado quando o objeto 'user' (do contexto de autenticação) muda.
  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id) // CORREÇÃO: usar 'id' em vez de 'user_id'
            .single();

          if (data && data.name) {
            setUserName(data.name);
          } else {
            const emailName = user.email?.split('@')[0] || "";
            setUserName(emailName);
          }
        } catch (error) {
          console.error("Erro ao buscar nome do usuário:", error);
          const emailName = user.email?.split('@')[0] || "";
          setUserName(emailName);
        }
      } else {
        setUserName("");
      }
    };

    fetchUserName();
  }, [user]);


  // --- Função truncate ---
  // Trunca uma string (nome do usuário) para um limite de caracteres especificado.
  // Tenta manter palavras iniciais inteiras e adiciona "..." se o nome for truncado.
  const truncate = (name: string): string => {
    const limit = 15; // Limite máximo de caracteres para a parte do texto.

    if (!name) {
      return ""; // Retorna string vazia se o nome for nulo ou indefinido.
    }

    const trimmedName = name.trim(); // Remove espaços extras no início e fim.

    // Se o nome ajustado já é curto o suficiente, retorna ele.
    if (trimmedName.length <= limit) {
      return trimmedName;
    }

    // O nome é mais longo que o limite.
    const words = trimmedName.split(/\s+/); // Divide o nome em palavras.

    if (words.length === 0) {
      return ""; // Caso improvável após trim.
    }

    // Caso especial: a primeira palavra sozinha já é muito longa.
    if (words[0].length > limit) {
      const cutLength = limit - 3; // Deixa espaço para "...".
      if (cutLength < 1) {
        return trimmedName.substring(0, limit); // Corta no limite se não houver espaço.
      }
      return words[0].substring(0, cutLength) + "...";
    }

    let textPart = "";
    for (const word of words) {
      const potentialTextPart = textPart + (textPart ? " " : "") + word;
      if (potentialTextPart.length <= limit) {
        textPart = potentialTextPart; // Adiciona a palavra se ainda couber.
      } else {
        break; // Adicionar esta palavra excederia o limite.
      }
    }

    const normalizedFullName = words.join(" ");

    // Adiciona "..." apenas se o texto foi efetivamente truncado.
    // (textPart.length < normalizedFullName.length) não é a melhor condição aqui,
    // pois textPart pode ser igual a normalizedFullName e ainda precisar de "..."
    // se normalizedFullName > limit.
    // A lógica correta é: se o textPart construído é menor que o nome original E o nome original era maior que o limite.
    // No entanto, a lógica atual já garante que textPart <= limit.
    // Se textPart é o nome completo e cabe, não precisa de "...".
    // Se textPart é uma parte do nome, então precisa de "...".
    if (textPart.length < trimmedName.length) { // Compara com trimmedName para ser mais preciso
        return textPart + "..."; // Adiciona "..." se nem todas as palavras couberam
    } else {
        return textPart; // Retorna a parte do texto que coube (pode ser o nome completo se <= limit)
    }
  };


  // --- Função handleSignOut ---
  // Manipulador para o evento de logout do usuário.
  // Realiza uma limpeza robusta de sessão local e do Supabase, e redireciona o usuário.
  const handleSignOut = async () => {
    try {
      // 1. Limpar quaisquer tokens remanescentes do Supabase no localStorage.
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      }

      // 2. Use o signOut do contexto de autenticação (limpa o estado do contexto).
      if (typeof signOut === 'function') {
        try {
          await signOut();
        } catch (contextError) {
          console.log("Erro no signOut do contexto, continuando a limpeza:", contextError);
        }
      }

      // 3. Tenta o signOut do Supabase (pode falhar com 403 se a sessão já for inválida).
      try {
        await supabase.auth.signOut();
      } catch (supabaseError) {
        console.log("Erro no signOut do Supabase (esperado se a sessão for inválida):", supabaseError);
      }

      // 4. Redefinir o estado local do componente.
      setUserName("");

      // 5. Forçar um recarregamento completo para a página inicial para garantir que todo o estado seja limpo.
      window.location.href = '/';

    } catch (error) {
      console.error("Erro durante o processo de saída:", error);

      // Mesmo em caso de erro fatal, tenta forçar um estado limpo.
      setUserName("");
      localStorage.clear(); // Limpeza mais agressiva do localStorage.
      window.location.href = '/'; // Redireciona para a página inicial.
    }
  };


  // REMOVIDO: Condição de inicialização que causava o loading infinito
  // Agora o header sempre renderiza, mesmo durante o carregamento

  // --- Renderização do Componente Header ---
  return (
    // Contêiner div com fundo preto. Importante para o efeito visual durante a retração do header.
    <div className='bg-black'>  
      <header
        // Classes de estilo e posicionamento do header.
        // 'sticky': Mantém o header fixo no topo.
        // 'transition-transform duration-300 ease-in-out': Anima a transição de visibilidade.
        // '-translate-y-full' ou 'translate-y-0': Controla a visibilidade com base na direção do scroll.
        // 'z-50': Garante que o header fique acima de outros elementos.
        // Estilos de fundo, borda e sombra.
        className={`sticky transition-transform duration-300 ease-in-out ${scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
          } top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-lg`}
      >
        {/* Overlay de grade com efeito de brilho (decorativo). */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="w-full h-full grid grid-cols-12">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="border-l border-[#4f9bff]/30"></div>
            ))}
          </div>
        </div>

        {/* Contêiner principal do conteúdo do header. */}
        <div className="container relative z-10 mx-auto px-4 flex items-center justify-between h-16 md:h-20">
          {/* Seção do Logo/Nome da Aplicação */}
          <div className="flex items-center">
            <NavLink 
              to="/" 
              className="flex flex-col items-start group cursor-pointer"
            >
              {/* "FastBot" - mantido igual */}
              <span className="font-bold text-4xl mt-2 !text-foreground 
              [text-shadow:0_0_12px_hsl(var(--primary)),0_0_24px_hsl(var(--primary)/0.9),0_0_36px_hsl(var(--primary)/0.6),0_0_48px_hsl(var(--primary)/0.3)]
              group-hover:!text-primary 
              group-hover:[text-shadow:0_0_16px_hsl(var(--primary)),0_0_32px_hsl(var(--primary)),0_0_48px_hsl(var(--primary)/0.8),0_0_64px_hsl(var(--primary)/0.5)]
              transition-all duration-300 tracking-wide">
                FastBot
              </span>
              
              {/* "DENTISTAS.COM.BR" - embaixo, menor e com largura limitada */}
              <span className="font-mono text-md !text-primary font-light pt-0">
                DENTISTAS.COM.BR / FASTBOT
              </span>
            </NavLink>
          </div>

          {/* Menu de Navegação Principal (links) */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) => `font-medium cursor-pointer ${isActive ? "!text-foreground text-2xl drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)]" : "!text-muted-foreground text-sm"} hover:!text-foreground hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)] transition-all`}
            >
              Início
            </NavLink>

            {/* Links condicionalmente exibidos se o usuário NÃO estiver logado */}
            {!user && (
              <NavLink
                to="/features"
                className={({ isActive }) => `font-medium cursor-pointer ${isActive ? "!text-foreground text-2xl drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)]" : "!text-muted-foreground text-sm"} hover:!text-foreground hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)] transition-all`}
              >
                Recursos
              </NavLink>
            )}

            {!user && (
              <NavLink
                to="/pricing"
                className={({ isActive }) => `font-medium cursor-pointer ${isActive ? "!text-foreground text-2xl drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)]" : "!text-muted-foreground text-sm"} hover:!text-foreground hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)] transition-all`}
              >
                Preços
              </NavLink>
            )}

            {/* Links condicionalmente exibidos se o usuário ESTIVER logado */}
            {user && (
              <NavLink
                to="/my-chatbot"
                className={({ isActive }) => `font-medium cursor-pointer ${isActive ? "!text-foreground text-2xl drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)]" : "!text-muted-foreground text-sm"} hover:!text-foreground hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)] transition-all`}
              >
                Meu Chatbot
              </NavLink>
            )}

            {/* NOVO: Link "Minha Conta" para usuários logados */}
            {user && (
              <NavLink
                to="/account"
                className={({ isActive }) => `font-medium cursor-pointer ${isActive ? "!text-foreground text-2xl drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)]" : "!text-muted-foreground text-sm"} hover:!text-foreground hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)] transition-all`}
              >
                Minha Conta
              </NavLink>
            )}
            
          </nav>

          {/* Seção de Ações do Usuário (Autenticação/Menu) */}
          <div className="flex items-center space-x-4">
            {authLoading ? (
              // Mostrar um indicador de loading só para a seção de usuário
              <div className="text-muted-foreground text-sm">Carregando...</div>
            ) : user ? (
              // Menu Dropdown para usuário logado
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-primary text-foreground bg-background/70 hover:bg-secondary hover:border-primary transition-all px-3 py-2 rounded-md"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">{truncate(userName)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-background border-2 border-border shadow-xl rounded-lg p-1 backdrop-blur-sm"
                >
                  <DropdownMenuItem
                    className="cursor-pointer rounded-md px-3 py-2 text-foreground hover:!bg-secondary hover:!text-foreground focus:!bg-secondary focus:!text-foreground transition-colors flex items-center"
                    asChild
                  >
                    <Link to="/my-chatbot">
                      <Bot className="mr-3 h-6 w-6" />
                      Meu Chatbot
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer rounded-md px-3 py-2 text-foreground hover:!bg-secondary hover:!text-foreground focus:!bg-secondary focus:!text-foreground transition-colors flex items-center"
                    asChild
                  >
                    <Link to="/account">
                      <User className="mr-3 h-6 w-6" />
                      Minha Conta
                    </Link>
                  </DropdownMenuItem>

                  {/* Item Admin - apenas para administradores */}
                  {isAdmin && (
                    <DropdownMenuItem
                      className="cursor-pointer rounded-md px-3 py-2 text-foreground hover:!bg-secondary hover:!text-foreground focus:!bg-secondary focus:!text-foreground transition-colors flex items-center"
                      asChild
                    >
                      <Link to="/admin">
                        <Shield className="mr-3 h-6 w-6" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-border" />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer rounded-md px-3 py-2 text-destructive hover:!bg-secondary hover:!text-destructive focus:!bg-secondary focus:!text-destructive transition-colors flex items-center"
                  >
                    <LogOut className="mr-3 h-6 w-6" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Botões de "Entrar" e "Cadastre-se" para usuário não logado
              <>
                <Button
                  variant="outline"
                  className="hidden md:inline-flex border-border text-foreground bg-background/70 hover:bg-secondary hover:border-primary transition-all"
                  onClick={() => {
                    setAuthModalTab("login");
                    setTimeout(() => {
                      setIsAuthModalOpen(true);
                    }, 0);
                  }}
                >
                  Entrar
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                  onClick={() => {
                    setAuthModalTab("signup");
                    setTimeout(() => {
                      setIsAuthModalOpen(true);
                    }, 0);
                  }}
                >
                  Cadastre-se
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Modal de Autenticação - CORRIGIDO com key para forçar re-render */}
        <AuthModal
          key={authModalTab} // Força re-render quando a aba muda
          isOpen={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
          defaultTab={authModalTab}
        />
      </header>
    </div>
  );
};

export default Header;

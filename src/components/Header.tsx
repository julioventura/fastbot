// Componente: Header
// Funcionalidade:
// Este componente renderiza o cabeçalho da aplicação. Ele é fixo no topo da página
// e possui um comportamento retrátil que o esconde ao rolar a página para baixo e
// o exibe ao rolar para cima. Inclui o logo, links de navegação (que mudam
// dependendo do estado de autenticação do usuário), e botões de ação como
// "Entrar", "Cadastre-se" ou um menu dropdown para usuários logados com opções
// como "Minha Conta", "Meus Créditos" e "Sair".
// Utiliza um modal para autenticação (AuthModal).
//
// Funções e Constantes Principais:
// - useScrollDirection (Custom Hook):
//   - scrollDirection (estado): String ('up' ou 'down') indicando a direção atual do scroll.
//   - lastScrollY (estado): Number, armazena a última posição vertical do scroll.
//   - useEffect (hook): Adiciona e remove um event listener para o evento de scroll,
//     atualizando 'scrollDirection' e 'lastScrollY' com base no movimento da página.
//   - Retorna: A direção atual do scroll ('up' ou 'down').
// - Header (Componente): Componente funcional principal do cabeçalho.
//   - scrollDirection (const): Obtém a direção do scroll do hook useScrollDirection.
//   - isAuthModalOpen (estado): Booleano, controla a visibilidade do modal de autenticação.
//   - setIsAuthModalOpen (função de estado): Atualiza o estado isAuthModalOpen.
//   - user (const): Objeto contendo informações do usuário autenticado, obtido do hook useAuth.
//   - signOut (const): Função para deslogar o usuário, obtida do hook useAuth.
//   - userName (estado): String, armazena o nome do usuário (ou parte do email como fallback).
//   - setUserName (função de estado): Atualiza o estado userName.
//   - useEffect (hook para fetchUserName): Busca o nome do perfil do usuário no Supabase
//     quando o estado 'user' muda. Se não encontrar um nome, usa parte do email.
//   - truncate (função): Função utilitária para truncar uma string (nome do usuário)
//     para um limite de caracteres, tentando manter palavras inteiras e adicionando "..." se necessário.
//   - handleSignOut (função): Manipulador para o evento de logout. Limpa tokens,
//     chama signOut do Supabase e do contexto, e redireciona o usuário.

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from "@/lib/auth/useAuth"; // CORREÇÃO AQUI
import { Link, NavLink } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Bot, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '../hooks/useProfile';

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

  // user: Objeto do usuário autenticado.
  // signOut: Função para deslogar o usuário.
  const { user, signOut, loading: authLoading, initializing } = useAuth();
  const { profile, loading: profileLoading, error } = useProfile();

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


  // Mostrar loading durante inicialização
  if (initializing) {
    return (
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link to="/">
                <span className="text-2xl font-bold text-gray-900">FastBot</span>
              </Link>
            </div>
            <div className="text-gray-500">Carregando...</div>
          </div>
        </div>
      </header>
    );
  }

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
          } top-0 z-50 bg-gradient-to-r from-[#0a1629] to-[#0e2d5e] backdrop-blur-md border-b border-[#2a4980]/40 shadow-lg shadow-[#0063F7]/10`}
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
              className="flex items-center space-x-2 group"
            >
              <span className="font-bold text-2xl text-white 
              [text-shadow:0_0_8px_#4f9bff,0_0_20px_rgba(0,99,247,0.8)]
              group-hover:text-[#4f9bff] 
              group-hover:[text-shadow:0_0_12px_#4f9bff,0_0_25px_rgba(0,99,247,0.9)]
              transition-all duration-300">
                FastBot
              </span>
            </NavLink>
          </div>

          {/* Menu de Navegação Principal (links) */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) => `font-medium ${isActive ? "text-white text-2xl drop-shadow-[0_0_8px_rgba(79,155,255,0.7)]" : "text-gray-300 text-sm"} hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all`}
            >
              Início
            </NavLink>

            {/* Links condicionalmente exibidos se o usuário NÃO estiver logado */}
            {!user && (
              <NavLink
                to="/features"
                className={({ isActive }) => `font-medium ${isActive ? "text-white text-2xl drop-shadow-[0_0_8px_rgba(79,155,255,0.7)]" : "text-gray-300 text-sm"} hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all`}
              >
                Recursos
              </NavLink>
            )}

            {!user && (
              <NavLink
                to="/pricing"
                className={({ isActive }) => `font-medium ${isActive ? "text-white text-2xl drop-shadow-[0_0_8px_rgba(79,155,255,0.7)]" : "text-gray-300 text-sm"} hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all`}
              >
                Preços
              </NavLink>
            )}

            {/* Links condicionalmente exibidos se o usuário ESTIVER logado */}
            {user && (
              <NavLink
                to="/my-chatbot"
                className={({ isActive }) => `font-medium ${isActive ? "text-white text-2xl drop-shadow-[0_0_8px_rgba(79,155,255,0.7)]" : "text-gray-300 text-sm"} hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all`}
              >
                Meu Chatbot
              </NavLink>
            )}

            {/* NOVO: Link "Minha Conta" para usuários logados */}
            {user && (
              <NavLink
                to="/account"
                className={({ isActive }) => `font-medium ${isActive ? "text-white text-2xl drop-shadow-[0_0_8px_rgba(79,155,255,0.7)]" : "text-gray-300 text-sm"} hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all`}
              >
                Minha Conta
              </NavLink>
            )}
            
          </nav>

          {/* Seção de Ações do Usuário (Autenticação/Menu) */}
          <div className="flex items-center space-x-4">
            {user ? (
              // Menu Dropdown para usuário logado
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-[#4f9bff]/80 text-white bg-[#0a1629]/70 hover:bg-blue-400 hover:border-[#4f9bff]  transition-all px-3 py-2 rounded-md"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {/* Exibe o nome do usuário truncado (ou parte do email como fallback) */}
                    <span className="hidden sm:inline">{truncate(userName)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-[#0a1629] border-2 border-[#2a4980]/80 shadow-xl rounded-lg p-1 backdrop-blur-sm"
                >
                  {/* NOVO: Link "Meu Chatbot" com ícone de robô */}
                  <DropdownMenuItem
                    className="cursor-pointer rounded-md px-3 py-2 text-gray-200 hover:!bg-[#2a4980]/70 hover:!text-white focus:!bg-[#2a4980]/70 focus:!text-white transition-colors flex items-center"
                    asChild
                  >
                    <Link to="/my-chatbot">
                      <Bot className="mr-3 h-6 w-6" />
                      Meu Chatbot
                    </Link>
                  </DropdownMenuItem>

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
                    onClick={handleSignOut}
                    className="cursor-pointer rounded-md px-3 py-2 text-red-400 hover:!bg-[#2a4980]/70 hover:!text-red-300 focus:!bg-[#2a4980]/70 focus:!text-red-300 transition-colors flex items-center"
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

        {/* Modal de Autenticação */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
        />
      </header>
    </div>
  );
};

export default Header;

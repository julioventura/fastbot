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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from '@/hooks/useTheme';
import { ThemePalette } from '@/contexts/theme-context';
import { useAuth } from "@/lib/auth/useAuth"; // CORREÇÃO AQUI
import { Link, NavLink } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Bot, Coins, Shield, Palette, Moon, Sun } from 'lucide-react';
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
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false);

  // user: Objeto do usuário autenticado.
  // signOut: Função para deslogar o usuário.
  const { user, signOut, loading: authLoading, initializing } = useAuth();
  const { profile, loading: profileLoading, error } = useProfile();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { theme, setTheme } = useTheme();

  // userName: Estado para armazenar o nome do usuário a ser exibido.
  const [userName, setUserName] = useState("");

  // Opções de tema
  const themeOptions = [
    {
      id: 'blue-dark' as ThemePalette,
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
      id: 'blue-light' as ThemePalette,
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
      id: 'purple-dark' as ThemePalette,
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
      id: 'purple-light' as ThemePalette,
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
      id: 'gray-dark' as ThemePalette,
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
      id: 'gray-light' as ThemePalette,
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

  const handleThemeChange = (newTheme: ThemePalette) => {
    setTheme(newTheme);
    setIsThemeDialogOpen(false); // Fecha o dialog após selecionar o tema
  };


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
              className="flex flex-col items-start group"
            >
              {/* "FastBot" - mantido igual */}
              <span className="font-bold text-4xl mt-2 text-foreground 
              [text-shadow:0_0_12px_hsl(var(--primary)),0_0_24px_hsl(var(--primary)/0.9),0_0_36px_hsl(var(--primary)/0.6),0_0_48px_hsl(var(--primary)/0.3)]
              group-hover:text-primary 
              group-hover:[text-shadow:0_0_16px_hsl(var(--primary)),0_0_32px_hsl(var(--primary)),0_0_48px_hsl(var(--primary)/0.8),0_0_64px_hsl(var(--primary)/0.5)]
              transition-all duration-300 tracking-wide">
                FastBot
              </span>
              
              {/* "DENTISTAS.COM.BR" - embaixo, menor e com largura limitada */}
              <span className="font-mono text-md text-primary font-light pt-0">
                DENTISTAS.COM.BR / FASTBOT
              </span>
            </NavLink>
          </div>

          {/* Menu de Navegação Principal (links) */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) => `font-medium ${isActive ? "text-foreground text-2xl drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)]" : "text-muted-foreground text-sm"} hover:text-foreground hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)] transition-all`}
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

                  {/* Item Configurar Tema */}
                  <DropdownMenuItem
                    onClick={() => setIsThemeDialogOpen(true)}
                    className="cursor-pointer rounded-md px-3 py-2 text-foreground hover:!bg-secondary hover:!text-foreground focus:!bg-secondary focus:!text-foreground transition-colors flex items-center"
                  >
                    <Palette className="mr-3 h-6 w-6" />
                    Tema
                  </DropdownMenuItem>

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
                    console.log("Clicou em Entrar - definindo aba para login");
                    setAuthModalTab("login");
                    // Usar setTimeout para garantir que o estado seja atualizado antes de abrir o modal
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
                    console.log("Clicou em Cadastre-se - definindo aba para signup");
                    setAuthModalTab("signup");
                    // Usar setTimeout para garantir que o estado seja atualizado antes de abrir o modal
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

        {/* Dialog de Seleção de Tema */}
        <Dialog open={isThemeDialogOpen} onOpenChange={setIsThemeDialogOpen}>
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

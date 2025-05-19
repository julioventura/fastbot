
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
  const truncateName = (name: string) => {
    if (name.length <= 10) return name;
    return name.substring(0, 10) + "...";
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <header 
      className={`sticky transition-transform duration-300 ease-in-out ${
        scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
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
          <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all">Features</a>
          <a href="#solutions" className="text-sm font-medium text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all">Solutions</a>
          <a href="#pricing" className="text-sm font-medium text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all">Pricing</a>
          <a href="#docs" className="text-sm font-medium text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(79,155,255,0.7)] transition-all">Docs</a>
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
                  {truncateName(userName)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/account">Minha conta</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
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
  );
};

export default Header;

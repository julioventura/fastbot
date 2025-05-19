import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

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
          <Button 
            variant="outline" 
            className="hidden md:inline-flex border-[#4f9bff]/80 text-white bg-[#0a1629]/70 hover:bg-[#4f9bff]/20 hover:border-[#4f9bff] hover:drop-shadow-[0_0_10px_rgba(79,155,255,0.5)] transition-all"
          >
            Log In
          </Button>
          <Button 
            className="bg-[#3b82f6] hover:bg-[#4f9bff] text-white drop-shadow-[0_0_10px_rgba(79,155,255,0.3)] hover:drop-shadow-[0_0_15px_rgba(79,155,255,0.5)] transition-all"
          >
            Start Free
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

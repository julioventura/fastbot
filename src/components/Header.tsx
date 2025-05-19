import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Custom hook to track scroll direction
const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState("up");
  const [lastScrollY, setLastScrollY] = useState(0);
  
  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      
      // Determine direction based on comparison with last scroll position
      const direction = scrollY > lastScrollY ? "down" : "up";
      
      // Only update state if direction changed and we've scrolled a bit
      if (direction !== scrollDirection && 
          (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10) && 
          scrollY > 20) {
        setScrollDirection(direction);
      }
      
      // Update last scroll position
      setLastScrollY(scrollY);
    };
    
    // Add scroll event listener with passive option for better performance
    window.addEventListener("scroll", updateScrollDirection, { passive: true });
    
    // Clean up
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
      } top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        <div className="flex items-center">
          <a href="/" className="flex items-center space-x-2">
            <span className="font-bold text-2xl text-brightblue-500">FastBot</span>
          </a>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-brightblue-500 transition-colors">Features</a>
          <a href="#solutions" className="text-sm font-medium text-gray-600 hover:text-brightblue-500 transition-colors">Solutions</a>
          <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-brightblue-500 transition-colors">Pricing</a>
          <a href="#docs" className="text-sm font-medium text-gray-600 hover:text-brightblue-500 transition-colors">Docs</a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="hidden md:inline-flex">Log In</Button>
          <Button className="bg-brightblue-500 hover:bg-brightblue-600">Start Free</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

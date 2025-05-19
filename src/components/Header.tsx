
import React from 'react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
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


import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[400px] -left-[300px] w-[600px] h-[600px] rounded-full bg-blue-gradient opacity-60"></div>
        <div className="absolute -bottom-[300px] -right-[200px] w-[500px] h-[500px] rounded-full bg-purple-gradient opacity-60"></div>
      </div>
      
      <div className="section-container relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">AI Agents </span> 
            <span>Interacting With Websites</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
            The most reliable agent browser. Let your AI agents automate any web task, understand content, and interact with any website.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button className="hero-button bg-brightblue-500 hover:bg-brightblue-600 text-white">
              Start for free
            </Button>
            <Button variant="outline" className="hero-button flex items-center gap-2">
              <span>See how it works</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl shadow-inner">
            <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm animate-float">
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-brightblue-500 to-brightpurple-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium">AI Browser Automation Demo</h3>
                  <p className="mt-2 text-sm text-gray-500">Interactive browser preview would be here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

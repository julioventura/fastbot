
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0a1629] to-[#082756] min-h-[80vh]">
      {/* SVG Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="https://dentistas.com.br/img/bg_hero.svg" 
          alt="Background" 
          className="w-full h-full object-cover opacity-60"
        />
      </div>
      
      {/* Grid overlay pattern */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="w-full h-full grid grid-cols-12 grid-rows-12">
          {Array.from({ length: 13 }).map((_, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              {Array.from({ length: 13 }).map((_, colIndex) => (
                <div key={`${rowIndex}-${colIndex}`} className="border-t border-l border-[#2a4980]/30"></div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className="section-container relative z-10 pt-16 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
            Browser Infrastructure for AI Agents
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Agent Browser lets you execute agentic workflows on remote browsers that never get blocked. 
            Infinitely scalable, headless or headful, and powered by the world's most reliable proxy network.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button className="hero-button bg-[#3b82f6] hover:bg-[#2563eb] text-white px-8 py-6 rounded-full text-lg flex items-center gap-2">
              <span>Try Now</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="hero-button border-white text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg">
              Contact us
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-24 text-center text-white">
            <div className="border border-[#2a4980]/50 rounded-lg p-6 bg-[#0a1629]/50 backdrop-blur-sm">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#0a1629] border border-[#2a4980]/50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-xl font-bold">150M+ actions</p>
              <p className="text-sm opacity-70">performed daily</p>
            </div>
            
            <div className="border border-[#2a4980]/50 rounded-lg p-6 bg-[#0a1629]/50 backdrop-blur-sm">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#0a1629] border border-[#2a4980]/50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                  </svg>
                </div>
              </div>
              <p className="text-xl font-bold">1M+ concurrent</p>
              <p className="text-sm opacity-70">sessions</p>
            </div>
            
            <div className="border border-[#2a4980]/50 rounded-lg p-6 bg-[#0a1629]/50 backdrop-blur-sm">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#0a1629] border border-[#2a4980]/50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xl font-bold">150M+ IPs in 195</p>
              <p className="text-sm opacity-70">countries</p>
            </div>
            
            <div className="border border-[#2a4980]/50 rounded-lg p-6 bg-[#0a1629]/50 backdrop-blur-sm">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#0a1629] border border-[#2a4980]/50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <p className="text-xl font-bold">3M+ domains</p>
              <p className="text-sm opacity-70">unlocked</p>
            </div>
            
            <div className="border border-[#2a4980]/50 rounded-lg p-6 bg-[#0a1629]/50 backdrop-blur-sm">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#0a1629] border border-[#2a4980]/50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
              </div>
              <p className="text-xl font-bold">2.5PB+ collected</p>
              <p className="text-sm opacity-70">daily</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

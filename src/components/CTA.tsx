
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#0a1629] to-[#0e2d5e]">
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
      
      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to supercharge your AI agents?
          </h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Join thousands of companies using Bright Data to build powerful AI-driven web automation
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="hero-button bg-[#3b82f6] hover:bg-[#2563eb] text-white px-8 py-6 rounded-full text-lg flex items-center gap-2">
              <span>Try Now</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="hero-button border-white text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg">
              Contact us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;

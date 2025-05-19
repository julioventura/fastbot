import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Export the component directly
export default function CTA() {
  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-[#0a1629] to-[#0e2d5e]">
      <div className="section-container relative z-10" id="cta-section">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text">
            Pronto em 3 minutos!
          </h1>
          <br />&nbsp;<br />
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Join thousands of companies using Bright Data to build powerful AI-driven web automation
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-8 py-6 rounded-full text-lg flex items-center gap-2">
              <span>Comece já</span>
              <ArrowRight className="h-5 w-5" />
            </Button>

          </div>
        </div>
      </div>

      {/* Grid overlay pattern */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div
          className="h-full w-full grid"
          style={{
            gridTemplateRows: 'repeat(20, 1fr)',
            gridTemplateColumns: 'repeat(20, 1fr)',
          }}
        >
          {/* Horizontal lines */}
          {Array.from({ length: 21 }).map((_, index) => (
            <div
              key={`h-${index}`}
              className="absolute left-0 right-0 border-t border-[#4f9bff]/30"
              style={{ top: `${(index * 100) / 20}%` }}
            />
          ))}

          {/* Vertical lines */}
          {Array.from({ length: 21 }).map((_, index) => (
            <div
              key={`v-${index}`}
              className="absolute top-0 bottom-0 border-l border-[#4f9bff]/30"
              style={{ left: `${(index * 100) / 20}%` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
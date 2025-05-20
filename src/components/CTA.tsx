import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Export the component directly
export default function CTA() {
  return (
    <section className="relative py-5 md:py-16 bg-gradient-to-br from-[#0a1629] to-[#0e2d5e]">
      <div className="section-container relative z-10" id="cta-section">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Pronto em <span className="text-[#4f9bff]">3 minutos!</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Nosso chatbot coloca a sua vida profissional em outro patamar!
            </p>
            <div className="mt-8">
              <Button 
                className="bg-[#3b82f6] hover:bg-[#4f9bff] text-white px-8 py-6 text-lg rounded-lg drop-shadow-[0_0_10px_rgba(79,155,255,0.3)] hover:drop-shadow-[0_0_15px_rgba(79,155,255,0.5)] transition-all"
              >
                Comece já
              </Button>
            </div>
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
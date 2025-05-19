
import React from 'react';
import { Button } from '@/components/ui/button';

const CTA = () => {
  return (
    <section className="py-16 md:py-24 bg-hero-gradient">
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to supercharge your AI agents?
          </h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Join thousands of companies using Bright Data to build powerful AI-driven web automation
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="hero-button bg-white text-brightblue-500 hover:bg-gray-100">
              Start for free
            </Button>
            <Button variant="outline" className="hero-button border-white text-white hover:bg-white/10">
              Talk to sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;

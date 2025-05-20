
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="flex flex-col bg-black">
      
      {/* <Header /> */}

      <main>
        <Hero />
        <Pricing />
        <Features />
        <Testimonials />
        <CTA />
      </main>

      {/* <Footer /> */}

    </div>
  );
};

export default Index;

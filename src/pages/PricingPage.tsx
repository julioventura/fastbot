import React from 'react';
import Pricing from '@/components/Pricing'; // Supondo que seu componente Pricing esteja em src/components/Pricing.tsx
import Footer from '@/components/Footer';   // Opcional: Adicione o Footer se desejar

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0a1629] to-[#0e2d5e] text-white">
      <main className="flex-grow">
        <Pricing />
      </main>
      <Footer /> {/* Opcional */}
    </div>
  );
};

export default PricingPage;
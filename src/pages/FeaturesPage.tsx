import React from 'react';
import Features from '@/components/Features'; // Supondo que seu componente Features esteja em src/components/Features.tsx
import Footer from '@/components/Footer';     // Opcional: Adicione o Footer se desejar

const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0a1629] to-[#0e2d5e] text-white">
      <main className="flex-grow">
        <Features />
      </main>
      <Footer /> {/* Opcional */}
    </div>
  );
};

export default FeaturesPage;
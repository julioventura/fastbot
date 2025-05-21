// Componente: Index
// Funcionalidade:
// Esta é a página principal (homepage) da aplicação.
// Ela serve como um contêiner para montar e exibir várias seções (componentes)
// que compõem a landing page, como Hero, Features, Pricing, Testimonials e CTA.
// O Header e Footer são gerenciados globalmente em App.tsx ou podem ser adicionados aqui se necessário.
//
// Funções e Constantes Principais:
// - Index (Componente): Componente funcional React que renderiza a estrutura da homepage.
//   - Importa e utiliza os seguintes componentes de seção:
//     - Hero: Seção de destaque inicial.
//     - Features: Seção que descreve as funcionalidades.
//     - Testimonials: Seção com depoimentos de clientes.
//     - Pricing: Seção com os planos e preços.
//     - CTA: Seção de Call to Action.

import React from 'react';
// Componentes de Seção da Homepage
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import CTA from '@/components/CTA';
// Header e Footer são geralmente gerenciados em um layout superior (ex: App.tsx)
// import Header from '@/components/Header';
// import Footer from '@/components/Footer';


// Componente Index
// Define a estrutura e o layout da página inicial da aplicação.
const Index = () => {
  return (
    // Contêiner principal da página, define um layout de coluna e um fundo preto.
    // O fundo preto pode ser sobreposto pelos gradientes das seções internas.
    <div className="flex flex-col bg-black">
      
      {/* O componente Header é renderizado globalmente em App.tsx, 
          portanto, está comentado aqui para evitar duplicação. 
          Se fosse específico desta página, seria descomentado. */}
      {/* <Header /> */}

      {/* Elemento <main> para o conteúdo principal da página. */}
      <main>
        {/* Seção Hero: Bloco de introdução principal da página. */}
        <Hero />

        {/* Seção Pricing: Apresenta os planos e preços. */}
        <Pricing />

        {/* Seção Features: Destaca as funcionalidades chave. */}
        <Features />

        {/* Seção Testimonials: Exibe depoimentos de usuários. */}
        <Testimonials />

        {/* Seção CTA (Call to Action): Incentiva o usuário a tomar uma ação. */}
        <CTA />
      </main>

      {/* O componente Footer também pode ser renderizado globalmente em App.tsx 
          ou ser específico da página. Comentado aqui por ora. */}
      {/* <Footer /> */}

    </div>
  );
};

export default Index;

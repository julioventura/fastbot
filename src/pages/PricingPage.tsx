// Página: PricingPage
// Funcionalidade:
// Esta página é dedicada a exibir a seção de "Preços" ou "Planos" da aplicação.
// Ela importa e renderiza o componente `Pricing`, que contém o detalhamento
// dos diferentes planos e seus respectivos custos e funcionalidades.
// A página também define um layout básico com um fundo em gradiente.
//
// Componentes Importados:
// - Pricing: Componente que exibe a tabela ou cards de preços/planos.
// - Footer (Opcional): Componente de rodapé, importado mas não utilizado no exemplo atual.
//   Pode ser adicionado se necessário.
//
// Componentes Definidos:
// - PricingPage (Componente): Componente funcional React que estrutura a página de preços.

import React from 'react';
import Pricing from '@/components/Pricing'; // Componente que exibe os planos e preços.
import Footer from '@/components/Footer';   // Opcional: Adicione o Footer se desejar


// Componente PricingPage
// Define a estrutura da página que exibe as informações de preços e planos.
const PricingPage: React.FC = () => {
  return (
    // Contêiner principal da página.
    // 'flex flex-col' para organizar o conteúdo em coluna.
    // 'bg-gradient-to-b from-[#0a1629] to-[#0e2d5e]' define o fundo com gradiente.
    // 'p-0' remove qualquer padding padrão do contêiner.
    <div className="flex flex-col bg-theme-gradient-alt p-0">
      
      {/* Seção principal do conteúdo da página. */}
      {/* 'flex-grow' faz com que esta seção ocupe o espaço disponível, empurrando o Footer (se existir) para baixo. */}
      <main className="flex-grow">
        {/* Renderiza o componente Pricing, que contém os detalhes dos planos. */}
        <Pricing />
      </main>
      
      {/* Footer (Opcional) */}
      {/* Se o componente Footer for importado e descomentado, ele será renderizado aqui. */}
      {/* <Footer /> */}
    </div>
  );
};

export default PricingPage;
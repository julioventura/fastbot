// Página: FeaturesPage
// Funcionalidade:
// Esta página é dedicada a exibir a seção de "Funcionalidades" da aplicação.
// Ela importa e renderiza o componente `Features`, que contém o detalhamento
// das funcionalidades oferecidas. A página também define um layout básico
// com um fundo em gradiente.
//
// Componentes Importados:
// - Features: Componente que exibe a lista e descrição das funcionalidades.
// - Footer (Opcional): Componente de rodapé, atualmente comentado no código original,
//   mas pode ser adicionado se necessário.
//
// Componentes Definidos:
// - FeaturesPage (Componente): Componente funcional React que estrutura a página de funcionalidades.

import React from 'react';
import Features from '@/components/Features'; // Componente que exibe as funcionalidades.
// import Footer from '@/components/Footer';     // Opcional: Adicione o Footer se desejar


// Componente FeaturesPage
// Define a estrutura da página que exibe as funcionalidades do produto/serviço.
const FeaturesPage: React.FC = () => {
  return (
    // Contêiner principal da página.
    // 'flex flex-col' para organizar o conteúdo em coluna.
    // 'bg-gradient-to-b from-[#0a1629] to-[#0e2d5e]' define o fundo com gradiente.
    // 'text-white' define a cor do texto padrão para branco.
    <div className="flex flex-col bg-gradient-to-b from-[#0a1629] to-[#0e2d5e] text-white">
      
      {/* Seção principal do conteúdo da página. */}
      {/* 'flex-grow' faz com que esta seção ocupe o espaço disponível, empurrando o Footer (se existir) para baixo. */}
      <main className="flex-grow">
        {/* Renderiza o componente Features, que contém a lista de funcionalidades. */}
        <Features />
      </main>
      
      {/* Footer (Opcional) */}
      {/* Se o componente Footer for importado e descomentado, ele será renderizado aqui. */}
      {/* <Footer /> */}
    </div>
  );
};

export default FeaturesPage;
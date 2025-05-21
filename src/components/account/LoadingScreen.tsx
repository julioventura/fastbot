import React from "react";
import BackgroundDecoration from "./BackgroundDecoration"; // Importa o componente de decoração de fundo.

// Componente LoadingScreen
// Renderiza uma interface visual para indicar o estado de carregamento da página da conta.
const LoadingScreen = () => {
  return (
    // Contêiner principal da tela de carregamento.
    // Ocupa no mínimo a altura total da tela (min-h-screen).
    // Possui um fundo com gradiente e 'overflow-hidden' para conter os elementos de decoração.
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a1629] to-[#082756] min-h-screen">
      
      {/* Componente de Decoração de Fundo */}
      {/* Adiciona os efeitos visuais de brilho SVG e grade ao fundo. */}
      <BackgroundDecoration />

      {/* Contêiner para centralizar o spinner e o texto de carregamento. */}
      {/* 'flex items-center justify-center h-screen' centraliza o conteúdo vertical e horizontalmente na tela. */}
      <div className="flex items-center justify-center h-screen">
        
        {/* Elementos visuais do carregamento (spinner e texto). */}
        <div className="flex flex-col items-center space-y-4">
          
          {/* Spinner de Carregamento */}
          {/* Um div estilizado para parecer um spinner circular animado.
              - 'w-12 h-12': define o tamanho do spinner.
              - 'border-4': define a espessura da borda.
              - 'border-t-[#4f9bff]': define a cor da borda superior (a parte visível do spinner).
              - 'border-r-transparent border-b-transparent border-l-transparent': torna as outras bordas transparentes.
              - 'rounded-full': torna o div circular.
              - 'animate-spin': aplica uma animação de rotação definida no Tailwind CSS. */}
          <div className="w-12 h-12 border-4 border-t-[#4f9bff] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          
          {/* Texto de Carregamento */}
          <p className="text-white text-xl">Carregando...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

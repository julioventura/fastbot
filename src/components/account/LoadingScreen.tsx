import React from "react";
import BackgroundDecoration from "./BackgroundDecoration"; // Importa o componente de decoração de fundo.

// Componente LoadingScreen
// Renderiza uma interface visual para indicar o estado de carregamento da página da conta.
interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = "Carregando..." }: LoadingScreenProps) => {
  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* <BackgroundDecoration /> */}
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-[#ffff00] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="text-white text-xl">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

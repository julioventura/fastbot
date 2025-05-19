
import React from "react";
import BackgroundDecoration from "./BackgroundDecoration";

const LoadingScreen = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a1629] to-[#082756] min-h-screen">
      <BackgroundDecoration />
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-[#4f9bff] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="text-white text-xl">Carregando...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

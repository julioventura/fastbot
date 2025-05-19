
import React from "react";
import BackgroundDecoration from "./BackgroundDecoration";

const LoadingScreen = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a1629] to-[#082756] min-h-screen">
      <BackgroundDecoration />
      <div className="flex items-center justify-center h-screen">
        <p className="text-white text-xl">Carregando...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;

// Componente: Hero
// Funcionalidade:
// Este componente renderiza a seção "Hero" (principal) da página inicial.
// Ele é projetado para capturar a atenção do usuário com um título impactante,
// uma breve descrição do produto/serviço e um botão de chamada para ação (CTA).
// A seção ocupa a tela inteira (min-h-screen) e possui efeitos visuais de fundo,
// como um brilho SVG animado e um padrão de grade sobreposto.
//
// Funções e Constantes Principais:
// - Hero (Componente): Componente funcional React que renderiza a estrutura da seção Hero.
//   - Não possui funções ou constantes complexas internas, sendo primariamente JSX para layout e estilo.
//   - Utiliza o componente Button e o ícone ArrowRight da biblioteca lucide-react.

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Componente Hero
// Define a estrutura e o layout da seção principal (Hero) da página inicial.
const Hero = () => {
  const navigate = useNavigate();
  const [useImageFallback, setUseImageFallback] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "https://dentistas.com.br/fastbot/avatar-estou-ocupada.png",
      text: [
        "Crie a SUA",
        "atendente virtual",
        "em 3 minutos!",
        "",
        "",
        "",
        ""
      ],
    },
  ];

  // Determina qual imagem usar - agora sempre usa a mesma imagem
  const getImageSrc = () => {
    return "/fastbot/hero-ana-dark.png";
  };

  // Handler para erro de carregamento da imagem
  const handleImageError = () => {
    setUseImageFallback(true);
  };

  // Troca automática de slides a cada 3 segundos
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  return (
    <>
      {/* Estilos CSS para animações dinâmicas das bolhas */}
      <style>{`
        @keyframes floatRandomly1 {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          25% { transform: translate(30px, -50px) rotate(90deg); }
          50% { transform: translate(-20px, -30px) rotate(180deg); }
          75% { transform: translate(-40px, 20px) rotate(270deg); }
          100% { transform: translate(0px, 0px) rotate(360deg); }
        }
        
        @keyframes floatRandomly2 {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          20% { transform: translate(-25px, 40px) rotate(72deg); }
          40% { transform: translate(35px, -25px) rotate(144deg); }
          60% { transform: translate(-15px, -45px) rotate(216deg); }
          80% { transform: translate(25px, 30px) rotate(288deg); }
          100% { transform: translate(0px, 0px) rotate(360deg); }
        }
        
        @keyframes floatRandomly3 {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          30% { transform: translate(45px, 25px) rotate(108deg); }
          60% { transform: translate(-30px, -40px) rotate(216deg); }
          100% { transform: translate(0px, 0px) rotate(360deg); }
        }
        
        @keyframes floatRandomly4 {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          16% { transform: translate(-35px, -20px) rotate(60deg); }
          33% { transform: translate(20px, -35px) rotate(120deg); }
          50% { transform: translate(40px, 15px) rotate(180deg); }
          66% { transform: translate(-10px, 45px) rotate(240deg); }
          83% { transform: translate(-25px, -10px) rotate(300deg); }
          100% { transform: translate(0px, 0px) rotate(360deg); }
        }
        
        @keyframes floatRandomly5 {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          40% { transform: translate(-40px, 30px) rotate(144deg); }
          80% { transform: translate(30px, -35px) rotate(288deg); }
          100% { transform: translate(0px, 0px) rotate(360deg); }
        }
      `}</style>

      <section className="relative overflow-hidden min-h-screen flex items-center bg-gradient-to-br from-background via-background/90 to-primary/5 -mt-10">
        {/* Fundo com gradiente suave responsivo ao tema */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-primary/5"></div>

        {/* Container principal ocupando toda a altura disponível */}
        <div className="container relative z-10 mx-auto px-8 w-full">
          <div className="grid lg:grid-cols-5 gap-4 lg:gap-4 items-center h-screen max-h-screen">

            {/* Coluna do texto - lado esquerdo) */}
            <div className="lg:col-span-3 flex flex-col justify-center space-y-8 py-0">

              {/* Título Principal */}
              <div className="space-y-2 ml-10">
                {/* Sempre 4 linhas, cada uma com seu estilo. Se faltar, exibe vazio. */}
                <span className="block text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-yellow-400">
                  {slides[currentSlide].text[0] || ""}
                </span>
                <span className="block text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white">
                  {slides[currentSlide].text[1] || ""}
                </span>
                <span className="block text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-yellow-400">
                  {slides[currentSlide].text[2] || ""}
                </span>
                <span className="block text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white">
                  {slides[currentSlide].text[3] || ""}
                </span>
                <span className="block text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-red-500">
                  {slides[currentSlide].text[4] || ""}
                </span>
                <span className="block text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-green-700">
                  {slides[currentSlide].text[5] || ""}
                </span>
                <span className="block text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-primary">
                  {slides[currentSlide].text[6] || ""}
                </span>
              </div>

              {/* Botão CTA */}
              <div>

                {/* BADGE DE DESTAQUE 1 */}
                <div className="flex flex-row gap-1 ml-10 mb-4">
                  <Button
                    onClick={() => {
                      // Scroll suave até o componente Pricing
                      const pricingElement = document.getElementById('pricing');
                      if (pricingElement) {
                        pricingElement.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }
                    }}
                    className="hero-cta-button bg-primary hover:bg-primary/90 text-primary-foreground mr-2 px-8 py-4 rounded-full text-2xl font-semibold flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <span>ATENDE NO WHATSAPP...</span>
                  </Button>
                </div>

                {/* BADGE DE DESTAQUE 2 */}
                <div className="flex flex-row gap-1 ml-10 mb-4">
                  <Button
                    onClick={() => {
                      // Scroll suave até o componente Pricing
                      const pricingElement = document.getElementById('pricing');
                      if (pricingElement) {
                        pricingElement.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }
                    }}
                    className="bg-gradient-to-r from-[#f82855] via-[#c91767] to-[#962fbf] hover:from-[#fd5949] hover:via-[#d6249f] hover:to-[#285AEB] text-white px-8 py-4 rounded-full text-2xl font-semibold flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <span>ATENDE NO INSTAGRAM...</span>
                  </Button>
                </div>

                {/* BADGE DE DESTAQUE 3 */}
                <div className="flex flex-row gap-1 ml-10 mb-4">
                  <Button
                    onClick={() => {
                      // Scroll suave até o componente Pricing
                      const pricingElement = document.getElementById('pricing');
                      if (pricingElement) {
                        pricingElement.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }
                    }}
                    className="hero-cta-button-blue bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-2xl font-semibold flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <span>ATENDE NO GMAIL...</span>
                  </Button>
                </div>

                {/* Não tem site? */}
                <div className="flex flex-row gap-1 ml-10">
                  <Button
                    className="bg-transparent py-4 mt-4 text-blue-400 text-2xl italic font-bold transform hover:scale-105 hover:bg-transparent transition-all duration-300 leading-[140%] text-left"
                  >
                    ATENDIMENTO 24H <span className="text-red-600"> com </span> <span className="text-yellow-400">Inteligência Artificial!</span><br />
                  </Button>
                </div>

              </div>

            </div>

            {/* Coluna da imagem - lado direito */}
            <div className="lg:col-span-2 flex justify-center lg:justify-end items-stretch h-full">
              <div className="relative w-full h-full flex items-center justify-center lg:justify-end">
                {/* Container da imagem otimizado para altura completa - sem animação */}
                <div className="relative h-[85vh] lg:h-[65vh] w-auto max-w-full">
                  {/* Imagem da Fastbot - altura completa, largura automática - FIXA sem movimento */}
                  <img
                    src={slides[currentSlide].image}
                    alt="Fastbot - Assistente Virtual Profissional da Saúde"
                    className="h-full w-auto object-contain object-center lg:object-right mr-20 rounded-[2rem]"
                    onError={handleImageError}
                  />

                  {/* Overlay sutil para melhor integração com o design */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent"></div>
                </div>

                {/* Elementos decorativos externos otimizados - COM ANIMAÇÃO INTENSA */}
                {/* Bolha amarela - 20% de opacidade com movimento aleatório */}
                <div
                  className="absolute -top-16 -right-6 lg:-top-10 mt-10 lg:-right-10 w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-gradient-to-t from-yellow-800 to-transparent"
                  style={{
                    animation: 'floatRandomly1 12s ease-in-out infinite',
                    animationDelay: '0s',
                    opacity: 0.6
                  }}
                ></div>
                {/* Bolha roxa - 20% de opacidade com movimento aleatório */}
                <div
                  className="absolute -bottom-6 mt-2 mb-20 -left-6 lg:-bottom-10 lg:-left-10 w-12 h-12 lg:w-20 lg:h-20 rounded-full bg-gradient-to-t from-purple-800 to-transparent"
                  style={{
                    animation: 'floatRandomly2 8s ease-in-out infinite',
                    animationDelay: '0s',
                    opacity: 0.6
                  }}
                ></div>
                {/* Bolha azul - 20% de opacidade com movimento aleatório */}
                <div
                  className="absolute top-1/4 -left-8 lg:-left-12 w-12 h-12 lg:w-12 lg:h-12 rounded-full bg-gradient-to-t from-primary/40 to-transparent"
                  style={{
                    animation: 'floatRandomly3 20s ease-in-out infinite',
                    animationDelay: '0s',
                    opacity: 0.6
                  }}
                ></div>

                {/* Nova bolha cinza - apenas borda com movimento aleatório */}
                <div
                  className="absolute top-1/3 -right-4 lg:top-1/3 lg:-right-8 w-14 h-14 lg:w-18 lg:h-18 border-4 rounded-full border-gradient-to-t from-white to-gray-500"
                  style={{
                    animation: 'floatRandomly4 10s ease-in-out infinite',
                    animationDelay: '2s',
                    opacity: 0.7
                  }}
                ></div>

                {/* Nova bolha verde - apenas borda com movimento aleatório */}
                <div
                  className="absolute bottom-1/3 left-2 lg:bottom-1/3 lg:left-0 w-10 h-10 lg:w-16 lg:h-16 rounded-full border-4 border-gradient-to-t from-green-500 to-transparent"
                  style={{
                    animation: 'floatRandomly5 18s ease-in-out infinite',
                    animationDelay: '4s',
                    opacity: 0.7
                  }}
                ></div>

                {/* Bolhas adicionais para a área do texto (lado esquerdo) */}
                {/* Bolha laranja na área dos títulos */}
                <div
                  className="absolute top-20 left-10 lg:top-24 lg:left-16 w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-orange-400 to-transparent"
                  style={{
                    animation: 'floatRandomly1 15s ease-in-out infinite',
                    animationDelay: '1s',
                    opacity: 0.5
                  }}
                ></div>

                {/* Bolha rosa no meio da área de texto */}
                <div
                  className="absolute top-1/2 left-1/4 lg:top-1/2 lg:left-1/3 w-6 h-6 lg:w-10 lg:h-10 rounded-full border-3 border-pink-400"
                  style={{
                    animation: 'floatRandomly3 22s ease-in-out infinite',
                    animationDelay: '6s',
                    opacity: 0.6
                  }}
                ></div>

                {/* Bolha turquesa próxima aos botões */}
                <div
                  className="absolute bottom-1/4 left-8 lg:bottom-1/4 lg:left-12 w-7 h-7 lg:w-11 lg:h-11 rounded-full bg-gradient-to-t from-teal-500 to-transparent"
                  style={{
                    animation: 'floatRandomly2 16s ease-in-out infinite',
                    animationDelay: '3s',
                    opacity: 0.5
                  }}
                ></div>

                {/* Bolha violeta sutil no topo esquerdo */}
                <div
                  className="absolute top-16 left-1/3 lg:top-20 lg:left-1/4 w-5 h-5 lg:w-8 lg:h-8 rounded-full border-2 border-violet-400"
                  style={{
                    animation: 'floatRandomly4 14s ease-in-out infinite',
                    animationDelay: '7s',
                    opacity: 0.7
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navegação do Carrossel - setas laterais centralizadas verticalmente - apenas se houver mais de 1 slide */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Slide anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-transparent hover:bg-primary/90 text-transparent hover:text-white shadow-lg transition-all duration-200"
              style={{ outline: "none", border: "none" }}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path
                  d="M15 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              aria-label="Próximo slide"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-transparent hover:bg-primary/90 text-primary hover:text-white shadow-lg transition-all duration-200"
              style={{ outline: "none", border: "none" }}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path
                  d="M9 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </section>
    </>
  );
};

export default Hero;

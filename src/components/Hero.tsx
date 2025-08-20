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
      image: "https://dentistas.com.br/fastbot/fale_comigo_02.png",
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
    // {
    //   image: "https://dentistas.com.br/fastbot/fale_comigo_03_t.png",
    //   text: [
    //     "Crie o SEU",
    //     "CHATBOT DE I.A.",
    //     "em 3 minutos!",
    //     "",
    //     "",
    //     "",
    //     ""
    //   ],
    // },
    // {
    //   image: "https://dentistas.com.br/fastbot/fale_comigo_01.png",
    //   text: [
    //     "Crie o SEU",
    //     "CHATBOT DE I.A.",
    //     "em 3 minutos!",
    //     "",
    //     "",
    //     "",
    //     ""
    //   ],
    // },
    // {
    //   image: "https://dentistas.com.br/fastbot/avatar-estou-ocupada.png",
    //   text: [
    //     "Crie o SEU",
    //     "CHATBOT DE I.A.",
    //     "em 3 minutos!",
    //     "",
    //     "",
    //     "",
    //     ""
    //   ],
    // },
  ];

  // Determina qual imagem usar - agora sempre usa a mesma imagem
  const getImageSrc = () => {
    // return "/fastbot/hero-ana-dark.png";
    return "/fastbot/fale_comigo_03_t.png";
  };

  // Handler para erro de carregamento da imagem
  const handleImageError = () => {
    setUseImageFallback(true);
  };

  // Troca automática de slides a cada 6 segundos
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
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
      {/* Estilos CSS para animações dinâmicas das bolhas e ocultar barras de rolagem */}
      <style>{`
        /* Ocultar barras de rolagem mantendo funcionalidade de scroll */
        html, body {
          overflow: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* Internet Explorer 10+ */
        }
        
        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
        
        /* Animação de rotação 360 graus no hover */
        .hover-rotate-360:hover {
          transform: rotate(360deg);
        }
        
        /* Animação automática de rotação 360 graus a cada 5 segundos */
        .auto-rotate-360 {
          animation: autoRotate360 5s linear infinite;
        }
        
        @keyframes autoRotate360 {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(360deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Animações diagonais verdadeiras - ângulos intermediários */
        @keyframes floatDiagonal1 {
          0% { transform: translate(-120vw, -80vh) rotate(23deg); }
          100% { transform: translate(120vw, 80vh) rotate(383deg); }
        }
        
        @keyframes floatDiagonal2 {
          0% { transform: translate(120vw, -90vh) rotate(47deg); }
          100% { transform: translate(-120vw, 90vh) rotate(-313deg); }
        }
        
        @keyframes floatDiagonal3 {
          0% { transform: translate(-110vw, 85vh) rotate(67deg); }
          100% { transform: translate(110vw, -85vh) rotate(427deg); }
        }
        
        @keyframes floatDiagonal4 {
          0% { transform: translate(115vw, 75vh) rotate(37deg); }
          100% { transform: translate(-115vw, -75vh) rotate(-323deg); }
        }
        
        @keyframes floatDiagonal5 {
          0% { transform: translate(-125vw, -70vh) rotate(53deg); }
          50% { transform: translate(50vw, 40vh) rotate(233deg); }
          100% { transform: translate(125vw, -70vh) rotate(413deg); }
        }
        
        @keyframes floatDiagonal6 {
          0% { transform: translate(100vw, 60vh) rotate(73deg); }
          100% { transform: translate(-100vw, -60vh) rotate(-287deg); }
        }
        
        @keyframes floatDiagonal7 {
          0% { transform: translate(-105vw, 45vh) rotate(29deg); }
          100% { transform: translate(105vw, -45vh) rotate(389deg); }
        }
        
        @keyframes floatDiagonal8 {
          0% { transform: translate(95vw, -55vh) rotate(61deg); }
          100% { transform: translate(-95vw, 55vh) rotate(-299deg); }
        }
      `}</style>

      <section className="relative overflow-hidden min-h-screen flex items-center bg-gradient-to-br from-background via-background/90 to-primary/5">
        {/* Fundo com gradiente suave responsivo ao tema */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-primary/5"></div>

        {/* Container principal ocupando toda a altura disponível */}
        <div className="container relative z-10 mx-auto px-4 md:px-8 w-full">
          <div className="grid lg:grid-cols-5 gap-4 lg:gap-4 items-center md:min-h-screen">

            {/* Coluna do texto - lado esquerdo) */}
            <div className="lg:col-span-3 flex flex-col justify-center space-y-8 py-0">

              {/* Container flex para título e selo GPT-5 no mobile */}
              <div className="flex flex-col lg:block relative">
                {/* Container flex horizontal para mobile - lado a lado */}
                <div className="flex flex-row items-start lg:block gap-2">

                  {/* Título Principal */}
                  <div className="space-y-2 mt-4 md:mt-0 md:space-y-2 ml-2 md:ml-10 flex-1">
                    {/* Sempre 4 linhas, cada uma com seu estilo. Se faltar, exibe vazio. */}
                    <span className="block text-xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-yellow-400">
                      {slides[currentSlide].text[0] || ""}
                    </span>
                    <span className="block text-xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-white">
                      {slides[currentSlide].text[1] || ""}
                    </span>
                    <span className="block text-xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-yellow-400">
                      {slides[currentSlide].text[2] || ""}
                    </span>
                    <span className="block text-xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-white">
                      {slides[currentSlide].text[3] || ""}
                    </span>
                    <span className="block text-xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-red-500">
                      {slides[currentSlide].text[4] || ""}
                    </span>
                    <span className="block text-xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-green-700">
                      {slides[currentSlide].text[5] || ""}
                    </span>
                    <span className="block text-xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-primary">
                      {slides[currentSlide].text[6] || ""}
                    </span>
                  </div>

                  {/* Selo GPT-5 - mobile: lado direito maior, desktop: centralizado depois */}
                  <div className="flex justify-center items-start lg:justify-center mt-0 pt-0 lg:mt-6 mr-2 lg:mr-0">
                    <img
                      src="https://dentistas.com.br/fastbot/GPT-5.png"
                      alt="Powered by GPT-5"
                      className="h-[140px] md:h-[160px] lg:h-[280px] w-[140px] md:w-[160px] lg:w-[280px] object-contain opacity-90 hover:opacity-100 hover-rotate-360 auto-rotate-360 transition-all duration-700"
                    />
                  </div>
                </div>
              </div>

              {/* Botão CTA */}
              <div>

                {/* BADGE DE DESTAQUE 1 */}
                <div className="flex flex-row gap-1 justify-center md:justify-start ml-0 md:ml-2 lg:ml-10 mb-2 md:mb-4">
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
                    className="hero-cta-button bg-primary hover:bg-primary/90 text-primary-foreground mr-2 px-4 md:px-8 py-2 md:py-4 rounded-full text-sm md:text-xl lg:text-2xl font-semibold flex items-center gap-2 md:gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <span>ATENDE NO WHATSAPP...</span>
                  </Button>
                </div>

                {/* BADGE DE DESTAQUE 2 */}
                <div className="flex flex-row gap-1 justify-center md:justify-start ml-0 md:ml-2 lg:ml-10 mb-2 md:mb-4">
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
                    className="bg-gradient-to-r from-[#f82855] via-[#c91767] to-[#962fbf] hover:from-[#fd5949] hover:via-[#d6249f] hover:to-[#285AEB] text-white px-4 md:px-8 py-2 md:py-4 rounded-full text-sm md:text-xl lg:text-2xl font-semibold flex items-center gap-2 md:gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <span>ATENDE NO INSTAGRAM...</span>
                  </Button>
                </div>

                {/* <div className="ml-2 md:ml-10">
                  <span className="block md:inline">ATENDIMENTO 24H</span>{" "}
                  <span className="text-red-600 block md:inline"> com </span>
                  <span className="text-yellow-400 block md:inline">Inteligência Artificial!</span>
                </div> */}

              </div>

            </div>

            {/* Coluna da imagem - lado direito */}
            <div className="lg:col-span-2 flex justify-center lg:justify-end items-center order-last">
              <div className="relative w-full h-[40vh] md:h-[60vh] lg:h-full flex items-center justify-center lg:justify-end">
                {/* Container da imagem otimizado para altura completa - sem animação */}
                <div className="relative h-full w-auto max-w-full">
                  {/* Imagem da Fastbot - altura completa, largura automática - FIXA sem movimento */}
                  <img
                    src={slides[currentSlide].image}
                    alt="Fastbot - Assistente Virtual Profissional da Saúde"
                    className="h-full w-auto object-contain object-center lg:object-right mr-0 lg:mr-20 rounded-[2rem]"
                    onError={handleImageError}
                  />

                  {/* Overlay sutil para melhor integração com o design */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent"></div>
                </div>

                {/* Elementos decorativos externos otimizados - COM ANIMAÇÃO DIAGONAL INTENSA */}
                {/* Bolha amarela - movimento diagonal verdadeiro */}
                <div
                  className="absolute -top-16 -right-6 lg:-top-10 mt-10 lg:-right-10 w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-gradient-to-t from-yellow-800 to-transparent"
                  style={{
                    animation: 'floatDiagonal1 68s linear infinite',
                    animationDelay: '0s',
                    opacity: 0.6
                  }}
                ></div>
                {/* Bolha roxa - movimento diagonal verdadeiro */}
                <div
                  className="absolute -bottom-6 mt-2 mb-20 -left-6 lg:-bottom-10 lg:-left-10 w-12 h-12 lg:w-20 lg:h-20 rounded-full bg-gradient-to-t from-purple-800 to-transparent"
                  style={{
                    animation: 'floatDiagonal2 46s linear infinite',
                    animationDelay: '0s',
                    opacity: 0.6
                  }}
                ></div>
                {/* Bolha azul - movimento diagonal verdadeiro */}
                <div
                  className="absolute top-1/4 -left-8 lg:-left-12 w-12 h-12 lg:w-12 lg:h-12 rounded-full bg-gradient-to-t from-primary/40 to-transparent"
                  style={{
                    animation: 'floatDiagonal3 114s linear infinite',
                    animationDelay: '0s',
                    opacity: 0.6
                  }}
                ></div>

                {/* Nova bolha cinza - com fundo gradiente e movimento diagonal */}
                <div
                  className="absolute top-1/3 -right-4 lg:top-1/3 lg:-right-8 w-14 h-14 lg:w-18 lg:h-18 border-1 rounded-full bg-gradient-to-t from-white to-gray-500 border-white"
                  style={{
                    animation: 'floatDiagonal4 58s linear infinite',
                    animationDelay: '2s',
                    opacity: 0.35
                  }}
                ></div>

                {/* Nova bolha verde - com fundo gradiente e movimento diagonal */}
                <div
                  className="absolute bottom-1/3 left-2 lg:bottom-1/3 lg:left-0 w-10 h-10 lg:w-16 lg:h-16 rounded-full border-1 bg-gradient-to-t from-green-500 to-transparent border-green-500"
                  style={{
                    animation: 'floatDiagonal5 102s linear infinite',
                    animationDelay: '4s',
                    opacity: 0.35
                  }}
                ></div>

                {/* Bolhas adicionais para a área do texto (lado esquerdo) - movimento diagonal */}
                {/* Bolha laranja na área dos títulos */}
                <div
                  className="absolute top-20 left-10 lg:top-24 lg:left-16 w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-orange-400 to-transparent"
                  style={{
                    animation: 'floatDiagonal6 86s linear infinite',
                    animationDelay: '1s',
                    opacity: 0.5
                  }}
                ></div>

                {/* Bolha rosa no meio da área de texto */}
                <div
                  className="absolute top-1/2 left-1/4 lg:top-1/2 lg:left-1/3 w-6 h-6 lg:w-10 lg:h-10 rounded-full border-1 bg-gradient-to-br from-pink-400 to-pink-200 border-pink-400"
                  style={{
                    animation: 'floatDiagonal7 126s linear infinite',
                    animationDelay: '6s',
                    opacity: 0.3
                  }}
                ></div>

                {/* Bolha turquesa próxima aos botões */}
                <div
                  className="absolute bottom-1/4 left-8 lg:bottom-1/4 lg:left-12 w-7 h-7 lg:w-11 lg:h-11 rounded-full bg-gradient-to-t from-teal-500 to-transparent"
                  style={{
                    animation: 'floatDiagonal8 92s linear infinite',
                    animationDelay: '3s',
                    opacity: 0.5
                  }}
                ></div>

                {/* Bolha violeta sutil no topo esquerdo */}
                <div
                  className="absolute top-16 left-1/3 lg:top-20 lg:left-1/4 w-5 h-5 lg:w-8 lg:h-8 rounded-full border-1 bg-gradient-to-br from-violet-400 to-violet-200 border-violet-400"
                  style={{
                    animation: 'floatDiagonal1 80s linear infinite',
                    animationDelay: '7s',
                    opacity: 0.35
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

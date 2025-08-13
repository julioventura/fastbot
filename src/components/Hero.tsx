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

              {/* ATENDE NO SEU WHATSAPP */}
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
                  <span>COLE NO WHATSAPP...</span>
                </Button>
              </div>

              {/* ATENDE NO SEU INSTAGRAM... */}
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
                  <span>COLE NO INSTAGRAM...</span>
                </Button>
              </div>

              {/* E ATENDE NO SEU SITE... */}
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
                  <span>E ATENDA 24h COM I.A.</span>
                </Button>
              </div>

              {/* Não tem site? */}
              <div className="flex flex-row gap-1 ml-10">
                <Button
                  className="bg-transparent py-4 mt-8 text-primary hover:text-blue-400 text-2xl italic font-bold transform hover:scale-105 hover:bg-transparent transition-all duration-300 leading-[140%] text-left"
                >
                  Ela responde mensagens, agenda, relembra...<br />
                  24 horas por dia, 7 dias por semana, o ano todo!<br />
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
              <div
                className="absolute -top-16 -right-6 lg:-top-10 mt-10 lg:-right-10 w-16 h-16 lg:w-24 lg:h-24 bg-yellow-400 opacity-70 dark:opacity-50 rounded-full"
                style={{
                  animation: 'floatPulse 12s ease-in-out infinite',
                  animationDelay: '0s'
                }}
              ></div>
              <div
                className="absolute -bottom-6 mt-2 mb-20 -left-6 lg:-bottom-10 lg:-left-10 w-12 h-12 lg:w-20 lg:h-20 bg-purple-400 opacity-60 dark:opacity-40 rounded-full"
                style={{
                  animation: 'floatPulse 8s ease-in-out infinite',
                  animationDelay: '0s'
                }}
              ></div>
              <div
                className="absolute top-1/4 -left-8 lg:-left-12 w-12 h-12 lg:w-12 lg:h-12 bg-primary opacity-50 dark:opacity-30 rounded-full"
                style={{
                  animation: 'floatPulse 20s ease-in-out infinite',
                  animationDelay: '0s'
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
  );
};

export default Hero;

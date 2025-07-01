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

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

// Componente Hero
// Define a estrutura e o layout da seção principal (Hero) da página inicial.
const Hero = () => {
  const { theme } = useTheme();
  const [useImageFallback, setUseImageFallback] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: '/fastbot/ana-hero.png',
      text: ['Olá!', 'Sou Ana.', 'Sua atendente', 'chatbot de IA'],
    },
    {
      image: '/fastbot/ana-hero-5.png',
      text: ['Faça seu', 'chatbot de IA', 'em apenas', '3 minutos!'],
    },
  ];

  // Determina qual imagem usar
  const getImageSrc = () => {
    if (theme === 'dark' && !useImageFallback) {
      return "/fastbot/ana-hero.png";
      // return "/fastbot/hero-ana-dark.png";
    }
    return "/fastbot/ana-hero.png";
  };

  // Handler para erro de carregamento da imagem
  const handleImageError = () => {
    setUseImageFallback(true);
  };


  // Troca automática de slides a cada 5 segundos
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center bg-background">
      {/* Fundo com gradiente suave responsivo ao tema */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-primary/5"></div>

      {/* Container principal ocupando toda a altura disponível */}
      <div className="container relative z-10 mx-auto px-4 w-full">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-12 items-center h-screen max-h-screen">

          {/* Coluna do texto - lado esquerdo (40% no desktop) */}
          <div className="lg:col-span-2 flex flex-col justify-center space-y-6 lg:space-y-8 py-8">
            {/* Título Principal */}
            <div className="space-y-2 ml-10">
              {/* Sempre 4 linhas, cada uma com seu estilo. Se faltar, exibe vazio. */}
              <span className="block text-4xl md:text-6xl lg:text-7xl font-black leading-tight gradient-text-red">
                {slides[currentSlide].text[0] || ''}
              </span>
              <span className="block text-4xl md:text-6xl lg:text-7xl font-black leading-tight gradient-text-red">
                {slides[currentSlide].text[1] || ''}
              </span>
              <span className="block text-4xl md:text-6xl lg:text-7xl font-black leading-tight gradient-text-blue">
                {slides[currentSlide].text[2] || ''}
              </span>
              <span className="block text-4xl md:text-6xl lg:text-7xl font-black leading-tight gradient-text-purple">
                {slides[currentSlide].text[3] || ''}
              </span>
            </div>

            {/* Botão CTA */}
            <div className="pt-4">
              <Button className="hero-cta-button bg-primary hover:bg-primary/90 text-primary-foreground ml-10 px-8 py-6 rounded-full text-lg font-semibold flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <span>COMECE JÁ O PLANO GRATUITO!</span>
                {/* <ArrowRight className="h-5 w-5" /> */}
              </Button>
            </div>
          </div>

          {/* Coluna da imagem - lado direito (60% no desktop) */}
          <div className="lg:col-span-3 flex justify-center lg:justify-end items-stretch h-full">
            <div className="relative character-illustration w-full h-full flex items-center justify-center">
              {/* Container da imagem otimizado para altura completa */}
              <div className="relative h-[85vh] lg:h-[90vh] w-auto max-w-full">
                {/* Imagem da Ana - altura completa, largura automática */}
                <img
                  src={slides[currentSlide].image}
                  alt="Ana - Assistente Virtual Profissional da Saúde"
                  className="h-full w-auto object-contain object-center"
                  onError={handleImageError}
                />

                {/* Overlay sutil para melhor integração com o design */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent"></div>
              </div>

              {/* Elementos decorativos externos otimizados */}
              <div className="absolute -top-6 -right-6 lg:-top-10 lg:-right-10 w-16 h-16 lg:w-24 lg:h-24 decoration-circle bg-yellow-400 opacity-70 dark:opacity-50"></div>
              <div className="absolute -bottom-6 -left-6 lg:-bottom-10 lg:-left-10 w-12 h-12 lg:w-20 lg:h-20 decoration-circle bg-purple-400 opacity-60 dark:opacity-40"></div>
              <div className="absolute top-1/4 -left-8 lg:-left-12 w-8 h-8 lg:w-12 lg:h-12 decoration-circle bg-primary opacity-50 dark:opacity-30"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação do Carrossel - setas laterais centralizadas verticalmente */}
      <button
        onClick={prevSlide}
        aria-label="Slide anterior"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white/80 hover:bg-primary/90 text-primary hover:text-white shadow-lg transition-all duration-200"
        style={{outline: 'none', border: 'none'}}
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <button
        onClick={nextSlide}
        aria-label="Próximo slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white/80 hover:bg-primary/90 text-primary hover:text-white shadow-lg transition-all duration-200"
        style={{outline: 'none', border: 'none'}}
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </section>
  );
};

export default Hero;

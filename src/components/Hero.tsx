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

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Componente Hero
// Define a estrutura e o layout da seção principal (Hero) da página inicial.
const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-hero-new min-h-screen flex items-center">
      {/* Fundo com gradiente suave */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      
      {/* Container principal ocupando toda a altura disponível */}
      <div className="container relative z-10 mx-auto px-4 w-full">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-12 items-center h-screen max-h-screen">
          
          {/* Coluna do texto - lado esquerdo (40% no desktop) */}
          <div className="lg:col-span-2 flex flex-col justify-center space-y-6 lg:space-y-8 py-8">
            {/* Título Principal */}
            <div className="space-y-2 ml-10">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
                {/* <span className="block gradient-text-purple">Ana.</span> */}
                <span className="block gradient-text-red">Ana.</span>
                <span className="block gradient-text-blue">Sua atendente de IA</span>
                {/* <span className="block text-gray-900">Sua assistente</span> */}
                <span className="block gradient-text-purple">em 3  <br />minutos!</span>
              </h1>
            </div>

            {/* Botão CTA */}
            <div className="pt-4">
              <Button className="hero-cta-button text-white ml-10 px-8 py-6 rounded-full text-lg font-semibold flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <span>PLANO GRATUITO!</span>
                <ArrowRight className="h-5 w-5" />
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
                  src="/fastbot/hero-ana.png"
                  alt="Ana - Assistente Virtual Profissional da Saúde"
                  className="h-full w-auto object-contain object-center"
                />
                
                {/* Overlay sutil para melhor integração com o design */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-50/10 to-transparent"></div>
              </div>
              
              {/* Elementos decorativos externos otimizados */}
              <div className="absolute -top-6 -right-6 lg:-top-10 lg:-right-10 w-16 h-16 lg:w-24 lg:h-24 decoration-circle bg-yellow-300 opacity-80"></div>
              <div className="absolute -bottom-6 -left-6 lg:-bottom-10 lg:-left-10 w-12 h-12 lg:w-20 lg:h-20 decoration-circle bg-purple-300 opacity-60"></div>
              <div className="absolute top-1/4 -left-8 lg:-left-12 w-8 h-8 lg:w-12 lg:h-12 decoration-circle bg-blue-300 opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

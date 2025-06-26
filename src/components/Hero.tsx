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
    // Elemento <section> principal com estilos de fundo, altura mínima e centralização de conteúdo.
    // 'relative overflow-hidden' é usado para conter os elementos de decoração absoluta e evitar barras de rolagem indesejadas.
    <section className="relative overflow-hidden bg-theme-gradient min-h-screen flex items-center justify-center">
      
      {/* Efeito de Brilho SVG (Decorativo) */}
      {/* Este div contém um SVG que cria um efeito de brilho de fundo dinâmico. */}
      {/* 'absolute inset-0 z-0 overflow-hidden' posiciona o SVG para preencher a seção e ficar atrás do conteúdo principal. */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg className="w-full h-full opacity-60" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {/* Grupo de elementos SVG para o brilho, com filtros de desfoque aplicados. */}
          <g opacity="0.4" filter="url(#filter0_f_101_3)">
            <circle cx="1079" cy="540" r="359" fill="#0063F7" />
          </g>
          <g opacity="0.3" filter="url(#filter1_f_101_3)">
            <circle cx="541" cy="540" r="359" fill="#8B2CF5" />
          </g>
          {/* Definições dos filtros SVG (GaussianBlur) usados para criar o efeito de brilho suave. */}
          <defs>
            <filter id="filter0_f_101_3" x="520" y="-19" width="1118" height="1118" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_101_3" />
            </filter>
            <filter id="filter1_f_101_3" x="-18" y="-19" width="1118" height="1118" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_101_3" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* Padrão de Grade Sobreposto (Decorativo) */}
      {/* Este div cria um padrão de grade sutil sobre o fundo. */}
      {/* 'absolute inset-0 z-0 opacity-20' posiciona a grade para preencher a seção e ficar atrás do conteúdo principal. */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div
          className="h-full w-full grid"
          style={{
            gridTemplateRows: 'repeat(20, 1fr)', // Define 20 linhas para a grade.
            gridTemplateColumns: 'repeat(20, 1fr)', // Define 20 colunas para a grade.
          }}
        >
          {/* Linhas Horizontais da Grade */}
          {/* Mapeamento para criar as linhas horizontais da grade. */}
          {Array.from({ length: 21 }).map((_, index) => (
            <div
              key={`h-${index}`} // Chave única para cada linha horizontal.
              className="absolute left-0 right-0 border-t border-[#4f9bff]/30" // Estilos da linha.
              style={{ top: `${(index * 100) / 20}%` }} // Posicionamento vertical da linha.
            />
          ))}

          {/* Linhas Verticais da Grade */}
          {/* Mapeamento para criar as linhas verticais da grade. */}
          {Array.from({ length: 21 }).map((_, index) => (
            <div
              key={`v-${index}`} // Chave única para cada linha vertical.
              className="absolute top-0 bottom-0 border-l border-[#4f9bff]/30" // Estilos da linha.
              style={{ left: `${(index * 100) / 20}%` }} // Posicionamento horizontal da linha.
            />
          ))}
        </div>
      </div>

      {/* Contêiner do Conteúdo Principal da Seção Hero */}
      {/* 'relative z-10' garante que este conteúdo fique acima dos elementos decorativos. */}
      {/* 'data-lov-id' é um atributo de dados personalizado, possivelmente para rastreamento ou testes. */}
      <div className="section-container relative z-10 pt-16 pb-20" data-lov-id="hero-section">
        {/* Contêiner para centralizar o texto e limitar a largura máxima. */}
        <div className="max-w-4xl mx-auto text-center">
          {/* Título Principal (H1) */}
          {/* 'gradient-text' aplica um estilo de texto com gradiente. */}
          <h1 className="text-4xl md:text-6xl font-bold gradient-text">
            Seu<br />
            <span className='text-white'>ChatBot de IA</span><br />
            <span className='text-4xl md:text-6xl gradient-text'>em 3 minutos!</span> <br />&nbsp;
          </h1>

          {/* Subtítulo/Descrição */}
          <p className="text-lg md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Chatbot de IA + Homepage profissional
          </p>

          {/* Botão de Chamada para Ação (CTA) */}
          {/* Layout flexível para o botão, responsivo para telas pequenas. */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button className="hero-button bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-full text-lg flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.6)]">
              <span>Use nosso Plano Gratuito e comece já!</span>
              {/* Ícone de seta para a direita, indicando progressão ou ação. */}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

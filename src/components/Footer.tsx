import React from 'react';
import { NavLink } from 'react-router-dom';

// Componente Footer
// Define a estrutura e o layout do rodapé da aplicação.
const Footer = () => {
  return (
    // Elemento <footer> principal com estilos de fundo e borda.
    // 'relative' é usado para posicionar os elementos SVG de decoração absoluta dentro dele.
    <footer className="relative bg-background/95 border-t border-theme-accent/30">

      {/* Efeito de Brilho SVG (Decorativo) */}
      {/* Este div contém um SVG que cria um efeito de brilho de fundo. */}
      {/* 'absolute inset-0 z-0 overflow-hidden' posiciona o SVG para preencher o footer e ficar atrás do conteúdo. */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg className="w-full h-full opacity-0" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {/* Grupo de elementos SVG para o brilho, com filtros aplicados. */}
          <g opacity="0.4" filter="url(#filter0_f_101_3)">
            <circle cx="1079" cy="540" r="359" fill="#0063F7" />
          </g>
          <g opacity="0.3" filter="url(#filter1_f_101_3)">
            <circle cx="541" cy="540" r="359" fill="#8B2CF5" />
          </g>
          {/* Definições dos filtros SVG usados para o efeito de desfoque (blur). */}
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
      {/* 'absolute inset-0 z-0 opacity-20' posiciona a grade para preencher o footer e ficar atrás do conteúdo. */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="w-full h-full grid grid-cols-12 grid-rows-12">
          {/* Mapeamento para criar as linhas e colunas da grade. */}
          {Array.from({ length: 13 }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`}>
              {Array.from({ length: 13 }).map((_, colIndex) => (
                <div key={`${rowIndex}-${colIndex}`} className="border-t border-l border-[#2a4980]/30"></div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Contêiner do Conteúdo Principal do Rodapé */}
      {/* 'relative z-10' garante que este conteúdo fique acima dos elementos decorativos. */}
      <div className="section-container py-4 md:py-8 relative z-10" id="footer-section">

        {/* Layout Grid para posicionar logo à esquerda, redes sociais no centro */}
        {/* Grid responsivo: 1 coluna no mobile, 3 colunas no desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 items-center w-full">

          {/* Seção do Logo/Nome da Aplicação - Coluna Esquerda */}
          <div className="flex items-center justify-center md:justify-start order-2 md:order-1">
            <NavLink to="/" className="flex items-center space-x-2 group">
              <div>
                <span className="text-xs md:text-sm text-primary/90 font-bold -mt-1">
                  Dentistas.com.br /&nbsp;
                </span>
                <span className="text-lg md:text-xl font-black text-primary group-hover:text-primary/95 transition-colors">
                  Fastbot
                </span>
              </div>
            </NavLink>
          </div>

          {/* Ícones de Redes Sociais - Coluna Central */}
          <div className="flex justify-center order-1 md:order-2">

            <div className="flex space-x-4 md:space-x-6">

              {/* Link para Facebook */}
              <a href="https://www.facebook.com/dentistas.com.br/" target='_blank' className="text-gray-400 hover:text-primary transition-colors duration-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Link para Instagram */}
              <a href="https://www.instagram.com/dentistascombr/" target='_blank' className="text-gray-400 hover:text-primary transition-colors duration-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

            </div>

          </div>

          {/* Coluna Direita - Vazia para manter simetria no desktop, oculta no mobile */}
          <div className="hidden md:block order-3"></div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;

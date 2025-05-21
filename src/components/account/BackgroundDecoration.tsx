// Componente: BackgroundDecoration
// Funcionalidade:
// Este componente é puramente decorativo e reutilizável, projetado para adicionar
// um efeito de brilho SVG e um padrão de grade sobreposto ao fundo de
// outros componentes ou seções da página. Ele é posicionado de forma absoluta
// para preencher o contêiner pai e ficar atrás do conteúdo principal.
//
// Funções e Constantes Principais:
// - BackgroundDecoration (Componente): Componente funcional React que renderiza os elementos SVG
//   e a grade. Não possui props ou estado interno, sendo focado apenas na apresentação visual.

import React from "react";


// Componente BackgroundDecoration
// Renderiza um efeito de brilho SVG e um padrão de grade para uso como fundo decorativo.
const BackgroundDecoration = () => {
  return (
    // Utiliza um React Fragment (<>) para agrupar os dois elementos de decoração
    // sem adicionar um nó extra ao DOM.
    <>
      {/* Efeito de Brilho SVG (Decorativo) */}
      {/* Este div contém um SVG que cria um efeito de brilho de fundo dinâmico. */}
      {/* 'absolute inset-0 z-0 overflow-hidden' posiciona o SVG para preencher o contêiner pai
          e ficar atrás do conteúdo principal (z-index 0). 'overflow-hidden' previne que
          partes do SVG que excedam os limites do contêiner sejam visíveis. */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg 
          className="w-full h-full opacity-60" // O SVG ocupa todo o espaço do div pai e tem opacidade reduzida.
          viewBox="0 0 1920 1080" // Define a caixa de visualização do SVG.
          fill="none" // Garante que as formas não sejam preenchidas por padrão, a menos que especificado.
          xmlns="http://www.w3.org/2000/svg" // Namespace XML padrão para SVG.
          preserveAspectRatio="none" // Permite que o SVG seja esticado para preencher o contêiner sem manter a proporção.
        >
          {/* Primeiro círculo de brilho */}
          <g opacity="0.4" filter="url(#filter0_f_101_3)"> 
            {/* 'g' agrupa elementos SVG. 'opacity' define a opacidade do grupo.
                'filter' aplica um filtro SVG definido abaixo (efeito de desfoque). */}
            <circle cx="1079" cy="540" r="359" fill="#0063F7" /> 
            {/* 'circle' desenha um círculo. 'cx', 'cy' são as coordenadas do centro,
                'r' é o raio, 'fill' é a cor de preenchimento. */}
          </g>
          {/* Segundo círculo de brilho */}
          <g opacity="0.3" filter="url(#filter1_f_101_3)">
            <circle cx="541" cy="540" r="359" fill="#8B2CF5" />
          </g>
          {/* Definições dos filtros SVG */}
          {/* 'defs' contém definições de elementos que podem ser reutilizados, como filtros. */}
          <defs>
            {/* Filtro para o primeiro círculo (desfoque gaussiano) */}
            <filter 
              id="filter0_f_101_3" // ID único para referenciar este filtro.
              x="520" y="-19" // Coordenadas e dimensões da região do filtro.
              width="1118" height="1118" 
              filterUnits="userSpaceOnUse" // Unidades para x, y, width, height.
              colorInterpolationFilters="sRGB" // Espaço de cor para operações de filtro.
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" /> 
              {/* 'feFlood' preenche a região do filtro com uma cor e opacidade.
                  'result' nomeia a saída desta operação de filtro. */}
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              {/* 'feBlend' combina duas entradas. 'in' é a entrada principal (o gráfico original),
                  'in2' é a segunda entrada. 'mode' define o modo de mesclagem. */}
              <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_101_3" />
              {/* 'feGaussianBlur' aplica um desfoque gaussiano. 'stdDeviation' controla a intensidade do desfoque. */}
            </filter>
            {/* Filtro para o segundo círculo (desfoque gaussiano) */}
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
      {/* 'absolute inset-0 z-0 opacity-20' posiciona a grade para preencher o contêiner pai,
          ficar atrás do conteúdo principal e ter uma opacidade reduzida. */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div
          className="h-full w-full grid" // Utiliza CSS Grid para criar o padrão.
          style={{
            gridTemplateRows: 'repeat(20, 1fr)', // Define 20 linhas de igual altura.
            gridTemplateColumns: 'repeat(20, 1fr)', // Define 20 colunas de igual largura.
          }}
        >
          {/* Linhas Horizontais da Grade */}
          {/* Array.from é usado para gerar um array de divs que representarão as linhas. */}
          {Array.from({ length: 21 }).map((_, index) => (
            <div
              key={`h-${index}`} // Chave única para cada linha, importante para o React.
              className="absolute left-0 right-0 border-t border-[#4f9bff]/30" // Estilos da linha: posicionamento absoluto, largura total, borda superior.
              style={{ top: `${(index * 100) / 20}%` }} // Posicionamento vertical da linha, distribuído uniformemente.
            />
          ))}

          {/* Linhas Verticais da Grade */}
          {/* Similar às linhas horizontais, mas para as colunas. */}
          {Array.from({ length: 21 }).map((_, index) => (
            <div
              key={`v-${index}`} // Chave única para cada coluna.
              className="absolute top-0 bottom-0 border-l border-[#4f9bff]/30" // Estilos da coluna: posicionamento absoluto, altura total, borda esquerda.
              style={{ left: `${(index * 100) / 20}%` }} // Posicionamento horizontal da coluna, distribuído uniformemente.
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default BackgroundDecoration;

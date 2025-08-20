// Componente: CTA (Call to Action)
// Funcionalidade:
// Este componente renderiza a seção de "Chamada para Ação" da página.
// Ele exibe um título chamativo, uma breve descrição e um botão principal
// para incentivar o usuário a iniciar o uso do serviço.
// A seção possui um efeito visual de fundo com um padrão de grade.
//
// Funções e Constantes Principais:
// - CTA (Componente): Componente funcional React que renderiza a estrutura da seção de CTA.
//   - Não possui funções ou constantes complexas internas, sendo primariamente JSX para layout e estilo.
//   - Utiliza o componente Button e o ícone ArrowRight (atualmente comentado no código original).

import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
// import { ArrowRight } from 'lucide-react'; // Ícone ArrowRight importado mas não utilizado no JSX atual.


// Componente CTA
// Define a estrutura e o layout da seção de Chamada para Ação.
export default function CTA() {
  const navigate = useNavigate();

  return (
    <>
      {/* CSS personalizado para rotação de 360 graus */}
      <style>{`
        .hover-rotate-360:hover {
          transform: rotate(360deg);
        }
      `}</style>

      {/* Elemento <section> principal com estilos de fundo e posicionamento relativo. */}
      {/* 'relative' é usado para posicionar o padrão de grade absoluto dentro dele. */}
      {/* 'min-h-screen flex items-center justify-center' para ocupar altura da tela e centralizar */}
      <section className="relative min-h-screen flex items-center justify-center py-8 md:py-16 bg-theme-gradient">

        {/* Contêiner do Conteúdo Principal da Seção CTA */}
        {/* 'relative z-10' garante que este conteúdo fique acima do padrão de grade. */}
        <div className="section-container relative z-10 px-4 md:px-8" id="cta-section">
          {/* Contêiner para centralizar o texto e limitar a largura máxima. */}
          <div className="max-w-4xl mx-auto text-center">
            {/* Bloco de texto principal da CTA. */}
            <div className="text-center mt-16 md:mt-32 mb-8 md:mb-12">
              {/* Título da CTA */}
              <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6 text-foreground">
                Pronto  <span className="text-theme-accent"> em </span> <span className="text-yellow-400">3 minutos!</span>
              </h2>

              {/* Descrição/Subtítulo da CTA */}
              <p className="text-lg md:text-xl text-foreground font-bold max-w-3xl mx-auto">
                É configurar... e usar!
              </p>

              {/* Imagem GPT-5 - Badge de destaque */}
              <div className="flex justify-center my-4 md:my-6">
                <img
                  src="https://dentistas.com.br/fastbot/GPT-5.png"
                  alt="Powered by GPT-5"
                  className="h-[200px] md:h-[280px] w-[200px] md:w-[280px] object-contain opacity-90 hover:opacity-100 hover-rotate-360 transition-all duration-700"
                />
              </div>

              {/* Botão de Chamada para Ação */}
              <div className="mt-6 md:mt-10">
                <Button
                  onClick={() => navigate('/account')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 md:px-8 py-4 md:py-6 text-base md:text-lg rounded-lg w-full md:w-auto"
                >
                  COMECE JÁ O PLANO GRATUITO!
                </Button>
              </div>

            </div>
          </div>
        </div>

        {/* Padrão de Grade Sobreposto (Decorativo) */}
        {/* Este div cria um padrão de grade sutil sobre o fundo. */}
        {/* 'absolute inset-0 z-0 opacity-20' posiciona a grade para preencher a seção e ficar atrás do conteúdo. */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div
            className="h-full w-full grid"
            style={{
              gridTemplateRows: 'repeat(20, 1fr)', // Define 20 linhas para a grade.
              gridTemplateColumns: 'repeat(20, 1fr)', // Define 20 colunas para a grade.
            }}
          >
            {/* Linhas Horizontais da Grade */}
            {/* Mapeamento para criar as linhas horizontais. */}
            {Array.from({ length: 21 }).map((_, index) => (
              <div
                key={`h-cta-${index}`} // Chave única para cada linha horizontal.
                className="absolute left-0 right-0 border-t border-primary/30" // Estilos da linha.
                style={{ top: `${(index * 100) / 20}%` }} // Posicionamento vertical da linha.
              />
            ))}

            {/* Linhas Verticais da Grade */}
            {/* Mapeamento para criar as linhas verticais. */}
            {Array.from({ length: 21 }).map((_, index) => (
              <div
                key={`v-cta-${index}`} // Chave única para cada linha vertical.
                className="absolute top-0 bottom-0 border-l border-primary/30" // Estilos da linha.
                style={{ left: `${(index * 100) / 20}%` }} // Posicionamento horizontal da linha.
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
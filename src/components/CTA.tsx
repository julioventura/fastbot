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
    // Elemento <section> principal com estilos de fundo e posicionamento relativo.
    // 'relative' é usado para posicionar o padrão de grade absoluto dentro dele.
    <section className="relative py-5 md:py-16 bg-theme-gradient">
      
      {/* Contêiner do Conteúdo Principal da Seção CTA */}
      {/* 'relative z-10' garante que este conteúdo fique acima do padrão de grade. */}
      <div className="section-container relative z-10" id="cta-section">
        {/* Contêiner para centralizar o texto e limitar a largura máxima. */}
        <div className="max-w-4xl mx-auto text-center">
          {/* Bloco de texto principal da CTA. */}
          <div className="text-center mb-12">
            {/* Título da CTA */}
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
              Pronto  <span className="text-theme-accent"> em </span> <span className="text-yellow-400">3 minutos!</span>
            </h2>

            {/* Descrição/Subtítulo da CTA */}
            <p className="text-xl text-foreground font-bold max-w-3xl mx-auto">
              É configurar... e usar!
            </p>

            {/* Botão de Chamada para Ação */}
            <div className="mt-20">
              <Button 
                onClick={() => navigate('/account')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-lg"
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
  );
}
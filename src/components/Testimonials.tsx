// Componente: Testimonials
// Funcionalidade:
// Este componente renderiza a seção de "Depoimentos" da página inicial.
// Ele exibe uma coleção de citações de clientes ou usuários, cada uma com o nome
// do autor e seu cargo ou afiliação.
// A seção possui efeitos visuais de fundo, como um brilho SVG animado e um padrão de grade.
//
// Funções e Constantes Principais:
// - testimonials (const): Array de objetos, onde cada objeto representa um depoimento.
//   - Cada objeto contém:
//     - quote (string): A citação do depoimento.
//     - author (string): O nome da pessoa que forneceu o depoimento.
//     - role (string): O cargo ou afiliação do autor.
// - Testimonials (Componente): Componente funcional React que renderiza a estrutura da seção de depoimentos.
//   - Mapeia o array 'testimonials' para renderizar um card para cada depoimento.

import React from 'react';
import { Card } from '@/components/ui/card';


// Constante testimonials
// Array contendo os dados de cada depoimento a ser exibido.
// Cada objeto no array define a citação, autor e cargo/papel do autor.
const testimonials = [
    {
        quote: 'O TutFOP expandiu a comunicação com os alunos. Conseguimos dar dupla checagem aos diagnósticos e planos de tratamento dos alunos, com o acompanhamento críticpo e explicativo de um tutor virtual ded I.A. munido de conhecimento específico pré-selecionado.',
        author: 'Prof. Paulo Reis',
        role: 'Professor de Endodontia, FOP-PE',
        name: 'TutFOP',
        local: 'Disciplina de Endodontia da FO-UPE',
    },
    {
        quote: 'A Manu dinamizou a comunicação do nosso aplicativo de gestão de pacientes do projeto de doutorado com  os funcionários e pacientes. Atuando como interface de acesso simplificada, tanto para pacientes via whatsapp (texto e audio) como para a equipe acessar os dados por conversa com a IA.',
        author: 'Profa. Emanuelle',
        role: 'Doutoranda',
        name: 'Manu',
        local: 'Projeto de doutorado da FO-UFC',
    },
    {
        quote: 'Implementamos o Bob no atendimento automatizado por whatsapp aos candidatos à seleção do nosso curso de especialização, respondendo dúvidas, passando links e dando um incentivo à decisão positiva do candidato.',
        author: 'Dra. Juliana Costa',
        role: 'Cirurgiã-Dentista, Clínica Oral Care',
        name: 'Bob',
        local: 'Depto de O. Legal e Saúde Coletiva. FO-UFRJ',
    },
];


// Componente Testimonials
// Define a estrutura e o layout da seção de depoimentos da aplicação.
const Testimonials = () => {
    return (
        // Elemento <section> principal com estilos de fundo e posicionamento relativo.
        // 'relative' é usado para posicionar os elementos SVG de decoração e a grade absoluta dentro dele.
        <section className="relative py-5 md:py-0 bg-theme-gradient-alt">

            {/* Efeito de Brilho SVG (Decorativo) */}
            {/* Este div contém um SVG que cria um efeito de brilho de fundo dinâmico. */}
            {/* 'absolute inset-0 z-0 overflow-hidden' posiciona o SVG para preencher a seção e ficar atrás do conteúdo principal. */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <svg className="w-full h-full opacity-60" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    {/* Grupos de elementos SVG para o brilho, com filtros de desfoque aplicados. */}
                    {/* IDs dos filtros são únicos para este componente para evitar conflitos. */}
                    <g opacity="0.4" filter="url(#filter0_f_testimonials)">
                        <circle cx="1079" cy="540" r="359" fill="#0063F7" />
                    </g>
                    <g opacity="0.3" filter="url(#filter1_f_testimonials)">
                        <circle cx="541" cy="540" r="359" fill="#8B2CF5" />
                    </g>
                    <defs>
                        <filter id="filter0_f_testimonials" x="520" y="-19" width="1118" height="1118" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                            <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_testimonials" />
                        </filter>
                        <filter id="filter1_f_testimonials" x="-18" y="-19" width="1118" height="1118" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                            <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_testimonials" />
                        </filter>
                    </defs>
                </svg>
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
                            key={`h-testimonials-${index}`} // Chave única para cada linha horizontal.
                            className="absolute left-0 right-0 border-t border-[#4f9bff]/30" // Estilos da linha.
                            style={{ top: `${(index * 100) / 20}%` }} // Posicionamento vertical da linha.
                        />
                    ))}

                    {/* Linhas Verticais da Grade */}
                    {/* Mapeamento para criar as linhas verticais. */}
                    {Array.from({ length: 21 }).map((_, index) => (
                        <div
                            key={`v-testimonials-${index}`} // Chave única para cada linha vertical.
                            className="absolute top-0 bottom-0 border-l border-[#4f9bff]/30" // Estilos da linha.
                            style={{ left: `${(index * 100) / 20}%` }} // Posicionamento horizontal da linha.
                        />
                    ))}
                </div>
            </div>

            {/* Contêiner do Conteúdo Principal da Seção de Depoimentos */}
            {/* 'relative z-10' garante que este conteúdo fique acima dos elementos decorativos. */}
            {/* 'id' para possível navegação interna na página. */}
            <div className="section-container relative z-10" id="testimonials-section">
                {/* Título da Seção */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                        <p><span className="text-theme-accent">O que falam de nossos</span> chatbots...</p>
                        <p className="text-4xl text-theme-accent"><i>TutFop, Manu e Bob, parentes de <span className="text-theme-accent text-5xl">Ana...</span></i> <span className="inline-block">😉</span></p>
                    </h2>

                </div>

                {/* Grade de Cards de Depoimentos */}
                {/* Layout responsivo: 1 coluna em telas pequenas, 3 colunas em médias e grandes. */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Mapeamento do array 'testimonials' para renderizar cada card de depoimento. */}
                    {testimonials.map((testimonial, index) => (
                        <Card
                            key={index} // Chave única para cada card.
                            // Estilos do card, incluindo fundo, borda, sombra e efeito de hover.
                            className="p-8 bg-theme-card backdrop-blur-sm border border-theme-accent/50 shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                            {/* Layout flexível interno para o conteúdo do card. */}
                            <div className="flex flex-col h-full">
                                {/* Ícone de Aspas (Citação) */}
                                <div className="mb-6 text-brightpurple-500 font-bold"> {/* Cor ajustada para 'brightpurple-500' */}
                                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                    </svg>
                                <span className='text-4xl text-brightpurple-500'>{testimonial.name}</span>
                                <p><span className='text-sm ml-1 text-brightpurple-500'>{testimonial.local}</span></p>
                                </div>


                                {/* Texto do Depoimento (Citação) */}
                                {/* 'flex-grow' permite que esta seção expanda e alinhe o autor/cargo na parte inferior. */}
                                <p className="text-gray-400 text-lg mb-6 flex-grow">{testimonial.quote}</p>
                                {/* Informações do Autor do Depoimento */}
                                <div>
                                    <p className="font-bold gradient-text">{testimonial.author}</p>
                                    <p className="text-sm gradient-text">{testimonial.role}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;

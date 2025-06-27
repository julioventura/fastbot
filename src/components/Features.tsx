// Componente: Features
// Funcionalidade:
// Este componente renderiza a seção de "Recursos" da página inicial.
// Ele exibe uma lista de funcionalidades chave da aplicação, cada uma com um título,
// uma breve descrição e um ícone representativo.
// A seção possui efeitos visuais de fundo, como um brilho SVG animado e um padrão de grade.
//
// Funções e Constantes Principais:
// - features (const): Array de objetos, onde cada objeto representa uma funcionalidade.
//   - Cada objeto contém:
//     - title (string): O título da funcionalidade.
//     - description (string): Uma breve descrição da funcionalidade.
//     - icon (JSX.Element): Um elemento JSX que renderiza o ícone da funcionalidade.
// - Features (Componente): Componente funcional React que renderiza a estrutura da seção de recursos.
//   - Mapeia o array 'features' para renderizar um card para cada funcionalidade.

import React from 'react';


// Constante features
// Array contendo os dados de cada funcionalidade a ser exibida.
// Cada objeto no array define o título, descrição e ícone de uma feature.
const features = [
    {
        title: 'Agent Browser',
        description:
            'Inicie navegadores de agentes com uma única chamada de API. Nossa tecnologia de navegador vem com IA embutida que entende o conteúdo, extrai dados e ajuda a navegar de forma eficiente.',
        // Ícone para "Agent Browser"
        icon: (
            <div className="w-16 h-16 rounded-full bg-theme-card border border-theme-accent/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,99,247,0.3)]">
                <svg
                    className="w-8 h-8 text-theme-accent drop-shadow-[0_0_8px_rgba(79,155,255,0.5)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                </svg>
            </div>
        ),
    },

    {
        title: 'Seu site com recepcionista!',
        description:
            'Seu chatbot é a porta de entrada do seu site. DÚVIDAS? FAQ? PREÇOS? COMO CONFIGURAR? Pergunte ao CHATBOT!',
        // Ícone para "Seu site com recepcionista!"
        icon: (
            <div className="w-16 h-16 rounded-full bg-theme-card border border-theme-accent/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,99,247,0.3)]">
                <svg
                    className="w-8 h-8 text-theme-accent drop-shadow-[0_0_8px_rgba(79,155,255,0.5)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                </svg>
            </div>
        ),
    },

    {
        title: 'Web Understanding',
        description:
            'Nosso navegador entende o conteúdo, significado e objetos em páginas da web, permitindo que seus agentes de IA naveguem e extraiam dados facilmente.',
        // Ícone para "Web Understanding"
        icon: (
            <div className="w-16 h-16 rounded-full bg-theme-card border border-theme-accent/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,99,247,0.3)]">
                <svg
                    className="w-8 h-8 text-theme-accent drop-shadow-[0_0_8px_rgba(79,155,255,0.5)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                </svg>
            </div>
        ),
    },
];


// Componente Features
// Define a estrutura e o layout da seção de recursos da aplicação.
const Features = () => {
    return (
        // Elemento <section> principal com ID para navegação e estilos de fundo.
        // 'relative' é usado para posicionar os elementos SVG de decoração absoluta dentro dele.
        <section
            id="features"
            className="relative min-h-screen flex items-center justify-center py-16 md:py-24 bg-theme-gradient-alt"
        >
            {/* Efeito de Brilho SVG (Decorativo) */}
            {/* Este div contém um SVG que cria um efeito de brilho de fundo. */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <svg
                    className="w-full h-full opacity-60"
                    viewBox="0 0 1920 1080"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                >
                    {/* Grupos de elementos SVG para o brilho, com filtros aplicados. */}
                    <g opacity="0.5" filter="url(#filter0_f_101_3_features)">
                        <circle cx="1079" cy="540" r="359" fill="#0063F7" />
                    </g>
                    <g opacity="0.1" filter="url(#filter1_f_101_3_features)">
                        <circle cx="541" cy="540" r="359" fill="#8B2CF5" />
                    </g>
                    {/* Definições dos filtros SVG usados para o efeito de desfoque (blur). */}
                    {/* IDs dos filtros são únicos para este componente para evitar conflitos. */}
                    <defs>
                        <filter
                            id="filter0_f_101_3_features"
                            x="520"
                            y="-19"
                            width="1118"
                            height="1118"
                            filterUnits="userSpaceOnUse"
                            colorInterpolationFilters="sRGB"
                        >
                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                            <feBlend
                                mode="normal"
                                in="SourceGraphic"
                                in2="BackgroundImageFix"
                                result="shape"
                            />
                            <feGaussianBlur
                                stdDeviation="100"
                                result="effect1_foregroundBlur_101_3"
                            />
                        </filter>
                        <filter
                            id="filter1_f_101_3_features"
                            x="-18"
                            y="-19"
                            width="1118"
                            height="1118"
                            filterUnits="userSpaceOnUse"
                            colorInterpolationFilters="sRGB"
                        >
                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                            <feBlend
                                mode="normal"
                                in="SourceGraphic"
                                in2="BackgroundImageFix"
                                result="shape"
                            />
                            <feGaussianBlur
                                stdDeviation="100"
                                result="effect1_foregroundBlur_101_3"
                            />
                        </filter>
                    </defs>
                </svg>
            </div>

            {/* Padrão de Grade Sobreposto (Decorativo) */}
            {/* Este div cria um padrão de grade sutil sobre o fundo. */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div
                    className="h-full w-full grid"
                    style={{
                        gridTemplateRows: 'repeat(20, 1fr)',
                        gridTemplateColumns: 'repeat(20, 1fr)',
                    }}
                >
                    {/* Linhas Horizontais da Grade */}
                    {Array.from({ length: 21 }).map((_, index) => (
                        <div
                            key={`h-features-${index}`} // Chave única para elementos da grade.
                            className="absolute left-0 right-0 border-t border-[#4f9bff]/30"
                            style={{ top: `${(index * 100) / 20}%` }}
                        />
                    ))}

                    {/* Linhas Verticais da Grade */}
                    {Array.from({ length: 21 }).map((_, index) => (
                        <div
                            key={`v-features-${index}`} // Chave única para elementos da grade.
                            className="absolute top-0 bottom-0 border-l border-[#4f9bff]/30"
                            style={{ left: `${(index * 100) / 20}%` }}
                        />
                    ))}
                </div>
            </div>

            {/* Contêiner do Conteúdo Principal da Seção de Recursos */}
            {/* 'relative z-10' garante que este conteúdo fique acima dos elementos decorativos. */}
            <div
                data-lov-id="features-section" // Atributo de dados para identificação (se necessário).
                className="section-container relative z-10"
            >
                {/* Título da Seção */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                        <span className="text-theme-accent">Recursos</span> Poderosos
                    </h2>
                </div>

                {/* Grade de Cards de Funcionalidades */}
                {/* Layout responsivo: 1 coluna em telas pequenas, 3 colunas em médias e grandes. */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
                    {/* Mapeamento do array 'features' para renderizar cada card de funcionalidade. */}
                    {features.map((feature, index) => (
                        <div
                            key={index} // Chave única para cada card.
                            className="bg-theme-card border border-border rounded-lg shadow-xl p-6 backdrop-blur-md" // Estilos do card adaptados para tema.
                        >
                            {/* Ícone da Funcionalidade */}
                            <div className="mb-4">{feature.icon}</div>
                            {/* Título da Funcionalidade */}
                            <h3 className="text-xl font-semibold mb-2 text-theme-accent">
                                {feature.title}
                            </h3>
                            {/* Descrição da Funcionalidade */}
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;

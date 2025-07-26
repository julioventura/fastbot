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
        title: 'Homepage Profissional Gratuita',
        description:
            'Receba uma homepage profissional em dentistas.com.br/voce totalmente gratuita. Presença digital completa com seu chatbot integrado, sem custos extras.',
        // Ícone para "Homepage Profissional Gratuita"
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
        title: 'Chatbot Inteligente com IA',
        description:
            'Chatbot de atendimento com inteligência artificial integrado à sua homepage. Responde dúvidas sobre procedimentos, horários, preços e agenda consultas automaticamente.',
        // Ícone para "Chatbot Inteligente com IA"
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
            </div>
        ),
    },

    {
        title: 'QR Code para Acesso Direto',
        description:
            'QR Code personalizado para acesso direto ao seu chatbot. Pacientes podem escanear e conversar instantaneamente, sem precisar digitar endereços ou procurar links.',
        // Ícone para "QR Code para Acesso Direto"
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                </svg>
            </div>
        ),
    },

    {
        title: 'Cartão de Visitas Digital',
        description:
            'Cartão de visitas digital moderno com QR Code direcionando para seu chatbot. Impressione pacientes e colegas com tecnologia de ponta.',
        // Ícone para "Cartão de Visitas Digital"
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
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                </svg>
            </div>
        ),
    },

    {
        title: 'Quadros para Sala de Espera',
        description:
            'Quadros personalizados para imprimir com QR Code para colocar na sua sala de espera. Pacientes podem acessar seu chatbot enquanto aguardam a consulta.',
        // Ícone para "Quadros para Sala de Espera"
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            </div>
        ),
    },

    {
        title: 'Integração Total',
        description:
            'Link universal do seu chatbot para usar no WhatsApp, Instagram, Facebook e outras redes sociais. Una toda sua comunicação digital em um só lugar.',
        // Ícone para "Integração Total"
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
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
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
                        <span className="text-yellow-400">Só vantagens</span><br />para o seu consultório!
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                        Atendimento online e de whatsapp com agentes de I.A.
                    </p>
                </div>

                {/* Grade de Cards de Funcionalidades */}
                {/* Layout responsivo: 1 coluna em mobile, 2 colunas em tablet, 3 colunas em desktop. */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Mapeamento do array 'features' para renderizar cada card de funcionalidade. */}
                    {features.map((feature, index) => (
                        <div
                            key={index} // Chave única para cada card.
                            className="bg-theme-card border border-border rounded-lg shadow-xl p-6 backdrop-blur-md hover:shadow-2xl transition-all duration-300 hover:scale-105" // Estilos do card com hover effects
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

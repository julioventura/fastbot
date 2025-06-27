// Componente: Pricing
// Funcionalidade:
// Este componente renderiza a seção de "Preços" da página inicial.
// Ele exibe diferentes planos de assinatura ou pacotes, cada um com um nome,
// preço, descrição, lista de recursos e um botão de chamada para ação.
// Um dos planos pode ser destacado como "popular".
// A seção possui efeitos visuais de fundo, como um brilho SVG animado e um padrão de grade.
//
// Funções e Constantes Principais:
// - pricingPlans (const): Array de objetos, onde cada objeto representa um plano de preços.
//   - Cada objeto contém:
//     - name (string): O nome do plano.
//     - price (string): O preço do plano (formatado como string).
//     - description (string): Uma breve descrição do plano.
//     - features (array de strings): Uma lista dos recursos incluídos no plano.
//     - isPopular (boolean): Indica se o plano deve ser destacado como popular.
//     - buttonText (string): O texto do botão de chamada para ação.
//     - buttonVariant ('default' | 'outline' | ...): A variante do botão (do Shadcn UI).
// - Pricing (Componente): Componente funcional React que renderiza a estrutura da seção de preços.
//   - Mapeia o array 'pricingPlans' para renderizar um card para cada plano.

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';


// Constante pricingPlans
// Array contendo os dados de cada plano de preços a ser exibido.
// Cada objeto no array define as características de um plano.
const pricingPlans = [
    {
        name: 'Fastbot Gratuito',
        price: 'GRÁTIS',
        description: 'Para conversas de texto',
        features: [
            '100 conversas por mês',
        ],
        isPopular: true, // Destaca este plano como o mais popular.
        buttonText: 'COMECE JÁ !',
        buttonVariant: 'default' as const, // Tipo específico para a variante do botão.
    },
    {
        name: 'Fastbot Plus',
        price: 'R$ 40 / mês',
        description: 'Para consultórios e clínicas.', // Descrição adicionada
        features: [
            'Conversas ilimitadas de texto',
        ],
        isPopular: false,
        buttonText: 'ASSINE JÁ !',
        buttonVariant: 'outline' as const,
    },    
    {
        name: 'Créditos Avulsos',
        price: 'R$ 20',
        description: 'Créditos para áudio e imagem',
        features: [
            'Pacote de 100 créditos avulsos',
        ],
        isPopular: false,
        buttonText: 'COMPRAR CRÉDITOS', // Texto do botão ajustado
        buttonVariant: 'outline' as const, // Variante do botão ajustada para diferenciar
    },
];


// Componente Pricing
// Define a estrutura e o layout da seção de preços da aplicação.
const Pricing = () => {
    return (
        // Elemento <section> principal com ID para navegação e estilos de fundo.
        // 'relative' é usado para posicionar os elementos SVG de decoração absoluta dentro dele.
        // 'min-h-screen' garante que a seção ocupe pelo menos a altura total da tela.
        <section
            id="pricing"
            className="relative min-h-screen flex items-center justify-center py-0 md:py-5 bg-theme-gradient-alt"
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
                    {/* IDs dos filtros são únicos para este componente para evitar conflitos. */}
                    <g opacity="0.4" filter="url(#filter0_f_pricing)">
                        <circle cx="1079" cy="540" r="359" fill="#0063F7" />
                    </g>
                    <g opacity="0.3" filter="url(#filter1_f_pricing)">
                        <circle cx="541" cy="540" r="359" fill="#8B2CF5" />
                    </g>
                    <defs>
                        <filter
                            id="filter0_f_pricing" // ID único para o filtro
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
                                result="effect1_foregroundBlur_pricing" // Resultado único
                            />
                        </filter>
                        <filter
                            id="filter1_f_pricing" // ID único para o filtro
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
                                result="effect1_foregroundBlur_pricing" // Resultado único
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
                            key={`h-pricing-${index}`} // Chave única para elementos da grade.
                            className="absolute left-0 right-0 border-t border-[#4f9bff]/30"
                            style={{ top: `${(index * 100) / 20}%` }}
                        />
                    ))}

                    {/* Linhas Verticais da Grade */}
                    {Array.from({ length: 21 }).map((_, index) => (
                        <div
                            key={`v-pricing-${index}`} // Chave única para elementos da grade.
                            className="absolute top-0 bottom-0 border-l border-[#4f9bff]/30"
                            style={{ left: `${(index * 100) / 20}%` }}
                        />
                    ))}
                </div>
            </div>

            {/* Contêiner do Conteúdo Principal da Seção de Preços */}
            {/* 'relative z-10' garante que este conteúdo fique acima dos elementos decorativos. */}
            <div className="section-container relative z-10" id="pricing-section">
                {/* Título da Seção */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                        <p>Assine o Plano Gratuito</p>
                        <p className='gradient-text pt-5 mt-3'>E comece a usar JÁ!</p>
                    </h2>
                </div>

                {/* Grade de Cards de Planos de Preços */}
                {/* Layout responsivo: 1 coluna em telas pequenas, 3 colunas em médias e grandes. */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 max-w-6xl mx-auto">
                    {/* Mapeamento do array 'pricingPlans' para renderizar cada card de plano. */}
                    {pricingPlans.map((plan, index) => (
                        <Card
                            key={index} // Chave única para cada card.
                            // Classes condicionais para destacar o plano popular.
                            className={`p-6 md:p-8 relative backdrop-blur-md flex flex-col ${plan.isPopular
                                ? 'bg-theme-card/95 border-2 border-[#4f9bff] shadow-[0_0_25px_rgba(79,155,255,0.5)]'
                                : plan.buttonVariant === 'outline'
                                    ? 'bg-theme-card/95 border-2 border-[#1d3661] shadow-[0_0_60px_rgba(79,155,255,0.5)]'
                                    : 'bg-theme-card/95 border-2 border-[#2a4980] shadow-[0_0_60px_rgba(79,155,255,0.5)]'
                                }`}
                        >
                            {/* Badge "Popular" (ou texto customizado) para o plano destacado. */}
                            {plan.isPopular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                                    GRATUITO
                                </div>
                            )}

                            {/* Cabeçalho do Card (Nome do Plano, Preço, Descrição) */}
                            <div className="text-center mb-6 pt-4"> {/* pt-4 para dar espaço ao badge "Popular" */}
                                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline justify-center text-white">
                                    <span className="gradient-text text-3xl sm:text-4xl font-bold">{plan.price}</span>
                                </div>
                                {/* Descrição do plano com altura fixa para alinhamento visual entre cards. */}
                                <p className="text-lg text-gray-300 mt-2 h-10">{plan.description}</p>
                            </div>

                            {/* Lista de Recursos do Plano */}
                            {/* 'flex-grow' permite que esta seção expanda e empurre o botão para baixo. */}
                            <div className="space-y-3 mb-8 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start">
                                        <Check className="h-5 w-5 text-theme-accent mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-muted-foreground text-sm sm:text-base">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Botão de Chamada para Ação do Plano */}
                            {/* 'mt-auto' ajuda a alinhar o botão na parte inferior do card quando os conteúdos têm alturas diferentes. */}
                            <Button
                                variant={plan.buttonVariant}
                                // Classes condicionais para estilizar o botão do plano popular de forma diferente.
                                className={`w-full mt-auto text-foreground font-semibold py-3 text-base md:text-lg
                                  ${plan.isPopular
                                        ? 'bg-primary hover:bg-primary/90 drop-shadow-[0_0_10px_rgba(79,155,255,0.5)] hover:drop-shadow-[0_0_15px_rgba(79,155,255,0.7)]'
                                        : plan.buttonVariant === 'outline' 
                                            ? 'bg-transparent border-2 border-theme-accent hover:bg-theme-hover-light text-theme-accent hover:text-foreground' // Estilo para botão outline
                                            : 'bg-theme-accent-bg hover:bg-theme-accent-bg border border-theme-accent/50 hover:border-theme-accent' // Estilo para botão default não popular
                                    } transition-all duration-300 ease-in-out transform hover:scale-105`}
                            >
                                {plan.buttonText}
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;

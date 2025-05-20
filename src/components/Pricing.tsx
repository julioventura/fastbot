import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

const pricingPlans = [
    {
        name: 'Plano Gratuito',
        price: 'R$ 0',
        description: ' ',
        features: [
            '100 créditos por mês',
            'Mensagens de texto',
        ],
        isPopular: true,
        buttonText: 'COMECE JÁ !',
        buttonVariant: 'default' as const,
    },
    {
        name: 'Plano Mensal',
        price: 'R$ 50',
        description: ' ',
        features: [
            '500 créditos por mês',
            'Mensagens de texto e áudio',
        ],
        isPopular: false,
        buttonText: 'COMECE JÁ !',
        buttonVariant: 'default' as const,
    },
    {
        name: 'Pacote de Créditos',
        price: 'R$ 10',
        description: ' ',
        features: [
            '100 créditos avulsos',
            'Validade de um ano',
        ],
        isPopular: false,
        buttonText: 'COMECE JÁ !',
        buttonVariant: 'default' as const,
    },
];

const Pricing = () => {
    return (
        <section
            id="pricing"
            className="relative min-h-screen flex items-center justify-center py-16 md:py-24 bg-gradient-to-b from-[#0a1629] to-[#0e2d5e]" // Modificado aqui
        >
            {/* SVG Glow Effect */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <svg
                    className="w-full h-full opacity-60"
                    viewBox="0 0 1920 1080"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                >
                    <g opacity="0.4" filter="url(#filter0_f_101_3)">
                        <circle cx="1079" cy="540" r="359" fill="#0063F7" />
                    </g>
                    <g opacity="0.3" filter="url(#filter1_f_101_3)">
                        <circle cx="541" cy="540" r="359" fill="#8B2CF5" />
                    </g>
                    <defs>
                        <filter
                            id="filter0_f_101_3"
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
                            id="filter1_f_101_3"
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

            {/* Grid overlay pattern - Fixed implementation */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div
                    className="h-full w-full grid"
                    style={{
                        gridTemplateRows: 'repeat(20, 1fr)',
                        gridTemplateColumns: 'repeat(20, 1fr)',
                    }}
                >
                    {/* Horizontal lines */}
                    {Array.from({ length: 21 }).map((_, index) => (
                        <div
                            key={`h-${index}`}
                            className="absolute left-0 right-0 border-t border-[#4f9bff]/30"
                            style={{ top: `${(index * 100) / 20}%` }}
                        />
                    ))}

                    {/* Vertical lines */}
                    {Array.from({ length: 21 }).map((_, index) => (
                        <div
                            key={`v-${index}`}
                            className="absolute top-0 bottom-0 border-l border-[#4f9bff]/30"
                            style={{ left: `${(index * 100) / 20}%` }}
                        />
                    ))}
                </div>
            </div>

            <div className="section-container relative z-10" id="pricing-section"> {/* O padding vertical foi movido para a section pai */}
                <div className="text-center mb-12 md:mb-16"> {/* Ajustado margin-bottom */}
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                        <span className='gradient-text'>Gratuito, mensal ou créditos...</span> <br /><span>na sua medida!</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 max-w-6xl mx-auto"> {/* Ajustado gap */}
                    {pricingPlans.map((plan, index) => (
                        <Card
                            key={index}
                            className={`p-6 md:p-8 relative bg-[#0a1629]/60 backdrop-blur-md flex flex-col ${plan.isPopular
                                ? 'border-2 border-[#4f9bff] shadow-[0_0_25px_rgba(79,155,255,0.5)]' // Estilo popular destacado
                                : 'border border-[#2a4980]/70 shadow-lg'
                                }`}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                                    COMECE JÁ !
                                </div>
                            )}

                            <div className="text-center mb-6 pt-4"> {/* Adicionado pt-4 para espaço do badge popular */}
                                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline justify-center text-white">
                                    <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                                    {plan.price !== 'Custom' && plan.name !== 'Plano Gratuito' && plan.name !== 'Pacote de Créditos' && (
                                        <span className="text-gray-400 ml-1 text-sm">/mês</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-300 mt-2 h-10">{plan.description}</p> {/* Altura fixa para alinhar */}
                            </div>

                            <div className="space-y-3 mb-8 flex-grow"> {/* flex-grow para empurrar o botão para baixo */}
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start">
                                        <Check className="h-5 w-5 text-[#4f9bff] mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-200 text-sm sm:text-base">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant={plan.buttonVariant}
                                className={`w-full mt-auto text-white font-semibold py-3 text-base md:text-lg
                  ${plan.isPopular
                                        ? 'bg-blue-600 hover:bg-[#3b82f6] drop-shadow-[0_0_10px_rgba(79,155,255,0.5)] hover:drop-shadow-[0_0_15px_rgba(79,155,255,0.7)]'
                                        : 'bg-[#2a4980]/80 hover:bg-[#375da0] border border-[#4f9bff]/50 hover:border-[#4f9bff]'
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

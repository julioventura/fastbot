import React from 'react';
import { Card } from '@/components/ui/card';

const features = [
	{
		title: 'Agent Browser',
		description:
			'Inicie navegadores de agentes com uma única chamada de API. Nossa tecnologia de navegador vem com IA embutida que entende o conteúdo, extrai dados e ajuda a navegar de forma eficiente.',
		icon: (
			<div className="w-12 h-12 rounded-full bg-brightblue-100 flex items-center justify-center">
				<svg
					className="w-6 h-6 text-brightblue-500"
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
		icon: (
			<div className="w-12 h-12 rounded-full bg-brightpurple-100 flex items-center justify-center">
				<svg
					className="w-6 h-6 text-brightpurple-500"
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
		icon: (
			<div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
				<svg
					className="w-6 h-6 text-teal-600"
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

	{
		title: 'Developer Friendly',
		description:
			'Comece em minutos com nossos SDKs abrangentes para Node.js, Python e mais. APIs intuitivas tornam a integração simples e rápida.',
		icon: (
			<div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
				<svg
					className="w-6 h-6 text-teal-600"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
					/>
				</svg>
			</div>
		),
	},
];

const Features = () => {
	return (
		<section
			id="features"
			className="relative py-16 md:py-24 bg-gradient-to-b from-[#0a1629] to-[#0e2d5e]"
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
					<g opacity="0.5" filter="url(#filter0_f_101_3)">
						<circle cx="1079" cy="540" r="359" fill="#0063F7" />
					</g>
					<g opacity="0.1" filter="url(#filter1_f_101_3)">
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

			{/* Grid overlay pattern */}
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

			<div
				data-lov-id="features-section"
				className="section-container relative z-10"
			>
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
						<span className="text-[#4f9bff]">Recursos</span> Poderosos
					</h2>
					<p className="text-xl gradient-text max-w-3xl mx-auto">
						Deixe a <span className="text-white">Inteligência Artificial</span> trabalhar pra você.
					</p>
				</div>

				{/* Focusing on just the feature cards section */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
					{features.map((feature, index) => (
						<div
							key={index}
							className="border border-black rounded-lg shadow-xl p-6 bg-gray-800/40"
						>
							<div className="mb-4">{feature.icon}</div>
							<h3 className="text-xl font-semibold mb-2 text-primary">
								{feature.title}
							</h3>
							<p className="text-gray-200">{feature.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Features;

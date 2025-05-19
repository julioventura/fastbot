import React from 'react';
import { Card } from '@/components/ui/card';

const testimonials = [
	{
		quote: 'O chatbot da FastBot transformou minha comunicação com os alunos. Consigo responder dúvidas frequentes 24h por dia, mesmo fora do horário de aula, e economizo cerca de 15 horas semanais em atendimentos repetitivos.',
		author: 'Prof. Carlos Mendes',
    	role: 'Professor de Endodontia, FOP-PE',
	},
	{
		quote: 'Implementamos o FastBot na recepção virtual da clínica e o resultado foi impressionante! Reduzimos as faltas em 40% com lembretes automáticos e nossos pacientes adoram poder agendar consultas e tirar dúvidas a qualquer momento.',
		author: 'Dra. Juliana Costa',
		role: 'Cirurgiã-Dentista, Clínica Oral Care',
	},
	{
		quote: 'Como coordenadora pedagógica, precisava de uma solução para atender pais, alunos e professores simultaneamente. O FastBot nos permitiu automatizar 70% das consultas administrativas e melhorou significativamente a satisfação da comunidade escolar.',
		author: 'Profa. Mariana Alves',
		role: 'Coordenadora Pedagógica, Escola Nova Geração',
	},
];

const Testimonials = () => {
	return (
		<section className="relative py-16 md:py-24 bg-gradient-to-b from-[#082756] to-[#0a1629]">
			{/* SVG Glow Effect */}
			<div className="absolute inset-0 z-0 overflow-hidden">
				<svg className="w-full h-full opacity-60" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
					<g opacity="0.4" filter="url(#filter0_f_101_3)">
						<circle cx="1079" cy="540" r="359" fill="#0063F7" />
					</g>
					<g opacity="0.3" filter="url(#filter1_f_101_3)">
						<circle cx="541" cy="540" r="359" fill="#8B2CF5" />
					</g>
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

			<div className="section-container relative z-10" id="testimonials-section">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
						<span className="text-[#4f9bff]">O que falam de nossos</span> chatbots
					</h2>
					<p className="text-2xl text-gray-300 max-w-3xl mx-auto">
						Depoimentos de quem já usa.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{testimonials.map((testimonial, index) => (
						<Card key={index} className="p-8 bg-[#0a1629]/50 backdrop-blur-sm border border-[#2a4980]/50 shadow-md hover:shadow-lg transition-shadow duration-300">
							<div className="flex flex-col h-full">
								<div className="mb-6 text-brightpurple-500">
									<svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
										<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
									</svg>
								</div>
								<p className="text-gray-400 text-lg mb-6 flex-grow">{testimonial.quote}</p>
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

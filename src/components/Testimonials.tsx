import React from 'react';
import { Card } from '@/components/ui/card';

const testimonials = [
	{
		quote: "Bright Data's Agent Browser has been a game-changer for our AI workflows. We've improved our automation efficiency by 300%.",
		author: "Sarah Johnson",
		role: "CTO, TechFusion AI",
	},
	{
		quote: "The reliability of Bright Data's infrastructure lets us scale our web automation without worrying about IP blocks or CAPTCHAs.",
		author: "Michael Chen",
		role: "Lead Engineer, DataCraft",
	},
	{
		quote: "We were able to launch our AI agent product in weeks instead of months thanks to Bright Data's easy-to-use APIs and robust documentation.",
		author: "Alex Rivera",
		role: "Product Manager, AgentWorks",
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
						<span>What Our Customers Say</span>
					</h2>
					<p className="text-xl text-gray-300 max-w-3xl mx-auto">
						Join thousands of companies using Bright Data to power their AI agents
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
								<p className="text-gray-200 mb-6 flex-grow">{testimonial.quote}</p>
								<div>
									<p className="font-bold text-white">{testimonial.author}</p>
									<p className="text-sm text-gray-400">{testimonial.role}</p>
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

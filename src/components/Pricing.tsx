import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

const pricingPlans = [
	{
		name: 'Gratuito',
		price: '0',
		description: 'Perfeito para o uso ocasional',
		features: [
			'10,000 browser sessions per month',
			'Basic AI assistance',
			'Standard support',
			'1 team member',
		],
		isPopular: true,
		buttonText: 'Start for free',
		buttonVariant: 'outline' as const,
	},
	{
		name: 'Plus',
		price: 'R$ 100',
		description: 'Uso profissional intenso',
		features: [
			'50,000 browser sessions per month',
			'Advanced AI assistance',
			'Priority support',
			'5 team members',
		],
		isPopular: false,
		buttonText: 'Start for free',
		buttonVariant: 'default' as const,
	},

];

const Pricing = () => {
	return (
		<section
			id="pricing"
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

			<div className="section-container relative z-10" id="pricing-section">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
						<span>Simple, Transparent Pricing</span>
					</h2>
					<p className="text-xl text-gray-300 max-w-3xl mx-auto">
						Choose the plan that fits your needs. All plans include a free trial.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-w-6xl mx-auto">
					{pricingPlans.map((plan, index) => (
						<Card
							key={index}
							className={`p-8 relative bg-[#0a1629]/50 backdrop-blur-sm ${plan.isPopular
									? 'border-2 border-brightblue-500 shadow-xl'
									: 'border border-brightblue-600 shadow-md'
								}`}
						>
							{plan.isPopular && (
								<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brightblue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
									Uso normal
								</div>
							)}
							{plan.isPopular || (
								<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brightblue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
									Uso intenso
								</div>
							)}
							<div className="text-center mb-6">
								<h3 className="text-2xl font-bold mb-2 text-white">
									{plan.name}
								</h3>
								<div className="flex items-center justify-center text-white">
									<span className="text-4xl font-bold">{plan.price}</span>
									{plan.price !== 'Custom' && (
										<span className="text-gray-400 ml-2">/month</span>
									)}
								</div>
								<p className="text-gray-300 mt-2">{plan.description}</p>
							</div>

							<div className="space-y-4 mb-8">
								{plan.features.map((feature, i) => (
									<div key={i} className="flex items-start">
										<Check className="h-5 w-5 text-brightblue-500 mr-2 mt-0.5" />
										<span className="text-gray-200">{feature}</span>
									</div>
								))}
							</div>

							<Button
								variant={plan.buttonVariant}
								className={`w-full ${plan.isPopular
										? 'bg-brightblue-600 hover:bg-brightblue-600 text-white hover:text-yellow-400'
										: ' hover:bg-brightblue-600 hover:text-yellow-400'
									}`}
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

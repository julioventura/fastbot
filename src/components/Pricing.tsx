import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

const pricingPlans = [
	{
		name: 'Starter',
		price: '$49',
		description: 'Perfect for small projects and individual developers',
		features: [
			'10,000 browser sessions per month',
			'Basic AI assistance',
			'Standard support',
			'1 team member',
			'Basic analytics',
		],
		isPopular: false,
		buttonText: 'Start for free',
		buttonVariant: 'outline' as const,
	},
	{
		name: 'Professional',
		price: '$199',
		description: 'Ideal for growing teams and businesses',
		features: [
			'50,000 browser sessions per month',
			'Advanced AI assistance',
			'Priority support',
			'5 team members',
			'Advanced analytics',
			'Custom IP rotation',
		],
		isPopular: true,
		buttonText: 'Start for free',
		buttonVariant: 'default' as const,
	},
	{
		name: 'Enterprise',
		price: 'Custom',
		description: 'For large-scale operations and custom needs',
		features: [
			'Unlimited browser sessions',
			'Premium AI assistance',
			'24/7 dedicated support',
			'Unlimited team members',
			'Enterprise analytics',
			'Custom solutions',
			'SLA guarantees',
		],
		isPopular: false,
		buttonText: 'Contact sales',
		buttonVariant: 'outline' as const,
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

			{/* Grid overlay pattern */}
			<div className="absolute inset-0 z-0 opacity-20">
				<div className="w-full h-full grid grid-cols-12 grid-rows-12">
					{Array.from({ length: 13 }).map((_, rowIndex) => (
						<div key={`row-${rowIndex}`}>
							{Array.from({ length: 13 }).map((_, colIndex) => (
								<div
									key={`${rowIndex}-${colIndex}`}
									className="border-t border-l border-[#2a4980]/30"
								></div>
							))}
						</div>
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

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					{pricingPlans.map((plan, index) => (
						<Card
							key={index}
							className={`p-8 relative bg-[#0a1629]/50 backdrop-blur-sm ${
								plan.isPopular
									? 'border-2 border-brightblue-500 shadow-xl'
									: 'border border-[#2a4980]/50 shadow-md'
							}`}
						>
							{plan.isPopular && (
								<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brightblue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
									Most Popular
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
								className={`w-full ${
									plan.isPopular
										? 'bg-brightblue-500 hover:bg-brightblue-600'
										: ''
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

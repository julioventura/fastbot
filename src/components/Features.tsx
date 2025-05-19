import React from 'react';
import { Card } from '@/components/ui/card';

const features = [
	{
		title: 'Agent Browser',
		description:
			'Launch agent browsers with a single API call. Our browser tech comes with built-in AI that understands content, extracts data, and helps navigate efficiently.',
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
		title: 'Web Automation',
		description:
			'Automate login flows, data collection, form submissions, and more. Our solution handles CAPTCHAs, cookies, and browsers automatically.',
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
			'Our browser understands the content, meaning, and objects on web pages, allowing your AI agents to easily navigate and extract data.',
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
		title: 'Unmatched Reliability',
		description:
			'Our infrastructure guarantees 99.99% uptime with automatic retry mechanisms and smart routing across millions of IPs worldwide.',
		icon: (
			<div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
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
						d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
					/>
				</svg>
			</div>
		),
	},
	{
		title: 'Enterprise Ready',
		description:
			'Scale instantly to handle millions of concurrent sessions with our infinitely scalable browser infrastructure.',
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
						d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
					/>
				</svg>
			</div>
		),
	},
	{
		title: 'Developer Friendly',
		description:
			'Start in minutes with our comprehensive SDKs for Node.js, Python, and more. Intuitive APIs make integration simple and fast.',
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

			<div
				data-lov-id="features-section"
				className="section-container relative z-10"
			>
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
						<span className="gradient-text">Powerful Features</span>
					</h2>
					<p className="text-xl text-gray-300 max-w-3xl mx-auto">
						Everything you need to power your AI agent workflows with reliable web
						automation
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<Card
							key={index}
							className="feature-card bg-[#0a1629]/50 backdrop-blur-sm border border-[#2a4980]/50"
						>
							<div className="flex flex-col p-6">
								<div className="mb-4">{feature.icon}</div>
								<h3 className="text-xl font-semibold mb-2 text-white">
									{feature.title}
								</h3>
								<p className="text-gray-300">{feature.description}</p>
							</div>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
};

export default Features;


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
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">What Our Customers Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of companies using Bright Data to power their AI agents
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-8 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col h-full">
                <div className="mb-6 text-brightpurple-500">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-6 flex-grow">{testimonial.quote}</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
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

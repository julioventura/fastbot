
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

const pricingPlans = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for small projects and individual developers",
    features: [
      "10,000 browser sessions per month",
      "Basic AI assistance",
      "Standard support",
      "1 team member",
      "Basic analytics",
    ],
    isPopular: false,
    buttonText: "Start for free",
    buttonVariant: "outline" as const,
  },
  {
    name: "Professional",
    price: "$199",
    description: "Ideal for growing teams and businesses",
    features: [
      "50,000 browser sessions per month",
      "Advanced AI assistance",
      "Priority support",
      "5 team members",
      "Advanced analytics",
      "Custom IP rotation",
    ],
    isPopular: true,
    buttonText: "Start for free",
    buttonVariant: "default" as const,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale operations and custom needs",
    features: [
      "Unlimited browser sessions",
      "Premium AI assistance",
      "24/7 dedicated support",
      "Unlimited team members",
      "Enterprise analytics",
      "Custom solutions",
      "SLA guarantees",
    ],
    isPopular: false,
    buttonText: "Contact sales",
    buttonVariant: "outline" as const,
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Simple, Transparent Pricing</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include a free trial.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card key={index} className={`p-8 relative ${plan.isPopular ? 'border-2 border-brightblue-500 shadow-xl' : 'border border-gray-200 shadow-md'}`}>
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brightblue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-gray-500 ml-2">/month</span>}
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </div>
              
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-brightblue-500 mr-2 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                variant={plan.buttonVariant} 
                className={`w-full ${plan.isPopular ? 'bg-brightblue-500 hover:bg-brightblue-600' : ''}`}
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

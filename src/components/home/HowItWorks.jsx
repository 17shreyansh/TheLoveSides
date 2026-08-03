import React from 'react';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import { steps } from '../../data/homeData';

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <RevealOnScroll>
          <SectionHeading 
            title="How It Works" 
            subtitle="Simple steps to your perfect windows" 
          />
        </RevealOnScroll>

        <div className="relative mt-16 md:mt-24">
          {/* Desktop dashed line connecting steps */}
          <div className="hidden md:block absolute top-8 left-0 right-0 border-t border-dashed border-charcoal/15 -z-10"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative">
            {steps.map((step, idx) => (
              <RevealOnScroll key={step.id} delay={idx * 0.1}>
                <div className="relative flex flex-col items-center text-center">
                  {/* Faint background number */}
                  <span className="absolute -top-10 md:-top-14 text-7xl md:text-8xl font-serif text-charcoal/5 -z-10 select-none">
                    {step.id}
                  </span>
                  
                  {/* Circle indicator for line */}
                  <div className="hidden md:flex w-4 h-4 rounded-full bg-cream border-2 border-amber mb-6 z-10" />
                  
                  <h3 className="font-serif text-xl md:text-2xl text-charcoal mb-2 relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 max-w-[200px] relative z-10">
                    {step.description}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

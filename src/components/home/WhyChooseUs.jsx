import React from 'react';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import { features } from '../../data/homeData';
import * as Icons from 'lucide-react';

export default function WhyChooseUs() {
  return (
    <section className="py-16 md:py-24 bg-ivory">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <RevealOnScroll>
          <SectionHeading 
            title="Why Choose Us" 
            subtitle="Excellence in every detail" 
          />
        </RevealOnScroll>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 text-center mt-8 md:mt-12">
          {features.map((feature, idx) => {
            const Icon = Icons[feature.icon];
            return (
              <RevealOnScroll key={feature.id} delay={idx * 0.1}>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-pink-primary/10 flex items-center justify-center mb-3 md:mb-4 transition-transform duration-300 hover:scale-110">
                    {Icon && <Icon className="text-pink-primary w-5 h-5 md:w-7 md:h-7" />}
                  </div>
                  <h3 className="font-serif text-base md:text-xl text-charcoal mb-1 md:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 max-w-[200px] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}

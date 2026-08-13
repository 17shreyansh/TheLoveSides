import React from 'react';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import { steps } from '../../data/homeData';

export default function HowItWorks() {
  return (
    <section className="py-12 md:py-20 bg-ivory relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-pink-soft/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-primary/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <RevealOnScroll>
          <SectionHeading 
            title="The Process" 
            subtitle="Four elegant steps to your perfect bespoke windows" 
          />
        </RevealOnScroll>

        <div className="mt-16 md:mt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 relative">
            {/* Elegant connecting line for desktop */}
            <div className="hidden lg:block absolute top-[2.5rem] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-pink-primary/30 to-transparent -z-10"></div>

            {steps.map((step, idx) => (
              <RevealOnScroll key={step.id} delay={idx * 0.15} className="h-full">
                <div className="group relative flex flex-col items-center text-center p-8 md:p-10 rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(254,125,189,0.15)] transition-all duration-500 hover:-translate-y-2 h-full overflow-hidden z-10">
                  
                  {/* Premium Number Indicator */}
                  <div className="w-16 h-16 rounded-full bg-pink-soft/40 flex items-center justify-center mb-8 relative group-hover:bg-pink-primary transition-colors duration-500 shadow-inner">
                    <div className="absolute inset-1.5 rounded-full border border-pink-primary/20 group-hover:border-white/40 transition-colors duration-500"></div>
                    <span className="font-serif text-2xl text-pink-primary group-hover:text-white transition-colors duration-500 relative z-10">
                      0{step.id}
                    </span>
                  </div>
                  
                  <h3 className="font-serif text-xl md:text-2xl text-charcoal mb-4 transition-colors duration-300 group-hover:text-pink-primary relative z-10">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm md:text-base text-charcoal/70 leading-relaxed max-w-[220px] relative z-10">
                    {step.description}
                  </p>

                  {/* Decorative faint background number */}
                  <span className="absolute -bottom-6 -right-2 text-9xl font-serif text-pink-soft/20 group-hover:text-pink-soft/40 transition-colors duration-500 select-none z-0">
                    {step.id}
                  </span>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

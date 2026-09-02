import React from 'react';
import RevealOnScroll from '../ui/RevealOnScroll';
import AnimatedCounter from '../ui/AnimatedCounter';
import { stats } from '../../data/homeData';

export default function StatsCounter() {
  return (
    <section className="bg-ivory py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-3 gap-2 md:gap-12 text-center divide-x divide-charcoal/10">
          {stats.map((stat, idx) => (
            <RevealOnScroll key={stat.id} delay={idx * 0.1}>
              <div className="flex flex-col items-center px-1 md:px-4">
                <AnimatedCounter 
                  target={stat.value} 
                  suffix="+" 
                  className="text-xl sm:text-2xl md:text-5xl lg:text-6xl font-serif text-charcoal mb-1 md:mb-3"
                />
                <span className="text-gray-500 text-[10px] sm:text-xs md:text-base tracking-wide font-medium">
                  {stat.label}
                </span>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

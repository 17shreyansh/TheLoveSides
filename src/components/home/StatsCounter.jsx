import React from 'react';
import RevealOnScroll from '../ui/RevealOnScroll';
import AnimatedCounter from '../ui/AnimatedCounter';
import { stats } from '../../data/homeData';

export default function StatsCounter() {
  return (
    <section className="bg-ivory py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-charcoal/10">
          {stats.map((stat, idx) => (
            <RevealOnScroll key={stat.id} delay={idx * 0.1} className={idx !== 0 ? 'pt-10 md:pt-0' : ''}>
              <div className="flex flex-col items-center">
                <AnimatedCounter 
                  target={stat.value} 
                  suffix="+" 
                  className="text-4xl md:text-5xl lg:text-6xl font-serif text-charcoal mb-3"
                />
                <span className="text-gray-500 text-sm md:text-base tracking-wide font-medium">
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

import React from 'react';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import { categories } from '../../data/homeData';

export default function CategoryShowcase() {
  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <RevealOnScroll>
          <SectionHeading 
            title="Explore Our Collection" 
            subtitle="Curated styles for every space" 
          />
        </RevealOnScroll>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, idx) => (
            <RevealOnScroll key={category.id} delay={idx * 0.1}>
              <a 
                href={`#${category.title.toLowerCase().replace(' ', '-')}`}
                className="group relative block aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <img 
                  src={category.image} 
                  alt={category.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 right-4">
                  <h3 className="font-serif text-base sm:text-lg md:text-2xl text-white leading-tight">
                    {category.title}
                  </h3>
                </div>
              </a>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

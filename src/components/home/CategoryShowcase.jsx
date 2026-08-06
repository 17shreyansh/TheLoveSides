import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import { categories } from '../../data/homeData';

export default function CategoryShowcase() {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 260 + 16; // width of card + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <RevealOnScroll>
          <SectionHeading 
            title="Explore Our Collection" 
            subtitle="Curated styles for every space" 
          />
        </RevealOnScroll>

        <div className="relative">
          <button 
            onClick={() => scroll('left')}
            className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/90 text-navy-dark rounded-full shadow-lg focus:outline-none"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 -ml-0.5" />
          </button>

          <div 
            ref={scrollContainerRef}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 relative" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
          <style>{`
            .flex::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {categories.map((category, idx) => (
            <div key={category.id} className="w-[65vw] max-w-[260px] sm:w-[300px] md:w-auto flex-shrink-0 snap-start md:snap-align-none">
              <RevealOnScroll delay={idx * 0.1}>
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
            </div>
          ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/90 text-navy-dark rounded-full shadow-lg focus:outline-none"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 ml-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

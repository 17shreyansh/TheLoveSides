import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import { useCollections } from '../../hooks/useCollections';

export default function CategoryShowcase() {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { collections, loading } = useCollections();

  // Determine active collections
  const activeCollections = collections || [];

  const handleScroll = () => {
    if (!scrollContainerRef.current || activeCollections.length === 0) return;
    const container = scrollContainerRef.current;
    const itemWidth = container.scrollWidth / activeCollections.length;
    const newIndex = Math.round(container.scrollLeft / itemWidth);
    if (newIndex >= 0 && newIndex < activeCollections.length) {
      setActiveIndex(newIndex);
    }
  };

  useEffect(() => {
    if (isHovered || activeCollections.length === 0) return;
    
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const itemWidth = container.scrollWidth / activeCollections.length;
        
        if (activeIndex >= activeCollections.length - 1 || container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: itemWidth, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [activeIndex, isHovered, activeCollections.length]);

  const scrollTo = (index) => {
    if (scrollContainerRef.current && activeCollections.length > 0) {
      const container = scrollContainerRef.current;
      const itemWidth = container.scrollWidth / activeCollections.length;
      container.scrollTo({ left: itemWidth * index, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 md:py-10 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <RevealOnScroll>
          <SectionHeading 
            title="Explore Our Collection" 
            subtitle="Curated styles for every space" 
          />
        </RevealOnScroll>

        <div className="relative mt-8">
          {loading ? (
             <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 xl:justify-center">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-[70vw] sm:w-[240px] lg:w-[260px] aspect-[1/1.1] sm:aspect-[4/5] bg-charcoal/5 animate-pulse rounded-xl md:rounded-2xl flex-shrink-0"></div>
                ))}
             </div>
          ) : activeCollections.length === 0 ? (
            <div className="text-center py-10 text-charcoal/60">No collections available yet.</div>
          ) : (
            <>
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={() => setIsHovered(true)}
                onTouchEnd={() => setIsHovered(false)}
                className="flex xl:justify-center gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-6 relative scroll-smooth" 
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
              <style>{`
                .flex::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {activeCollections.map((category, idx) => (
                <div key={category._id} className="w-[70vw] sm:w-[240px] lg:w-[260px] flex-shrink-0 snap-center md:snap-start">
                  <RevealOnScroll delay={idx * 0.1}>
                    <Link 
                      to={`/products?collection=${category.slug}`}
                      className="group relative block aspect-[1/1.1] sm:aspect-[4/5] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer shadow-sm md:hover:shadow-2xl transition-all duration-500"
                    >
                      {category.image && !category.image.endsWith('/undefined') ? (
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-charcoal/10 flex items-center justify-center transition-transform duration-700 md:group-hover:scale-110">
                          <span className="text-charcoal/40 text-sm">No Image</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 opacity-70 md:group-hover:opacity-90 transition-opacity duration-500"></div>
                      
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <h3 className="font-serif text-lg md:text-2xl text-white mb-2 md:transform md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500">
                          {category.name}
                        </h3>
                        <p className="text-white/90 font-sans text-xs md:text-sm font-semibold tracking-wider uppercase md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 flex items-center gap-2">
                          Shop Now <span className="text-lg leading-none">→</span>
                        </p>
                      </div>
                    </Link>
                  </RevealOnScroll>
                </div>
              ))}
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center items-center gap-2 md:gap-3 mt-6 md:mt-10">
                {activeCollections.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollTo(idx)}
                    className={`h-2 rounded-full transition-all duration-500 ${activeIndex === idx ? 'bg-pink-primary w-8 md:w-10' : 'bg-charcoal/20 hover:bg-pink-primary/50 w-2 md:w-2'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

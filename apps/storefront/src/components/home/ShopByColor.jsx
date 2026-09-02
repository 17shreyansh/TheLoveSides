import React, { useState } from 'react';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import { colors } from '../../data/homeData';
import clsx from 'clsx';

export default function ShopByColor() {
  const [activeColor, setActiveColor] = useState(colors[0].id);

  return (
    <section className="py-10 md:py-16 bg-ivory">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <RevealOnScroll>
          <SectionHeading 
            title="Shop by Color" 
            subtitle="Find your perfect palette" 
          />
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-12">
            {colors.map((color) => {
              const isActive = activeColor === color.id;
              
              return (
                <div key={color.id} className="flex flex-col items-center">
                  <button
                    onClick={() => setActiveColor(color.id)}
                    className={clsx(
                      'w-16 h-16 md:w-20 md:h-20 rounded-full shadow-md transition-all duration-300',
                      isActive ? 'ring-2 ring-offset-4 ring-pink-primary scale-110' : 'hover:scale-110 border-2 border-white'
                    )}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Select ${color.label} color`}
                  />
                  <span className={clsx(
                    "text-sm mt-3 text-center transition-colors font-medium",
                    isActive ? "text-charcoal" : "text-gray-500"
                  )}>
                    {color.label}
                  </span>
                </div>
              );
            })}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

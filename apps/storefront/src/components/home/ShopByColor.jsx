import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import { useColors } from '../../hooks/useColors';
import clsx from 'clsx';

export default function ShopByColor() {
  const { colors, loading } = useColors();
  const [activeColor, setActiveColor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (colors.length > 0 && !activeColor) {
      setActiveColor(colors[0].id);
    }
  }, [colors, activeColor]);

  const handleColorClick = (color) => {
    setActiveColor(color.id);
    navigate(`/products?color=${encodeURIComponent(color.label)}`);
  };

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
          {loading ? (
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-12 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-charcoal/10" />
                  <div className="w-12 h-4 mt-3 bg-charcoal/10 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-12">
              {colors.map((color) => {
                const isActive = activeColor === color.id;
                
                return (
                  <div key={color.id} className="flex flex-col items-center">
                    <button
                      onClick={() => handleColorClick(color)}
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
          )}
        </RevealOnScroll>
      </div>
    </section>
  );
}

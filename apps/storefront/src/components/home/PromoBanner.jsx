import React from 'react';
import { Link } from 'react-router-dom';
import RevealOnScroll from '../ui/RevealOnScroll';
import Button from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';

export default function PromoBanner() {
  const { promoBanners } = useTheme();

  if (!promoBanners || promoBanners.length === 0) return null;

  return (
    <>
      {promoBanners.filter(b => b.isActive !== false).map((banner, index) => (
        <section key={banner.id || index} className="py-6 md:py-10 bg-[#fdecf4] text-charcoal border-b border-pink-200/50 last:border-b-0">
          <div className="max-w-6xl mx-auto px-6">
            <RevealOnScroll>
              <div className="flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8 text-center md:text-left">
                <div>
                  <h2 className="text-2xl md:text-4xl font-serif mb-2 md:mb-3">{banner.title}</h2>
                  <p 
                    className="text-charcoal/80 font-sans text-sm md:text-lg"
                    dangerouslySetInnerHTML={{ __html: banner.description }}
                  />
                </div>
                {banner.buttonText && (
                  <Link 
                    to={banner.buttonLink || '/products'} 
                    className="bg-pink-primary text-white hover:bg-pink-dark whitespace-nowrap px-8 py-3 md:px-10 md:py-4 shrink-0 shadow-lg rounded-md font-medium text-sm md:text-base transition-all duration-300 hover:-translate-y-0.5 inline-block text-center"
                  >
                    {banner.buttonText}
                  </Link>
                )}
              </div>
            </RevealOnScroll>
          </div>
        </section>
      ))}
    </>
  );
}

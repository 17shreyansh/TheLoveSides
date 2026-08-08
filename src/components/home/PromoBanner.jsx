import React from 'react';
import RevealOnScroll from '../ui/RevealOnScroll';
import Button from '../ui/Button';

export default function PromoBanner() {
  return (
    <section className="py-12 md:py-16 bg-burgundy text-white">
      <div className="max-w-6xl mx-auto px-6">
        <RevealOnScroll>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-3">Spring Sale Event</h2>
              <p className="text-white/80 font-sans text-base md:text-lg">
                Refresh your home with up to <span className="text-white font-medium">40% off</span> our premium bespoke curtains.
              </p>
            </div>
            <button className="bg-gold text-burgundy hover:bg-rose-light whitespace-nowrap px-10 py-4 shrink-0 shadow-lg rounded-md font-medium transition-all duration-300 hover:-translate-y-0.5">
              Shop The Sale
            </button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

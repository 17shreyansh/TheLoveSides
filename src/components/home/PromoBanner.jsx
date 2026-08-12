import React from 'react';
import RevealOnScroll from '../ui/RevealOnScroll';
import Button from '../ui/Button';

export default function PromoBanner() {
  return (
    <section className="py-8 md:py-16 bg-pink-soft text-charcoal">
      <div className="max-w-6xl mx-auto px-6">
        <RevealOnScroll>
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8 text-center md:text-left">
            <div>
              <h2 className="text-2xl md:text-4xl font-serif mb-2 md:mb-3">Spring Sale Event</h2>
              <p className="text-charcoal/80 font-sans text-sm md:text-lg">
                Refresh your home with up to <span className="text-charcoal font-bold">40% off</span> our premium bespoke curtains.
              </p>
            </div>
            <button className="bg-pink-primary text-white hover:bg-pink-dark whitespace-nowrap px-8 py-3 md:px-10 md:py-4 shrink-0 shadow-lg rounded-md font-medium text-sm md:text-base transition-all duration-300 hover:-translate-y-0.5">
              Shop The Sale
            </button>
          </div>
        </
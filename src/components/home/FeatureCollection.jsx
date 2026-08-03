import React from 'react';
import RevealOnScroll from '../ui/RevealOnScroll';
import Button from '../ui/Button';
import { Check } from 'lucide-react';
import VelvetBlue from '../../assets/images/Curtains/Blackout Curtains/VelvetBlue.jpeg';

export default function FeatureCollection() {
  const checklist = [
    '100% premium velvet fabric',
    'Thermal insulation properties',
    'Complete blackout capability',
    'Custom sizing available'
  ];

  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          <RevealOnScroll className="order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={VelvetBlue} 
                alt="Signature Velvet Collection" 
                className="w-full h-auto object-contain transition-transform duration-700 hover:scale-105"
              />
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="order-1 lg:order-2" delay={0.2}>
            <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-6 leading-tight">
              Signature Velvet Collection
            </h2>
            <p className="text-base md:text-lg text-gray-600 font-sans leading-relaxed mb-8">
              Indulge in luxury with our premium velvet curtains. Crafted from the finest materials, each piece offers unparalleled depth, texture, and light control for sophisticated interiors.
            </p>
            
            <ul className="space-y-4 mb-10">
              {checklist.map((item, idx) => (
                <li key={idx} className="flex items-center gap-4 text-gray-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-amber-dark" />
                  </span>
                  <span className="font-medium font-sans">{item}</span>
                </li>
              ))}
            </ul>

            <Button variant="dark">
              View Collection
            </Button>
          </RevealOnScroll>
          
        </div>
      </div>
    </section>
  );
}

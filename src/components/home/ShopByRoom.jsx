import React from 'react';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import { rooms } from '../../data/homeData';

export default function ShopByRoom() {
  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <RevealOnScroll>
          <SectionHeading 
            title="Shop by Room" 
            subtitle="Find the perfect match for every space" 
          />
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {rooms.map((room, idx) => (
            <RevealOnScroll key={room.id} delay={idx * 0.1}>
              <a 
                href={`#${room.title.toLowerCase().replace(' ', '-')}`}
                className="group relative block aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <img 
                  src={room.image} 
                  alt={room.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-8 left-8">
                  <h3 className="font-serif text-2xl md:text-3xl text-white mb-2">
                    {room.title}
                  </h3>
                  <span className="text-sm text-white/80 underline-offset-4 group-hover:underline transition-all">
                    Explore Collection
                  </span>
                </div>
              </a>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

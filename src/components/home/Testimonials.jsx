import React from 'react';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import ResponsiveCardSlider from '../ui/ResponsiveCardSlider';
import { testimonials } from '../../data/homeData';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const renderTestimonial = (testimonial, idx) => (
    <RevealOnScroll delay={idx * 0.1} className="h-full w-full flex">
      <div className="bg-ivory rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex-1 flex flex-col border border-charcoal/5 max-w-sm mx-auto min-h-[260px]">
        <div className="flex gap-1 mb-4 text-amber">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-current" />
          ))}
        </div>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 italic flex-grow">
          "{testimonial.quote}"
        </p>
        <div className="mt-auto">
          <p className="font-serif text-base md:text-lg text-charcoal font-medium">
            — {testimonial.author}
          </p>
        </div>
      </div>
    </RevealOnScroll>
  );

  return (
    <section className="py-16 md:py-24 bg-ivory/50">
      <div className="max-w-7xl mx-auto px-6 md:px-10 overflow-hidden md:overflow-visible">
        <RevealOnScroll>
          <SectionHeading 
            title="What Our Clients Say" 
            subtitle="Trusted by thousands of happy customers" 
          />
        </RevealOnScroll>

        <ResponsiveCardSlider items={testimonials} renderItem={renderTestimonial} desktopCols={3} />
      </div>
    </section>
  );
}

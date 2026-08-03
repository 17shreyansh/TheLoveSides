import React from 'react';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import { testimonials } from '../../data/homeData';
import { Star } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-ivory/50">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <RevealOnScroll>
          <SectionHeading 
            title="What Our Clients Say" 
            subtitle="Trusted by thousands of happy customers" 
          />
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12">
          {testimonials.map((testimonial, idx) => (
            <RevealOnScroll key={testimonial.id} delay={idx * 0.1}>
              <div className="bg-ivory rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="flex gap-1 mb-6 text-amber">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-8 italic flex-grow">
                  "{testimonial.quote}"
                </p>
                <div className="mt-auto">
                  <p className="font-serif text-lg text-charcoal font-medium">
                    — {testimonial.author}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

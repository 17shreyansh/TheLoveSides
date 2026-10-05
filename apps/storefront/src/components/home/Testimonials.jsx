import React from 'react';
import clientImg from '../../assets/client.PNG';
import RevealOnScroll from '../ui/RevealOnScroll';
import ResponsiveCardSlider from '../ui/ResponsiveCardSlider';
import { useTheme } from '../../context/ThemeContext';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const { testimonials = [] } = useTheme();

  const renderTestimonial = (testimonial, idx) => {
    if (testimonial.image) {
      return (
        <RevealOnScroll delay={idx * 0.1} className="h-full w-full flex justify-center">
          <div className="rounded-2xl shadow-sm hover:shadow-md transition-shadow w-full max-w-sm mx-auto overflow-hidden border border-pink-primary/10 flex flex-col bg-white">
            <img src={testimonial.image} alt="Customer Review" className="w-full h-auto object-contain max-h-[500px]" />
          </div>
        </RevealOnScroll>
      );
    }

    return (
      <RevealOnScroll delay={idx * 0.1} className="h-full w-full flex justify-center">
        <div className="bg-ivory rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col border border-pink-primary/10 w-full max-w-sm mx-auto h-full min-h-[300px]">
          <div className="flex gap-1 mb-4 text-gold">
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
  };

  return (
    <section className="pb-10 md:pb-16 bg-[#ffeaef]">
      <RevealOnScroll>
        <div className="w-full mb-8 md:mb-12">
          <img src={clientImg} alt="Client love" className="w-full h-auto object-cover" />
        </div>
      </RevealOnScroll>

      <div className="max-w-7xl mx-auto px-6 md:px-10 overflow-hidden md:overflow-visible">
        <ResponsiveCardSlider items={testimonials} renderItem={renderTestimonial} desktopCols={3} />
      </div>
    </section>
  );
}

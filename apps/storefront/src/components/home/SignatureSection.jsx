import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function SignatureSection({ signature }) {
  if (!signature) return null;
  
  const isImageLeft = signature.imagePosition === 'left';
  
  return (
    <section className="py-16 md:py-24 bg-ivory/30">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          
          <div className={clsx(
            "w-full md:w-1/2 order-2",
            isImageLeft ? "md:order-2" : "md:order-1"
          )}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-charcoal mb-6">
              {signature.title}
            </h2>
            <div className="w-16 h-[1px] bg-charcoal/20 mb-6"></div>
            <p className="text-lg text-charcoal/80 leading-relaxed font-sans mb-8">
              {signature.text}
            </p>
            {signature.buttonText && signature.buttonLink && (
              <Link
                to={signature.buttonLink}
                className="inline-block bg-charcoal text-white px-8 py-3 rounded-full hover:bg-charcoal/90 transition-colors duration-300 font-medium"
              >
                {signature.buttonText}
              </Link>
            )}
          </div>

          <div className={clsx(
            "w-full md:w-1/2 order-1",
            isImageLeft ? "md:order-1" : "md:order-2"
          )}>
            <div className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gray-100">
              {signature.imageUrl ? (
                <img 
                  src={signature.imageUrl} 
                  alt={signature.title || "Signature Image"} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-sm uppercase tracking-widest">No Image</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

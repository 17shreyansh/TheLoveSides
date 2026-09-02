import React from 'react';
import { Heart, MessageCircle, Play } from 'lucide-react';
import RevealOnScroll from '../ui/RevealOnScroll';
import { socialPosts } from '../../data/homeData';

// Custom SVG for Instagram since lucide-react removed brand icons
const InstagramIcon = ({ className, strokeWidth = 1.5 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function SocialFeed() {
  return (
    <section className="py-8 md:py-12 bg-cream/30 relative overflow-hidden" id="social-feed">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-ivory rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-ivory rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        
        <RevealOnScroll>
          <div className="flex flex-col items-center justify-center text-center mb-6 md:mb-8">
            <a 
              href="#" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 md:gap-3 text-charcoal hover:text-pink-primary transition-colors mb-3 group"
            >
              <InstagramIcon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
              <span className="font-serif text-2xl md:text-3xl">@thelovesides</span>
            </a>
            <p className="text-[10px] md:text-xs font-sans tracking-[0.2em] md:tracking-[0.3em] text-gray-500 uppercase">
              Join Our Community On Instagram
            </p>
          </div>
        </RevealOnScroll>

        {/* CSS Grid Masonry Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 auto-rows-[120px] sm:auto-rows-[150px] md:auto-rows-[180px] lg:auto-rows-[200px]">
          {socialPosts.slice(0, 6).map((img, idx) => {
            let spanClasses = "";
            let hasPlayIcon = false;

            if (idx === 0) {
              spanClasses = "row-span-2 col-span-1"; // Col 1 (Tall)
              hasPlayIcon = true;
            } else if (idx === 1) {
              spanClasses = "row-span-1 col-span-1"; // Col 2 Top
            } else if (idx === 2) {
              spanClasses = "row-span-1 col-span-1"; // Col 3 Top
            } else if (idx === 3) {
              spanClasses = "row-span-2 col-span-1"; // Col 4 (Tall)
              hasPlayIcon = true;
            } else if (idx === 4) {
              spanClasses = "row-span-1 col-span-1"; // Col 2 Bottom
            } else if (idx === 5) {
              spanClasses = "row-span-1 col-span-1"; // Col 3 Bottom
            }

            return (
              <RevealOnScroll 
                key={idx} 
                delay={idx * 0.1} 
                className={`group relative rounded-2xl overflow-hidden cursor-pointer ${spanClasses} shadow-sm hover:shadow-xl transition-all duration-300 bg-white`}
              >
                <img 
                  src={img} 
                  alt={`Instagram post ${idx + 1}`} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {hasPlayIcon && (
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 text-white bg-black/20 rounded-full p-1.5 backdrop-blur-sm shadow-sm z-10">
                    <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-0.5" />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-white font-sans font-medium text-sm md:text-base z-20">
                  <div className="flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Heart className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                    <span>{(2.1 + idx * 0.4).toFixed(1)}k</span>
                  </div>
                  <div className="flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                    <span>{103 + idx * 24}</span>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

      </div>
    </section>
  );
}

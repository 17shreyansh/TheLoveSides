import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import { useColors } from '../../hooks/useColors';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ShopByColor() {
  const { colors, loading } = useColors();
  const [activeColor, setActiveColor] = useState(null);
  const navigate = useNavigate();
  const sliderId = "color-showcase-slider";

  useEffect(() => {
    if (colors.length > 0 && !activeColor) {
      setActiveColor(colors[0].id);
    }
  }, [colors, activeColor]);

  const handleColorClick = (color) => {
    setActiveColor(color.id);
    navigate(`/products?color=${encodeURIComponent(color.label)}`);
  };

  return (
    <section className="py-10 md:py-16 bg-ivory overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <RevealOnScroll>
          <SectionHeading 
            title="Shop by Color" 
            subtitle="Find your perfect palette" 
          />
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          {loading ? (
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-12 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-charcoal/10" />
                  <div className="w-12 h-4 mt-3 bg-charcoal/10 rounded" />
                </div>
              ))}
            </div>
          ) : colors.length === 0 ? (
            <div className="text-center py-10 text-charcoal/60">No colors available yet.</div>
          ) : (
            <div className="w-full relative mt-12 overflow-visible group slider-container">
              <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                slidesPerView={3.5}
                spaceBetween={16}
                centeredSlides={false}
                loop={colors.length > 5}
                autoplay={{
                  delay: 3500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                pagination={{
                  clickable: true,
                  el: `.swiper-pagination-${sliderId}`,
                  bulletClass: 'swiper-pagination-bullet !bg-charcoal/20 !w-2 !h-2 !rounded-full !transition-all !duration-500 !mx-1',
                  bulletActiveClass: '!bg-pink-primary !w-8'
                }}
                navigation={{
                  prevEl: `.swiper-button-prev-${sliderId}`,
                  nextEl: `.swiper-button-next-${sliderId}`,
                }}
                breakpoints={{
                  480: {
                    slidesPerView: 4.5,
                    spaceBetween: 20,
                  },
                  640: {
                    slidesPerView: 5.5,
                    spaceBetween: 24,
                  },
                  768: {
                    slidesPerView: 6.5,
                    spaceBetween: 28,
                  },
                  1024: {
                    slidesPerView: 8,
                    spaceBetween: 32,
                    allowTouchMove: true,
                  },
                  1280: {
                    slidesPerView: 10,
                    spaceBetween: 32,
                    allowTouchMove: true,
                  }
                }}
                className="!pb-12 md:!pb-4 !px-4 -mx-4"
              >
                {colors.map((color) => {
                  const isActive = activeColor === color.id;
                  
                  return (
                    <SwiperSlide key={color.id} className="flex justify-center">
                      <div className="flex flex-col items-center py-4">
                        <button
                          onClick={() => handleColorClick(color)}
                          className={clsx(
                            'w-16 h-16 md:w-20 md:h-20 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-all duration-300 relative',
                            isActive ? 'ring-2 ring-offset-4 ring-pink-primary scale-110' : 'hover:scale-110 border-2 border-white',
                            'before:absolute before:inset-0 before:rounded-full before:shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]'
                          )}
                          style={{ backgroundColor: color.hex }}
                          aria-label={`Select ${color.label} color`}
                        />
                        <span className={clsx(
                          "text-sm mt-4 text-center transition-colors font-medium whitespace-nowrap",
                          isActive ? "text-charcoal" : "text-gray-500"
                        )}>
                          {color.label}
                        </span>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>

              {/* Custom Navigation Arrows */}
              <button
                className={`swiper-button-prev-${sliderId} hidden md:flex absolute left-4 lg:-left-6 top-1/2 -translate-y-1/2 -mt-6 z-20 w-12 h-12 bg-white text-charcoal rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] items-center justify-center hover:bg-charcoal hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none opacity-0 group-hover:opacity-100`}
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" strokeWidth={2} />
              </button>
              <button
                className={`swiper-button-next-${sliderId} hidden md:flex absolute right-4 lg:-right-6 top-1/2 -translate-y-1/2 -mt-6 z-20 w-12 h-12 bg-white text-charcoal rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] items-center justify-center hover:bg-charcoal hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none opacity-0 group-hover:opacity-100`}
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" strokeWidth={2} />
              </button>

              {/* Pagination Dots */}
              <div className={`swiper-pagination-${sliderId} flex justify-center mt-2`} />
            </div>
          )}
        </RevealOnScroll>
      </div>
    </section>
  );
}

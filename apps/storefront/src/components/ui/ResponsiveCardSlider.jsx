import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ResponsiveCardSlider({ items, renderItem, desktopCols = 4 }) {
  // Using a custom unique ID for navigation to support multiple sliders on the same page
  const sliderId = React.useId().replace(/:/g, "");

  return (
    <div className="w-full relative overflow-visible group slider-container mx-auto">
      <Swiper
        modules={[Navigation, Pagination]}
        slidesPerView={1}
        spaceBetween={16}
        pagination={{
          clickable: true,
          el: `.swiper-pagination-${sliderId}`,
        }}
        navigation={{
          prevEl: `.swiper-button-prev-${sliderId}`,
          nextEl: `.swiper-button-next-${sliderId}`,
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
          1024: {
            slidesPerView: desktopCols,
            spaceBetween: 32,
            allowTouchMove: true,
          },
        }}
        className="!pb-12" // Extra padding bottom for shadows so they aren't clipped
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id || index} className="h-auto">
            {renderItem(item, index)}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Arrows */}
      <button 
        className={`swiper-button-prev-${sliderId} absolute left-0 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur border border-white/50 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center justify-center text-charcoal hover:bg-white hover:scale-105 hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)] transition-all cursor-pointer disabled:opacity-0 disabled:cursor-auto`}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
      </button>
      <button 
        className={`swiper-button-next-${sliderId} absolute right-0 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur border border-white/50 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center justify-center text-charcoal hover:bg-white hover:scale-105 hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)] transition-all cursor-pointer disabled:opacity-0 disabled:cursor-auto`}
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
      </button>

      {/* Pagination Dots */}
      <div className={`swiper-pagination-${sliderId} flex justify-center mt-6 gap-2`} />
    </div>
  );
}

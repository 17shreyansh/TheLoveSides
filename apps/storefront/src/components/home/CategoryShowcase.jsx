import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import { useCategories } from '../../hooks/useCategories';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryShowcase() {
  const { categories: collections, loading } = useCategories();
  const activeCollections = collections || [];
  const sliderId = "category-showcase-slider";

  return (
    <section className="py-8 md:py-10 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <RevealOnScroll>
          <SectionHeading 
            title="Shop by Category" 
            subtitle="Browse through our popular categories" 
          />
        </RevealOnScroll>

        <div className="relative mt-8">
          {loading ? (
             <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 xl:justify-center">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-[70vw] sm:w-[240px] lg:w-[260px] aspect-[1/1.1] sm:aspect-[4/5] bg-charcoal/5 animate-pulse rounded-xl md:rounded-2xl flex-shrink-0"></div>
                ))}
             </div>
          ) : activeCollections.length === 0 ? (
            <div className="text-center py-10 text-charcoal/60">No categories available yet.</div>
          ) : (
            <div className="w-full relative overflow-visible group slider-container">
              <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                slidesPerView={1.2}
                spaceBetween={16}
                centeredSlides={false}
                loop={activeCollections.length >= 4}
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
                    slidesPerView: 1.5,
                    spaceBetween: 16,
                  },
                  640: {
                    slidesPerView: 2.2,
                    spaceBetween: 20,
                  },
                  768: {
                    slidesPerView: 3.2,
                    spaceBetween: 24,
                  },
                  1024: {
                    slidesPerView: 4,
                    spaceBetween: 24,
                    allowTouchMove: true,
                  },
                  1280: {
                    slidesPerView: 4,
                    spaceBetween: 32,
                  }
                }}
                className="!pb-12"
              >
                {activeCollections.map((category, idx) => (
                  <SwiperSlide key={category._id} className="h-auto">
                    <RevealOnScroll delay={idx * 0.1}>
                      <Link 
                        to={`/category/${category.slug}`}
                        className="group relative block aspect-[1/1.1] sm:aspect-[4/5] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer shadow-sm md:hover:shadow-2xl transition-all duration-500"
                      >
                        {category.image && !category.image.endsWith('/undefined') ? (
                          <img 
                            src={category.image} 
                            alt={category.name} 
                            className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-charcoal/10 flex items-center justify-center transition-transform duration-700 md:group-hover:scale-110">
                            <span className="text-charcoal/40 text-sm">No Image</span>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 opacity-70 md:group-hover:opacity-90 transition-opacity duration-500"></div>
                        
                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                          <h3 className="font-serif text-lg md:text-2xl text-white mb-2 md:transform md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500">
                            {category.name}
                          </h3>
                          <p className="text-white/90 font-sans text-xs md:text-sm font-semibold tracking-wider uppercase md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 flex items-center gap-2">
                            Shop Now <span className="text-lg leading-none">→</span>
                          </p>
                        </div>
                      </Link>
                    </RevealOnScroll>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom Navigation Arrows */}
              <button 
                className={`swiper-button-prev-${sliderId} absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 -mt-6 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur border border-white/50 rounded-full shadow-lg flex items-center justify-center text-charcoal hover:bg-white hover:scale-105 hover:shadow-xl transition-all cursor-pointer disabled:opacity-0 disabled:cursor-auto opacity-0 group-hover:opacity-100`}
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
              </button>
              <button 
                className={`swiper-button-next-${sliderId} absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 -mt-6 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur border border-white/50 rounded-full shadow-lg flex items-center justify-center text-charcoal hover:bg-white hover:scale-105 hover:shadow-xl transition-all cursor-pointer disabled:opacity-0 disabled:cursor-auto opacity-0 group-hover:opacity-100`}
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
              </button>

              {/* Pagination Dots */}
              <div className={`swiper-pagination-${sliderId} flex justify-center mt-2`} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

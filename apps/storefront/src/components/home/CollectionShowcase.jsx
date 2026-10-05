import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import { useCollections } from '../../hooks/useCollections';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CollectionShowcase() {
  const { collections, loading } = useCollections();
  const activeCollections = collections || [];
  const sliderId = "collection-showcase-slider";

  return (
    <section className="py-8 md:py-10 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <RevealOnScroll>
          <SectionHeading
            title="Explore Our Collection"
            subtitle="Curated styles for every space"
          />
        </RevealOnScroll>

        <div className="relative mt-8">
          {loading ? (
            <div className="flex gap-3 md:gap-5 overflow-x-auto pb-6 xl:justify-center">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="w-[42vw] sm:w-[200px] lg:w-[220px] aspect-[4/5] bg-charcoal/5 animate-pulse rounded-xl md:rounded-2xl flex-shrink-0"></div>
              ))}
            </div>
          ) : activeCollections.length === 0 ? (
            <div className="text-center py-10 text-charcoal/60">No collections available yet.</div>
          ) : (
            <div className="w-full relative overflow-visible group slider-container">
              <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                slidesPerView={2.2}
                spaceBetween={12}
                centeredSlides={false}
                loop={activeCollections.length > 5}
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
                    slidesPerView: 2.8,
                    spaceBetween: 16,
                  },
                  640: {
                    slidesPerView: 3.5,
                    spaceBetween: 16,
                  },
                  768: {
                    slidesPerView: 4.2,
                    spaceBetween: 20,
                  },
                  1024: {
                    slidesPerView: 5,
                    spaceBetween: 24,
                    allowTouchMove: true,
                  },
                  1280: {
                    slidesPerView: 6,
                    spaceBetween: 24,
                  }
                }}
                className="!pb-12"
              >
                {activeCollections.map((collection, idx) => (
                  <SwiperSlide key={collection._id} className="h-auto">
                    <RevealOnScroll delay={idx * 0.1}>
                      <Link
                        to={`/products?collection=${collection.slug}`}
                        className="group relative block aspect-[4/5] sm:aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer shadow-sm md:hover:shadow-xl transition-all duration-500"
                      >
                        {collection.image && !collection.image.endsWith('/undefined') ? (
                          <img
                            src={collection.image}
                            alt={collection.name}
                            className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-charcoal/10 flex items-center justify-center transition-transform duration-700 md:group-hover:scale-110">
                            <span className="text-charcoal/40 text-sm">No Image</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 md:group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="absolute inset-0 p-4 sm:p-5 md:p-6 flex flex-col justify-end">
                          <h3 className="font-serif text-base sm:text-lg md:text-xl font-medium text-white mb-1 md:mb-1.5 md:transform md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 drop-shadow-sm">
                            {collection.name}
                          </h3>
                          <p className="text-white/90 font-sans text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 flex items-center gap-1.5">
                            Shop Now <span className="text-sm leading-none">→</span>
                          </p>
                        </div>
                      </Link>
                    </RevealOnScroll>
                  </SwiperSlide>
                ))}
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
        </div>
      </div>
    </section>
  );
}


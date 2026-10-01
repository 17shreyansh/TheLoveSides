import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/zoom';

export default function ImageZoomViewer({ images = [], onFullscreenChange }) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Hover & Zoom State
  const [isHovering, setIsHovering] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 }); // relative percentages (0-100)
  const [lensPos, setLensPos] = useState({ top: 0, left: 0 }); // pixels for the lens box
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const imgContainerRef = useRef(null);
  
  // Lens dimension constants (pixels)
  const LENS_SIZE = 160; // Size of the square lens overlay
  const ZOOM_LEVEL = 2.2; // 220% zoom

  const handleMouseMove = useCallback((e) => {
    if (!imgContainerRef.current) return;
    
    const { left, top, width, height } = imgContainerRef.current.getBoundingClientRect();
    
    // Mouse position relative to the container
    let x = e.clientX - left;
    let y = e.clientY - top;

    // Clamp coordinates to stay within the image container
    x = Math.max(0, Math.min(x, width));
    y = Math.max(0, Math.min(y, height));
    
    // Calculate percentages for background-position
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;
    
    // Calculate Lens Top/Left (centering the lens on the cursor, but clamping it inside bounds)
    let lensLeft = x - LENS_SIZE / 2;
    let lensTop = y - LENS_SIZE / 2;
    
    lensLeft = Math.max(0, Math.min(lensLeft, width - LENS_SIZE));
    lensTop = Math.max(0, Math.min(lensTop, height - LENS_SIZE));

    setCursorPos({ x: xPercent, y: yPercent });
    setLensPos({ top: lensTop, left: lensLeft });
  }, []);
  
  const nextImage = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Lock body scroll when fullscreen is open
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    if (onFullscreenChange) {
      onFullscreenChange(isFullscreen);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, onFullscreenChange]);
  
  if (!images || images.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-4 relative">
      
      {/* 
        DESKTOP LAYOUT (Hidden on mobile, block on lg+)
      */}
      <div className="hidden lg:flex gap-4 lg:gap-6 relative z-10 w-full">
        {/* Thumbnails (Vertical on left side) */}
        <div className="flex flex-col gap-3 w-16 xl:w-20 shrink-0">
          {images.map((img, index) => (
            <button 
              key={index} 
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              className={`aspect-[4/5] rounded-xl overflow-hidden cursor-pointer border-2 focus:outline-none ${index === activeIndex ? 'border-pink-primary opacity-100 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'} transition-all duration-300`}
            >
              <img src={img} alt={`thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Main Image Container */}
        <div 
          ref={imgContainerRef}
          className="w-full aspect-[4/5] rounded-2xl bg-gray-100 relative overflow-hidden cursor-crosshair group shadow-sm border border-charcoal/5"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsFullscreen(true)}
        >
          <img 
            src={images[activeIndex]} 
            alt="Product View" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <button onClick={prevImage} className="p-2 bg-white/80 hover:bg-white rounded-full shadow-md text-charcoal backdrop-blur-sm transition-all hover:scale-105">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <button onClick={nextImage} className="p-2 bg-white/80 hover:bg-white rounded-full shadow-md text-charcoal backdrop-blur-sm transition-all hover:scale-105">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}

          {/* Hover Lens Overlay */}
          <AnimatePresence>
            {isHovering && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute pointer-events-none border-2 border-white/70 bg-white/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.2)] backdrop-blur-[0.5px] z-10"
                style={{
                  width: LENS_SIZE,
                  height: LENS_SIZE,
                  top: lensPos.top,
                  left: lensPos.left
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* 
          Zoomed Preview Panel 
          Absolute positioned to overlay the right column (product details area).
        */}
        <AnimatePresence>
          {isHovering && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-[100] top-0 left-[calc(100%+3rem)] w-[calc(140%)] xl:w-[calc(150%)] h-full rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-200 pointer-events-none"
              style={{
                backgroundImage: `url(${images[activeIndex]})`,
                backgroundPosition: `${cursorPos.x}% ${cursorPos.y}%`,
                backgroundSize: `${ZOOM_LEVEL * 100}%`,
                backgroundRepeat: 'no-repeat'
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* 
        MOBILE LAYOUT (Swiper, disabled hover)
      */}
      <div className="lg:hidden w-full relative">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="w-full aspect-[4/5] rounded-xl overflow-hidden shadow-sm"
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx} onClick={() => setIsFullscreen(true)} className="flex items-center justify-center bg-white">
              <img src={img} alt={`Product view ${idx + 1}`} className="w-full h-full object-contain cursor-pointer" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Fullscreen Lightbox Modal (Pro Version) */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-[99999] bg-black/98 flex flex-col"
          >
            {/* Header / Close - High Visibility */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-[100000]">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(false);
                }}
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all shadow-lg border border-white/20 group cursor-pointer"
                aria-label="Close fullscreen"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Main Content - Swiper with Zoom */}
            <div className="flex-1 w-full h-full relative" onClick={() => setIsFullscreen(false)}>
              <Swiper
                modules={[Zoom, Navigation, Pagination]}
                zoom={{ maxRatio: 3, minRatio: 1 }}
                navigation={{
                  prevEl: '.swiper-button-prev-custom',
                  nextEl: '.swiper-button-next-custom',
                }}
                pagination={{ type: 'fraction', el: '.swiper-pagination-custom' }}
                initialSlide={activeIndex}
                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                className="w-full h-full"
                onClick={(e) => e.stopPropagation()} 
              >
                {images.map((img, idx) => (
                  <SwiperSlide key={idx} className="flex items-center justify-center p-0 md:p-12">
                    <div className="swiper-zoom-container cursor-grab active:cursor-grabbing w-full h-full flex items-center justify-center">
                      <img 
                        src={img} 
                        alt={`Fullscreen View ${idx + 1}`} 
                        className="max-w-full max-h-full object-contain rounded-sm select-none"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Custom Navigation */}
              {images.length > 1 && (
                <>
                  <button className="swiper-button-prev-custom absolute left-2 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all z-[10000] border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed group">
                    <ChevronLeft className="w-5 h-5 md:w-8 md:h-8 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <button className="swiper-button-next-custom absolute right-2 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all z-[10000] border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed group">
                    <ChevronRight className="w-5 h-5 md:w-8 md:h-8 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </>
              )}

              {/* Custom Pagination & Thumbnails */}
              <div className="absolute bottom-0 left-0 right-0 z-[10000] bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-6 px-4 md:px-6 flex flex-col items-center gap-4 pointer-events-none">
                
                {images.length > 1 && (
                  <div className="flex items-center gap-2 md:gap-3 pointer-events-auto overflow-x-auto max-w-full no-scrollbar pb-2 px-2">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIndex(index);
                          const swiperEl = document.querySelector('.swiper').swiper;
                          if (swiperEl) swiperEl.slideTo(index);
                        }}
                        className={`h-14 w-14 md:h-20 md:w-20 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 shadow-lg ${index === activeIndex ? 'ring-2 ring-white scale-105 opacity-100' : 'opacity-50 hover:opacity-100 hover:scale-100 border border-white/20'}`}
                      >
                        <img src={img} alt={`thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="swiper-pagination-custom text-white/80 font-medium font-sans tracking-widest text-xs md:text-sm bg-black/40 px-3 md:px-4 py-1 md:py-1.5 rounded-full backdrop-blur-md border border-white/10"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

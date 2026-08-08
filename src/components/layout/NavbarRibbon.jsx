import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { promoOffers } from '../../data/homeData';

import clsx from 'clsx';

export default function NavbarRibbon({ isVisible }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promoOffers.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? promoOffers.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promoOffers.length);
  };

  if (!promoOffers || promoOffers.length === 0) return null;

  return (
    <div 
      className={clsx(
        "w-full bg-burgundy text-ivory flex items-center justify-center relative transition-all duration-300 ease-in-out",
        isVisible ? "opacity-100" : "opacity-0 overflow-hidden"
      )} 
      style={{ height: isVisible ? '40px' : '0px' }}
    >
      <button 
        onClick={handlePrev} 
        className="absolute left-2 md:left-4 p-1 hover:text-rose-light transition-colors focus:outline-none z-10"
        aria-label="Previous Offer"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      <div className="flex-grow flex justify-center items-center h-full max-w-[85%] mx-auto py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.15em] sm:tracking-widest text-center"
          >
            <Gift className="w-3 h-3 md:w-4 md:h-4 text-gold hidden sm:block flex-shrink-0" />
            <span className="line-clamp-1">{promoOffers[currentIndex]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <button 
        onClick={handleNext} 
        className="absolute right-2 md:right-4 p-1 hover:text-rose-light transition-colors focus:outline-none z-10"
        aria-label="Next Offer"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </button>
    </div>
  );
}

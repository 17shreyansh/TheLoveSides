import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import HeroImageDesktop from '../../assets/images/heroimg.jpeg';
import HeroImageMobile from '../../assets/images/HeroImage2.jpeg';

export default function Hero() {
  // Stagger animation setup
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <section className="relative mt-[85px] md:mt-[136px] lg:mt-[108px] min-h-[calc(100vh-85px)] md:min-h-[calc(100vh-136px)] lg:min-h-[calc(100vh-108px)] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={HeroImageMobile}
          alt=""
          className="w-full h-full object-cover object-[85%_center] md:hidden"
        />
        <img
          src={HeroImageDesktop}
          alt=""
          className="w-full h-full object-cover object-center hidden md:block"
        />
        {/* Overlay gradient - mobile only */}
        <div className="absolute inset-0 bg-gradient-to-r from-hero-dark/90 via-hero-dark/60 to-transparent md:hidden"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <motion.div
          className="max-w-xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.2] md:leading-[1.05] text-ivory md:text-black mb-4 md:mb-6"
          >
            Curtains & <br className="md:hidden" /> Quiet Luxury
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="hidden md:block text-lg md:text-xl text-black/80 font-sans mb-10 leading-relaxed"
          >
            Shop our exclusive collection of premium curtains and blinds. Discover high-quality fabrics, custom sizing, and effortless style to elevate any room.
          </motion.p>
          
          <motion.p 
            variants={itemVariants}
            className="md:hidden text-base text-ivory/80 font-sans mb-8 leading-relaxed"
          >
            Home, Styled with Love
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex gap-4 flex-wrap"
          >
            <Button className="!bg-pink-primary !text-white hover:!bg-pink-dark hover:shadow-lg px-8">
              Shop Curtains
            </Button>
            <Button className="!bg-ivory/10 md:!bg-black/5 !border !border-ivory/40 md:!border-black/20 !text-ivory md:!text-black hover:!bg-ivory hover:!text-hero-dark md:hover:!bg-black md:hover:!text-white px-8">
              Book Free Consultation
            </Button>
          </motion.div>
          
        </motion.div>
      </div>
    </section>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import HeroImage from '../../assets/images/HeroImage2.jpeg';

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
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={HeroImage}
          alt=""
          className="w-full h-full object-cover object-[85%_center] md:object-[center_5%]"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-hero-dark/90 via-hero-dark/60 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 mt-32 md:mt-40">
        <motion.div
          className="max-w-xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.2] md:leading-[1.05] text-ivory mb-4 md:mb-6"
          >
            Curtains & <br className="md:hidden" /> Quiet Luxury
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="hidden md:block text-lg md:text-xl text-ivory/80 font-sans mb-10 leading-relaxed"
          >
            Shop our exclusive collection of premium curtains and blinds. Discover high-quality fabrics, custom sizing, and effortless style to elevate any room.
          </motion.p>
          
          <motion.p 
            variants={itemVariants}
            className="md:hidden text-base text-ivory/80 font-sans mb-8 leading-relaxed"
          >
            Adding Love to Every Sides.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex gap-4 flex-wrap"
          >
            <Button className="!bg-pink-primary !text-white hover:!bg-pink-dark hover:shadow-lg px-8">
              Shop Curtains
            </Button>
            <Button className="!bg-ivory/10 !border !border-ivory/40 !text-ivory hover:!bg-ivory hover:!text-hero-dark px-8">
              Book Free Consultation
            </Button>
          </motion.div>
          
        </motion.div>
      </div>
    </section>
  );
}

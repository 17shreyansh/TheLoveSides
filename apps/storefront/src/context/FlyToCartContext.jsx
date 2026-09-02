import React, { createContext, useContext, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FlyToCartContext = createContext();

export function FlyToCartProvider({ children }) {
  const [flyingItems, setFlyingItems] = useState([]);
  const cartIconRef = useRef(null);

  const triggerFlyToCart = (startRect, imageSrc) => {
    if (!startRect || !imageSrc) return;

    let endX = window.innerWidth - 60; // Fallback if ref is missing
    let endY = 30; // Fallback

    if (cartIconRef.current) {
      const endRect = cartIconRef.current.getBoundingClientRect();
      endX = endRect.left + endRect.width / 2 - 12; // Center the 24px flying image
      endY = endRect.top + endRect.height / 2 - 12;
      
      // If navbar is hidden via scroll (top < 0), fly to where it would be
      if (endY < 0) {
        endY = 30; 
      }
    }

    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    
    const newItem = {
      id,
      imageSrc,
      startX: startRect.left,
      startY: startRect.top,
      width: startRect.width,
      height: startRect.height,
      endX,
      endY,
    };

    setFlyingItems((prev) => [...prev, newItem]);

    // Clean up after animation finishes (800ms to be safe)
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    }, 800);
  };

  return (
    <FlyToCartContext.Provider value={{ cartIconRef, triggerFlyToCart }}>
      {children}
      
      {/* Global Overlay for flying items */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        <AnimatePresence>
          {flyingItems.map((item) => (
            <motion.img
              key={item.id}
              src={item.imageSrc}
              initial={{
                x: item.startX,
                y: item.startY,
                width: item.width,
                height: item.height,
                opacity: 1,
                borderRadius: '16px',
              }}
              animate={{
                x: [item.startX, item.startX + (item.endX - item.startX) * 0.5, item.endX],
                y: [item.startY, item.startY - 100, item.endY],
                width: [item.width, item.width * 0.5, 20],
                height: [item.height, item.height * 0.5, 20],
                opacity: [1, 1, 0],
                borderRadius: ['16px', '32px', '50%'],
              }}
              transition={{
                duration: 0.65,
                ease: "easeInOut",
              }}
              className="absolute object-cover shadow-xl border-2 border-white/50"
            />
          ))}
        </AnimatePresence>
      </div>
    </FlyToCartContext.Provider>
  );
}

export function useFlyToCart() {
  const context = useContext(FlyToCartContext);
  if (!context) {
    throw new Error('useFlyToCart must be used within a FlyToCartProvider');
  }
  return context;
}

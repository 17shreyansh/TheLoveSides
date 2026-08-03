import React, { useState } from 'react';
import StarRating from './StarRating';
import Button from './Button';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  return (
    <div className="group rounded-2xl bg-ivory shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden rounded-t-2xl">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col flex-grow p-6">
        <h3 className="font-serif text-lg md:text-xl text-charcoal mb-2 line-clamp-1">{product.name}</h3>
        <div className="flex justify-between items-center mb-6">
          <span className="font-sans font-medium text-lg text-charcoal">${product.price}</span>
          <StarRating value={product.rating} />
        </div>
        <div className="mt-auto">
          <Button 
            variant="dark" 
            className="w-full relative overflow-hidden" 
            onClick={handleAddToCart}
            disabled={added}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="block text-amber-light"
                >
                  Added ✓
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="block"
                >
                  Add to Cart
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </div>
  );
}

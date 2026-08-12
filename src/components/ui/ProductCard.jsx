import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="group rounded-xl bg-ivory shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-col h-full border border-charcoal/5">
      <Link to={`/product/${product.id}`} className="relative w-full shrink-0 aspect-square md:aspect-[4/5] block cursor-pointer">
        <img 
          src={product.image} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-col flex-grow p-3 md:p-4 justify-between">
        <div>
          <Link to={`/product/${product.id}`} className="hover:text-pink-primary transition-colors block mb-1">
            <h3 className="font-serif text-sm md:text-lg text-charcoal line-clamp-1 leading-snug">{product.name}</h3>
          </Link>
          <div className="flex justify-between items-center mt-1 md:mt-2 gap-1">
            <span className="font-sans font-semibold text-sm md:text-lg text-charcoal shrink-0">₹{product.price}</span>
            <div className="scale-[0.6] sm:scale-75 md:scale-100 origin-right">
              <StarRating value={product.rating} />
            </div>
          </div>
        </div>
        <div className="mt-3 md:mt-4">
          <Button 
            variant="dark" 
            className="w-full relative overflow-hidden text-xs md:text-sm py-2 md:py-3 px-1 md:px-4 shrink-0" 
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
                  className="block text-pink-primary whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Added ✓</span>
                  <span className="sm:hidden">✓</span>
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="block whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Add to Cart</span>
                  <span className="sm:hidden">Add</span>
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </div>
  );
}

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
    <div className="group rounded-2xl bg-ivory shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-row sm:flex-col h-full">
      <Link to={`/product/${product.id}`} className="relative w-1/2 sm:w-full shrink-0 sm:aspect-[4/3] overflow-hidden rounded-l-2xl sm:rounded-l-none sm:rounded-t-2xl min-h-[150px] block cursor-pointer">
        <img 
          src={product.image} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-col flex-grow w-1/2 sm:w-full p-4 sm:p-6 justify-between">
        <div>
          <Link to={`/product/${product.id}`} className="hover:text-rose transition-colors">
            <h3 className="font-serif text-base sm:text-lg md:text-xl text-charcoal mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-1 leading-snug">{product.name}</h3>
          </Link>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 sm:mb-6 gap-1 sm:gap-0">
            <span className="font-sans font-medium text-sm sm:text-lg text-charcoal">₹{product.price}</span>
            <div className="scale-[0.70] origin-left sm:scale-100 sm:origin-center">
              <StarRating value={product.rating} />
            </div>
          </div>
        </div>
        <div className="mt-auto">
          <Button 
            variant="dark" 
            className="w-full relative overflow-hidden text-sm sm:text-base px-2 sm:px-6" 
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
                  className="block text-rose-light"
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

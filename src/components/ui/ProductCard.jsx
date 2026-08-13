import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import Button from './Button';
import { useCart } from '../../context/CartContext';
import { useFlyToCart } from '../../context/FlyToCartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductCard({ product, layout = 'auto' }) {
  const { addToCart } = useCart();
  const { triggerFlyToCart } = useFlyToCart();
  const [added, setAdded] = useState(false);
  const imageRef = React.useRef(null);

  const handleAddToCart = (e) => {
    e.preventDefault(); // In case it's inside a Link or prevents event bubbling
    if (imageRef.current) {
      triggerFlyToCart(imageRef.current.getBoundingClientRect(), product.image);
    }
    addToCart(product);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  if (layout === 'vertical') {
    return (
      <div className="group rounded-xl bg-ivory shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-col h-full border border-charcoal/5">
        <Link to={`/product/${product.id}`} className="relative w-full shrink-0 aspect-square md:aspect-[4/5] block cursor-pointer">
          <img 
            ref={imageRef}
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

  // Original layout ('auto')
  return (
    <div className="group rounded-2xl bg-ivory shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-row sm:flex-col h-full">
      <Link to={`/product/${product.id}`} className="relative w-1/2 sm:w-full shrink-0 sm:aspect-[4/3] overflow-hidden rounded-l-2xl sm:rounded-l-none sm:rounded-t-2xl min-h-[150px] block cursor-pointer">
        <img 
          ref={imageRef}
          src={product.image} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-col flex-grow w-1/2 sm:w-full p-4 sm:p-6 justify-between">
        <div>
          <Link to={`/product/${product.id}`} className="hover:text-pink-primary transition-colors">
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
                  className="block text-pink-primary"
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

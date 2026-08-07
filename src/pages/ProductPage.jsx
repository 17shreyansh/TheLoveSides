import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, Info, Ruler, Truck, Shield, RefreshCw, Calendar, Star, Award, Sparkles } from 'lucide-react';
import { products } from '../data/homeData';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import StarRating from '../components/ui/StarRating';
import ProductCard from '../components/ui/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const product = products.find((p) => p.id === parseInt(id));
  
  const [selectedSize, setSelectedSize] = useState('7 feet');
  const [selectedColor, setSelectedColor] = useState('Ivory');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Mock related products (excluding current product)
  const relatedProducts = products.filter(p => p.id !== parseInt(id)).slice(0, 3);

  useEffect(() => {
    // Scroll to top when loading a new product page
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="pt-32 pb-20 px-6 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-serif text-charcoal mb-4">Product Not Found</h1>
        <p className="text-gray-500 mb-8">We couldn't find the product you're looking for.</p>
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  const sizes = ['5 feet', '7 feet', '9 feet', '12 feet'];
  const colors = [
    { name: 'Ivory', hex: '#FDFBF7' },
    { name: 'Beige', hex: '#E6DCC8' },
    { name: 'Charcoal', hex: '#36454F' },
    { name: 'Navy', hex: '#1C2E4A' }
  ];

  const handleAddToCart = () => {
    // In a real app we'd pass size/color/qty to the cart too
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="pt-28 md:pt-36 pb-32 md:pb-20 bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left Column: Images (Sticky) */}
          <div className="w-full lg:w-5/12 lg:sticky lg:top-32 self-start flex flex-col gap-4">
            
            <div className="flex gap-4">
              {/* Desktop Vertical Thumbnails */}
              <div className="hidden lg:flex flex-col gap-3 w-16 xl:w-20 shrink-0">
                {[0, 1, 2, 3].map((index) => (
                  <button 
                    key={index} 
                    onClick={() => setActiveImageIndex(index)}
                    className={`aspect-[4/5] rounded-lg overflow-hidden cursor-pointer border-2 focus:outline-none ${index === activeImageIndex ? 'border-amber opacity-100 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'} transition-all duration-300`}
                  >
                    <img src={product.image} alt={`thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full aspect-square md:aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 shadow-sm relative"
              >
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </motion.div>
            </div>
            
            {/* Mobile Horizontal Thumbnails */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:hidden grid grid-cols-4 gap-3 w-full"
            >
              {[0, 1, 2, 3].map((index) => (
                <button 
                  key={index} 
                  onClick={() => setActiveImageIndex(index)}
                  className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 focus:outline-none ${index === activeImageIndex ? 'border-amber opacity-100 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'} transition-all duration-300`}
                >
                  <img src={product.image} alt={`thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Details (Scrollable) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full lg:w-7/12 flex flex-col pb-10 lg:pl-8"
          >
            <span className="text-amber-dark font-sans font-semibold tracking-wider text-xs uppercase mb-3">
              Bespoke Window Treatments
            </span>
            <h1 className="text-3xl md:text-5xl font-serif text-charcoal mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-sans font-medium text-red-700">
                ${product.price}
              </span>
              <span className="text-xl font-sans text-gray-400 line-through">
                ${(product.price * 1.4).toFixed(0)}
              </span>
              <div className="flex items-center gap-2 border-l border-gray-300 pl-4 ml-2">
                <StarRating value={product.rating} />
                <span className="text-sm text-gray-500 font-medium">({Math.floor(Math.random() * 50) + 20} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-8">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-sans font-medium text-green-700">In Stock — Ships in 2-3 days</span>
            </div>

            <p className="text-base text-gray-600 font-sans leading-relaxed mb-8">
              Elevate your living space with our premium bespoke window treatments. Hand-crafted from the finest materials, these curtains offer an unparalleled blend of sophistication, light control, and thermal efficiency.
            </p>

            <div className="h-px w-full bg-charcoal/10 mb-8"></div>

            {/* Options */}
            <div className="flex flex-col gap-6 mb-10">
              
              {/* Size Selection */}
              <div>
                <span className="font-sans font-semibold text-charcoal block mb-3">Size (per panel)</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {sizes.map((size) => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                        selectedSize === size 
                          ? 'border-navy-dark bg-navy-dark text-white shadow-md' 
                          : 'border-charcoal/20 text-charcoal hover:border-navy-dark'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection with Swatches */}
              <div>
                <span className="font-sans font-semibold text-charcoal block mb-3">
                  Color: <span className="font-normal text-gray-600">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-4">
                  {colors.map((color) => (
                    <button 
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        selectedColor === color.name ? 'ring-2 ring-offset-2 ring-amber' : 'ring-1 ring-gray-200 hover:ring-amber/50'
                      }`}
                    >
                      <span 
                        className="w-8 h-8 rounded-full shadow-inner border border-black/5" 
                        style={{ backgroundColor: color.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <span className="font-sans font-semibold text-charcoal block mb-3">Quantity</span>
                <div className="flex items-center border border-charcoal/20 rounded-xl w-32 bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-12 flex items-center justify-center text-charcoal hover:text-amber transition-colors"
                  >
                    -
                  </button>
                  <span className="flex-grow text-center font-medium font-sans">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-12 flex items-center justify-center text-charcoal hover:text-amber transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Add to Cart Action */}
            <Button 
              variant="dark" 
              className="w-full py-4 text-lg font-medium shadow-xl hover:-translate-y-1 relative overflow-hidden mb-4"
              onClick={handleAddToCart}
              disabled={added}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="flex items-center justify-center gap-2 text-amber-light"
                  >
                    <Check className="w-5 h-5" /> Added to Cart
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="block"
                  >
                    Add to Cart - ${(product.price * quantity).toFixed(2)}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
            
            {/* Delivery Estimate Box */}
            <div className="flex items-center gap-4 p-4 mb-6 rounded-xl border border-amber/30 bg-amber/5">
              <Calendar className="w-6 h-6 text-amber flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-charcoal font-sans">Estimated Delivery</p>
                <p className="text-xs text-gray-600 font-sans mt-0.5">Order today, delivers between <strong className="text-charcoal font-semibold">Oct 12 - Oct 15</strong>.</p>
              </div>
            </div>
            
            {/* Guarantee Badges */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-6 border-t border-charcoal/10">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-6 h-6 text-gray-400" />
                <span className="text-[10px] md:text-xs font-sans text-gray-500 uppercase tracking-wider">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 border-x border-charcoal/10">
                <RefreshCw className="w-6 h-6 text-gray-400" />
                <span className="text-[10px] md:text-xs font-sans text-gray-500 uppercase tracking-wider">30-Day Returns</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="w-6 h-6 text-gray-400" />
                <span className="text-[10px] md:text-xs font-sans text-gray-500 uppercase tracking-wider">Secure Checkout</span>
              </div>
            </div>

            {/* Why You'll Love It */}
            <div className="mt-8 bg-cream/50 p-6 rounded-2xl border border-charcoal/5">
              <h3 className="font-serif text-xl text-charcoal mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber" /> Why You'll Love It
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-sans text-gray-600 leading-relaxed"><strong>Hand-finished edges</strong> for a perfect, weighted drape that hangs beautifully right out of the box.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-sans text-gray-600 leading-relaxed"><strong>Fade-resistant</strong> premium yarns designed to withstand years of direct sunlight.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-sans text-gray-600 leading-relaxed"><strong>Oeko-Tex® Certified</strong> meaning it's free of harmful chemicals and safe for your family.</span>
                </li>
              </ul>
            </div>

            {/* Accordion Tabs */}
            <div className="mt-8 border-t border-charcoal/10">
              {['description', 'specifications', 'shipping'].map((tab) => (
                <div key={tab} className="border-b border-charcoal/10">
                  <button 
                    onClick={() => setActiveTab(activeTab === tab ? '' : tab)}
                    className="w-full py-5 flex items-center justify-between font-serif text-lg text-charcoal focus:outline-none group"
                  >
                    <div className="flex items-center gap-3">
                      {tab === 'description' && <Info className="w-5 h-5 text-gray-400 group-hover:text-amber transition-colors" />}
                      {tab === 'specifications' && <Ruler className="w-5 h-5 text-gray-400 group-hover:text-amber transition-colors" />}
                      {tab === 'shipping' && <Truck className="w-5 h-5 text-gray-400 group-hover:text-amber transition-colors" />}
                      <span className="capitalize">{tab}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeTab === tab ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeTab === tab && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 text-gray-600 font-sans text-sm leading-relaxed pl-8">
                          {tab === 'description' && "Our signature curtains are woven with uncompromising attention to detail. Designed to drape beautifully from the moment they are hung, they offer the perfect balance of privacy and natural light."}
                          {tab === 'specifications' && "Sold as single panels. 100% premium fabric. Dry clean only. Includes matching tie-back. Stainless steel grommets or rod pocket available upon request."}
                          {tab === 'shipping' && "Free standard shipping on all orders over $200. Standard delivery takes 3-5 business days. Expedited shipping is available at checkout. 30-day hassle-free returns."}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

          </motion.div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-20 md:mt-32 border-t border-charcoal/10 pt-20">
        <div className="text-center mb-12">
          <span className="text-amber font-sans font-semibold tracking-widest text-xs uppercase block mb-3">Complete The Look</span>
          <h2 className="text-3xl md:text-4xl font-serif text-charcoal">Related Products</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 max-w-4xl mx-auto">
          {relatedProducts.map(related => (
            <ProductCard key={related.id} product={related} />
          ))}
        </div>
      </div>

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-6 z-50 md:hidden flex justify-between items-center shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div>
          <p className="text-xs text-gray-500 font-sans uppercase font-medium">{product.name}</p>
          <p className="text-lg font-sans font-semibold text-charcoal">${(product.price * quantity).toFixed(2)}</p>
        </div>
        <Button 
          variant="dark" 
          className="px-8 py-3 relative overflow-hidden"
          onClick={handleAddToCart}
          disabled={added}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex items-center justify-center gap-2 text-amber-light"
              >
                <Check className="w-4 h-4" /> Added
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="block whitespace-nowrap"
              >
                Add to Cart
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Menu, ShoppingBag, Search, User } from 'lucide-react';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { useCart } from '../../context/CartContext';
import { navLinks } from '../../data/homeData';
import MobileMenu from './MobileMenu';
import NavbarRibbon from './NavbarRibbon';
import clsx from 'clsx';
import Badge from '../ui/Badge';

export default function Navbar() {
  const { hideNavbar, scrollY } = useScrollDirection();
  const { state } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (state.totalCount > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [state.totalCount]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <>
      <header className={clsx(
        'fixed top-0 left-0 right-0 z-50 flex flex-col bg-cream transition-transform duration-300 ease-in-out w-full',
        hideNavbar ? '-translate-y-full' : 'translate-y-0',
        scrollY > 20 && 'shadow-md'
      )}>
        {/* ROW 1: Ribbon */}
        <NavbarRibbon isVisible={true} />
        
        {/* ROW 2: Main Header */}
        <div className="w-full py-4 border-b border-charcoal/10 relative">
          <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
            {/* LEFT: Search / Mobile Menu */}
            <div className="flex items-center gap-4">
              <button 
                className="md:hidden p-1 -ml-1 text-charcoal hover:text-rose transition-colors focus:outline-none"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="flex items-center">
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-1 text-charcoal hover:text-rose transition-colors focus:outline-none"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <div 
                  className={clsx(
                    "overflow-hidden transition-all duration-300 ease-in-out flex items-center",
                    isSearchOpen ? "w-32 sm:w-48 ml-2 opacity-100" : "w-0 opacity-0"
                  )}
                >
                  <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="Search for..."
                    className="w-full bg-transparent border-b border-charcoal/30 pb-1 text-sm text-charcoal focus:outline-none focus:border-rose transition-colors placeholder:text-charcoal/40"
                  />
                </div>
              </div>
            </div>

            {/* CENTER: Brand Wordmark */}
            <a 
              href="/" 
              className={clsx(
                "absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-opacity duration-300",
                isSearchOpen ? "opacity-0 sm:opacity-100 pointer-events-none sm:pointer-events-auto" : "opacity-100"
              )}
            >
              <span className="font-serif text-lg sm:text-2xl md:text-3xl tracking-[0.1em] sm:tracking-[0.2em] text-charcoal uppercase text-center whitespace-nowrap">
                THELOVESIDES
              </span>
            </a>

            {/* RIGHT: User & Cart */}
            <div className="flex items-center gap-3 md:gap-5">
              <button 
                className="p-1 text-charcoal hover:text-rose transition-colors focus:outline-none hidden sm:block"
                aria-label="Account"
              >
                <User className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              
              <button 
                className="relative p-1 text-charcoal hover:text-rose transition-colors focus:outline-none"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                {state.totalCount > 0 && (
                  <Badge className={clsx(isBouncing && 'animate-bounce')}>
                    {state.totalCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ROW 3: Categories (Desktop Only) */}
        <div className="hidden md:flex w-full py-3 border-b border-charcoal/10 bg-cream">
          <nav className="max-w-7xl mx-auto px-6 md:px-10 flex justify-center gap-10 w-full">
            {navLinks.map((link) => (
              <a 
                key={link.title} 
                href={link.href}
                className="text-sm font-medium tracking-wider uppercase text-charcoal hover:text-rose relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-rose hover:after:w-full after:transition-all after:duration-300"
              >
                {link.title}
              </a>
            ))}
          </nav>
        </div>
      </header>
      
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}

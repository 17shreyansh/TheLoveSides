import React, { useState, useEffect } from 'react';
import { Menu, ShoppingBag } from 'lucide-react';
import { useScrollHeader } from '../../hooks/useScrollHeader';
import { useCart } from '../../context/CartContext';
import { navLinks } from '../../data/homeData';
import Button from '../ui/Button';
import MobileMenu from './MobileMenu';
import clsx from 'clsx';
import Badge from '../ui/Badge';
import LogoImage from '../../assets/images/LogoTransparent.png';

export default function Navbar() {
  const isScrolled = useScrollHeader(20);
  const { state } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  // Trigger bounce animation when totalCount changes
  useEffect(() => {
    if (state.totalCount > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [state.totalCount]);

  return (
    <>
      <header 
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled ? 'bg-cream/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex-shrink-0 flex items-center">
            <img 
              src={LogoImage} 
              alt="THELOVESIDES" 
              className="h-10 md:h-12 object-contain scale-[1.5] origin-left" 
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.title} 
                href={link.href}
                className="text-sm font-medium tracking-wide text-charcoal hover:text-amber relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-amber hover:after:w-full after:transition-all after:duration-300"
              >
                {link.title}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              className="relative p-2 text-charcoal hover:text-amber transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-full"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
              {state.totalCount > 0 && (
                <Badge className={clsx(isBouncing && 'animate-bounce')}>
                  {state.totalCount}
                </Badge>
              )}
            </button>
            
            <div className="hidden lg:block">
              <Button variant="dark">
                Book Consultation
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 -mr-2 text-charcoal hover:text-amber transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-md"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>
      
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { navLinks } from '../../data/homeData';

export default function MobileMenu({ isOpen, onClose }) {
  // Prevent body scroll when menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-cream z-[70] shadow-2xl flex flex-col p-6 border-r border-charcoal/10"
          >
            <div className="flex justify-end mb-8">
              <button 
                onClick={onClose} 
                className="p-2 -mr-2 text-charcoal hover:text-rose transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose rounded-md"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-6 font-sans text-lg text-charcoal font-medium">
              {navLinks.map((link) => (
                <a 
                  key={link.title} 
                  href={link.href} 
                  className="hover:text-rose transition-colors w-fit tracking-wide uppercase text-sm"
                  onClick={onClose}
                >
                  {link.title}
                </a>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

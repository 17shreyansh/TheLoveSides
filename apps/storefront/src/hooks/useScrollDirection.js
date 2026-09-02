import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [scrollY, setScrollY] = useState(0);
  const [showRibbon, setShowRibbon] = useState(true);

  useEffect(() => {
    let ticking = false;

    const updateScrollDir = () => {
      const currentScrollY = window.pageYOffset;
      setScrollY(currentScrollY);

      if (currentScrollY === 0) {
        setShowRibbon(true);
      } else {
        setShowRibbon(false);
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Initial check
    updateScrollDir();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { scrollY, showRibbon };
}

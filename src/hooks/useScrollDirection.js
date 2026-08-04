import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [scrollY, setScrollY] = useState(0);
  const [hideNavbar, setHideNavbar] = useState(false);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const updateScrollDir = () => {
      const currentScrollY = window.pageYOffset;
      setScrollY(currentScrollY);

      // Only trigger if delta is > 10px to avoid jitter
      if (Math.abs(currentScrollY - lastScrollY) < 10) {
        ticking = false;
        return;
      }

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHideNavbar(true);
      } else if (currentScrollY < lastScrollY) {
        setHideNavbar(false);
      }

      lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
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

  return { hideNavbar, scrollY };
}

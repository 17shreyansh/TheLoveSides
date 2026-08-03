import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import clsx from 'clsx';

export default function AnimatedCounter({ target, suffix = '', className }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(target, 10);
      if (start === end) return;

      let totalDuration = 1500;
      let incrementTime = Math.max(16, Math.floor(totalDuration / end)); // minimum 16ms per frame
      let step = Math.max(1, Math.ceil(end / (totalDuration / 16)));

      const timer = setInterval(() => {
        start += step;
        if (start > end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [target, isInView]);

  return (
    <span ref={ref} className={clsx(className)}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

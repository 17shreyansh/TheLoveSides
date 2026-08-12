import React from 'react';
import clsx from 'clsx';

export default function SectionHeading({ title, subtitle, className }) {
  return (
    <div className={clsx('text-center mb-12', className)}>
      <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-3">
        {title}
      </h2>
      <div className="w-12 h-[2px] bg-pink-primary mx-auto mb-4"></div>
      {subtitle && (
        <p className="text-base md:text-lg text-charcoal/50 font-sans">
          {subtitle}
        </p>
      )}
    </div>
  );
}

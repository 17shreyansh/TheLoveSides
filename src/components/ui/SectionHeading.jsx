import React from 'react';
import clsx from 'clsx';

export default function SectionHeading({ title, subtitle, className }) {
  return (
    <div className={clsx('text-center mb-12', className)}>
      <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base md:text-lg text-gray-500 font-sans">
          {subtitle}
        </p>
      )}
    </div>
  );
}

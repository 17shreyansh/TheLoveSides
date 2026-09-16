import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import clsx from 'clsx';

export default function StarRating({ value = 0, className }) {
  const safeValue = Math.max(0, Math.min(5, Number(value) || 0));
  const fullStars = Math.floor(safeValue);
  const hasHalfStar = safeValue % 1 >= 0.5;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  return (
    <div className={clsx('flex items-center gap-0.5 text-gold', className)} aria-label={`${value} out of 5 stars`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="w-4 h-4 fill-current" />
      ))}
      {hasHalfStar && <StarHalf className="w-4 h-4 fill-current" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      ))}
    </div>
  );
}

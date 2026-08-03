import React from 'react';
import { Truck, Award, CheckCircle } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    { icon: Truck, text: 'Free Delivery' },
    { icon: Award, text: '5-Year Warranty' },
    { icon: CheckCircle, text: 'Expert Fitting' },
  ];

  return (
    <div className="flex gap-6 flex-wrap text-sm text-ivory/90 mt-8">
      {badges.map((badge, idx) => {
        const Icon = badge.icon;
        return (
          <div key={idx} className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-amber" />
            <span className="font-medium tracking-wide">{badge.text}</span>
          </div>
        );
      })}
    </div>
  );
}

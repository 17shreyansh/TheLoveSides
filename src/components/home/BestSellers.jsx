import React from 'react';
import SectionHeading from '../ui/SectionHeading';
import ProductCard from '../ui/ProductCard';
import RevealOnScroll from '../ui/RevealOnScroll';
import ResponsiveCardSlider from '../ui/ResponsiveCardSlider';
import { bestSellerProducts } from '../../data/homeData';

export default function BestSellers() {
  const renderProduct = (product, idx) => (
    <RevealOnScroll delay={idx * 0.1} className="h-full">
      <ProductCard product={product} />
    </RevealOnScroll>
  );

  return (
    <section className="py-16 md:py-24 bg-ivory/50" id="bestsellers">
      <div className="max-w-7xl mx-auto px-6 md:px-10 overflow-hidden md:overflow-visible">
        <RevealOnScroll>
          <SectionHeading 
            title="Best Sellers" 
            subtitle="Our most loved window treatments" 
          />
        </RevealOnScroll>

        <ResponsiveCardSlider items={bestSellerProducts} renderItem={renderProduct} desktopCols={4} />
      </div>
    </section>
  );
}

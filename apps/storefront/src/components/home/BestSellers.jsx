import React from 'react';
import SectionHeading from '../ui/SectionHeading';
import ProductCard from '../ui/ProductCard';
import RevealOnScroll from '../ui/RevealOnScroll';
import ResponsiveCardSlider from '../ui/ResponsiveCardSlider';
import { useProducts } from '../../hooks/useProducts';

export default function BestSellers() {
  const { products, loading } = useProducts({ limit: 8 });

  const renderProduct = (product, idx) => (
    <RevealOnScroll delay={idx * 0.1} className="h-full">
      <ProductCard product={product} />
    </RevealOnScroll>
  );

  return (
    <section className="py-10 md:py-16 bg-ivory/50" id="bestsellers">
      <div className="max-w-7xl mx-auto px-6 md:px-10 overflow-hidden md:overflow-visible">
        <RevealOnScroll>
          <SectionHeading 
            title="Best Sellers" 
            subtitle="Our most loved items" 
          />
        </RevealOnScroll>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-primary"></div>
          </div>
        ) : (
          <ResponsiveCardSlider items={products} renderItem={renderProduct} desktopCols={4} />
        )}
      </div>
    </section>
  );
}

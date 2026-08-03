import React from 'react';
import SectionHeading from '../ui/SectionHeading';
import RevealOnScroll from '../ui/RevealOnScroll';
import ProductCard from '../ui/ProductCard';
import { products } from '../../data/homeData';

export default function BestSellers() {
  return (
    <section className="py-16 md:py-24 bg-ivory/50">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <RevealOnScroll>
          <SectionHeading 
            title="Best Sellers" 
            subtitle="Our most loved window treatments" 
          />
        </RevealOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product, idx) => (
            <RevealOnScroll key={product.id} delay={idx * 0.1}>
              <ProductCard product={product} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

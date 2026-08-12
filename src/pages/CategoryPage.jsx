import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import RevealOnScroll from '../components/ui/RevealOnScroll';
import Button from '../components/ui/Button';
import { products } from '../data/homeData';

export default function CategoryPage({ type }) {
  const { categorySlug } = useParams();
  const [visibleCount, setVisibleCount] = useState(12);

  // Reset visible count when category changes
  useEffect(() => {
    setVisibleCount(12);
  }, [categorySlug, type]);

  // Filter products based on route type or categorySlug
  const filteredProducts = products.filter(product => {
    if (type === 'arrivals') return product.isNewArrival;
    if (type === 'bestsellers') return product.isBestSeller;
    return product.category === categorySlug;
  });

  // Generate readable title
  let pageTitle = 'Collection';
  if (type === 'arrivals') {
    pageTitle = 'New Arrivals';
  } else if (type === 'bestsellers') {
    pageTitle = 'Best Sellers';
  } else if (categorySlug) {
    pageTitle = categorySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleProducts.length < filteredProducts.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  return (
    <div className="bg-cream min-h-screen pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Header Section */}
        <div className="mb-10 md:mb-16">
          <div className="flex items-center gap-2 text-xs md:text-sm text-charcoal/60 mb-4 font-sans">
            <Link to="/" className="hover:text-pink-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-charcoal capitalize">{pageTitle}</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-3">{pageTitle}</h1>
        </div>

        {/* Sort & Filter Bar */}
        <div className="flex justify-between items-center py-4 border-y border-charcoal/10 mb-8 md:mb-12">
          <span className="text-xs md:text-sm text-charcoal font-medium font-sans">
            Showing {visibleProducts.length} of {filteredProducts.length} products
          </span>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-xs md:text-sm text-charcoal/60 hidden sm:block font-sans">Sort by:</label>
            <select 
              id="sort" 
              className="bg-transparent border border-charcoal/20 rounded px-2 py-1 text-xs md:text-sm text-charcoal focus:outline-none focus:border-pink-primary cursor-pointer font-sans"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid or Empty State */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {visibleProducts.map((product, idx) => (
                <RevealOnScroll key={product.id} delay={(idx % 12) * 0.05} className="h-full">
                  <ProductCard product={product} />
                </RevealOnScroll>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-12 md:mt-16">
                <Button variant="outline" onClick={handleLoadMore} className="px-8 py-3">
                  Load More
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-4">No products found</h2>
            <p className="text-charcoal/60 mb-8 max-w-md font-sans">
              We couldn't find any products in this collection right now. Check back later or explore our other categories.
            </p>
            <Link to="/">
              <Button variant="primary">Back to Home</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

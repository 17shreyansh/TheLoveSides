import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import RevealOnScroll from '../components/ui/RevealOnScroll';
import Button from '../components/ui/Button';
import { useProducts } from '../hooks/useProducts';
import { useCollections } from '../hooks/useCollections';
import { useRooms } from '../hooks/useRooms';
import clsx from 'clsx';

export default function ProductsPage() {
  const [visibleCount, setVisibleCount] = useState(12);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();
  
  const selectedCollection = searchParams.get('collection') || '';
  const selectedRoom = searchParams.get('room') || '';
  const [selectedSort, setSelectedSort] = useState('newest'); // 'newest', 'price_asc', 'price_desc'

  const updateParam = (key, value) => {
    setSearchParams(prev => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      return prev;
    });
  };

  const { collections, loading: collectionsLoading } = useCollections();
  const { rooms, loading: roomsLoading } = useRooms();

  const query = {};
  if (selectedCollection) query.collection = selectedCollection;
  if (selectedRoom) query.room = selectedRoom;
  if (selectedSort) query.sort = selectedSort;

  const { products, loading: productsLoading } = useProducts(query);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleProducts.length < products.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCollection, selectedRoom, selectedSort]);

  const FilterSidebarContent = () => (
    <div className="space-y-8 font-sans">
      {/* Collections Filter */}
      <div>
        <h3 className="text-sm font-semibold text-charcoal mb-4 uppercase tracking-wider">Collections</h3>
        {collectionsLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-4 bg-charcoal/10 rounded w-2/3"></div>)}
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => updateParam('collection', '')}
              className={clsx(
                "block text-sm transition-colors text-left",
                selectedCollection === '' ? "text-pink-primary font-medium" : "text-charcoal/70 hover:text-charcoal"
              )}
            >
              All Collections
            </button>
            {collections.map(collection => (
              <button
                key={collection._id}
                onClick={() => updateParam('collection', collection.slug)}
                className={clsx(
                  "block text-sm transition-colors text-left",
                  selectedCollection === collection.slug ? "text-pink-primary font-medium" : "text-charcoal/70 hover:text-charcoal"
                )}
              >
                {collection.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Rooms Filter */}
      <div>
        <h3 className="text-sm font-semibold text-charcoal mb-4 uppercase tracking-wider">Rooms</h3>
        {roomsLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-4 bg-charcoal/10 rounded w-2/3"></div>)}
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => updateParam('room', '')}
              className={clsx(
                "block text-sm transition-colors text-left",
                selectedRoom === '' ? "text-pink-primary font-medium" : "text-charcoal/70 hover:text-charcoal"
              )}
            >
              All Rooms
            </button>
            {rooms.map(room => (
              <button
                key={room._id}
                onClick={() => updateParam('room', room.slug)}
                className={clsx(
                  "block text-sm transition-colors text-left",
                  selectedRoom === room.slug ? "text-pink-primary font-medium" : "text-charcoal/70 hover:text-charcoal"
                )}
              >
                {room.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-cream min-h-screen pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-2 text-xs md:text-sm text-charcoal/60 mb-4 font-sans">
            <Link to="/" className="hover:text-pink-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-charcoal">Shop All</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-charcoal mb-3">Shop All Products</h1>
          <p className="text-charcoal/60 font-sans max-w-2xl text-sm md:text-base">
            Discover our curated collection of premium products, designed to elevate your space with timeless elegance.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-32">
              <FilterSidebarContent />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            
            {/* Sort & Mobile Filter Toggle Bar */}
            <div className="flex justify-between items-center py-4 border-y border-charcoal/10 mb-8">
              
              <button 
                onClick={() => setIsFilterDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm text-charcoal font-medium font-sans hover:text-pink-primary transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              <span className="hidden lg:inline-block text-sm text-charcoal font-medium font-sans">
                Showing {visibleProducts.length} of {products.length} products
              </span>

              <div className="flex items-center gap-3">
                <label htmlFor="sort" className="text-sm text-charcoal/60 hidden sm:block font-sans">Sort by:</label>
                <select 
                  id="sort" 
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="bg-transparent border border-charcoal/20 rounded px-3 py-1.5 text-sm text-charcoal focus:outline-none focus:border-pink-primary cursor-pointer font-sans"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Mobile Filter Drawer Overlay */}
            {isFilterDrawerOpen && (
              <div 
                className="fixed inset-0 bg-charcoal/50 z-[60] lg:hidden transition-opacity" 
                onClick={() => setIsFilterDrawerOpen(false)}
              />
            )}

            {/* Mobile Filter Drawer */}
            <div 
              className={clsx(
                "fixed inset-y-0 left-0 w-[280px] bg-cream z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto flex flex-col",
                isFilterDrawerOpen ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <div className="p-6 border-b border-charcoal/10 flex justify-between items-center sticky top-0 bg-cream z-10">
                <h2 className="font-serif text-xl text-charcoal">Filters</h2>
                <button onClick={() => setIsFilterDrawerOpen(false)} className="text-charcoal/60 hover:text-charcoal">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 flex-1">
                <FilterSidebarContent />
              </div>
              <div className="p-6 border-t border-charcoal/10 sticky bottom-0 bg-cream">
                <Button variant="primary" className="w-full" onClick={() => setIsFilterDrawerOpen(false)}>
                  Show {products.length} Products
                </Button>
              </div>
            </div>

            {/* Product Grid or Empty State */}
            {productsLoading ? (
              <div className="flex justify-center items-center py-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-primary"></div>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {visibleProducts.map((product, idx) => (
                    <RevealOnScroll key={product.id} delay={(idx % 12) * 0.05} className="h-full">
                      <ProductCard product={product} layout="vertical" />
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
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-charcoal/20 rounded-lg bg-white/30">
                <h2 className="font-serif text-2xl text-charcoal mb-3">No products found</h2>
                <p className="text-charcoal/60 mb-6 max-w-sm font-sans text-sm">
                  We couldn't find any products matching your selected filters. Try clearing some filters.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    updateParam('collection', '');
                    updateParam('room', '');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

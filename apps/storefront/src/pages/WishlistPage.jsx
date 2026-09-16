import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';

export default function WishlistPage() {
  const { state, fetchWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-[60vh] flex flex-col items-center justify-center bg-cream">
        <Heart className="w-16 h-16 text-gray-300 mb-6" />
        <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-4 text-center">Your Wishlist</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md font-sans">
          Please log in to view and manage your wishlisted items.
        </p>
        <Button onClick={() => navigate('/profile')} variant="dark" className="px-8 py-3">
          Log In
        </Button>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-[60vh] flex flex-col items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-primary mb-4"></div>
        <p className="text-gray-500 font-sans">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-36 pb-32 md:pb-20 bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-2">My Wishlist</h1>
            <p className="text-gray-500 font-sans text-sm">
              {state.items.length} {state.items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-sans font-medium text-charcoal hover:text-pink-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        {state.items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-charcoal/5 shadow-sm">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-serif text-charcoal mb-3">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto font-sans">
              Found something you love? Tap the heart icon on any product to save it here for later.
            </p>
            <Button onClick={() => navigate('/products')} variant="dark" className="px-8 py-3">
              Explore Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10">
            {state.items.map((item) => {
              // The backend populates productId, so item.productId is the product object
              const product = item.productId;
              if (!product) return null;
              
              return (
                <div key={item._id} className="relative">
                  <ProductCard product={product} layout="vertical" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

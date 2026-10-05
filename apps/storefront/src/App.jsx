import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { FlyToCartProvider } from './context/FlyToCartContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import WhatsAppButton from './components/layout/WhatsAppButton';
import InitialLoader from './components/layout/InitialLoader';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SubCategoryPage = lazy(() => import('./pages/SubCategoryPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage.jsx'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CmsPage = lazy(() => import('./pages/CmsPage'));
const TrackPage = lazy(() => import('./pages/TrackPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

// A simple loading fallback
const PageLoader = () => (
  <div className="flex justify-center items-center h-[60vh]">
    <div className="w-12 h-12 relative">
      <div className="absolute inset-0 rounded-full border-2 border-gray-100 dark:border-gray-800"></div>
      <div className="absolute inset-0 rounded-full border-2 border-gold border-t-transparent animate-spin"></div>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
          <FlyToCartProvider>
          <InitialLoader>
          <BrowserRouter>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
              <Navbar />
            <main className="flex-grow">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/product/:slug" element={<ProductPage />} />
                  <Route path="/category/:categorySlug" element={<CategoryPage />} />
                  <Route path="/subcategory/:subCategorySlug" element={<SubCategoryPage />} />
                  <Route path="/arrivals" element={<CategoryPage type="arrivals" />} />
                  <Route path="/best-sellers" element={<CategoryPage type="bestsellers" />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />
                  <Route path="/order/:id" element={<OrderDetailsPage />} />
                  <Route path="/track" element={<TrackPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/pages/:slug" element={<CmsPage />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <WhatsAppButton />
          </div>
        </BrowserRouter>
        </InitialLoader>
        </FlyToCartProvider>
        </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
export default App;

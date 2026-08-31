import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { FlyToCartProvider } from './context/FlyToCartContext';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import CategoryPage from './pages/CategoryPage';
import PolicyPage from './pages/PolicyPage';
import { exchangeRefundPolicy, privacyPolicy, shippingPolicy } from './data/policies';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

function App() {
  return (
    <CartProvider>
      <FlyToCartProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/category/:categorySlug" element={<CategoryPage />} />
                <Route path="/arrivals" element={<CategoryPage type="arrivals" />} />
                <Route path="/best-sellers" element={<CategoryPage type="bestsellers" />} />
                <Route path="/policies/exchange-refund" element={<PolicyPage policyData={exchangeRefundPolicy} />} />
                <Route path="/policies/privacy" element={<PolicyPage policyData={privacyPolicy} />} />
                <Route path="/policies/shipping" element={<PolicyPage policyData={shippingPolicy} />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </FlyToCartProvider>
    </CartProvider>
  );
}
export default App;

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import ProductsList from './pages/catalog/ProductsList';
import ProductForm from './pages/catalog/ProductForm';
import OrdersList from './pages/orders/OrdersList';
import OrderDetails from './pages/orders/OrderDetails';
import ReturnsList from './pages/orders/ReturnsList';
import ReturnDetails from './pages/orders/ReturnDetails';
import CustomersList from './pages/customers/CustomersList';
import CustomerDetails from './pages/customers/CustomerDetails';
import CouponsList from './pages/marketing/CouponsList';
import CouponForm from './pages/marketing/CouponForm';
import MediaList from './pages/content/MediaList';
import CmsPagesList from './pages/content/CmsPagesList';
import CmsPageForm from './pages/content/CmsPageForm';
import InventoryList from './pages/inventory/InventoryList';
import GeneralSettings from './pages/settings/GeneralSettings';
import TaxesSettings from './pages/settings/TaxesSettings';
import ShippingSettings from './pages/settings/ShippingSettings';
import UsersList from './pages/settings/UsersList';
import AuditLogsList from './pages/settings/AuditLogsList';
import CollectionsList from './pages/catalog/CollectionsList';
import CollectionForm from './pages/catalog/CollectionForm';
import RoomsList from './pages/catalog/RoomsList';
import RoomForm from './pages/catalog/RoomForm';
import ReviewsList from './pages/catalog/ReviewsList';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            
            {/* Catalog */}
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id" element={<ProductForm />} />
            <Route path="/rooms" element={<RoomsList />} />
            <Route path="/rooms/new" element={<RoomForm />} />
            <Route path="/rooms/:id" element={<RoomForm />} />
            <Route path="/collections" element={<CollectionsList />} />
            <Route path="/collections/new" element={<CollectionForm />} />
            <Route path="/collections/:id" element={<CollectionForm />} />
            <Route path="/reviews" element={<ReviewsList />} />
            
            {/* Inventory */}
            <Route path="/inventory" element={<InventoryList />} />

            {/* Sales & Customers */}
            <Route path="/orders" element={<OrdersList />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/returns" element={<ReturnsList />} />
            <Route path="/returns/:id" element={<ReturnDetails />} />
            <Route path="/customers" element={<CustomersList />} />
            <Route path="/customers/:id" element={<CustomerDetails />} />
            
            {/* Marketing */}
            <Route path="/coupons" element={<CouponsList />} />
            <Route path="/coupons/new" element={<CouponForm />} />
            <Route path="/coupons/:id" element={<CouponForm />} />
            
            {/* Content & Media */}
            <Route path="/media" element={<MediaList />} />
            <Route path="/cms" element={<CmsPagesList />} />
            <Route path="/cms/new" element={<CmsPageForm />} />
            <Route path="/cms/:id" element={<CmsPageForm />} />
            
            {/* Settings */}
            <Route path="/settings" element={<GeneralSettings />} />
            <Route path="/settings/taxes" element={<TaxesSettings />} />
            <Route path="/settings/shipping" element={<ShippingSettings />} />
            <Route path="/settings/users" element={<UsersList />} />
            <Route path="/settings/audit-logs" element={<AuditLogsList />} />
            
            <Route path="*" element={<div className="p-8 text-center text-charcoal/50">Page Not Found</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

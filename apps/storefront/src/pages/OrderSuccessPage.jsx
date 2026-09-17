import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Truck, MapPin } from 'lucide-react';
import Button from '../components/ui/Button';

export default function OrderSuccessPage() {
  const location = useLocation();
  const { orderId, orderNumber, amount, items, shippingAddress } = location.state || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-cream min-h-screen pt-32 md:pt-40 pb-24 font-sans text-charcoal">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex justify-center items-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Thank you for your order!</h1>
          <p className="text-lg text-charcoal/70">
            We've received your order and are getting it ready to ship.
            <br className="hidden md:block" /> You will receive an email confirmation shortly.
          </p>
        </div>

        {orderId ? (
          <div className="bg-white rounded-3xl shadow-sm border border-pink-soft/20 overflow-hidden">
            
            {/* Order Meta */}
            <div className="bg-ivory border-b border-pink-soft/20 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-charcoal/60 uppercase tracking-wider mb-1">Order Number</p>
                <p className="font-serif text-2xl">{orderNumber || orderId.slice(-8).toUpperCase()}</p>
              </div>
              <div className="md:text-right">
                <p className="text-sm font-medium text-charcoal/60 uppercase tracking-wider mb-1">Total Amount</p>
                <p className="font-serif text-2xl text-pink-primary">₹{(amount / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* Order Items */}
              <div>
                <h3 className="font-serif text-xl mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-pink-primary" /> Order Details
                </h3>
                <div className="space-y-6">
                  {items?.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-ivory border border-pink-soft/20 shrink-0">
                        <img 
                          src={item.image || 'https://via.placeholder.com/150'} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-charcoal mb-1 line-clamp-1">{item.name}</h4>
                        <p className="text-sm text-charcoal/60 mb-2">
                          Qty: {item.quantity} 
                          {item.attributes?.map(attr => {
                            const isColor = attr.name.toLowerCase().includes('color');
                            const displayVal = isColor ? attr.value.replace(/\s*\([^)]+\)\s*/g, '') : attr.value;
                            return ` | ${attr.name}: ${displayVal}`;
                          })}
                        </p>
                        <p className="font-medium">₹{Number(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Info */}
              <div className="space-y-8">
                <div>
                  <h3 className="font-serif text-xl mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-pink-primary" /> Shipping Address
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-5 text-charcoal/80 leading-relaxed text-sm">
                    <p className="font-medium text-charcoal text-base mb-1">
                      {shippingAddress?.firstName} {shippingAddress?.lastName}
                    </p>
                    <p>{shippingAddress?.addressLine1}</p>
                    {shippingAddress?.addressLine2 && <p>{shippingAddress?.addressLine2}</p>}
                    <p>{shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postalCode}</p>
                    <p>{shippingAddress?.country}</p>
                    <p className="mt-2 text-charcoal/60">Phone: {shippingAddress?.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-xl mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-pink-primary" /> What's Next?
                  </h3>
                  <p className="text-sm text-charcoal/70 bg-pink-50 p-5 rounded-2xl border border-pink-100">
                    We are currently processing your order. You will receive an email with tracking information as soon as your items ship. Standard delivery usually takes 3-5 business days.
                  </p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-pink-soft/20 p-8 text-center max-w-2xl mx-auto">
             <p className="text-charcoal/70 mb-6">
                Your order was successful. Please check your email for the order confirmation and tracking details.
             </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link to="/">
            <Button variant="dark" className="px-10 py-4 shadow-lg hover:shadow-xl transition-all">
              Continue Shopping
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

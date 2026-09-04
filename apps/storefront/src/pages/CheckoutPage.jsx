import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';

export default function CheckoutPage() {
  const { state, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
    phone: '',
  });

  useEffect(() => {
    // If cart is empty, go back to home
    if (!state.loading && state.items.length === 0) {
      navigate('/');
    }
  }, [state.items, state.loading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create order on backend (which creates Razorpay order)
      const shippingAddress = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
      };

      const { data } = await api.post('/checkout/initiate', {
        email: formData.email,
        shippingAddress,
        billingAddress: shippingAddress,
      }, { withCredentials: true });

      const { orderId } = data.data;

      // 2. Initialize Razorpay Order
      const { data: paymentData } = await api.post(`/payment/${orderId}/initiate`, {}, { withCredentials: true });
      const razorpayOrder = paymentData.data;

      // Ensure Razorpay script is loaded
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock', // Fallback for testing
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'TheLoveSides',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          // 4. Verify Payment on Backend
          try {
            await api.post(`/payment/${orderId}/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }, { withCredentials: true });
            
            // Payment successful, clear cart and redirect
            fetchCart(); // This will clear the cart from state (since backend clears it)
            navigate('/order-success');
          } catch (err) {
            console.error('Payment verification failed', err);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#36454F' // Charcoal color
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed', response.error);
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (error) {
      console.error('Checkout failed:', error);
      alert(error.response?.data?.message || 'Failed to initiate checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (state.loading) {
    return (
      <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Form */}
          <div className="w-full lg:w-3/5">
            <form onSubmit={handleCheckout} className="space-y-8">
              {/* Contact Info */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-charcoal/5 shadow-sm">
                <h2 className="font-serif text-xl text-charcoal mb-4">Contact Information</h2>
                <div>
                  <label className="block text-sm font-sans text-charcoal/80 mb-1" htmlFor="email">Email</label>
                  <input 
                    type="email" id="email" name="email" required
                    value={formData.email} onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:outline-none focus:border-pink-primary font-sans text-charcoal"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-sans text-charcoal/80 mb-1" htmlFor="phone">Phone (for shipping updates)</label>
                  <input 
                    type="tel" id="phone" name="phone" required
                    value={formData.phone} onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:outline-none focus:border-pink-primary font-sans text-charcoal"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-charcoal/5 shadow-sm">
                <h2 className="font-serif text-xl text-charcoal mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-sans text-charcoal/80 mb-1" htmlFor="firstName">First Name</label>
                    <input 
                      type="text" id="firstName" name="firstName" required
                      value={formData.firstName} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:outline-none focus:border-pink-primary font-sans text-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans text-charcoal/80 mb-1" htmlFor="lastName">Last Name</label>
                    <input 
                      type="text" id="lastName" name="lastName" required
                      value={formData.lastName} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:outline-none focus:border-pink-primary font-sans text-charcoal"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-sans text-charcoal/80 mb-1" htmlFor="addressLine1">Address Line 1</label>
                    <input 
                      type="text" id="addressLine1" name="addressLine1" required
                      value={formData.addressLine1} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:outline-none focus:border-pink-primary font-sans text-charcoal"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-sans text-charcoal/80 mb-1" htmlFor="addressLine2">Apartment, suite, etc. (optional)</label>
                    <input 
                      type="text" id="addressLine2" name="addressLine2"
                      value={formData.addressLine2} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:outline-none focus:border-pink-primary font-sans text-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans text-charcoal/80 mb-1" htmlFor="city">City</label>
                    <input 
                      type="text" id="city" name="city" required
                      value={formData.city} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:outline-none focus:border-pink-primary font-sans text-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans text-charcoal/80 mb-1" htmlFor="state">State</label>
                    <input 
                      type="text" id="state" name="state" required
                      value={formData.state} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:outline-none focus:border-pink-primary font-sans text-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans text-charcoal/80 mb-1" htmlFor="postalCode">PIN Code</label>
                    <input 
                      type="text" id="postalCode" name="postalCode" required
                      value={formData.postalCode} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:outline-none focus:border-pink-primary font-sans text-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans text-charcoal/80 mb-1" htmlFor="country">Country</label>
                    <select 
                      id="country" name="country" disabled
                      value={formData.country} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:outline-none focus:border-pink-primary font-sans text-charcoal bg-gray-50"
                    >
                      <option value="IN">India</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button type="submit" variant="dark" className="w-full py-4 text-lg shadow-lg" disabled={loading}>
                {loading ? 'Processing...' : 'Pay Now'}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-2/5">
            <div className="bg-ivory p-6 md:p-8 rounded-2xl border border-charcoal/10 sticky top-32">
              <h2 className="font-serif text-xl text-charcoal mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {state.items.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-white border border-charcoal/10">
                      <img src={item.variant?.images?.[0] || 'https://via.placeholder.com/150'} alt={item.product?.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-charcoal text-sm">{item.product?.name}</h3>
                      <p className="font-sans text-xs text-charcoal/60 mt-1">
                        {item.variant?.attributes?.map(attr => {
                           const isColor = attr.name.toLowerCase().includes('color');
                           const displayVal = isColor ? attr.value.replace(/\s*\(#[^\)]+\)\s*/g, '') : attr.value;
                           return `${attr.name}: ${displayVal}`;
                        }).join(' | ')}
                      </p>
                      <p className="font-sans text-xs text-charcoal/60">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-sans font-medium text-charcoal text-sm">
                      ₹{Number(item.price * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-charcoal/10 pt-4 space-y-3 font-sans text-sm">
                <div className="flex justify-between text-charcoal/80">
                  <span>Subtotal</span>
                  <span>₹{Number(state.subtotal).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-charcoal/80">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-charcoal/80">
                  <span>Taxes (included)</span>
                  <span>₹0</span>
                </div>
              </div>

              <div className="border-t border-charcoal/10 mt-4 pt-4 flex justify-between font-serif text-xl text-charcoal">
                <span>Total</span>
                <span>₹{Number(state.subtotal).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

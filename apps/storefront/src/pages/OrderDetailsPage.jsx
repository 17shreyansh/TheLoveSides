import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Package, ArrowLeft, Truck, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import Button from '../components/ui/Button';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-cream min-h-screen pt-32 pb-24 flex items-center justify-center">
        <div className="flex items-center gap-3 text-charcoal/60">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-primary"></div>
          Loading order details...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-cream min-h-screen pt-32 pb-24 flex flex-col items-center justify-center px-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-serif text-charcoal mb-2">Order Not Found</h2>
        <p className="text-charcoal/70 font-sans mb-8">{error}</p>
        <Button onClick={() => navigate('/profile')}>Back to Profile</Button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
      case 'DELIVERED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const isShipped = order.shipments && order.shipments.length > 0;

  return (
    <div className="bg-cream min-h-screen pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-charcoal/60 hover:text-pink-primary transition-colors mb-6 font-sans text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">Order Details</h1>
            <p className="text-charcoal/60 font-sans">
              Order <span className="font-mono text-charcoal font-medium">#{order.orderNumber}</span> • Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - Items */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-charcoal/5 shadow-sm">
              <h2 className="font-serif text-xl text-charcoal mb-6 border-b border-charcoal/5 pb-4">Items in your order</h2>
              <div className="space-y-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl border border-charcoal/5 shrink-0" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded-xl border border-charcoal/5 shrink-0">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.productId}`} className="font-serif text-lg text-charcoal hover:text-pink-primary truncate block">
                        {item.name}
                      </Link>
                      <p className="text-sm text-charcoal/60 mt-1 font-sans">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-charcoal font-sans">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking / Shipments */}
            {isShipped && (
              <div className="bg-white p-6 rounded-2xl border border-charcoal/5 shadow-sm">
                <h2 className="font-serif text-xl text-charcoal mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-pink-primary" />
                  Shipment Information
                </h2>
                <div className="space-y-4">
                  {order.shipments.map((shipment, index) => (
                    <div key={index} className="bg-cream/50 p-4 rounded-xl border border-charcoal/5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-charcoal">AWB: <span className="font-mono">{shipment.awbCode || 'Pending'}</span></p>
                        <p className="text-xs text-charcoal/60 mt-1">Courier: {shipment.courierName || 'Shiprocket'}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate('/track')} className="text-xs">
                        Track Package
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Summary & Info */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-charcoal/5 shadow-sm">
              <h2 className="font-serif text-xl text-charcoal mb-4 border-b border-charcoal/5 pb-4">Order Summary</h2>
              <div className="space-y-3 font-sans text-sm">
                <div className="flex justify-between text-charcoal/70">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal?.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discountAmount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-charcoal/70">
                  <span>Shipping</span>
                  <span>{order.shippingAmount > 0 ? `₹${order.shippingAmount.toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="flex justify-between text-charcoal/70">
                  <span>Tax</span>
                  <span>₹{order.taxAmount?.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-charcoal/5 flex justify-between font-medium text-lg text-charcoal">
                  <span>Total</span>
                  <span>₹{order.grandTotal?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-charcoal/5 shadow-sm">
              <h2 className="font-serif text-xl text-charcoal mb-4 border-b border-charcoal/5 pb-4">Shipping Address</h2>
              <div className="font-sans text-sm text-charcoal/80 space-y-1">
                <p className="font-medium text-charcoal">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                <p>{order.shippingAddress.country}</p>
                <p className="mt-2 text-charcoal/60">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Package, ArrowLeft, Truck, Clock, CheckCircle, AlertCircle, FileText, RotateCcw } from 'lucide-react';
import Button from '../components/ui/Button';
import ReviewForm from '../components/product/ReviewForm';
import ReturnRequestModal from '../components/orders/ReturnRequestModal';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewedItems, setReviewedItems] = useState({});
  const [returningItem, setReturningItem] = useState(null);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const [orderRes, settingsRes] = await Promise.all([
          api.get(`/orders/${id}`),
          api.get('/settings')
        ]);
        setOrder(orderRes.data);
        
        const settingsMap = (settingsRes.data || []).reduce((acc, curr) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});
        setSettings(settingsMap);
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
      <div className="bg-cream min-h-screen pt-32 md:pt-40 pb-24 flex items-center justify-center">
        <div className="flex items-center gap-3 text-charcoal/60">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-primary"></div>
          Loading order details...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-cream min-h-screen pt-32 md:pt-40 pb-24 flex flex-col items-center justify-center px-6">
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

  // Calculate return/replacement eligibility
  const isEligibleForReturn = (item) => {
    if (order.status !== 'DELIVERED' || !order.deliveredAt) return false;
    
    // Simplification: we use the max of return/replacement policy days to show the button
    const returnDays = Number(settings.returnPolicyDays) || 7;
    const replacementDays = Number(settings.replacementPolicyDays) || 7;
    const maxDays = Math.max(returnDays, replacementDays);
    
    const daysSinceDelivery = (Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceDelivery <= maxDays;
  };

  return (
    <div className="bg-cream min-h-screen pt-32 md:pt-40 pb-16 md:pb-24">
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
            
            {/* Order Timeline */}
            <div className="bg-white p-6 rounded-2xl border border-charcoal/5 shadow-sm">
              <h2 className="font-serif text-xl text-charcoal mb-6 border-b border-charcoal/5 pb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-pink-primary" /> Order History
              </h2>
              <div className="space-y-6 pl-2">
                {order.timeline?.map((event, index) => (
                  <div key={index} className="relative pl-6 pb-2 border-l-2 border-pink-soft/50 last:border-0 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-pink-primary"></div>
                    <div className="-mt-1">
                      <p className="font-medium text-charcoal text-sm">{event.status.replace(/_/g, ' ')}</p>
                      <p className="text-charcoal/60 text-xs mt-1">{event.message}</p>
                      <p className="text-charcoal/40 text-xs mt-1">{new Date(event.timestamp).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-charcoal/5 shadow-sm">
              <h2 className="font-serif text-xl text-charcoal mb-6 border-b border-charcoal/5 pb-4">Items in your order</h2>
              <div className="space-y-6">
                {order.items.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-0 pb-6 mb-6 last:pb-0 last:mb-0">
                    <div className="flex gap-4">
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
                  {/* Actions Section */}
                  {['DELIVERED', 'SHIPPED', 'PAID'].includes(order.status) && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                      {/* Review */}
                      <div className="flex-1">
                        {reviewedItems[item.productId] ? (
                          <div className="flex items-center text-green-600 gap-2 bg-green-50 px-4 py-2 rounded-lg text-sm font-medium w-max">
                            <CheckCircle className="w-4 h-4" /> Thanks for your review!
                          </div>
                        ) : reviewingItem === item.productId ? (
                          <div className="bg-gray-50 p-6 rounded-2xl w-full">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-serif font-semibold">Write your review</h3>
                              <button onClick={() => setReviewingItem(null)} className="text-gray-500 hover:text-charcoal text-sm font-medium">Cancel</button>
                            </div>
                            <ReviewForm 
                              productId={item.productId} 
                              onSubmitSuccess={() => {
                                setReviewedItems(prev => ({ ...prev, [item.productId]: true }));
                                setReviewingItem(null);
                              }} 
                            />
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setReviewingItem(item.productId)}>
                            Write a Review
                          </Button>
                        )}
                      </div>

                      {/* Return / Replace */}
                      {isEligibleForReturn(item) && (
                        <div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setReturningItem(item)}
                            className="text-brand border-brand/20 hover:bg-brand/5"
                          >
                            <RotateCcw className="w-4 h-4 mr-1.5" />
                            Return / Replace
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                ))}
              </div>
            </div>

            <ReturnRequestModal
              isOpen={!!returningItem}
              onClose={() => setReturningItem(null)}
              orderId={order._id}
              item={returningItem}
              onSuccess={() => {
                alert('Return/Replacement request submitted successfully. We will review it shortly.');
                setReturningItem(null);
                // Optionally reload order to update status
              }}
            />

            {/* Tracking / Shipments */}
            {isShipped && (
              <div className="bg-white p-6 rounded-2xl border border-charcoal/5 shadow-sm">
                <h2 className="font-serif text-xl text-charcoal mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-pink-primary" />
                  Shipment Information
                </h2>
                <div className="space-y-6">
                  {order.shipments.map((shipment, index) => (
                    <div key={index} className="bg-cream/50 p-4 rounded-xl border border-charcoal/5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium text-charcoal">AWB: <span className="font-mono">{shipment.awbCode || 'Pending'}</span></p>
                          <p className="text-xs text-charcoal/60 mt-1">Courier: {shipment.courierName || 'Shiprocket'}</p>
                          <p className="text-xs text-charcoal/60 mt-1">Status: {shipment.status.replace(/_/g, ' ')}</p>
                        </div>
                        {shipment.trackingUrl ? (
                          <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="text-xs">
                              Track Package
                            </Button>
                          </a>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => navigate(`/track?awb=${shipment.awbCode || ''}`)} className="text-xs">
                            Track Package
                          </Button>
                        )}
                      </div>
                      
                      {/* Shipment Tracking History */}
                      {shipment.trackingHistory && shipment.trackingHistory.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-charcoal/10">
                          <h4 className="text-sm font-medium text-charcoal mb-3">Delivery History</h4>
                          <div className="space-y-4 pl-2">
                            {shipment.trackingHistory.map((history, idx) => (
                              <div key={idx} className="relative pl-6 pb-2 border-l border-charcoal/20 last:border-0 last:pb-0">
                                <div className="absolute -left-[5px] top-0.5 w-2.5 h-2.5 rounded-full bg-charcoal/20"></div>
                                <div className="-mt-1">
                                  <p className="font-medium text-charcoal text-xs">{history.status}</p>
                                  {history.description && <p className="text-charcoal/60 text-xs mt-0.5">{history.description}</p>}
                                  {history.location && <p className="text-charcoal/60 text-xs mt-0.5">{history.location}</p>}
                                  <p className="text-charcoal/40 text-[10px] mt-0.5">{new Date(history.timestamp).toLocaleString('en-IN')}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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

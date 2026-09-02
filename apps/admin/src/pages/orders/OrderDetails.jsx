import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/admin/orders/${id}`);
      setOrder(data.data);
    } catch (error) {
      alert('Failed to load order');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!window.confirm(`Update order status to ${newStatus}?`)) return;
    
    setUpdating(true);
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
      fetchOrder(); // Reload to get updated timeline
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="animate-pulse">Loading order details...</div>;
  if (!order) return null;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-charcoal">Order #{order.orderNumber}</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-charcoal/60">Status:</span>
          <select 
            value={order.status}
            onChange={handleStatusChange}
            disabled={updating}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-pink-primary"
          >
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY_TO_SHIP">Ready to Ship</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Items & Timeline */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-charcoal/5">
            <h2 className="text-lg font-serif font-bold text-charcoal mb-4">Items</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-4 border-b border-charcoal/5 last:border-0 last:pb-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-ivory">
                    <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-charcoal text-sm">{item.name}</h3>
                    <p className="text-xs text-charcoal/50 mt-1">SKU: {item.sku}</p>
                    <p className="text-xs text-charcoal/50">
                      {item.attributes?.map(a => `${a.name}: ${a.value}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-charcoal">₹{item.price}</p>
                    <p className="text-xs text-charcoal/60">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-charcoal/5">
            <h2 className="text-lg font-serif font-bold text-charcoal mb-4">Timeline</h2>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-charcoal/10 before:to-transparent">
              {order.timeline.map((event, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-pink-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow" />
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-charcoal/5 bg-ivory/50">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-charcoal text-sm">{event.status}</div>
                      <time className="text-xs text-charcoal/50 font-sans">{new Date(event.timestamp).toLocaleString()}</time>
                    </div>
                    <div className="text-sm text-charcoal/70">{event.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Customer & Financials */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-charcoal/5">
            <h2 className="text-lg font-serif font-bold text-charcoal mb-4">Customer Details</h2>
            <div className="space-y-2 text-sm text-charcoal/80">
              <p><span className="font-medium text-charcoal">Name:</span> {order.shippingAddress?.fullName}</p>
              <p><span className="font-medium text-charcoal">Phone:</span> {order.shippingAddress?.phone}</p>
              
              <div className="pt-2 mt-2 border-t border-charcoal/5">
                <p className="font-medium text-charcoal mb-1">Shipping Address:</p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress?.addressLine2}</p>}
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p>{order.shippingAddress?.pincode}, {order.shippingAddress?.country}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-charcoal/5">
            <h2 className="text-lg font-serif font-bold text-charcoal mb-4">Summary</h2>
            <div className="space-y-2 text-sm text-charcoal/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{order.shippingAmount}</span>
              </div>
              <div className="flex justify-between font-bold text-charcoal pt-2 mt-2 border-t border-charcoal/5">
                <span>Grand Total</span>
                <span>₹{order.grandTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Eye } from 'lucide-react';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/admin/orders');
      setOrders(data.data || []);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-charcoal">Orders</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ivory text-sm text-charcoal/60 border-b border-charcoal/10">
                <th className="p-4 font-medium">Order #</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-charcoal/5 hover:bg-ivory/50">
                  <td className="p-4 text-sm font-medium text-charcoal">{order.orderNumber}</td>
                  <td className="p-4 text-sm text-charcoal/70">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-charcoal/70">{order.shippingAddress?.fullName}</td>
                  <td className="p-4 text-sm font-medium text-charcoal">₹{order.grandTotal}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${{
                        PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
                        PAYMENT_FAILED: 'bg-red-100 text-red-800',
                        PAID: 'bg-blue-100 text-blue-800',
                        PROCESSING: 'bg-indigo-100 text-indigo-800',
                        READY_TO_SHIP: 'bg-purple-100 text-purple-800',
                        SHIPPED: 'bg-cyan-100 text-cyan-800',
                        OUT_FOR_DELIVERY: 'bg-teal-100 text-teal-800',
                        DELIVERED: 'bg-green-100 text-green-800',
                        CANCELLED: 'bg-red-100 text-red-800',
                        RETURN_REQUESTED: 'bg-amber-100 text-amber-800',
                        RETURNED: 'bg-orange-100 text-orange-800',
                        REFUNDED: 'bg-lime-100 text-lime-800',
                        RTO: 'bg-rose-100 text-rose-800',
                      }[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link 
                      to={`/orders/${order._id}`}
                      className="inline-flex p-2 text-charcoal/60 hover:text-pink-primary transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-charcoal/50 text-sm">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

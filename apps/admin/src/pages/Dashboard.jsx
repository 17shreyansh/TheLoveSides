import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ShoppingBag, DollarSign, Package, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeProducts: 0,
    lowStock: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/orders?limit=5'),
          api.get('/admin/catalog/products?limit=1000') // Get more products to check stock
        ]);

        const dashboardData = statsRes.data.data;
        const orders = ordersRes.data.data.orders || [];
        const products = productsRes.data.data.products || [];
        
        // Calculate low stock from products
        const lowStockCount = products.filter(p => p.stock <= 5 && p.trackInventory).length;
        const activeProducts = products.filter(p => p.isActive).length;
        
        setStats({
          totalSales: dashboardData.revenue || 0,
          totalOrders: dashboardData.totalOrders || 0,
          activeProducts: activeProducts,
          lowStock: lowStockCount,
          recentOrders: orders
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Revenue', value: `₹${stats.totalSales.toLocaleString()}`, icon: DollarSign, color: 'text-gray-900', bg: 'bg-white', border: 'border-gray-200' },
    { name: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-gray-900', bg: 'bg-white', border: 'border-gray-200' },
    { name: 'Active Products', value: stats.activeProducts, icon: Package, color: 'text-gray-900', bg: 'bg-white', border: 'border-gray-200' },
    { name: 'Low Stock Alerts', value: stats.lowStock, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-white', border: 'border-red-200' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-28 animate-pulse">
               <div className="h-full flex items-center gap-4">
                 <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                 <div className="space-y-3 flex-1">
                   <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                   <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className={`bg-white p-6 rounded-lg shadow-sm border ${stat.border} flex items-center gap-4`}>
            <div className={`p-3 rounded-lg bg-gray-50 border border-gray-100`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
          <button className="text-sm font-medium text-brand-accent hover:text-blue-700 transition-colors">View All &rarr;</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-3">Order #</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {stats.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-accent hover:underline cursor-pointer">{order.orderNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.shippingAddress?.fullName || 'Guest User'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${order.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 
                        order.status === 'PENDING_PAYMENT' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                        'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">₹{order.grandTotal.toLocaleString()}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                    No recent orders found.
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

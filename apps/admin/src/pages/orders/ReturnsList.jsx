import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Eye, RotateCcw } from 'lucide-react';

export default function ReturnsList() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const { data } = await api.get('/admin/returns');
      setReturns(data.data?.data || data.data || []);
    } catch (error) {
      console.error('Failed to fetch returns', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse">Loading returns...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-charcoal">Returns & RMAs</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ivory text-sm text-charcoal/60 border-b border-charcoal/10">
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Reason</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((ret) => (
                <tr key={ret._id} className="border-b border-charcoal/5 hover:bg-ivory/50">
                  <td className="p-4">
                    <p className="text-sm font-bold text-brand hover:underline">
                      <Link to={`/orders/${ret.orderId?._id}`}>{ret.orderId?.orderNumber || 'Order'}</Link>
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-charcoal">{ret.userId?.firstName} {ret.userId?.lastName}</p>
                    <p className="text-xs text-charcoal/50">{ret.userId?.email}</p>
                  </td>
                  <td className="p-4 text-sm text-charcoal/70">
                    <span className="capitalize">{ret.reason?.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="p-4 text-sm text-charcoal/70">
                    {new Date(ret.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${ret.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        ret.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        ret.status === 'REFUNDED' ? 'bg-green-100 text-green-800' :
                        ret.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/returns/${ret._id}`}
                        className="p-2 text-charcoal/60 hover:text-brand transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {returns.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-charcoal/50 text-sm">
                    No returns found.
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

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ArrowLeft, Check, X, DollarSign } from 'lucide-react';

export default function ReturnDetails() {
  const { id } = useParams();
  const [returnReq, setReturnReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchReturn();
  }, [id]);

  const fetchReturn = async () => {
    try {
      const { data } = await api.get(`/admin/returns/${id}`);
      setReturnReq(data.data);
      setAdminNotes(data.data.adminNotes || '');
    } catch (error) {
      console.error('Failed to fetch return', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!window.confirm(`Are you sure you want to change status to ${status}?`)) return;
    setUpdating(true);
    try {
      await api.patch(`/admin/returns/${id}/status`, { status, adminNotes });
      fetchReturn(); // Refresh
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="animate-pulse p-6">Loading return details...</div>;
  if (!returnReq) return <div className="p-6 text-red-500">Return not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/returns" className="p-2 text-charcoal/60 hover:text-charcoal bg-white rounded-lg shadow-sm border border-charcoal/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-serif font-bold text-charcoal flex items-center gap-2">
            Return Request
            <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium ml-2
              ${returnReq.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                returnReq.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                returnReq.status === 'REFUNDED' ? 'bg-green-100 text-green-800' :
                returnReq.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'}`}>
              {returnReq.status}
            </span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-4">
            <h2 className="text-lg font-bold text-charcoal border-b border-charcoal/5 pb-2">Return Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-charcoal/60 mb-1">Reason</span>
                <span className="font-medium text-charcoal capitalize">{returnReq.reason?.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="block text-charcoal/60 mb-1">Requested Action</span>
                <span className="font-medium text-charcoal capitalize">{returnReq.requestedAction}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-charcoal/60 mb-1">Customer Comments</span>
                <p className="bg-ivory/50 p-3 rounded-lg text-charcoal">{returnReq.comments || 'No comments provided.'}</p>
              </div>
              {returnReq.images?.length > 0 && (
                <div className="col-span-2">
                  <span className="block text-charcoal/60 mb-2">Attached Images</span>
                  <div className="flex gap-2">
                    {returnReq.images.map((img, idx) => (
                      <a key={idx} href={img} target="_blank" rel="noreferrer">
                        <img src={img} alt="Return Evidence" className="w-20 h-20 object-cover rounded-lg border border-charcoal/10" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-4">
            <h2 className="text-lg font-bold text-charcoal border-b border-charcoal/5 pb-2">Admin Resolution</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Admin Notes (visible internally)</label>
                <textarea
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                  placeholder="Notes about why this was approved/rejected..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusUpdate('APPROVED')}
                  disabled={updating || returnReq.status !== 'PENDING'}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate('REJECTED')}
                  disabled={updating || returnReq.status !== 'PENDING'}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => handleStatusUpdate('REFUNDED')}
                  disabled={updating || returnReq.status !== 'APPROVED'}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" /> Mark Refunded
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-4">
            <h2 className="text-lg font-bold text-charcoal border-b border-charcoal/5 pb-2">Related Order</h2>
            <div>
              <Link to={`/orders/${returnReq.orderId?._id}`} className="text-brand font-bold hover:underline">
                {returnReq.orderId?.orderNumber}
              </Link>
              <p className="text-sm text-charcoal/60 mt-1">Status: {returnReq.orderId?.status}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-4">
            <h2 className="text-lg font-bold text-charcoal border-b border-charcoal/5 pb-2">Customer</h2>
            <div>
              <p className="font-medium text-charcoal">{returnReq.userId?.firstName} {returnReq.userId?.lastName}</p>
              <p className="text-sm text-charcoal/60">{returnReq.userId?.email}</p>
              {returnReq.userId?.phone && <p className="text-sm text-charcoal/60">{returnReq.userId?.phone}</p>}
              <Link to={`/customers/${returnReq.userId?._id}`} className="text-xs text-brand hover:underline mt-2 inline-block">
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

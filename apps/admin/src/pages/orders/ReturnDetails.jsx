import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ArrowLeft, Loader2, Save, Package, Truck, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

export default function ReturnDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnReq, setReturnReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchReturnDetails();
  }, [id]);

  const fetchReturnDetails = async () => {
    try {
      const { data } = await api.get(`/admin/returns/${id}`);
      setReturnReq(data.data);
      setStatus(data.data.status);
      setAdminNotes(data.data.adminNotes || '');
    } catch (error) {
      console.error('Failed to fetch return details:', error);
      alert('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/returns/${id}/status`, {
        status,
        adminNotes
      });
      alert('Updated successfully');
      fetchReturnDetails();
    } catch (error) {
      console.error('Failed to update:', error);
      alert('Failed to update request');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'RECEIVED':
      case 'QC_PASSED':
      case 'REFUNDED':
      case 'CLOSED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'REQUESTED':
      case 'PICKUP_SCHEDULED':
      case 'QC_PENDING':
      case 'REFUND_PENDING':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'REJECTED':
      case 'QC_FAILED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!returnReq) return <div>Request not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/orders/returns')}
            className="p-2 -ml-2 text-charcoal/60 hover:text-charcoal hover:bg-black/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-charcoal flex items-center gap-3">
              {returnReq.type === 'REPLACEMENT' ? 'Replacement' : 'Return'} Request
              <span className={`text-xs font-sans px-3 py-1 rounded-full border ${getStatusColor(returnReq.status)}`}>
                {returnReq.status.replace(/_/g, ' ')}
              </span>
            </h1>
            <p className="text-sm text-charcoal/60 mt-1 font-mono">
              ID: {returnReq._id}
            </p>
          </div>
        </div>
        <button
          onClick={handleUpdate}
          disabled={saving}
          className="flex items-center gap-2 bg-charcoal text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6">
            <h2 className="font-serif text-lg text-charcoal mb-4">Request Details</h2>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-charcoal/60 mb-1">Reason</p>
                <p className="font-medium text-charcoal">{returnReq.reason}</p>
              </div>
              <div>
                <p className="text-sm text-charcoal/60 mb-1">Date Requested</p>
                <p className="font-medium text-charcoal">{new Date(returnReq.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-charcoal/60 mb-1">Customer Notes</p>
              <div className="bg-ivory/50 p-4 rounded-lg text-sm text-charcoal min-h-[60px] border border-charcoal/5">
                {returnReq.notes || 'No additional notes provided by customer.'}
              </div>
            </div>

            {returnReq.images && returnReq.images.length > 0 && (
              <div>
                <p className="text-sm text-charcoal/60 mb-2">Uploaded Images</p>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {returnReq.images.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="shrink-0 group relative block">
                      <img src={img} alt={`Proof ${i+1}`} className="w-32 h-32 object-cover rounded-xl border border-charcoal/10" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Management */}
          <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6">
            <h2 className="font-serif text-lg text-charcoal mb-4">Management</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="REQUESTED">Requested</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>
                  <option value="RECEIVED">Received</option>
                  <option value="QC_PENDING">QC Pending</option>
                  <option value="QC_PASSED">QC Passed</option>
                  <option value="QC_FAILED">QC Failed</option>
                  <option value="REFUND_PENDING">Refund Pending</option>
                  <option value="REFUNDED">Refunded</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <p className="text-xs text-charcoal/60 mt-2">
                  * Note: If Shiprocket is configured, selecting "APPROVED" will attempt to automatically create a reverse pickup order.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Internal Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows="4"
                  placeholder="Private notes for staff..."
                  className="w-full px-4 py-3 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Order Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6">
            <h2 className="font-serif text-lg text-charcoal mb-4 flex items-center justify-between">
              Order Info
              <Link to={`/orders/${returnReq.orderId?._id}`} className="text-sm text-brand hover:underline font-sans">
                View Order
              </Link>
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-charcoal/60 mb-0.5">Order Number</p>
                <p className="font-mono text-sm font-medium">{returnReq.orderId?.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal/60 mb-0.5">Customer</p>
                <Link to={`/customers/${returnReq.userId?._id}`} className="font-medium text-sm text-brand hover:underline">
                  {returnReq.userId?.firstName} {returnReq.userId?.lastName}
                </Link>
                <p className="text-xs text-charcoal/60">{returnReq.userId?.email}</p>
                <p className="text-xs text-charcoal/60">{returnReq.userId?.phone}</p>
              </div>
            </div>
          </div>

          {/* Item Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6">
            <h2 className="font-serif text-lg text-charcoal mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-charcoal/60" />
              Item to Return
            </h2>
            <div className="flex gap-4 items-start">
              <div className="w-16 h-16 bg-gray-100 rounded-lg border border-charcoal/5 flex items-center justify-center overflow-hidden shrink-0">
                {/* Usually you'd fetch the product image, but variant might only have sku. Using placeholder or check variant. */}
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-charcoal break-all">{returnReq.variantId?.sku}</p>
                <p className="text-sm text-charcoal/60 mt-1">Quantity: <span className="font-medium text-charcoal">{returnReq.quantity}</span></p>
                <p className="text-sm text-charcoal/60">Price: <span className="font-medium text-charcoal">₹{returnReq.variantId?.price}</span></p>
              </div>
            </div>
          </div>

          {/* Shiprocket Info */}
          {returnReq.shiprocketReturnId && (
            <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6">
              <h2 className="font-serif text-lg text-charcoal mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-charcoal/60" />
                Pickup Info
              </h2>
              <div>
                <p className="text-xs text-charcoal/60 mb-0.5">Shiprocket Return Order ID</p>
                <p className="font-mono text-sm font-medium">{returnReq.shiprocketReturnId}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

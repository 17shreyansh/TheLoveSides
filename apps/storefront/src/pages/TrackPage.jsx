import React, { useState } from 'react';
import { api } from '../lib/api';
import Button from '../components/ui/Button';
import { Package, Truck, CheckCircle, Search, Clock, AlertCircle } from 'lucide-react';

export default function TrackPage() {
  const [awb, setAwb] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!awb.trim()) return;

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const { data } = await api.get(`/shipping/track/${awb.trim()}`);
      setTrackingData(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tracking details. Please check your AWB and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'OUT FOR DELIVERY': return <Truck className="w-8 h-8 text-pink-primary" />;
      case 'SHIPPED': return <Truck className="w-8 h-8 text-blue-500" />;
      case 'CANCELLED': return <AlertCircle className="w-8 h-8 text-red-500" />;
      default: return <Package className="w-8 h-8 text-gray-400" />;
    }
  };

  return (
    <div className="bg-cream min-h-screen pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">Track Your Order</h1>
          <p className="text-charcoal/70 font-sans">Enter your tracking number (AWB) to see live status updates.</p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-charcoal/5 mb-8">
          <form onSubmit={handleTrack} className="flex gap-4 flex-col md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter AWB Number"
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-charcoal/20 focus:outline-none focus:border-pink-primary font-sans text-charcoal"
              />
            </div>
            <Button type="submit" variant="dark" className="px-8 py-4 !rounded-xl" disabled={loading || !awb}>
              {loading ? 'Tracking...' : 'Track Order'}
            </Button>
          </form>
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </div>

        {trackingData && trackingData.liveTracking && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-charcoal/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-charcoal/10">
              <div className="flex items-center gap-4">
                {getStatusIcon(trackingData.liveTracking.current_status)}
                <div>
                  <h2 className="text-xl font-bold font-serif text-charcoal">
                    {trackingData.liveTracking.current_status}
                  </h2>
                  <p className="text-sm text-charcoal/60 font-sans mt-1">
                    Courier: <span className="font-medium text-charcoal">{trackingData.courierName || 'Shiprocket'}</span> | AWB: <span className="font-medium text-charcoal">{trackingData.awbCode}</span>
                  </p>
                </div>
              </div>
              
              {(trackingData.estimatedDeliveryDate || trackingData.liveTracking.expected_date) && (
                <div className="bg-pink-primary/5 px-4 py-3 rounded-xl flex items-center gap-3">
                  <Clock className="w-5 h-5 text-pink-primary" />
                  <div>
                    <p className="text-xs text-charcoal/60">Estimated Delivery</p>
                    <p className="font-medium text-charcoal font-sans text-sm">
                      {new Date(trackingData.liveTracking.expected_date || trackingData.estimatedDeliveryDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-8">
              <h3 className="font-serif text-lg text-charcoal mb-6">Tracking History</h3>
              
              {trackingData.liveTracking.scans && trackingData.liveTracking.scans.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-charcoal/10">
                  {trackingData.liveTracking.scans.map((scan, idx) => (
                    <div key={idx} className="relative flex items-start gap-6 group">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-pink-primary shrink-0 shadow" />
                      <div className="pb-6 border-b border-charcoal/5 w-full last:border-0 last:pb-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-1 gap-2">
                          <p className="font-medium text-charcoal text-sm">{scan.activity}</p>
                          <p className="text-xs text-charcoal/50 whitespace-nowrap">
                            {new Date(scan.date).toLocaleString()}
                          </p>
                        </div>
                        {scan.location && (
                          <p className="text-xs text-charcoal/60">{scan.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-charcoal/60">No tracking history available yet. Please check back later.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

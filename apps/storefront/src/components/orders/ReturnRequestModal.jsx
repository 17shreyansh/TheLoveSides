import React, { useState } from 'react';
import { api } from '../../lib/api';
import { X, Upload, Loader2, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

export default function ReturnRequestModal({ isOpen, onClose, orderId, item, onSuccess }) {
  const [type, setType] = useState('RETURN');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !item) return null;

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // For demonstration, simulating upload or base64. 
    // In a real app, upload to a server/S3 and get URLs.
    const newImages = [];
    for (const file of files) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise(resolve => {
        reader.onload = () => {
          newImages.push(reader.result);
          resolve();
        };
      });
    }
    setImages(prev => [...prev, ...newImages]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await api.post(`/orders/${orderId}/return`, {
        type,
        variantId: item.variantId,
        quantity,
        reason,
        notes,
        images
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal/5">
          <h2 className="font-serif text-xl text-charcoal font-semibold">Request Return or Replacement</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-charcoal/40 hover:text-charcoal hover:bg-black/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(100vh-120px)] hide-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Item Info */}
            <div className="flex gap-4 p-4 bg-ivory/50 rounded-xl border border-charcoal/5">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg"></div>
              )}
              <div>
                <p className="font-medium text-charcoal text-sm">{item.name}</p>
                <p className="text-xs text-charcoal/60 mt-1">Ordered Qty: {item.quantity}</p>
              </div>
            </div>

            {/* Request Type */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-3">Request Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('RETURN')}
                  className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors ${
                    type === 'RETURN' 
                      ? 'border-brand text-brand bg-brand/5' 
                      : 'border-charcoal/10 text-charcoal hover:border-charcoal/20'
                  }`}
                >
                  Return Item
                </button>
                <button
                  type="button"
                  onClick={() => setType('REPLACEMENT')}
                  className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors ${
                    type === 'REPLACEMENT' 
                      ? 'border-brand text-brand bg-brand/5' 
                      : 'border-charcoal/10 text-charcoal hover:border-charcoal/20'
                  }`}
                >
                  Replace Item
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Quantity to {type === 'RETURN' ? 'Return' : 'Replace'}</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-ivory/50 border border-charcoal/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand appearance-none"
              >
                {Array.from({ length: item.quantity }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Reason for {type.toLowerCase()}</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 bg-ivory/50 border border-charcoal/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand appearance-none"
              >
                <option value="">Select a reason</option>
                <option value="DEFECTIVE">Item is damaged or defective</option>
                <option value="WRONG_ITEM">Wrong item delivered</option>
                <option value="MISSING_PARTS">Missing parts or accessories</option>
                {type === 'RETURN' && <option value="NOT_NEEDED">No longer needed</option>}
                <option value="QUALITY_ISSUE">Poor quality / not as expected</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Additional Comments</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                placeholder="Please provide any additional details..."
                className="w-full px-4 py-3 bg-ivory/50 border border-charcoal/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand resize-none text-sm"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Upload Images (Optional)</label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg border border-charcoal/10 overflow-hidden group">
                    <img src={img} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed border-charcoal/20 flex flex-col items-center justify-center text-charcoal/40 hover:text-brand hover:border-brand/50 hover:bg-brand/5 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Add Photo</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-4 border-t border-charcoal/5 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

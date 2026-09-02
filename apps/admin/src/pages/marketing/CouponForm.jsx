import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function CouponForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    minCartValue: '',
    maxDiscountAmount: '',
    isFirstOrderOnly: false,
    usageLimit: '',
    perUserLimit: 1,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    isActive: true
  });

  useEffect(() => {
    if (isEditing) {
      fetchCoupon();
    }
  }, [id]);

  const fetchCoupon = async () => {
    try {
      const listRes = await api.get('/admin/coupons');
      const allCoupons = listRes.data.data?.data || listRes.data.data || [];
      const coupon = allCoupons.find(c => c._id === id);
      if (coupon) {
        setFormData({
          ...coupon,
          startDate: new Date(coupon.startDate).toISOString().slice(0, 16),
          endDate: new Date(coupon.endDate).toISOString().slice(0, 16)
        });
      } else {
        setError('Coupon not found');
      }
    } catch (err) {
      setError('Failed to load coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = { ...formData };
      if (payload.minCartValue === '') delete payload.minCartValue;
      if (payload.maxDiscountAmount === '') delete payload.maxDiscountAmount;
      if (payload.usageLimit === '') delete payload.usageLimit;
      
      if (isEditing) {
        await api.patch(`/admin/coupons/${id}`, payload);
      } else {
        await api.post('/admin/coupons', payload);
      }
      navigate('/coupons');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save coupon');
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse p-6">Loading coupon...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/coupons" className="p-2 text-charcoal/60 hover:text-charcoal bg-white rounded-lg shadow-sm border border-charcoal/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-serif font-bold text-charcoal">
            {isEditing ? 'Edit Coupon' : 'Create Coupon'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">Code *</label>
            <input
              type="text"
              name="code"
              required
              value={formData.code}
              onChange={(e) => handleChange({ target: { name: 'code', value: e.target.value.toUpperCase() } })}
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white uppercase transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">Type *</label>
            <select
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">Value *</label>
            <input
              type="number"
              name="value"
              required
              min="0"
              step="0.01"
              value={formData.value}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">Min Cart Value</label>
            <input
              type="number"
              name="minCartValue"
              min="0"
              value={formData.minCartValue}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">Start Date *</label>
            <input
              type="datetime-local"
              name="startDate"
              required
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">End Date *</label>
            <input
              type="datetime-local"
              name="endDate"
              required
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">Total Usage Limit</label>
            <input
              type="number"
              name="usageLimit"
              min="1"
              value={formData.usageLimit}
              onChange={handleChange}
              placeholder="Unlimited if empty"
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">Per User Limit *</label>
            <input
              type="number"
              name="perUserLimit"
              min="1"
              required
              value={formData.perUserLimit}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>

          <div className="flex gap-6 items-end pb-2 md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <span className="text-sm font-medium text-charcoal">Active</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isFirstOrderOnly"
                checked={formData.isFirstOrderOnly}
                onChange={handleChange}
                className="w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <span className="text-sm font-medium text-charcoal">First Order Only</span>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-charcoal/5 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-charcoal text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditing ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Save, Loader2 } from 'lucide-react';

export default function ShippingSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings', { params: { group: 'shipping' } });
      const settingsMap = (data.data || []).reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      
      if (!settingsMap.freeShippingThreshold) settingsMap.freeShippingThreshold = '1000';
      if (!settingsMap['shiprocket.pickup_pincode']) settingsMap['shiprocket.pickup_pincode'] = '';
      if (!settingsMap['shiprocket.default_weight']) settingsMap['shiprocket.default_weight'] = '0.5';
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = Object.entries(settings).map(([key, value]) => ({ key, value, group: 'shipping' }));
      await api.patch('/admin/settings', { settings: payload });
      alert('Shipping settings saved successfully');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse p-6">Loading shipping settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-charcoal">Shipping Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">Free Shipping Threshold</label>
            <input
              type="number"
              name="freeShippingThreshold"
              min="0"
              value={settings.freeShippingThreshold}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-charcoal/5">
          <h2 className="text-lg font-medium text-charcoal mb-4">Shiprocket Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-charcoal">Pickup Pincode (Warehouse)</label>
              <input
                type="text"
                name="shiprocket.pickup_pincode"
                placeholder="e.g. 110001"
                value={settings['shiprocket.pickup_pincode'] || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
              />
              <p className="text-xs text-charcoal/60">
                Leave blank to use SHIPROCKET_PICKUP_PINCODE from your .env file
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-charcoal">Default Package Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                name="shiprocket.default_weight"
                placeholder="0.5"
                min="0"
                value={settings['shiprocket.default_weight'] || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
              />
              <p className="text-xs text-charcoal/60">
                Default weight applied for shipping rates and orders.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-charcoal/5 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-charcoal text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

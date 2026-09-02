import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Save, Loader2 } from 'lucide-react';

export default function TaxesSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings', { params: { group: 'taxes' } });
      const settingsMap = (data.data || []).reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      
      if (!settingsMap.defaultTaxRate) settingsMap.defaultTaxRate = '18';
      if (!settingsMap.taxInclusive) settingsMap.taxInclusive = 'true';
      
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
      const payload = Object.entries(settings).map(([key, value]) => ({ key, value }));
      await api.put('/admin/settings', { settings: payload });
      alert('Tax settings saved successfully');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse p-6">Loading tax settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-charcoal">Tax Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">Default Tax Rate (%)</label>
            <input
              type="number"
              name="defaultTaxRate"
              min="0"
              max="100"
              value={settings.defaultTaxRate}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">Prices Include Tax</label>
            <select
              name="taxInclusive"
              value={settings.taxInclusive}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
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

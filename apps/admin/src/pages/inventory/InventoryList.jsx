import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Search, Save, Loader2 } from 'lucide-react';

export default function InventoryList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [adjustments, setAdjustments] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/admin/catalog/products', {
        params: { search: searchTerm }
      });
      setProducts(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Failed to fetch inventory', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustmentChange = (variantId, field, value) => {
    setAdjustments(prev => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        [field]: value
      }
    }));
  };

  const saveAdjustment = async (variantId) => {
    const adj = adjustments[variantId];
    if (!adj || !adj.quantity) return;
    
    setSaving(prev => ({ ...prev, [variantId]: true }));
    try {
      await api.post(`/admin/inventory/${variantId}/adjust`, {
        quantity: Number(adj.quantity),
        type: adj.type || 'MANUAL_ADJUSTMENT',
        reason: adj.notes || ''
      });
      
      setAdjustments(prev => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });
      fetchInventory();
    } catch (error) {
      alert('Failed to adjust inventory');
    } finally {
      setSaving(prev => ({ ...prev, [variantId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-charcoal">Inventory Management</h1>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-charcoal/5 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-primary/20 focus:border-pink-primary text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ivory text-sm text-charcoal/60 border-b border-charcoal/10">
                <th className="p-4 font-medium">Product / Variant</th>
                <th className="p-4 font-medium">SKU</th>
                <th className="p-4 font-medium">Current Stock</th>
                <th className="p-4 font-medium text-right w-1/3">Adjust Stock</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-charcoal/50">Loading...</td></tr>
              ) : products.flatMap(product => 
                (product.variants || []).map(variant => {
                  const isSaving = saving[variant._id];
                  const adj = adjustments[variant._id] || {};
                  
                  return (
                    <tr key={variant._id} className="border-b border-charcoal/5 hover:bg-ivory/50">
                      <td className="p-4">
                        <p className="text-sm font-medium text-charcoal">{product.name}</p>
                        <p className="text-xs text-charcoal/50">{variant.attributes?.map(a => a.value).join(' / ') || 'Default'}</p>
                      </td>
                      <td className="p-4 text-sm text-charcoal/70">{variant.sku}</td>
                      <td className="p-4">
                        <span className={`text-sm font-bold ${variant.inventory?.available <= (variant.inventory?.lowStockThreshold || 5) ? 'text-red-500' : 'text-green-600'}`}>
                          {variant.inventory?.available || 0}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <input 
                            type="number" 
                            placeholder="+/- Qty" 
                            value={adj.quantity || ''}
                            onChange={(e) => handleAdjustmentChange(variant._id, 'quantity', e.target.value)}
                            className="w-24 px-3 py-1.5 border border-charcoal/10 rounded text-sm focus:outline-none focus:border-pink-primary focus:ring-1 focus:ring-pink-primary/20"
                          />
                          <select
                            value={adj.type || 'MANUAL_ADJUSTMENT'}
                            onChange={(e) => handleAdjustmentChange(variant._id, 'type', e.target.value)}
                            className="px-3 py-1.5 border border-charcoal/10 rounded text-sm focus:outline-none focus:border-pink-primary focus:ring-1 focus:ring-pink-primary/20 bg-white max-w-[120px] truncate"
                          >
                            <option value="PURCHASE">Received</option>
                            <option value="MANUAL_ADJUSTMENT">Manual</option>
                            <option value="DAMAGED">Damage/Loss</option>
                            <option value="RETURN_RECEIVED">Return</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Notes (opt)"
                            value={adj.notes || ''}
                            onChange={(e) => handleAdjustmentChange(variant._id, 'notes', e.target.value)}
                            className="w-24 px-3 py-1.5 border border-charcoal/10 rounded text-sm focus:outline-none focus:border-pink-primary focus:ring-1 focus:ring-pink-primary/20"
                          />
                          <button
                            onClick={() => saveAdjustment(variant._id)}
                            disabled={!adj.quantity || isSaving}
                            className="p-1.5 bg-pink-primary text-white rounded hover:bg-pink-700 disabled:opacity-50 transition-colors"
                          >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
              {!loading && products.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-charcoal/50">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

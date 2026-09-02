import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Search, Save, Loader2, ChevronDown, ChevronRight, History, Plus, Minus, X, Image as ImageIcon } from 'lucide-react';

export default function InventoryList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [expandedProducts, setExpandedProducts] = useState({});
  const [adjustments, setAdjustments] = useState({});
  const [saving, setSaving] = useState({});
  
  const [historyModal, setHistoryModal] = useState({ open: false, variantId: null, variantName: '', logs: [], loading: false });

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

  const toggleExpand = (productId) => {
    setExpandedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleAdjustmentChange = (variantId, delta) => {
    setAdjustments(prev => {
      const current = prev[variantId] || 0;
      return { ...prev, [variantId]: current + delta };
    });
  };

  const setAdjustmentValue = (variantId, value) => {
    const num = parseInt(value, 10);
    setAdjustments(prev => ({ ...prev, [variantId]: isNaN(num) ? 0 : num }));
  };

  const saveAdjustment = async (variantId) => {
    const qty = adjustments[variantId];
    if (!qty) return;
    
    setSaving(prev => ({ ...prev, [variantId]: true }));
    try {
      await api.post(`/admin/inventory/${variantId}/adjust`, {
        quantity: qty,
        type: 'MANUAL_ADJUSTMENT',
        reason: 'Quick adjustment'
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

  const openHistory = async (variant, productName) => {
    const variantName = variant.attributes?.map(a => a.value).join(' / ') || 'Default';
    setHistoryModal({ open: true, variantId: variant._id, variantName: `${productName} - ${variantName}`, logs: [], loading: true });
    
    try {
      const { data } = await api.get(`/admin/inventory/${variant._id}/history`);
      setHistoryModal(prev => ({ ...prev, logs: data.data || [], loading: false }));
    } catch (error) {
      alert('Failed to fetch history');
      setHistoryModal(prev => ({ ...prev, loading: false }));
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
                <th className="p-4 font-medium w-10"></th>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Total Stock</th>
                <th className="p-4 font-medium">Variants</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-charcoal/50">Loading...</td></tr>
              ) : products.map(product => {
                const isExpanded = expandedProducts[product._id];
                const totalStock = (product.variants || []).reduce((acc, v) => acc + (v.inventory?.available || 0), 0);
                
                return (
                  <React.Fragment key={product._id}>
                    <tr 
                      className={`border-b border-charcoal/5 hover:bg-ivory/50 cursor-pointer transition-colors ${isExpanded ? 'bg-ivory/50' : ''}`}
                      onClick={() => toggleExpand(product._id)}
                    >
                      <td className="p-4 text-charcoal/40">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </td>
                      <td className="p-4 flex items-center gap-3">
                        {(product.images && product.images.length > 0) ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="w-10 h-10 min-w-[2.5rem] object-cover rounded-lg border border-charcoal/10"
                          />
                        ) : (
                          <div className="w-10 h-10 min-w-[2.5rem] flex items-center justify-center bg-gray-100 rounded-lg border border-charcoal/10">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-charcoal">{product.name}</p>
                          <p className="text-xs text-charcoal/50">{product.slug}</p>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-charcoal">{totalStock}</td>
                      <td className="p-4 text-sm text-charcoal/70">{(product.variants || []).length} Variants</td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-gray-50/50 border-b border-charcoal/10">
                        <td colSpan="4" className="p-0">
                          <div className="p-4 pl-14">
                            <table className="w-full text-left text-sm">
                              <thead>
                                <tr className="text-charcoal/60 border-b border-charcoal/5">
                                  <th className="pb-3 font-medium">Variant</th>
                                  <th className="pb-3 font-medium">SKU</th>
                                  <th className="pb-3 font-medium">Available</th>
                                  <th className="pb-3 font-medium text-right w-1/2">Adjust Stock</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(product.variants || []).map(variant => {
                                  const isSaving = saving[variant._id];
                                  const adjQty = adjustments[variant._id] || 0;
                                  
                                  return (
                                    <tr key={variant._id} className="border-b border-charcoal/5 last:border-0 hover:bg-white transition-colors">
                                      <td className="py-3 font-medium text-charcoal">
                                        {variant.attributes?.map(a => a.value).join(' / ') || 'Default'}
                                      </td>
                                      <td className="py-3 text-charcoal/70">{variant.sku}</td>
                                      <td className="py-3">
                                        <span className={`font-bold ${variant.inventory?.available <= (variant.inventory?.lowStockThreshold || 5) ? 'text-red-500' : 'text-green-600'}`}>
                                          {variant.inventory?.available || 0}
                                        </span>
                                      </td>
                                      <td className="py-3 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                          <button
                                            onClick={() => openHistory(variant, product.name)}
                                            className="p-1.5 text-charcoal/40 hover:text-pink-primary transition-colors tooltip-trigger"
                                            title="View History"
                                          >
                                            <History className="w-4 h-4" />
                                          </button>
                                          
                                          <div className="flex items-center bg-white border border-charcoal/10 rounded-lg overflow-hidden focus-within:border-pink-primary focus-within:ring-1 focus-within:ring-pink-primary/20 transition-all">
                                            <button 
                                              onClick={() => handleAdjustmentChange(variant._id, -1)}
                                              className="p-2 text-charcoal/60 hover:bg-gray-50 hover:text-charcoal transition-colors"
                                            >
                                              <Minus className="w-3 h-3" />
                                            </button>
                                            <input 
                                              type="text" 
                                              value={adjQty > 0 ? `+${adjQty}` : adjQty}
                                              onChange={(e) => setAdjustmentValue(variant._id, e.target.value)}
                                              className="w-12 text-center text-sm font-medium py-1 focus:outline-none"
                                            />
                                            <button 
                                              onClick={() => handleAdjustmentChange(variant._id, 1)}
                                              className="p-2 text-charcoal/60 hover:bg-gray-50 hover:text-charcoal transition-colors"
                                            >
                                              <Plus className="w-3 h-3" />
                                            </button>
                                          </div>
                                          
                                          <button
                                            onClick={() => saveAdjustment(variant._id)}
                                            disabled={adjQty === 0 || isSaving}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                              adjQty === 0 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                : 'bg-pink-primary text-white hover:bg-pink-700 shadow-sm'
                                            }`}
                                          >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {!loading && products.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-charcoal/50">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      {historyModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-6 border-b border-charcoal/10">
              <div>
                <h2 className="text-xl font-serif font-bold text-charcoal">Inventory History</h2>
                <p className="text-sm text-charcoal/50 mt-1">{historyModal.variantName}</p>
              </div>
              <button 
                onClick={() => setHistoryModal({ open: false, variantId: null, variantName: '', logs: [], loading: false })}
                className="p-2 text-charcoal/40 hover:text-charcoal hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
              {historyModal.loading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-pink-primary" /></div>
              ) : historyModal.logs.length === 0 ? (
                <div className="text-center p-8 text-charcoal/50">No inventory history found for this variant.</div>
              ) : (
                <div className="space-y-4">
                  {historyModal.logs.map(log => (
                    <div key={log._id} className="bg-white p-4 rounded-xl border border-charcoal/10 shadow-sm flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-charcoal">{log.type.replace(/_/g, ' ')}</span>
                          <span className="text-xs text-charcoal/40 px-2 py-0.5 bg-gray-100 rounded-full">
                            {new Date(log.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                        {log.reason && <p className="text-sm text-charcoal/60 mt-1">{log.reason}</p>}
                        {log.performedBy && <p className="text-xs text-charcoal/40 mt-1">By: {log.performedBy.firstName} {log.performedBy.lastName}</p>}
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${log.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {log.quantity > 0 ? '+' : ''}{log.quantity}
                        </p>
                        <p className="text-xs text-charcoal/50 mt-0.5">Balance: {log.newAvailable}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

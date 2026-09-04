import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Upload, Plus, Trash2, Tag, Box, Info, Image as ImageIcon, Loader2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { TagInput } from '../../components/TagInput';
import { SortableGridItem } from '../../components/SortableGridItem';
import { MultiSelect } from '../../components/MultiSelect';

const ColorAttributeInput = ({ values, onChange }) => {
  const [colorValue, setColorValue] = useState('#000000');

  const handleAddHex = () => {
    if (!values.includes(colorValue)) {
      onChange([...values, colorValue]);
    }
  };

  return (
    <div className="flex items-start gap-3 w-full">
      <div className="flex-1">
        <TagInput 
          tags={values || []}
          onChange={onChange}
          placeholder="e.g. Red, Blue, #Hex"
        />
      </div>
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 bg-white mt-1 shrink-0">
        <input 
          type="color" 
          value={colorValue}
          onChange={e => setColorValue(e.target.value)}
          className="w-7 h-7 p-0 border-0 rounded cursor-pointer"
          title="Pick a color"
        />
        <button 
          type="button"
          onClick={handleAddHex}
          className="px-2 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-charcoal rounded transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [rooms, setRooms] = useState([]);
  const [collections, setCollections] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'draft',
    roomIds: [],
    collectionIds: [],
    tags: [],
    images: [],
    attributes: [],
    highlights: [],
    specifications: '',
    
    // Base Variant Fields
    sku: '',
    price: '',
    compareAtPrice: '',
    inventory: 0,

    variants: [],
  });

  useEffect(() => {
    const init = async () => {
      try {
        const [roomRes, colRes] = await Promise.all([
          api.get('/admin/catalog/rooms'),
          api.get('/admin/catalog/collections')
        ]);
        setRooms(roomRes.data.data || []);
        setCollections(colRes.data.data || []);
        
        if (isEditing) {
          const res = await api.get(`/admin/catalog/products/${id}`);
          const product = res.data.data;
          
          if (product.attributes) {
            product.attributes = product.attributes.map(a => ({
              ...a,
              values: a.values || []
            }));
          }

          // Extract base variant data if exists
          const baseVariant = product.variants?.[0] || {};
          
          setFormData({ 
            ...product,
            roomIds: (product.roomIds || []).map(r => typeof r === 'object' ? r._id : r),
            collectionIds: (product.collectionIds || []).map(c => typeof c === 'object' ? c._id : c),
            sku: baseVariant.sku || '',
            price: baseVariant.price || '',
            compareAtPrice: baseVariant.compareAtPrice || '',
            inventory: baseVariant.inventory?.available || 0,
            variants: product.variants || [],
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' && value !== '' ? Number(value) : value)
    }));
  };

  const handleAddAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...(prev.attributes || []), { name: '', values: [] }]
    }));
  };

  const handleUpdateAttribute = (index, field, value) => {
    setFormData(prev => {
      const newAttributes = [...prev.attributes];
      newAttributes[index][field] = value;
      return { ...prev, attributes: newAttributes };
    });
  };

  const handleRemoveAttribute = (index) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const handleAddHighlight = () => {
    setFormData(prev => ({ ...prev, highlights: [...(prev.highlights || []), ''] }));
  };

  const handleUpdateHighlight = (index, value) => {
    setFormData(prev => {
      const newHighlights = [...(prev.highlights || [])];
      newHighlights[index] = value;
      return { ...prev, highlights: newHighlights };
    });
  };

  const handleRemoveHighlight = (index) => {
    setFormData(prev => ({
      ...prev,
      highlights: (prev.highlights || []).filter((_, i) => i !== index)
    }));
  };

  // Generate variants automatically when attributes change
  useEffect(() => {
    if (!formData.attributes || formData.attributes.length === 0) {
      if (formData.variants && formData.variants.length > 0 && formData.variants[0].attributes?.length > 0) {
        // If they deleted all attributes, clear variants except base
        setFormData(prev => ({ ...prev, variants: [] }));
      }
      return;
    }

    const validAttrs = formData.attributes.filter(a => a.name && a.values && a.values.length > 0);
    if (validAttrs.length === 0) return;

    const getCombinations = (attrs, current = []) => {
      if (attrs.length === 0) return [current];
      const first = attrs[0];
      const rest = attrs.slice(1);
      const combos = [];
      for (const val of first.values) {
        combos.push(...getCombinations(rest, [...current, { name: first.name, value: val }]));
      }
      return combos;
    };

    const combinations = getCombinations(validAttrs);
    
    setFormData(prev => {
      const existingVariants = prev.variants || [];
      const newVariants = combinations.map(combo => {
        const comboStr = combo.map(c => `${c.name}:${c.value}`).sort().join('|');
        const existing = existingVariants.find(v => {
          if (!v.attributes) return false;
          const vStr = v.attributes.map(a => `${a.name}:${a.value}`).sort().join('|');
          return vStr === comboStr;
        });

        if (existing) return existing;

        const skuSuffix = combo.map(c => c.value.substring(0, 3).toUpperCase()).join('-');
        
        return {
          attributes: combo,
          price: prev.price !== '' ? Number(prev.price) : '',
          compareAtPrice: prev.compareAtPrice !== '' ? Number(prev.compareAtPrice) : '',
          sku: prev.slug ? `${prev.slug.toUpperCase()}-${skuSuffix}` : '',
          inventory: { available: 0, trackInventory: true, lowStockThreshold: 5 }
        };
      });

      return { ...prev, variants: newVariants };
    });
  }, [formData.attributes]); // Run this effect when attributes change

  const handleVariantChange = (index, field, value) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      if (field === 'inventory') {
        newVariants[index].inventory = { ...newVariants[index].inventory, available: Number(value) };
      } else {
        newVariants[index][field] = field === 'price' || field === 'compareAtPrice' ? (value ? Number(value) : '') : value;
      }
      return { ...prev, variants: newVariants };
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const fd = new FormData();
        fd.append('file', file);
        const { data } = await api.post('/admin/upload/single', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data.data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls]
      }));
    } catch (err) {
      alert('Upload failed for some images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (urlToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(url => url !== urlToRemove)
    }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.images.indexOf(active.id);
        const newIndex = prev.images.indexOf(over.id);
        return {
          ...prev,
          images: arrayMove(prev.images, oldIndex, newIndex)
        };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      // Auto-generate slug if not editing and empty
      if (!isEditing && !payload.slug) {
        payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      } else if (payload.slug) {
        payload.slug = payload.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }

      // Ensure roomIds and collectionIds are strings (extract _id if populated objects)
      if (payload.roomIds) {
        payload.roomIds = payload.roomIds.map(r => typeof r === 'object' ? r._id : r).filter(Boolean);
      }
      if (payload.collectionIds) {
        payload.collectionIds = payload.collectionIds.map(c => typeof c === 'object' ? c._id : c).filter(Boolean);
      }

      // Clean up empty highlights and attributes
      if (payload.highlights) {
        payload.highlights = payload.highlights.filter(h => h.trim() !== '');
      }
      if (payload.attributes) {
        payload.attributes = payload.attributes.filter(a => a.name.trim() !== '' && a.values.length > 0);
      }

      // Populate base variant
      const baseVariant = {
        sku: payload.sku || (payload.slug + '-01'),
        price: Number(payload.price) || 0,
        attributes: []
      };

      if (payload.compareAtPrice) baseVariant.compareAtPrice = Number(payload.compareAtPrice);
      if (payload.inventory !== undefined && payload.inventory !== '') {
        baseVariant.inventory = {
          available: Number(payload.inventory),
          trackInventory: true
        };
      }

      // If we have dynamically generated variants, use those instead of base
      const hasDynamicVariants = payload.variants && payload.variants.length > 0 && payload.variants[0].attributes?.length > 0;
      
      const finalVariants = hasDynamicVariants ? payload.variants : [baseVariant];
      
      payload.variants = finalVariants.map(v => ({
        ...v,
        price: Number(v.price) || 0,
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
      }));
      
      // Cleanup base fields from top-level payload to avoid schema errors if strict
      delete payload.sku;
      delete payload.price;
      delete payload.compareAtPrice;
      delete payload.inventory;

      if (isEditing) {
        // 1. Update Product (which omits variants)
        await api.patch(`/admin/catalog/products/${id}`, payload);
        // 2. Update Variants
        await api.put(`/admin/catalog/products/${id}/variants`, { variants: payload.variants });
      } else {
        await api.post('/admin/catalog/products', payload);
      }
      navigate('/products');
    } catch (err) {
      console.error(err);
      const apiError = err.response?.data?.error;
      const errorMessage = typeof apiError === 'object' ? apiError.message : (apiError || err.response?.data?.message || 'Failed to save product');
      alert(errorMessage);
    }
  };

  if (loading) return <div className="animate-pulse p-8 text-center text-charcoal/50 font-medium">Loading product data...</div>;

  return (
    <form onSubmit={handleSubmit} className="relative pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 -mx-8 px-8 py-4 mb-8 bg-[#fdfdfc]/80 backdrop-blur-md border-b border-charcoal/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-charcoal">
            {isEditing ? 'Edit Product' : 'Add Product'}
          </h1>
          <p className="text-sm text-charcoal/60 mt-1">
            {isEditing ? `Editing ${formData.name}` : 'Create a new product for your catalog'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => navigate('/products')} 
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-charcoal hover:bg-gray-100 transition-colors"
          >
            Discard
          </button>
          <button 
            type="submit" 
            className="px-5 py-2.5 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-black transition-colors shadow-sm"
          >
            {isEditing ? 'Save Changes' : 'Publish Product'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          
          {/* Basic Info Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-charcoal/5">
            <div className="flex items-center gap-2 mb-6 text-charcoal">
              <Info className="w-5 h-5 text-pink-primary" />
              <h2 className="text-lg font-serif font-bold">Basic Information</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1.5">Product Name</label>
                <input
                  type="text" name="name" required
                  value={formData.name} onChange={handleChange}
                  placeholder="e.g. Classic Diamond Ring"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-primary/20 focus:border-pink-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1.5">Description (HTML supported)</label>
                <textarea
                  name="description" rows="5"
                  value={formData.description || ''} onChange={handleChange}
                  placeholder="Describe the product details, materials, and care instructions..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-primary/20 focus:border-pink-primary transition-all resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1.5">Specifications (HTML supported)</label>
                <textarea
                  name="specifications" rows="3"
                  value={formData.specifications || ''} onChange={handleChange}
                  placeholder="e.g. 100% premium fabric. Dry clean only."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-primary/20 focus:border-pink-primary transition-all resize-y"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-charcoal">"Why You'll Love It" Highlights</label>
                  <button type="button" onClick={handleAddHighlight} className="text-xs text-pink-primary font-semibold hover:underline">
                    + Add Highlight
                  </button>
                </div>
                <div className="space-y-3">
                  {(formData.highlights || []).map((highlight, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => handleUpdateHighlight(index, e.target.value)}
                        placeholder="e.g. Hand-finished edges for a perfect drape."
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-primary/20 focus:border-pink-primary transition-all"
                      />
                      <button type="button" onClick={() => handleRemoveHighlight(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {(!formData.highlights || formData.highlights.length === 0) && (
                    <div className="text-sm text-gray-400 italic py-2">No highlights added. Storefront will use default fallback text.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-charcoal/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-charcoal">
                <ImageIcon className="w-5 h-5 text-pink-primary" />
                <h2 className="text-lg font-serif font-bold">Media</h2>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-charcoal/60 rounded-full">
                {formData.images?.length || 0} Images
              </span>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={formData.images || []} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {(formData.images || []).map((url, index) => (
                    <SortableGridItem 
                      key={url} id={url} url={url} 
                      onRemove={handleRemoveImage} isMain={index === 0}
                    />
                  ))}
                  
                  <label className={`flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? 'bg-gray-50 border-gray-200' : 'border-gray-300 hover:bg-pink-50/50 hover:border-pink-primary/50 text-charcoal/40 hover:text-pink-primary'}`}>
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-pink-primary mb-2" />
                      ) : (
                        <Upload className="w-6 h-6 mb-2" />
                      )}
                      <p className="text-xs font-medium">{uploading ? 'Uploading...' : 'Add Images'}</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </SortableContext>
            </DndContext>
            <p className="text-xs text-charcoal/50 mt-4">Drag and drop images to reorder. The first image will be used as the cover.</p>
          </div>

          {/* Dynamic Attributes Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-charcoal/5">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2 text-charcoal">
                 <Box className="w-5 h-5 text-pink-primary" />
                 <h2 className="text-lg font-serif font-bold">Variants & Attributes</h2>
               </div>
               <button 
                type="button" 
                onClick={handleAddAttribute} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-700 hover:bg-pink-100 rounded-lg text-sm font-semibold transition-colors"
               >
                 <Plus className="w-4 h-4" /> Add Option
               </button>
            </div>
            
            <div className="space-y-4">
              {formData.attributes?.map((attr, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-200">
                  <div className="w-full sm:w-1/3">
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">Option Name</label>
                    <input
                      type="text" required
                      placeholder="e.g. Size, Material"
                      value={attr.name} onChange={(e) => handleUpdateAttribute(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-pink-primary focus:ring-1 focus:ring-pink-primary/20"
                    />
                  </div>
                  <div className="w-full sm:w-2/3">
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">Values (Press Enter to add)</label>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 flex">
                        {attr.name.toLowerCase().includes('color') ? (
                          <ColorAttributeInput 
                            values={attr.values || []}
                            onChange={(newTags) => handleUpdateAttribute(index, 'values', newTags)}
                          />
                        ) : (
                          <TagInput 
                            tags={attr.values || []}
                            onChange={(newTags) => handleUpdateAttribute(index, 'values', newTags)}
                            placeholder="e.g. Small, Medium"
                          />
                        )}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveAttribute(index)} 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                        title="Remove Option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {(!formData.attributes || formData.attributes.length === 0) && (
                <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-500 font-medium">No variant options configured.</p>
                  <p className="text-xs text-gray-400 mt-1">Add options like Size or Color if this product has multiple variations.</p>
                </div>
              )}
            </div>
          </div>

          {/* Dedicated Variant Matrix Card */}
          {(formData.variants && formData.variants.length > 0 && formData.variants[0].attributes?.length > 0) && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-charcoal/5 mt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-charcoal">
                  <Tag className="w-5 h-5 text-pink-primary" />
                  <h2 className="text-lg font-serif font-bold">Variant Stocks & Pricing</h2>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-500 rounded-full">{formData.variants.length} combinations</span>
              </div>
              
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <th className="p-3">Variant</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Price (₹)</th>
                      <th className="p-3">Compare (₹)</th>
                      <th className="p-3">Available Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.variants.map((variant, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="p-3">
                          <span className="text-sm font-medium text-charcoal">
                            {variant.attributes?.map(a => a.value).join(' / ')}
                          </span>
                        </td>
                        <td className="p-3">
                          <input 
                            type="text" 
                            value={variant.sku || ''} 
                            onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                            placeholder="SKU"
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-pink-primary focus:ring-1 focus:ring-pink-primary/20 uppercase"
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            type="number" min="0" step="0.01" required
                            value={variant.price === 0 ? 0 : (variant.price || '')} 
                            onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                            placeholder={formData.price || '0.00'}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-pink-primary focus:ring-1 focus:ring-pink-primary/20"
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            type="number" min="0" step="0.01"
                            value={variant.compareAtPrice || ''} 
                            onChange={(e) => handleVariantChange(idx, 'compareAtPrice', e.target.value)}
                            placeholder="0.00"
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-pink-primary focus:ring-1 focus:ring-pink-primary/20"
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            type="number" min="0"
                            value={variant.inventory?.available ?? ''} 
                            onChange={(e) => handleVariantChange(idx, 'inventory', e.target.value)}
                            placeholder="0"
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-pink-primary focus:ring-1 focus:ring-pink-primary/20"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pricing & Inventory Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-charcoal/5 mt-6">
            <div className="flex items-center gap-2 mb-6 text-charcoal">
              <Tag className="w-5 h-5 text-pink-primary" />
              <h2 className="text-lg font-serif font-bold">Pricing & Inventory</h2>
            </div>

            {formData.attributes && formData.attributes.length > 0 && formData.attributes[0].name ? (
              <div className="p-4 bg-pink-primary/5 border border-pink-primary/20 rounded-xl">
                <p className="text-sm text-charcoal font-medium">
                  This product has multiple options. Pricing and inventory are managed for each variant individually in the dedicated section above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-1.5">Price (₹)</label>
                  <input
                    type="number" name="price" required min="0" step="0.01"
                    value={formData.price} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-primary/20 focus:border-pink-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-1.5 flex items-center gap-1">
                    Compare-at Price <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
                  </label>
                  <input
                    type="number" name="compareAtPrice" min="0" step="0.01"
                    value={formData.compareAtPrice} onChange={handleChange}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-primary/20 focus:border-pink-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-1.5">Available Stock</label>
                  <input
                    type="number" name="inventory" min="0"
                    value={formData.inventory} onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-primary/20 focus:border-pink-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-1.5 flex items-center gap-1">
                    SKU <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
                  </label>
                  <input
                    type="text" name="sku" 
                    value={formData.sku} onChange={handleChange}
                    placeholder="e.g. RNG-01"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-primary/20 focus:border-pink-primary transition-all uppercase"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata & Organization */}
        <div className="space-y-6 min-w-0">
          
          {/* Status Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-charcoal/5">
            <h2 className="text-base font-serif font-bold text-charcoal mb-4">Status</h2>
            <select 
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-primary/20 focus:border-pink-primary transition-all font-medium text-charcoal"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Published products are immediately visible to customers.
            </p>
          </div>

          {/* Organization Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-charcoal/5 space-y-5">
            <h2 className="text-base font-serif font-bold text-charcoal mb-2">Organization</h2>
            
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-2 uppercase tracking-wider">Rooms</label>
              <MultiSelect 
                options={rooms}
                selectedIds={formData.roomIds || []}
                onChange={(ids) => setFormData(prev => ({ ...prev, roomIds: ids }))}
                placeholder="Assign to rooms..."
              />
            </div>
            
            <div className="pt-2">
              <label className="block text-xs font-semibold text-charcoal mb-2 uppercase tracking-wider">Collections</label>
              <MultiSelect 
                options={collections}
                selectedIds={formData.collectionIds || []}
                onChange={(ids) => setFormData(prev => ({ ...prev, collectionIds: ids }))}
                placeholder="Add to collections..."
              />
            </div>
          </div>

          {/* SEO / URL Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-charcoal/5 space-y-4">
            <h2 className="text-base font-serif font-bold text-charcoal mb-2">Search Engine</h2>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5 uppercase tracking-wider flex items-center justify-between">
                URL Slug
                <span className="text-[10px] font-normal text-gray-400 normal-case bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
              </label>
              <input
                type="text" name="slug" 
                value={formData.slug} onChange={handleChange}
                placeholder="Leave empty to auto-generate"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-primary/20 focus:border-pink-primary transition-all text-sm"
              />
              <p className="text-xs text-gray-400 mt-2">
                A unique identifier for the product URL.
              </p>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}

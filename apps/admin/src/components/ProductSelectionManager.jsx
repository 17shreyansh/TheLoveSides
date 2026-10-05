import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Search, Filter, CheckSquare, Square, ChevronLeft, ChevronRight, GripVertical, X, Loader2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableSelectedItem({ id, product, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm group ${isDragging ? 'border-brand' : 'border-charcoal/10'}`}
    >
      <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-charcoal/40 hover:text-charcoal">
        <GripVertical className="w-5 h-5" />
      </button>
      
      {product?.images?.[0] ? (
        <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded bg-ivory" />
      ) : (
        <div className="w-10 h-10 rounded bg-ivory flex items-center justify-center text-xs text-charcoal/40">No Img</div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal truncate">{product?.name || 'Unknown Product'}</p>
        <p className="text-xs text-charcoal/60 truncate">{product?.sku || 'No SKU'}</p>
      </div>

      <button
        type="button"
        onClick={() => onRemove(id)}
        className="p-1.5 text-charcoal/40 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ProductSelectionManager({ selectedIds, onChange, categories, subCategories }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');

  // Cache for selected product details so we can render them in the right panel
  const [selectedProductsCache, setSelectedProductsCache] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/admin/catalog/products?limit=10&page=${page}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (category) url += `&category=${category}`;
        if (subCategory) url += `&subcategory=${subCategory}`;

        const { data } = await api.get(url);
        const fetchedProducts = data.data || [];
        setProducts(fetchedProducts);
        setTotalPages(data.meta?.pagination?.totalPages || 1);

        // Update cache with newly fetched products
        const newCache = { ...selectedProductsCache };
        fetchedProducts.forEach(p => {
          newCache[p._id] = p;
        });
        setSelectedProductsCache(newCache);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, search, category, subCategory]);

  // Fetch missing product details for selectedIds on mount (if they weren't in the initial fetch)
  useEffect(() => {
    const fetchMissingSelected = async () => {
      // Find IDs that are not in the cache
      const missingIds = selectedIds.filter(id => !selectedProductsCache[id]);
      if (missingIds.length === 0) return;

      try {
        // Fetch each missing product individually
        const promises = missingIds.map(id => api.get(`/admin/catalog/products/${id}`).catch(() => null));
        const responses = await Promise.all(promises);
        
        setSelectedProductsCache(prev => {
          const newCache = { ...prev };
          responses.forEach(res => {
            if (res?.data?.data) {
              const p = res.data.data;
              newCache[p._id] = p;
            }
          });
          return newCache;
        });
      } catch (err) {
        console.error('Failed to fetch missing selected products', err);
      }
    };
    
    // We only want to attempt fetching missing products if there are any
    if (selectedIds.some(id => !selectedProductsCache[id])) {
      fetchMissingSelected();
    }
  }, [selectedIds, selectedProductsCache]);


  const toggleProduct = (product) => {
    const id = product._id;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedProductsCache(prev => ({ ...prev, [id]: product }));
      onChange([...selectedIds, id]);
    }
  };

  const handleSelectAllOnPage = () => {
    const allOnPageSelected = products.every(p => selectedIds.includes(p._id));
    if (allOnPageSelected) {
      // Deselect all on page
      const pageIds = products.map(p => p._id);
      onChange(selectedIds.filter(id => !pageIds.includes(id)));
    } else {
      // Select all on page
      const newIds = [...selectedIds];
      const newCache = { ...selectedProductsCache };
      products.forEach(p => {
        if (!newIds.includes(p._id)) {
          newIds.push(p._id);
          newCache[p._id] = p;
        }
      });
      setSelectedProductsCache(newCache);
      onChange(newIds);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = selectedIds.indexOf(active.id);
      const newIndex = selectedIds.indexOf(over.id);
      onChange(arrayMove(selectedIds, oldIndex, newIndex));
    }
  };

  const allOnPageSelected = products.length > 0 && products.every(p => selectedIds.includes(p._id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white border border-charcoal/10 rounded-xl overflow-hidden">
      
      {/* LEFT: Product Selector */}
      <div className="flex flex-col border-r border-charcoal/10 bg-ivory/20">
        <div className="p-4 border-b border-charcoal/10 space-y-3">
          <h3 className="font-semibold text-charcoal">Available Products</h3>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-charcoal/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="flex-1 px-3 py-2 bg-white border border-charcoal/10 rounded-lg text-sm focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select
              value={subCategory}
              onChange={(e) => { setSubCategory(e.target.value); setPage(1); }}
              className="flex-1 px-3 py-2 bg-white border border-charcoal/10 rounded-lg text-sm focus:outline-none"
            >
              <option value="">All Sub-Categories</option>
              {subCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-[400px] max-h-[500px] p-4">
          {loading && products.length === 0 ? (
            <div className="flex items-center justify-center h-full text-charcoal/40">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center h-full text-charcoal/40 text-sm">
              No products found.
            </div>
          ) : (
            <div className="space-y-2">
              <div 
                className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-charcoal/5"
                onClick={handleSelectAllOnPage}
              >
                {allOnPageSelected ? (
                  <CheckSquare className="w-5 h-5 text-brand" />
                ) : (
                  <Square className="w-5 h-5 text-charcoal/20" />
                )}
                <span className="text-sm font-medium text-charcoal">Select all on this page</span>
              </div>
              <div className="h-px bg-charcoal/10 my-2" />
              
              {products.map(product => {
                const isSelected = selectedIds.includes(product._id);
                return (
                  <div 
                    key={product._id}
                    onClick={() => toggleProduct(product)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${isSelected ? 'bg-brand/5 border-brand/20' : 'bg-white border-charcoal/5 hover:border-brand/30'}`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-brand shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-charcoal/20 shrink-0" />
                    )}
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded bg-ivory shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-ivory flex items-center justify-center text-xs text-charcoal/40 shrink-0">No Img</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-charcoal truncate">{product.name}</p>
                      <p className="text-xs text-charcoal/50 truncate">{product.sku}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-charcoal/10 flex items-center justify-between bg-white">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-1.5 rounded hover:bg-ivory disabled:opacity-50 text-charcoal"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-charcoal/60">Page {page} of {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded hover:bg-ivory disabled:opacity-50 text-charcoal"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* RIGHT: Selected Products Reordering */}
      <div className="flex flex-col bg-white">
        <div className="p-4 border-b border-charcoal/10 flex items-center justify-between">
          <h3 className="font-semibold text-charcoal">Selected Products</h3>
          <span className="text-xs font-medium px-2 py-1 bg-brand/10 text-brand rounded-full">
            {selectedIds.length} items
          </span>
        </div>
        
        <div className="flex-1 overflow-auto min-h-[400px] max-h-[500px] p-4 bg-ivory/10">
          {selectedIds.length === 0 ? (
            <div className="flex items-center justify-center h-full text-charcoal/40 text-sm">
              No products selected yet.
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={selectedIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {selectedIds.map(id => (
                    <SortableSelectedItem 
                      key={id} 
                      id={id} 
                      product={selectedProductsCache[id]} 
                      onRemove={(removeId) => onChange(selectedIds.filter(sid => sid !== removeId))} 
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
      
    </div>
  );
}

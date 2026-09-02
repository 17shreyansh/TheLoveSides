import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/admin/catalog/products');
      setProducts(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/catalog/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  if (loading) return <div className="animate-pulse">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-charcoal">Products</h1>
        <Link 
          to="/products/new"
          className="flex items-center gap-2 bg-charcoal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ivory text-sm text-charcoal/60 border-b border-charcoal/10">
                <th className="p-4 font-medium">Image</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Rooms</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-charcoal/5 hover:bg-ivory/50">
                  <td className="p-4">
                    <img 
                      src={(product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/50'} 
                      alt={product.name} 
                      className="w-12 h-12 object-cover rounded-lg border border-charcoal/10"
                    />
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-charcoal">{product.name}</p>
                    <p className="text-xs text-charcoal/50">{product.slug}</p>
                  </td>
                  <td className="p-4 text-sm text-charcoal/70">
                    {product.roomIds && product.roomIds.length > 0 
                      ? product.roomIds.map(r => r.name).join(', ') 
                      : 'None'}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800 capitalize'}`}>
                      {product.status || 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/products/${product._id}`}
                        className="p-2 text-charcoal/60 hover:text-pink-primary transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-charcoal/60 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-charcoal/50 text-sm">
                    No products found. Start by adding one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

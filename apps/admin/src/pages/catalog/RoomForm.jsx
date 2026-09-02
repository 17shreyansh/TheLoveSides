import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ArrowLeft, Save, Loader2, Upload, X } from 'lucide-react';

export default function RoomForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    isActive: true,
    showInNavigation: true,
    sortOrder: 0
  });

  useEffect(() => {
    if (isEditing) {
      fetchRoom();
    }
  }, [id]);

  const fetchRoom = async () => {
    try {
      const { data } = await api.get(`/admin/catalog/rooms/${id}`);
      setFormData(data.data);
    } catch (err) {
      setError('Failed to load Room');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);

    try {
      const { data } = await api.post('/admin/upload/single', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image: data.data.url }));
    } catch (err) {
      alert('Upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEditing) {
        await api.patch(`/admin/catalog/rooms/${id}`, formData);
      } else {
        await api.post('/admin/catalog/rooms', formData);
      }
      navigate('/rooms');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save Room');
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse p-6">Loading Room...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/rooms" className="p-2 text-charcoal/60 hover:text-charcoal bg-white rounded-lg shadow-sm border border-charcoal/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-serif font-bold text-charcoal">
            {isEditing ? 'Edit Room' : 'Create Room'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">Slug *</label>
            <input
              type="text"
              name="slug"
              required
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens"
              value={formData.slug || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-charcoal">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-charcoal">Cover Image</label>
              {formData.image ? (
                <div className="relative inline-block">
                  <img src={formData.image} alt="Preview" className="w-full h-32 object-cover rounded-xl border border-charcoal/10" />
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({...prev, image: ''}))}
                    className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow border border-charcoal/10 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-charcoal/20 rounded-xl cursor-pointer hover:bg-ivory/50 hover:border-pink-primary transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-6 h-6 text-charcoal/40 mb-2" />
                    <p className="text-xs text-charcoal/60">Click to upload</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-charcoal">Sort Order</label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder ?? 0}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
              />
            </div>
          
          <div className="flex gap-6 items-end pb-2">
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
                name="showInNavigation"
                checked={formData.showInNavigation}
                onChange={handleChange}
                className="w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <span className="text-sm font-medium text-charcoal">Show in Navigation</span>
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
            {isEditing ? 'Update Room' : 'Create Room'}
          </button>
        </div>
      </form>
    </div>
  );
}

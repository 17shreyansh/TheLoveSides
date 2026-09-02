import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function CmsPageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    isPublished: false,
    seo: {
      metaTitle: '',
      metaDescription: ''
    }
  });

  useEffect(() => {
    if (isEditing) {
      fetchPage();
    }
  }, [id]);

  const fetchPage = async () => {
    try {
      const { data } = await api.get(`/admin/cms/${id}`);
      setFormData({
        ...data.data,
        seo: data.data.seo || { metaTitle: '', metaDescription: '' }
      });
    } catch (err) {
      setError('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData(prev => ({ ...prev, seo: { ...prev.seo, [seoField]: value } }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEditing) {
        await api.patch(`/admin/cms/${id}`, formData);
      } else {
        await api.post('/admin/cms', formData);
      }
      navigate('/cms');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save page');
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse p-6">Loading page...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/cms" className="p-2 text-charcoal/60 hover:text-charcoal bg-white rounded-lg shadow-sm border border-charcoal/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-serif font-bold text-charcoal">
            {isEditing ? 'Edit Page' : 'Create Page'}
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
            <label className="block text-sm font-medium text-charcoal">Page Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title || ''}
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
              value={formData.slug || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-charcoal">Content (Markdown or HTML) *</label>
            <textarea
              name="content"
              required
              rows={15}
              value={formData.content || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors font-mono text-sm"
            />
          </div>

          <div className="space-y-2 md:col-span-2 pt-4 border-t border-charcoal/5">
            <h3 className="text-sm font-bold text-charcoal mb-4">SEO Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal">Meta Title</label>
                <input
                  type="text"
                  name="seo.metaTitle"
                  value={formData.seo?.metaTitle || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal">Meta Description</label>
                <input
                  type="text"
                  name="seo.metaDescription"
                  value={formData.seo?.metaDescription || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-ivory/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-6 items-end pb-2 md:col-span-2 pt-4 border-t border-charcoal/5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="w-4 h-4 rounded text-brand focus:ring-brand"
              />
              <span className="text-sm font-medium text-charcoal">Published (Visible on storefront)</span>
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
            {isEditing ? 'Update Page' : 'Create Page'}
          </button>
        </div>
      </form>
    </div>
  );
}

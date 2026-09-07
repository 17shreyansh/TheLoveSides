import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Save, Loader2, Plus, Trash2, Upload, GripVertical } from 'lucide-react';
import clsx from 'clsx';
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

function SortableItem({ id, children, className }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={clsx("flex gap-2 items-center", className)}>
      <div {...attributes} {...listeners} className="cursor-grab hover:bg-gray-200 p-1.5 rounded text-gray-400 self-center">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function ThemeSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('navbar');
  const [dynamicLinks, setDynamicLinks] = useState({ products: [], collections: [], rooms: [] });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchSettings();
    fetchDynamicLinks();
  }, []);

  const fetchDynamicLinks = async () => {
    try {
      const colsRes = await api.get('/admin/catalog/collections');
      const collections = (colsRes.data?.data || []).map(c => ({ title: `Collection: ${c.name}`, href: `/category/${c.slug}` }));

      const roomsRes = await api.get('/admin/catalog/rooms');
      const rooms = (roomsRes.data?.data || []).map(r => ({ title: `Room: ${r.name}`, href: `/room/${r.slug}` }));

      const prodsRes = await api.get('/admin/catalog/products?limit=100');
      const products = (prodsRes.data?.data?.products || prodsRes.data?.data || []).map(p => ({ title: `Product: ${p.title}`, href: `/product/${p.slug}` }));

      setDynamicLinks({ collections, rooms, products });
    } catch (err) {
      console.error('Failed to fetch dynamic links', err);
    }
  };

  const withId = (arr) => (arr || []).map(item => {
    if (typeof item === 'string') return { _id: generateId(), value: item };
    return { ...item, _id: item._id || generateId() };
  });

  const footerWithId = (footerArr) => (footerArr || []).map(col => ({
    ...col,
    _id: col._id || generateId(),
    links: (col.links || []).map(link => ({ ...link, _id: link._id || generateId() }))
  }));

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings', { params: { group: 'theme' } });
      const settingsMap = (data.data || []).reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      
      setSettings({
        navbar: withId(settingsMap['theme.navbar.links']),
        footer: footerWithId(settingsMap['theme.footer.links']),
        promo: withId(settingsMap['theme.promo.offers']),
        promoBanner: settingsMap['theme.home.promo_banner'] || { title: 'Spring Sale Event', description: 'Refresh your home with up to <span class="text-charcoal font-bold">40% off</span> our premium bespoke curtains.', buttonText: 'Shop The Sale', buttonLink: '/products' },
        features: withId(settingsMap['theme.home.features']),
        testimonials: withId(settingsMap['theme.home.testimonials']),
        socialFeed: withId(settingsMap['theme.home.social_feed']),
        stats: withId(settingsMap['theme.home.stats']),
        hero: settingsMap['theme.home.hero'] || {
          title: '', subtitle: '', description: '',
          button1Text: '', button1Link: '', button2Text: '', button2Link: '',
          desktopImageUrl: '', mobileImageUrl: ''
        },
      });
    } catch (error) {
      console.error('Failed to fetch theme settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event, fieldName, nestedListId = null) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSettings((prev) => {
      if (nestedListId) {
        const newParent = [...prev[fieldName]];
        const colIdx = newParent.findIndex(c => c._id === nestedListId);
        if (colIdx === -1) return prev;
        
        const list = newParent[colIdx].links;
        const oldIndex = list.findIndex(i => i._id === active.id);
        const newIndex = list.findIndex(i => i._id === over.id);
        
        newParent[colIdx].links = arrayMove(list, oldIndex, newIndex);
        return { ...prev, [fieldName]: newParent };
      } else {
        const list = prev[fieldName];
        const oldIndex = list.findIndex(i => i._id === active.id);
        const newIndex = list.findIndex(i => i._id === over.id);
        return { ...prev, [fieldName]: arrayMove(list, oldIndex, newIndex) };
      }
    });
  };

  const handleImageUpload = async (e, idx, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);

    try {
      const { data } = await api.post('/admin/upload/single', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newArray = [...settings[fieldName]];
      newArray[idx].value = data.data.url;
      setSettings(prev => ({ ...prev, [fieldName]: newArray }));
    } catch (err) {
      alert('Upload failed');
    }
  };

  const withoutId = (arr) => arr.map(item => {
    if (item.value !== undefined && Object.keys(item).length === 2 && item._id) return item.value;
    const { _id, ...rest } = item;
    return rest;
  });

  const footerWithoutId = (footerArr) => footerArr.map(col => {
    const { _id, ...rest } = col;
    rest.links = (rest.links || []).map(link => { const { _id, ...lrest } = link; return lrest; });
    return rest;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = [
        { key: 'theme.navbar.links', value: withoutId(settings.navbar) },
        { key: 'theme.footer.links', value: footerWithoutId(settings.footer) },
        { key: 'theme.promo.offers', value: withoutId(settings.promo) },
        { key: 'theme.home.promo_banner', value: settings.promoBanner },
        { key: 'theme.home.features', value: withoutId(settings.features) },
        { key: 'theme.home.testimonials', value: withoutId(settings.testimonials) },
        { key: 'theme.home.social_feed', value: withoutId(settings.socialFeed) },
        { key: 'theme.home.stats', value: withoutId(settings.stats) },
        { key: 'theme.home.hero', value: settings.hero },
      ];
      await api.patch('/admin/settings', { settings: payload });
      alert('Theme settings saved successfully');
    } catch (error) {
      alert('Failed to save theme settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse p-6">Loading theme settings...</div>;

  const tabs = [
    { id: 'hero', label: 'Hero Section' },
    { id: 'navbar', label: 'Navbar' },
    { id: 'promo', label: 'Promo Offers' },
    { id: 'promoBanner', label: 'Promo Banner' },
    { id: 'features', label: 'Why Choose Us' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'stats', label: 'Statistics' },
    { id: 'socialFeed', label: 'Social Feed' },
    { id: 'footer', label: 'Footer (Advanced)' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-charcoal">Theme Customization</h1>
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "border-brand text-brand"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <datalist id="available-pages">
        <option value="/">Home</option>
        <option value="/products">All Products</option>
        <option value="/arrivals">New Arrivals</option>
        <option value="/best-sellers">Best Sellers</option>
        <option value="/collections">Collections</option>
        <option value="/rooms">Rooms</option>
        <option value="/legal/terms">Terms of Service</option>
        <option value="/legal/privacy">Privacy Policy</option>
        <option value="/legal/shipping">Shipping Policy</option>
        <option value="/contact">Contact Us</option>
        <option value="/about">About Us</option>
        {dynamicLinks.collections.map(link => (
          <option key={link.href} value={link.href}>{link.title}</option>
        ))}
        {dynamicLinks.rooms.map(link => (
          <option key={link.href} value={link.href}>{link.title}</option>
        ))}
        {dynamicLinks.products.map(link => (
          <option key={link.href} value={link.href}>{link.title}</option>
        ))}
      </datalist>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-8">
        
        {/* Hero Section */}
        {activeTab === 'hero' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Hero Section</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Title (HTML allowed)</label>
                <input
                  type="text"
                  value={settings.hero.title}
                  onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, title: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Mobile Subtitle</label>
                <input
                  type="text"
                  value={settings.hero.subtitle || ''}
                  onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, subtitle: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Desktop Description</label>
              <textarea
                value={settings.hero.description}
                onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, description: e.target.value } })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Primary Button Text</label>
                <input
                  type="text"
                  value={settings.hero.button1Text}
                  onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, button1Text: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Primary Button Link</label>
                <input
                  type="text"
                  list="available-pages"
                  value={settings.hero.button1Link}
                  onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, button1Link: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Secondary Button Text</label>
                <input
                  type="text"
                  value={settings.hero.button2Text}
                  onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, button2Text: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Secondary Button Link</label>
                <input
                  type="text"
                  list="available-pages"
                  value={settings.hero.button2Link}
                  onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, button2Link: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navbar Links */}
        {activeTab === 'navbar' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Navbar Links</h2>
              <button type="button" onClick={() => setSettings(p => ({ ...p, navbar: [...p.navbar, { _id: generateId(), title: '', href: '' }] }))} className="text-sm text-brand flex items-center gap-1"><Plus className="w-4 h-4"/> Add Link</button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'navbar')}>
              <SortableContext items={settings.navbar.map(i => i._id)} strategy={verticalListSortingStrategy}>
                {settings.navbar.map((link, idx) => (
                  <SortableItem key={link._id} id={link._id}>
                    <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <input
                        type="text"
                        placeholder="Title"
                        value={link.title}
                        onChange={(e) => {
                          const newNavbar = [...settings.navbar];
                          newNavbar[idx].title = e.target.value;
                          setSettings({ ...settings, navbar: newNavbar });
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                      <input
                        type="text"
                        list="available-pages"
                        placeholder="Link URL"
                        value={link.href}
                        onChange={(e) => {
                          const newLinks = [...settings.navbar];
                          newLinks[idx].href = e.target.value;
                          setSettings({ ...settings, navbar: newLinks });
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                      <button type="button" onClick={() => setSettings(p => ({ ...p, navbar: p.navbar.filter((_, i) => i !== idx) }))} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Promo Offers */}
        {activeTab === 'promo' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Promo Offers (Top Ribbon)</h2>
              <button type="button" onClick={() => setSettings(p => ({ ...p, promo: [...p.promo, { _id: generateId(), value: '' }] }))} className="text-sm text-brand flex items-center gap-1"><Plus className="w-4 h-4"/> Add Offer</button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'promo')}>
              <SortableContext items={settings.promo.map(i => i._id)} strategy={verticalListSortingStrategy}>
                {settings.promo.map((offer, idx) => (
                  <SortableItem key={offer._id} id={offer._id}>
                    <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <input
                        type="text"
                        placeholder="Offer text"
                        value={offer.value}
                        onChange={(e) => {
                          const newPromo = [...settings.promo];
                          newPromo[idx].value = e.target.value;
                          setSettings({ ...settings, promo: newPromo });
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                      <button type="button" onClick={() => setSettings(p => ({ ...p, promo: p.promo.filter((_, i) => i !== idx) }))} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Promo Banner */}
        {activeTab === 'promoBanner' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Promo Banner (Home Page)</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Title</label>
                <input
                  type="text"
                  value={settings.promoBanner?.title || ''}
                  onChange={(e) => setSettings({ ...settings, promoBanner: { ...settings.promoBanner, title: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Description (HTML allowed)</label>
                <textarea
                  value={settings.promoBanner?.description || ''}
                  onChange={(e) => setSettings({ ...settings, promoBanner: { ...settings.promoBanner, description: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Button Text</label>
                  <input
                    type="text"
                    value={settings.promoBanner?.buttonText || ''}
                    onChange={(e) => setSettings({ ...settings, promoBanner: { ...settings.promoBanner, buttonText: e.target.value } })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Button Link</label>
                  <input
                    type="text"
                    list="available-pages"
                    value={settings.promoBanner?.buttonLink || ''}
                    onChange={(e) => setSettings({ ...settings, promoBanner: { ...settings.promoBanner, buttonLink: e.target.value } })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Why Choose Us Features */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Why Choose Us (Features)</h2>
              <button type="button" onClick={() => setSettings(p => ({ ...p, features: [...p.features, { _id: generateId(), icon: 'Star', title: '', description: '' }] }))} className="text-sm text-brand flex items-center gap-1"><Plus className="w-4 h-4"/> Add Feature</button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'features')}>
              <SortableContext items={settings.features.map(i => i._id)} strategy={verticalListSortingStrategy}>
                {settings.features.map((feature, idx) => (
                  <SortableItem key={feature._id} id={feature._id}>
                    <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100 relative">
                      <button type="button" onClick={() => setSettings(p => ({ ...p, features: p.features.filter((_, i) => i !== idx) }))} className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-50 rounded-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                        <input
                          type="text"
                          placeholder="Title"
                          value={feature.title}
                          onChange={(e) => {
                            const newFeatures = [...settings.features];
                            newFeatures[idx].title = e.target.value;
                            setSettings({ ...settings, features: newFeatures });
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                        <input
                          type="text"
                          placeholder="Icon Name (e.g. Award, Gem, Heart)"
                          value={feature.icon}
                          onChange={(e) => {
                            const newFeatures = [...settings.features];
                            newFeatures[idx].icon = e.target.value;
                            setSettings({ ...settings, features: newFeatures });
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                      </div>
                      <textarea
                          placeholder="Description"
                          value={feature.description}
                          onChange={(e) => {
                            const newFeatures = [...settings.features];
                            newFeatures[idx].description = e.target.value;
                            setSettings({ ...settings, features: newFeatures });
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand resize-y"
                          rows={2}
                      />
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Testimonials */}
        {activeTab === 'testimonials' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Testimonials</h2>
              <button type="button" onClick={() => setSettings(p => ({ ...p, testimonials: [...p.testimonials, { _id: generateId(), quote: '', author: '' }] }))} className="text-sm text-brand flex items-center gap-1"><Plus className="w-4 h-4"/> Add Testimonial</button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'testimonials')}>
              <SortableContext items={settings.testimonials.map(i => i._id)} strategy={verticalListSortingStrategy}>
                {settings.testimonials.map((test, idx) => (
                  <SortableItem key={test._id} id={test._id}>
                    <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100 relative">
                      <button type="button" onClick={() => setSettings(p => ({ ...p, testimonials: p.testimonials.filter((_, i) => i !== idx) }))} className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-50 rounded-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        placeholder="Author Name"
                        value={test.author}
                        onChange={(e) => {
                          const newTests = [...settings.testimonials];
                          newTests[idx].author = e.target.value;
                          setSettings({ ...settings, testimonials: newTests });
                        }}
                        className="w-1/2 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                      <textarea
                          placeholder="Quote"
                          value={test.quote}
                          onChange={(e) => {
                            const newTests = [...settings.testimonials];
                            newTests[idx].quote = e.target.value;
                            setSettings({ ...settings, testimonials: newTests });
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand resize-y"
                          rows={2}
                      />
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Statistics */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Statistics</h2>
              <button type="button" onClick={() => setSettings(p => ({ ...p, stats: [...(p.stats||[]), { _id: generateId(), value: 0, label: '' }] }))} className="text-sm text-brand flex items-center gap-1"><Plus className="w-4 h-4"/> Add Stat</button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'stats')}>
              <SortableContext items={(settings.stats||[]).map(i => i._id)} strategy={verticalListSortingStrategy}>
                {(settings.stats||[]).map((stat, idx) => (
                  <SortableItem key={stat._id} id={stat._id}>
                    <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <input
                        type="number"
                        placeholder="Number Value (e.g. 15000)"
                        value={stat.value}
                        onChange={(e) => {
                          const newStats = [...settings.stats];
                          newStats[idx].value = Number(e.target.value);
                          setSettings({ ...settings, stats: newStats });
                        }}
                        className="w-1/3 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                      <input
                        type="text"
                        placeholder="Label (e.g. Happy Customers)"
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...settings.stats];
                          newStats[idx].label = e.target.value;
                          setSettings({ ...settings, stats: newStats });
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                      <button type="button" onClick={() => setSettings(p => ({ ...p, stats: p.stats.filter((_, i) => i !== idx) }))} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Social Feed */}
        {activeTab === 'socialFeed' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Social Feed Images (Max 6)</h2>
              {settings.socialFeed.length < 6 && (
                <button type="button" onClick={() => setSettings(p => ({ ...p, socialFeed: [...p.socialFeed, { _id: generateId(), value: '' }] }))} className="text-sm text-brand flex items-center gap-1"><Plus className="w-4 h-4"/> Add Image URL</button>
              )}
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'socialFeed')}>
              <SortableContext items={settings.socialFeed.map(i => i._id)} strategy={verticalListSortingStrategy}>
                {settings.socialFeed.map((img, idx) => (
                  <SortableItem key={img._id} id={img._id}>
                    <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden flex-shrink-0 relative group">
                        {img.value ? (
                          <img src={img.value} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Upload className="w-4 h-4" />
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                          <Upload className="w-4 h-4 text-white" />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, idx, 'socialFeed')} />
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="Image URL or click thumbnail to upload"
                        value={img.value}
                        onChange={(e) => {
                          const newFeed = [...settings.socialFeed];
                          newFeed[idx].value = e.target.value;
                          setSettings({ ...settings, socialFeed: newFeed });
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                      <button type="button" onClick={() => setSettings(p => ({ ...p, socialFeed: p.socialFeed.filter((_, i) => i !== idx) }))} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Footer */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Footer Columns</h2>
              <button 
                type="button" 
                onClick={() => setSettings(p => ({ ...p, footer: [...p.footer, { _id: generateId(), title: '', links: [] }] }))} 
                className="text-sm text-brand flex items-center gap-1"
              >
                <Plus className="w-4 h-4"/> Add Column
              </button>
            </div>
            
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'footer')}>
              <SortableContext items={settings.footer.map(i => i._id)} strategy={verticalListSortingStrategy}>
                {settings.footer.map((col, colIdx) => (
                  <SortableItem key={col._id} id={col._id}>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                      <div className="flex justify-between items-center gap-4">
                        <input
                          type="text"
                          placeholder="Column Title (e.g. Categories)"
                          value={col.title}
                          onChange={(e) => {
                            const newFooter = [...settings.footer];
                            newFooter[colIdx].title = e.target.value;
                            setSettings({ ...settings, footer: newFooter });
                          }}
                          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md font-medium focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                        <button 
                          type="button" 
                          onClick={() => setSettings(p => ({ ...p, footer: p.footer.filter((_, i) => i !== colIdx) }))} 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                          title="Delete Column"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="pl-4 border-l-2 border-gray-200 space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium text-gray-600">Links</h3>
                          <button 
                            type="button" 
                            onClick={() => {
                              const newFooter = [...settings.footer];
                              newFooter[colIdx].links.push({ _id: generateId(), name: '', href: '' });
                              setSettings({ ...settings, footer: newFooter });
                            }} 
                            className="text-xs text-brand flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3"/> Add Link
                          </button>
                        </div>
                        
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'footer', col._id)}>
                          <SortableContext items={col.links.map(i => i._id)} strategy={verticalListSortingStrategy}>
                            {col.links.map((link, linkIdx) => (
                              <SortableItem key={link._id} id={link._id}>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="text"
                                    placeholder="Link Name"
                                    value={link.name}
                                    onChange={(e) => {
                                      const newFooter = [...settings.footer];
                                      newFooter[colIdx].links[linkIdx].name = e.target.value;
                                      setSettings({ ...settings, footer: newFooter });
                                    }}
                                    className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                                  />
                                  <input
                                    type="text"
                                    list="available-pages"
                                    placeholder="URL / Path"
                                    value={link.href}
                                    onChange={(e) => {
                                      const newFooter = [...settings.footer];
                                      newFooter[colIdx].links[linkIdx].href = e.target.value;
                                      setSettings({ ...settings, footer: newFooter });
                                    }}
                                    className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                                  />
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const newFooter = [...settings.footer];
                                      newFooter[colIdx].links = newFooter[colIdx].links.filter((_, i) => i !== linkIdx);
                                      setSettings({ ...settings, footer: newFooter });
                                    }} 
                                    className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-md"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </SortableItem>
                            ))}
                          </SortableContext>
                        </DndContext>

                        {col.links.length === 0 && (
                          <p className="text-sm text-gray-400 italic py-2">No links added yet.</p>
                        )}
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
            
            {settings.footer.length === 0 && (
              <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                <p className="text-gray-500 text-sm">No footer columns defined.</p>
              </div>
            )}
          </div>
        )}

        <div className="pt-6 border-t border-charcoal/5 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-charcoal text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Theme
          </button>
        </div>
      </form>
    </div>
  );
}

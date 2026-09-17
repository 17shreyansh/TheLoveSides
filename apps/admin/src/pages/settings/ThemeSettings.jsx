import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Save, Loader2, Plus, Trash2, Upload, GripVertical } from 'lucide-react';
import * as Icons from 'lucide-react';
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

const AVAILABLE_ICONS = [
  { name: 'AlertCircle', emoji: '⚠️' },
  { name: 'ArrowLeft', emoji: '⬅️' },
  { name: 'Award', emoji: '🏆' },
  { name: 'Calendar', emoji: '📅' },
  { name: 'Check', emoji: '✔️' },
  { name: 'CheckCircle', emoji: '✅' },
  { name: 'CheckCircle2', emoji: '☑️' },
  { name: 'ChevronDown', emoji: '🔽' },
  { name: 'ChevronLeft', emoji: '◀️' },
  { name: 'ChevronRight', emoji: '▶️' },
  { name: 'Clock', emoji: '🕒' },
  { name: 'FileText', emoji: '📄' },
  { name: 'Gem', emoji: '💎' },
  { name: 'Gift', emoji: '🎁' },
  { name: 'Heart', emoji: '❤️' },
  { name: 'Image', emoji: '🖼️' },
  { name: 'Info', emoji: 'ℹ️' },
  { name: 'KeyRound', emoji: '🔑' },
  { name: 'Loader2', emoji: '🔄' },
  { name: 'LogOut', emoji: '🚪' },
  { name: 'Mail', emoji: '✉️' },
  { name: 'MapPin', emoji: '📍' },
  { name: 'Menu', emoji: '☰' },
  { name: 'MessageCircle', emoji: '💬' },
  { name: 'Package', emoji: '📦' },
  { name: 'Play', emoji: '▶️' },
  { name: 'RefreshCw', emoji: '🔄' },
  { name: 'Ruler', emoji: '📏' },
  { name: 'Search', emoji: '🔍' },
  { name: 'Shield', emoji: '🛡️' },
  { name: 'ShoppingBag', emoji: '🛍️' },
  { name: 'SlidersHorizontal', emoji: '🎛️' },
  { name: 'Sparkles', emoji: '✨' },
  { name: 'Star', emoji: '⭐' },
  { name: 'StarHalf', emoji: '⭐' },
  { name: 'Trash2', emoji: '🗑️' },
  { name: 'Truck', emoji: '🚚' },
  { name: 'Upload', emoji: '📤' },
  { name: 'User', emoji: '👤' },
  { name: 'X', emoji: '❌' }
];

function IconSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const SelectedIcon = Icons[value] || Icons.MousePointer2;

  return (
    <div className="relative">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand text-sm"
      >
        <SelectedIcon className="w-4 h-4 text-gray-500" />
        <span className="flex-1 text-left truncate">{value || 'Select Icon...'}</span>
        <Icons.ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2">
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 max-h-48 overflow-y-auto hide-scrollbar">
            {AVAILABLE_ICONS.map(icon => {
               const Icon = Icons[icon.name];
               return (
                 <button
                   key={icon.name}
                   type="button"
                   title={icon.name}
                   onClick={() => { onChange(icon.name); setIsOpen(false); }}
                   className={clsx(
                     "p-2 flex items-center justify-center rounded hover:bg-gray-100 transition-colors",
                     value === icon.name ? "bg-pink-50 text-brand ring-1 ring-brand/30" : "text-gray-600"
                   )}
                 >
                   {Icon && <Icon className="w-5 h-5" />}
                 </button>
               );
            })}
          </div>
          <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}

export default function ThemeSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('navbar');
  const [dynamicLinks, setDynamicLinks] = useState({ products: [], collections: [], rooms: [], cmsPages: [] });

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

      const cmsRes = await api.get('/admin/cms');
      const cmsPages = (cmsRes.data?.data || []).map(p => ({ title: `Page: ${p.title}`, href: `/pages/${p.slug}` }));

      setDynamicLinks({ collections, rooms, products, cmsPages });
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

  const navbarWithId = (navbarArr) => (navbarArr || []).map(link => ({
    ...link,
    _id: link._id || generateId(),
    subLinks: (link.subLinks || []).map(sub => ({ ...sub, _id: sub._id || generateId() }))
  }));

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings', { params: { group: 'theme' } });
      const settingsMap = (data.data || []).reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      
      setSettings({
        navbar: navbarWithId(settingsMap['theme.navbar.links']),
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
        homeSections: settingsMap['theme.home.sections'] || {
          showFeatured: true, showBestSellers: true, bestSellersMode: 'manual'
        },
        signatures: withId(settingsMap['theme.home.signatures'] || []),
        socialLinks: withId(settingsMap['theme.social.links'] || []),
        contactInfo: settingsMap['theme.contact.info'] || { email: '', phone: '', address: '', hours: '' },
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
      if (fieldName === 'signatures') {
        newArray[idx].imageUrl = data.data.url;
      } else {
        newArray[idx].value = data.data.url;
      }
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

  const navbarWithoutId = (navbarArr) => navbarArr.map(link => {
    const { _id, ...rest } = link;
    rest.subLinks = (rest.subLinks || []).map(sub => { const { _id, ...srest } = sub; return srest; });
    return rest;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = [
        { key: 'theme.navbar.links', value: navbarWithoutId(settings.navbar) },
        { key: 'theme.footer.links', value: footerWithoutId(settings.footer) },
        { key: 'theme.promo.offers', value: withoutId(settings.promo) },
        { key: 'theme.home.promo_banner', value: settings.promoBanner },
        { key: 'theme.home.features', value: withoutId(settings.features) },
        { key: 'theme.home.testimonials', value: withoutId(settings.testimonials) },
        { key: 'theme.home.social_feed', value: withoutId(settings.socialFeed) },
        { key: 'theme.home.stats', value: withoutId(settings.stats) },
        { key: 'theme.home.hero', value: settings.hero },
        { key: 'theme.home.sections', value: settings.homeSections },
        { key: 'theme.home.signatures', value: withoutId(settings.signatures) },
        { key: 'theme.social.links', value: withoutId(settings.socialLinks) },
        { key: 'theme.contact.info', value: settings.contactInfo },
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
    { id: 'homeSections', label: 'Home Sections' },
    { id: 'signatures', label: 'Signatures' },
    { id: 'socialLinks', label: 'Social Links' },
    { id: 'contactInfo', label: 'Contact Info' },
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
        {dynamicLinks.cmsPages.map(link => (
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Desktop Image URL (Aspect Ratio: 16:9 recommended)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.hero.desktopImageUrl}
                    onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, desktopImageUrl: e.target.value } })}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md flex items-center justify-center border border-gray-200">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append('file', file);
                      try {
                        const { data } = await api.post('/admin/upload/single', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                        setSettings({ ...settings, hero: { ...settings.hero, desktopImageUrl: data.data.url } });
                      } catch (err) { alert('Upload failed'); }
                    }} />
                  </label>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Mobile Image URL (Aspect Ratio: 4:5 or 1:1 recommended)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.hero.mobileImageUrl}
                    onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, mobileImageUrl: e.target.value } })}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md flex items-center justify-center border border-gray-200">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append('file', file);
                      try {
                        const { data } = await api.post('/admin/upload/single', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                        setSettings({ ...settings, hero: { ...settings.hero, mobileImageUrl: data.data.url } });
                      } catch (err) { alert('Upload failed'); }
                    }} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navbar Links */}
        {activeTab === 'navbar' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Navbar Links</h2>
              <button type="button" onClick={() => setSettings(p => ({ ...p, navbar: [...p.navbar, { _id: generateId(), title: '', href: '', subLinks: [] }] }))} className="text-sm text-brand flex items-center gap-1"><Plus className="w-4 h-4"/> Add Link</button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'navbar')}>
              <SortableContext items={settings.navbar.map(i => i._id)} strategy={verticalListSortingStrategy}>
                {settings.navbar.map((link, idx) => (
                  <SortableItem key={link._id} id={link._id}>
                    <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex gap-4 items-center">
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
                      
                      {/* Sub-links section */}
                      <div className="pl-8 border-l-2 border-gray-200 space-y-3 mt-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium text-gray-600">Dropdown Sub-links</h3>
                          <button 
                            type="button" 
                            onClick={() => {
                              const newNavbar = [...settings.navbar];
                              if (!newNavbar[idx].subLinks) newNavbar[idx].subLinks = [];
                              newNavbar[idx].subLinks.push({ _id: generateId(), name: '', href: '' });
                              setSettings({ ...settings, navbar: newNavbar });
                            }} 
                            className="text-xs text-brand flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3"/> Add Sub-link
                          </button>
                        </div>
                        
                        {(link.subLinks || []).map((sub, subIdx) => (
                          <div key={sub._id} className="flex gap-3 items-center">
                            <input
                              type="text"
                              placeholder="Sub-link Name"
                              value={sub.name}
                              onChange={(e) => {
                                const newNavbar = [...settings.navbar];
                                newNavbar[idx].subLinks[subIdx].name = e.target.value;
                                setSettings({ ...settings, navbar: newNavbar });
                              }}
                              className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                            />
                            <input
                              type="text"
                              list="available-pages"
                              placeholder="Sub-link URL"
                              value={sub.href}
                              onChange={(e) => {
                                const newNavbar = [...settings.navbar];
                                newNavbar[idx].subLinks[subIdx].href = e.target.value;
                                setSettings({ ...settings, navbar: newNavbar });
                              }}
                              className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                            />
                            <button 
                              type="button" 
                              onClick={() => {
                                const newNavbar = [...settings.navbar];
                                newNavbar[idx].subLinks = newNavbar[idx].subLinks.filter((_, i) => i !== subIdx);
                                setSettings({ ...settings, navbar: newNavbar });
                              }} 
                              className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {(!link.subLinks || link.subLinks.length === 0) && (
                          <p className="text-xs text-gray-400 italic py-1">No dropdown sub-links added yet.</p>
                        )}
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Contact Info */}
        {activeTab === 'contactInfo' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Email Address</label>
                <input
                  type="email"
                  value={settings.contactInfo?.email || ''}
                  onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, email: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="hello@thelovesides.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Phone Number</label>
                <input
                  type="text"
                  value={settings.contactInfo?.phone || ''}
                  onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, phone: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="+1 (234) 567-890"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Studio Address</label>
                <textarea
                  value={settings.contactInfo?.address || ''}
                  onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, address: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand resize-y"
                  placeholder="123 Design Avenue..."
                  rows={3}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Working Hours</label>
                <textarea
                  value={settings.contactInfo?.hours || ''}
                  onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, hours: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand resize-y"
                  placeholder="Monday - Friday: 9am - 6pm..."
                  rows={3}
                />
              </div>
            </div>
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
                        <IconSelect 
                          value={feature.icon}
                          onChange={(val) => {
                            const newFeatures = [...settings.features];
                            newFeatures[idx].icon = val;
                            setSettings({ ...settings, features: newFeatures });
                          }}
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
                      <button type="button" onClick={() => setSettings(p => ({ ...p, testimonials: p.testimonials.filter((_, i) => i !== idx) }))} className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-50 rounded-md z-10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex flex-col md:flex-row gap-4 items-start mt-2">
                        <div className="w-full md:w-1/3 h-32 rounded-lg bg-gray-200 flex-shrink-0 relative group overflow-hidden border border-gray-300">
                          {test.image ? (
                            <img src={test.image} alt={test.author || 'Testimonial'} className="w-full h-full object-cover object-top" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                              <Upload className="w-6 h-6 mb-2" />
                              <span className="text-xs">Upload Screenshot</span>
                              <span className="text-[10px] text-gray-400 mt-1">(1:1 Square recommended)</span>
                            </div>
                          )}
                          <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white">
                            <Upload className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">Change</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, idx, 'testimonials')} />
                          </label>
                          {test.image && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                const newTests = [...settings.testimonials];
                                newTests[idx].image = '';
                                setSettings({ ...settings, testimonials: newTests });
                              }}
                              className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div className="flex-1 w-full space-y-3 md:pr-8">
                          <p className="text-xs text-gray-500 italic">If a screenshot is uploaded, it will take over the entire card on the storefront.</p>
                          <input
                            type="text"
                            placeholder="Author Name (Optional if screenshot)"
                            value={test.author || ''}
                            onChange={(e) => {
                              const newTests = [...settings.testimonials];
                              newTests[idx].author = e.target.value;
                              setSettings({ ...settings, testimonials: newTests });
                            }}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                          />
                          <textarea
                              placeholder="Quote (Optional if screenshot)"
                              value={test.quote || ''}
                              onChange={(e) => {
                                const newTests = [...settings.testimonials];
                                newTests[idx].quote = e.target.value;
                                setSettings({ ...settings, testimonials: newTests });
                              }}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand resize-y"
                              rows={2}
                          />
                        </div>
                      </div>
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

        {/* Home Sections */}
        {activeTab === 'homeSections' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Home Page Sections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.homeSections?.showFeatured !== false}
                    onChange={(e) => setSettings({ ...settings, homeSections: { ...settings.homeSections, showFeatured: e.target.checked } })}
                    className="rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <span className="font-medium text-gray-700">Show Featured Products</span>
                </label>
                <p className="text-sm text-gray-500 pl-6">
                  Displays products marked as 'Featured' in the product editor.
                </p>
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.homeSections?.showBestSellers !== false}
                    onChange={(e) => setSettings({ ...settings, homeSections: { ...settings.homeSections, showBestSellers: e.target.checked } })}
                    className="rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <span className="font-medium text-gray-700">Show Best Sellers</span>
                </label>
                
                {settings.homeSections?.showBestSellers !== false && (
                  <div className="pl-6 space-y-2 pt-2 border-t border-gray-200 mt-2">
                    <label className="text-sm font-medium text-gray-700">Selection Mode:</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="bestSellersMode"
                          value="manual"
                          checked={settings.homeSections?.bestSellersMode === 'manual'}
                          onChange={(e) => setSettings({ ...settings, homeSections: { ...settings.homeSections, bestSellersMode: e.target.value } })}
                          className="text-brand focus:ring-brand"
                        />
                        Manual (Marked via Product Edit)
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="bestSellersMode"
                          value="auto"
                          checked={settings.homeSections?.bestSellersMode === 'auto'}
                          onChange={(e) => setSettings({ ...settings, homeSections: { ...settings.homeSections, bestSellersMode: e.target.value } })}
                          className="text-brand focus:ring-brand"
                        />
                        Auto (Highest Sales Count)
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Signatures */}
        {activeTab === 'signatures' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Signature Sections</h2>
              <button type="button" onClick={() => setSettings(p => ({ ...p, signatures: [...(p.signatures || []), { _id: generateId(), title: '', text: '', imageUrl: '', buttonText: '', buttonLink: '', imagePosition: 'left' }] }))} className="text-sm text-brand flex items-center gap-1"><Plus className="w-4 h-4"/> Add Signature</button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'signatures')}>
              <SortableContext items={(settings.signatures || []).map(i => i._id)} strategy={verticalListSortingStrategy}>
                {(settings.signatures || []).map((sig, idx) => (
                  <SortableItem key={sig._id} id={sig._id}>
                    <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100 relative">
                      <button type="button" onClick={() => setSettings(p => ({ ...p, signatures: p.signatures.filter((_, i) => i !== idx) }))} className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-50 rounded-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                        <input
                          type="text"
                          placeholder="Title"
                          value={sig.title}
                          onChange={(e) => {
                            const newSigs = [...settings.signatures];
                            newSigs[idx].title = e.target.value;
                            setSettings({ ...settings, signatures: newSigs });
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Image URL"
                            value={sig.imageUrl}
                            onChange={(e) => {
                              const newSigs = [...settings.signatures];
                              newSigs[idx].imageUrl = e.target.value;
                              setSettings({ ...settings, signatures: newSigs });
                            }}
                            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                          />
                          <label className="cursor-pointer bg-white hover:bg-gray-100 px-3 py-2 rounded-md flex items-center justify-center border border-gray-200">
                            <Upload className="w-4 h-4 text-gray-600" />
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, idx, 'signatures')} />
                          </label>
                        </div>
                      </div>
                      <textarea
                          placeholder="Text/Description"
                          value={sig.text}
                          onChange={(e) => {
                            const newSigs = [...settings.signatures];
                            newSigs[idx].text = e.target.value;
                            setSettings({ ...settings, signatures: newSigs });
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand resize-y"
                          rows={2}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          placeholder="Button Text"
                          value={sig.buttonText || ''}
                          onChange={(e) => {
                            const newSigs = [...settings.signatures];
                            newSigs[idx].buttonText = e.target.value;
                            setSettings({ ...settings, signatures: newSigs });
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                        <input
                          type="text"
                          placeholder="Button Link (/collections/new)"
                          value={sig.buttonLink || ''}
                          onChange={(e) => {
                            const newSigs = [...settings.signatures];
                            newSigs[idx].buttonLink = e.target.value;
                            setSettings({ ...settings, signatures: newSigs });
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                        <select
                          value={sig.imagePosition || 'left'}
                          onChange={(e) => {
                            const newSigs = [...settings.signatures];
                            newSigs[idx].imagePosition = e.target.value;
                            setSettings({ ...settings, signatures: newSigs });
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                        >
                          <option value="left">Image on Left</option>
                          <option value="right">Image on Right</option>
                        </select>
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Social Links */}
        {activeTab === 'socialLinks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Footer Social Links</h2>
              <button type="button" onClick={() => setSettings(p => ({ ...p, socialLinks: [...(p.socialLinks || []), { _id: generateId(), platform: '', url: '' }] }))} className="text-sm text-brand flex items-center gap-1"><Plus className="w-4 h-4"/> Add Link</button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'socialLinks')}>
              <SortableContext items={(settings.socialLinks || []).map(i => i._id)} strategy={verticalListSortingStrategy}>
                {(settings.socialLinks || []).map((link, idx) => (
                  <SortableItem key={link._id} id={link._id}>
                    <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <select
                        value={link.platform}
                        onChange={(e) => {
                          const newLinks = [...settings.socialLinks];
                          newLinks[idx].platform = e.target.value;
                          setSettings({ ...settings, socialLinks: newLinks });
                        }}
                        className="w-1/3 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                      >
                        <option value="">Select Platform</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="twitter">Twitter / X</option>
                        <option value="youtube">YouTube</option>
                        <option value="pinterest">Pinterest</option>
                        <option value="tiktok">TikTok</option>
                      </select>
                      <input
                        type="url"
                        placeholder="Profile URL"
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...settings.socialLinks];
                          newLinks[idx].url = e.target.value;
                          setSettings({ ...settings, socialLinks: newLinks });
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                      <button type="button" onClick={() => setSettings(p => ({ ...p, socialLinks: p.socialLinks.filter((_, i) => i !== idx) }))} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
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

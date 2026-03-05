'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getHomeSettings, updateHomeSettings } from '@/services/homeSettingsService';
import { uploadSingleImage, deleteFile } from '@/services/uploadService';
import { getCategories } from '@/services/categoryService';
import { useAuthState } from '@/hooks/useAuthState';

function extractCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (match && match[1]) return match[1].replace(/\.[^.]+$/, '');
  } catch {}
  return null;
}

async function deleteOldImage(url: string) {
  const publicId = extractCloudinaryPublicId(url);
  if (publicId) {
    try { await deleteFile(publicId, 'image'); } catch (e) { console.error('Delete failed:', e); }
  }
}

const TABS = [
  { id: 'sections', label: 'Section Order' },
  { id: 'hero', label: 'Hero Slides' },
  { id: 'clients', label: 'Client Logos' },
  { id: 'categorySlider', label: 'Category Slider' },
  { id: 'collections', label: 'Collections' },
  { id: 'photoGrid', label: 'Photo Grid' },
  { id: 'promoCards', label: 'Promo Cards' },
  { id: 'statsBanner', label: 'Stats Banner' },
  { id: 'products', label: 'Product Sections' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'brandStory', label: 'Our Story' },
  { id: 'benefits', label: 'Benefits' },
];

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Banner',
  clients: 'Client Logos',
  categories: 'Category Navigation (Legacy)',
  categorySlider: 'Category Slider',
  collections: 'Shop by Collection',
  photoGrid: 'Photo Grid',
  promoCards: 'Promo Cards',
  statsBanner: 'Stats Banner',
  products: 'Product Sections',
  testimonials: 'Testimonials',
  brandStory: 'Our Story',
  benefits: 'Why Shop With Us',
};

const BENEFIT_ICONS = ['check', 'gift', 'shield', 'refresh', 'truck', 'star', 'heart', 'clock'];

function ImageUploader({ value, onChange, label, folder = 'home', hint }: { value: string; onChange: (url: string) => void; label: string; folder?: string; hint?: string }) {
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      if (value) await deleteOldImage(value);
      const result = await uploadSingleImage(file, folder);
      onChange(result.data.url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };
  const handleRemove = async () => {
    if (value) await deleteOldImage(value);
    onChange('');
  };
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">📐 Recommended: {hint}</p>}
      <div className="flex gap-2 items-start">
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Image URL or upload" className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
        <label className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors whitespace-nowrap ${uploading ? 'bg-gray-300 text-gray-500' : 'bg-accent text-white hover:bg-secondary'}`}>
          {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      {value && (
        <div className="mt-2 relative w-32 h-20 rounded overflow-hidden border border-gray-200">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button onClick={handleRemove} className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">x</button>
        </div>
      )}
    </div>
  );
}

export default function AdminHomePage() {
  const router = useRouter();
  const { status, isAdmin } = useAuthState();
  const [activeTab, setActiveTab] = useState('sections');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/sign-in'); return; }
    if (status === 'authenticated' && !isAdmin) { router.push('/'); return; }
    if (status === 'authenticated' && isAdmin) { fetchData(); }
  }, [status, isAdmin]);

  const fetchData = async () => {
    try {
      const [homeRes, catRes] = await Promise.all([getHomeSettings(), getCategories()]);
      const data = homeRes.data;

      // Auto-add any missing section types so new sections appear in the order editor
      const DEFAULT_SECTION_TYPES = [
        'hero', 'clients', 'categorySlider', 'collections',
        'photoGrid', 'promoCards', 'statsBanner',
        'products', 'testimonials', 'brandStory', 'benefits',
      ];
      if (data && Array.isArray(data.sections)) {
        const existing = new Set(data.sections.map((s: any) => s.type));
        const maxOrder = data.sections.reduce((m: number, s: any) => Math.max(m, s.order ?? 0), data.sections.length - 1);
        let nextOrder = maxOrder + 1;
        DEFAULT_SECTION_TYPES.forEach((type) => {
          if (!existing.has(type)) {
            // Remove legacy 'categories' if present; skip it in defaults
            if (type === 'categories') return;
            data.sections.push({ type, enabled: true, order: nextOrder++ });
          }
        });
        // Disable legacy categories section
        data.sections = data.sections.map((s: any) =>
          s.type === 'categories' ? { ...s, enabled: false } : s
        );
        data.sections.forEach((s: any, i: number) => { if (s.order == null) s.order = i; });
      } else if (data && !data.sections) {
        data.sections = DEFAULT_SECTION_TYPES.map((type, i) => ({ type, enabled: true, order: i }));
      }

      setSettings(data);
      setCategories((catRes.data || []).map((c: any) => ({ _id: c.slug || c._id, name: c.name })));
    } catch (error) {
      console.error('Error fetching home settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateHomeSettings(settings);
      setSettings(res.data);
      alert('Home page settings saved!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === 'unauthenticated' || !isAdmin) return null;

  // ===== SECTION ORDER EDITOR =====
  const renderSectionsTab = () => {
    const sections = settings?.sections || [];
    const moveSection = (index: number, dir: number) => {
      const newSections = [...sections];
      const target = index + dir;
      if (target < 0 || target >= newSections.length) return;
      [newSections[index], newSections[target]] = [newSections[target], newSections[index]];
      newSections.forEach((s: any, i: number) => s.order = i);
      setSettings({ ...settings, sections: newSections });
    };
    const toggleSection = (index: number) => {
      const newSections = [...sections];
      newSections[index] = { ...newSections[index], enabled: !newSections[index].enabled };
      setSettings({ ...settings, sections: newSections });
    };
    return (
      <div>
        <p className="text-sm text-gray-600 mb-4">Drag sections to reorder. Toggle visibility with the switch.</p>
        <div className="space-y-2">
          {sections.sort((a: any, b: any) => a.order - b.order).map((section: any, index: number) => (
            <div key={section.type} className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex flex-col gap-1">
                <button onClick={() => moveSection(index, -1)} disabled={index === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              <span className="flex-1 font-medium">{SECTION_LABELS[section.type] || section.type}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={section.enabled} onChange={() => toggleSection(index)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===== HERO EDITOR =====
  const renderHeroTab = () => {
    const slides = settings?.hero?.slides || [];
    const updateSlide = (index: number, field: string, value: string) => {
      const newSlides = [...slides];
      newSlides[index] = { ...newSlides[index], [field]: value };
      setSettings({ ...settings, hero: { ...settings.hero, slides: newSlides } });
    };
    const addSlide = () => {
      setSettings({ ...settings, hero: { ...settings.hero, slides: [...slides, { image: '', title: '', subtitle: '', buttonText: 'Shop Now', buttonLink: '/shop' }] } });
    };
    const removeSlide = (index: number) => {
      if (slides.length <= 1) { alert('At least one slide is required.'); return; }
      const newSlides = slides.filter((_: any, i: number) => i !== index);
      setSettings({ ...settings, hero: { ...settings.hero, slides: newSlides } });
    };
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">Manage hero banner slides.</p>
          <button onClick={addSlide} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">+ Add Slide</button>
        </div>
        <div className="space-y-6">
          {slides.map((slide: any, index: number) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Slide {index + 1}</h4>
                <button onClick={() => removeSlide(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
              </div>
              <div className="grid gap-3">
                <ImageUploader value={slide.image} onChange={(url) => updateSlide(index, 'image', url)} label="Background Image" folder="home/hero" hint="1920×1080px (16:9 landscape, JPG/WEBP)" />
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input type="text" value={slide.title || ''} onChange={(e) => updateSlide(index, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subtitle</label>
                  <input type="text" value={slide.subtitle || ''} onChange={(e) => updateSlide(index, 'subtitle', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Button Text</label>
                    <input type="text" value={slide.buttonText || ''} onChange={(e) => updateSlide(index, 'buttonText', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Button Link</label>
                    <input type="text" value={slide.buttonLink || ''} onChange={(e) => updateSlide(index, 'buttonLink', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===== CLIENTS EDITOR =====
  const renderClientsTab = () => {
    const clients = settings?.clients || { title: '', logos: [] };
    const updateClient = (index: number, field: string, value: string) => {
      const newLogos = [...clients.logos];
      newLogos[index] = { ...newLogos[index], [field]: value };
      setSettings({ ...settings, clients: { ...clients, logos: newLogos } });
    };
    const addClient = () => {
      setSettings({ ...settings, clients: { ...clients, logos: [...clients.logos, { name: '', image: '' }] } });
    };
    const removeClient = (index: number) => {
      setSettings({ ...settings, clients: { ...clients, logos: clients.logos.filter((_: any, i: number) => i !== index) } });
    };
    return (
      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Section Title</label>
          <input type="text" value={clients.title || ''} onChange={(e) => setSettings({ ...settings, clients: { ...clients, title: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        </div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">Client logos shown in the carousel.</p>
          <button onClick={addClient} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">+ Add Logo</button>
        </div>
        <div className="space-y-4">
          {clients.logos.map((logo: any, index: number) => (
            <div key={index} className="flex gap-3 items-start p-3 border border-gray-200 rounded-lg bg-white">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Name</label>
                  <input type="text" value={logo.name || ''} onChange={(e) => updateClient(index, 'name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <ImageUploader value={logo.image} onChange={(url) => updateClient(index, 'image', url)} label="Logo" folder="home/clients" hint="400×160px (transparent PNG preferred)" />
              </div>
              <button onClick={() => removeClient(index)} className="text-red-500 hover:text-red-700 text-sm mt-6">Remove</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===== COLLECTIONS EDITOR =====
  const renderCollectionsTab = () => {
    const coll = settings?.collections || { title: '', subtitle: '', items: [] };
    const updateCollection = (index: number, field: string, value: any) => {
      const newItems = [...coll.items];
      newItems[index] = { ...newItems[index], [field]: value };
      setSettings({ ...settings, collections: { ...coll, items: newItems } });
    };
    const addCollection = () => {
      setSettings({ ...settings, collections: { ...coll, items: [...coll.items, { title: '', description: '', image: '', itemCount: 0, link: '/shop' }] } });
    };
    const removeCollection = (index: number) => {
      setSettings({ ...settings, collections: { ...coll, items: coll.items.filter((_: any, i: number) => i !== index) } });
    };
    return (
      <div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Section Title</label>
            <input type="text" value={coll.title || ''} onChange={(e) => setSettings({ ...settings, collections: { ...coll, title: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input type="text" value={coll.subtitle || ''} onChange={(e) => setSettings({ ...settings, collections: { ...coll, subtitle: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">Featured collection cards.</p>
          <button onClick={addCollection} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">+ Add Collection</button>
        </div>
        <div className="space-y-4">
          {coll.items.map((item: any, index: number) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Collection {index + 1}</h4>
                <button onClick={() => removeCollection(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
              </div>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input type="text" value={item.title || ''} onChange={(e) => updateCollection(index, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Item Count</label>
                    <input type="number" value={item.itemCount || 0} onChange={(e) => updateCollection(index, 'itemCount', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input type="text" value={item.description || ''} onChange={(e) => updateCollection(index, 'description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <ImageUploader value={item.image} onChange={(url) => updateCollection(index, 'image', url)} label="Image" folder="home/collections" hint="1920×800px (wide landscape, JPG/WEBP)" />
                <div>
                  <label className="block text-sm font-medium mb-1">Link</label>
                  <input type="text" value={item.link || ''} onChange={(e) => updateCollection(index, 'link', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===== PRODUCT SECTIONS EDITOR =====
  const renderProductsTab = () => {
    const ps = settings?.productSections || { bestSellers: {}, newArrivals: {}, categoryProducts: [] };
    const updatePS = (field: string, value: any) => {
      setSettings({ ...settings, productSections: { ...ps, [field]: value } });
    };
    const addCategorySection = () => {
      const newCat = { category: '', categoryName: '', title: '', subtitle: '', limit: 8, enabled: true };
      updatePS('categoryProducts', [...(ps.categoryProducts || []), newCat]);
    };
    const updateCategorySection = (index: number, field: string, value: any) => {
      const newCats = [...(ps.categoryProducts || [])];
      newCats[index] = { ...newCats[index], [field]: value };
      if (field === 'category') {
        const cat = categories.find((c: any) => c._id === value);
        if (cat) newCats[index].categoryName = cat.name;
        if (!newCats[index].title) newCats[index].title = cat?.name || '';
      }
      updatePS('categoryProducts', newCats);
    };
    const removeCategorySection = (index: number) => {
      updatePS('categoryProducts', (ps.categoryProducts || []).filter((_: any, i: number) => i !== index));
    };

    return (
      <div className="space-y-8">
        {/* Best Sellers */}
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-lg">Best Sellers</h4>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={ps.bestSellers?.enabled ?? true} onChange={(e) => updatePS('bestSellers', { ...ps.bestSellers, enabled: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" value={ps.bestSellers?.title || ''} onChange={(e) => updatePS('bestSellers', { ...ps.bestSellers, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Product Limit</label>
              <input type="number" value={ps.bestSellers?.limit || 8} onChange={(e) => updatePS('bestSellers', { ...ps.bestSellers, limit: parseInt(e.target.value) || 8 })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input type="text" value={ps.bestSellers?.subtitle || ''} onChange={(e) => updatePS('bestSellers', { ...ps.bestSellers, subtitle: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
        </div>

        {/* New Arrivals */}
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-lg">New Arrivals</h4>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={ps.newArrivals?.enabled ?? true} onChange={(e) => updatePS('newArrivals', { ...ps.newArrivals, enabled: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" value={ps.newArrivals?.title || ''} onChange={(e) => updatePS('newArrivals', { ...ps.newArrivals, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Product Limit</label>
              <input type="number" value={ps.newArrivals?.limit || 8} onChange={(e) => updatePS('newArrivals', { ...ps.newArrivals, limit: parseInt(e.target.value) || 8 })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input type="text" value={ps.newArrivals?.subtitle || ''} onChange={(e) => updatePS('newArrivals', { ...ps.newArrivals, subtitle: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
        </div>

        {/* Category Product Sections */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-lg">Category Product Sections</h4>
            <button onClick={addCategorySection} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">+ Add Category Section</button>
          </div>
          <p className="text-sm text-gray-600 mb-4">Show products from specific categories on the homepage.</p>
          <div className="space-y-4">
            {(ps.categoryProducts || []).map((cp: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium">Category Section {index + 1}</h5>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={cp.enabled ?? true} onChange={(e) => updateCategorySection(index, 'enabled', e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                    <button onClick={() => removeCategorySection(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select value={cp.category || ''} onChange={(e) => updateCategorySection(index, 'category', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value="">Select category...</option>
                      {categories.map((cat: any) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Product Limit</label>
                    <input type="number" value={cp.limit || 8} onChange={(e) => updateCategorySection(index, 'limit', parseInt(e.target.value) || 8)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input type="text" value={cp.title || ''} onChange={(e) => updateCategorySection(index, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <input type="text" value={cp.subtitle || ''} onChange={(e) => updateCategorySection(index, 'subtitle', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ===== TESTIMONIALS EDITOR =====
  const renderTestimonialsTab = () => {
    const t = settings?.testimonials || { title: '', description: '', items: [] };
    const updateTestimonial = (index: number, field: string, value: string) => {
      const newItems = [...t.items];
      newItems[index] = { ...newItems[index], [field]: value };
      setSettings({ ...settings, testimonials: { ...t, items: newItems } });
    };
    const addTestimonial = () => {
      setSettings({ ...settings, testimonials: { ...t, items: [...t.items, { name: '', handle: '', avatar: '', text: '' }] } });
    };
    const removeTestimonial = (index: number) => {
      setSettings({ ...settings, testimonials: { ...t, items: t.items.filter((_: any, i: number) => i !== index) } });
    };
    return (
      <div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Section Title</label>
            <input type="text" value={t.title || ''} onChange={(e) => setSettings({ ...settings, testimonials: { ...t, title: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input type="text" value={t.description || ''} onChange={(e) => setSettings({ ...settings, testimonials: { ...t, description: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">Customer testimonials.</p>
          <button onClick={addTestimonial} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">+ Add Testimonial</button>
        </div>
        <div className="space-y-4">
          {t.items.map((item: any, index: number) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Testimonial {index + 1}</h4>
                <button onClick={() => removeTestimonial(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
              </div>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input type="text" value={item.name || ''} onChange={(e) => updateTestimonial(index, 'name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Handle</label>
                    <input type="text" value={item.handle || ''} onChange={(e) => updateTestimonial(index, 'handle', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
                <ImageUploader value={item.avatar} onChange={(url) => updateTestimonial(index, 'avatar', url)} label="Avatar" folder="home/testimonials" hint="200×200px (square, face photo)" />
                <div>
                  <label className="block text-sm font-medium mb-1">Testimonial Text</label>
                  <textarea value={item.text || ''} onChange={(e) => updateTestimonial(index, 'text', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===== BRAND STORY EDITOR =====
  const renderBrandStoryTab = () => {
    const bs = settings?.brandStory || { title: '', image: '', paragraphs: [], stats: [] };
    const updateParagraph = (index: number, value: string) => {
      const newP = [...bs.paragraphs];
      newP[index] = value;
      setSettings({ ...settings, brandStory: { ...bs, paragraphs: newP } });
    };
    const addParagraph = () => {
      setSettings({ ...settings, brandStory: { ...bs, paragraphs: [...bs.paragraphs, ''] } });
    };
    const removeParagraph = (index: number) => {
      setSettings({ ...settings, brandStory: { ...bs, paragraphs: bs.paragraphs.filter((_: any, i: number) => i !== index) } });
    };
    const updateStat = (index: number, field: string, value: string) => {
      const newStats = [...bs.stats];
      newStats[index] = { ...newStats[index], [field]: value };
      setSettings({ ...settings, brandStory: { ...bs, stats: newStats } });
    };
    const addStat = () => {
      setSettings({ ...settings, brandStory: { ...bs, stats: [...bs.stats, { value: '', label: '' }] } });
    };
    const removeStat = (index: number) => {
      setSettings({ ...settings, brandStory: { ...bs, stats: bs.stats.filter((_: any, i: number) => i !== index) } });
    };
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Section Title</label>
          <input type="text" value={bs.title || ''} onChange={(e) => setSettings({ ...settings, brandStory: { ...bs, title: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        </div>
        <ImageUploader value={bs.image} onChange={(url) => setSettings({ ...settings, brandStory: { ...bs, image: url } })} label="Story Image" folder="home/story" hint="800×600px (portrait or square, JPG/WEBP)" />

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Paragraphs</label>
            <button onClick={addParagraph} className="text-sm text-green-600 hover:text-green-700">+ Add Paragraph</button>
          </div>
          <div className="space-y-3">
            {bs.paragraphs.map((p: string, index: number) => (
              <div key={index} className="flex gap-2">
                <textarea value={p} onChange={(e) => updateParagraph(index, e.target.value)} rows={3} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
                <button onClick={() => removeParagraph(index)} className="text-red-500 hover:text-red-700 text-sm self-start mt-2">Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Statistics</label>
            <button onClick={addStat} className="text-sm text-green-600 hover:text-green-700">+ Add Stat</button>
          </div>
          <div className="space-y-3">
            {bs.stats.map((stat: any, index: number) => (
              <div key={index} className="flex gap-3 items-center">
                <input type="text" value={stat.value || ''} onChange={(e) => updateStat(index, 'value', e.target.value)} placeholder="e.g. 15+" className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm" />
                <input type="text" value={stat.label || ''} onChange={(e) => updateStat(index, 'label', e.target.value)} placeholder="e.g. Years Experience" className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
                <button onClick={() => removeStat(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ===== BENEFITS EDITOR =====
  const renderBenefitsTab = () => {
    const b = settings?.benefits || { title: '', subtitle: '', items: [] };
    const updateBenefit = (index: number, field: string, value: string) => {
      const newItems = [...b.items];
      newItems[index] = { ...newItems[index], [field]: value };
      setSettings({ ...settings, benefits: { ...b, items: newItems } });
    };
    const addBenefit = () => {
      setSettings({ ...settings, benefits: { ...b, items: [...b.items, { icon: 'check', title: '', description: '' }] } });
    };
    const removeBenefit = (index: number) => {
      setSettings({ ...settings, benefits: { ...b, items: b.items.filter((_: any, i: number) => i !== index) } });
    };
    return (
      <div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Section Title</label>
            <input type="text" value={b.title || ''} onChange={(e) => setSettings({ ...settings, benefits: { ...b, title: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input type="text" value={b.subtitle || ''} onChange={(e) => setSettings({ ...settings, benefits: { ...b, subtitle: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">Benefits / Why Shop With Us items.</p>
          <button onClick={addBenefit} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">+ Add Benefit</button>
        </div>
        <div className="space-y-4">
          {b.items.map((item: any, index: number) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Benefit {index + 1}</h4>
                <button onClick={() => removeBenefit(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
              </div>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Icon</label>
                    <select value={item.icon || 'check'} onChange={(e) => updateBenefit(index, 'icon', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      {BENEFIT_ICONS.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input type="text" value={item.title || ''} onChange={(e) => updateBenefit(index, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input type="text" value={item.description || ''} onChange={(e) => updateBenefit(index, 'description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===== CATEGORY SLIDER EDITOR =====
  const renderCategorySliderTab = () => {
    const cs = settings?.categorySlider || { title: '', categories: [] };
    const updateCategory = (catIdx: number, field: string, value: any) => {
      const newCats = [...(cs.categories || [])];
      newCats[catIdx] = { ...newCats[catIdx], [field]: value };
      setSettings({ ...settings, categorySlider: { ...cs, categories: newCats } });
    };
    const updateSubcategory = (catIdx: number, subIdx: number, field: string, value: string) => {
      const newCats = [...(cs.categories || [])];
      const newSubs = [...(newCats[catIdx]?.subcategories || [])];
      newSubs[subIdx] = { ...newSubs[subIdx], [field]: value };
      newCats[catIdx] = { ...newCats[catIdx], subcategories: newSubs };
      setSettings({ ...settings, categorySlider: { ...cs, categories: newCats } });
    };
    const addCategory = () => {
      setSettings({ ...settings, categorySlider: { ...cs, categories: [...(cs.categories || []), { name: '', subcategories: [] }] } });
    };
    const removeCategory = (catIdx: number) => {
      setSettings({ ...settings, categorySlider: { ...cs, categories: (cs.categories || []).filter((_: any, i: number) => i !== catIdx) } });
    };
    const addSubcategory = (catIdx: number) => {
      const newCats = [...(cs.categories || [])];
      newCats[catIdx] = { ...newCats[catIdx], subcategories: [...(newCats[catIdx]?.subcategories || []), { name: '', image: '', link: '/shop' }] };
      setSettings({ ...settings, categorySlider: { ...cs, categories: newCats } });
    };
    const removeSubcategory = (catIdx: number, subIdx: number) => {
      const newCats = [...(cs.categories || [])];
      newCats[catIdx] = { ...newCats[catIdx], subcategories: (newCats[catIdx]?.subcategories || []).filter((_: any, i: number) => i !== subIdx) };
      setSettings({ ...settings, categorySlider: { ...cs, categories: newCats } });
    };
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Section Title</label>
          <input type="text" value={cs.title || ''} onChange={(e) => setSettings({ ...settings, categorySlider: { ...cs, title: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="How can we help you?" />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Category tabs and their subcategory images.</p>
          <button onClick={addCategory} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">+ Add Category Tab</button>
        </div>
        {(cs.categories || []).map((cat: any, catIdx: number) => (
          <div key={catIdx} className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex justify-between items-center mb-3">
              <div className="flex-1 mr-3">
                <label className="block text-xs font-medium mb-1">Tab Name</label>
                <input type="text" value={cat.name || ''} onChange={(e) => updateCategory(catIdx, 'name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <button onClick={() => removeCategory(catIdx)} className="text-red-500 hover:text-red-700 text-sm mt-4">Remove Tab</button>
            </div>
            <div className="space-y-3 ml-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">Subcategories:</p>
                <button onClick={() => addSubcategory(catIdx)} className="text-xs text-green-600 hover:text-green-700">+ Add Subcategory</button>
              </div>
              {(cat.subcategories || []).map((sub: any, subIdx: number) => (
                <div key={subIdx} className="flex gap-3 items-start p-3 bg-gray-50 rounded border border-gray-100">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Name</label>
                      <input type="text" value={sub.name || ''} onChange={(e) => updateSubcategory(catIdx, subIdx, 'name', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Link</label>
                      <input type="text" value={sub.link || ''} onChange={(e) => updateSubcategory(catIdx, subIdx, 'link', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs" placeholder="/shop" />
                    </div>
                    <ImageUploader value={sub.image} onChange={(url) => updateSubcategory(catIdx, subIdx, 'image', url)} label="Image" folder="home/category-slider" hint="720×480px (3:2 landscape card)" />
                  </div>
                  <button onClick={() => removeSubcategory(catIdx, subIdx)} className="text-red-500 hover:text-red-700 text-xs mt-5">✕</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ===== PHOTO GRID EDITOR =====
  const renderPhotoGridTab = () => {
    const pg = settings?.photoGrid || { title: '', photos: [] };
    const updatePhoto = (index: number, field: string, value: any) => {
      const newPhotos = [...(pg.photos || [])];
      newPhotos[index] = { ...newPhotos[index], [field]: value };
      setSettings({ ...settings, photoGrid: { ...pg, photos: newPhotos } });
    };
    const addPhoto = () => {
      setSettings({ ...settings, photoGrid: { ...pg, photos: [...(pg.photos || []), { image: '', label: '', link: '/shop', showInstagramIcon: true }] } });
    };
    const removePhoto = (index: number) => {
      setSettings({ ...settings, photoGrid: { ...pg, photos: (pg.photos || []).filter((_: any, i: number) => i !== index) } });
    };
    return (
      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Section Title</label>
          <input type="text" value={pg.title || ''} onChange={(e) => setSettings({ ...settings, photoGrid: { ...pg, title: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="In Everyday Living" />
        </div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">Photo grid (5-6 photos). The 3rd photo spans 2 rows.</p>
          <button onClick={addPhoto} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">+ Add Photo</button>
        </div>
        <div className="space-y-4">
          {(pg.photos || []).map((photo: any, index: number) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-sm">Photo {index + 1}{index === 2 ? ' (Tall — spans 2 rows)' : ''}</h4>
                <button onClick={() => removePhoto(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ImageUploader value={photo.image} onChange={(url) => updatePhoto(index, 'image', url)} label="Image" folder="home/photo-grid" hint="800×800px (square) or 800×600px (landscape)" />
                <div>
                  <label className="block text-sm font-medium mb-1">Label (optional)</label>
                  <input type="text" value={photo.label || ''} onChange={(e) => updatePhoto(index, 'label', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Link</label>
                  <input type="text" value={photo.link || ''} onChange={(e) => updatePhoto(index, 'link', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="/shop" />
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <input type="checkbox" id={`ig-${index}`} checked={photo.showInstagramIcon ?? true} onChange={(e) => updatePhoto(index, 'showInstagramIcon', e.target.checked)} className="w-4 h-4" />
                  <label htmlFor={`ig-${index}`} className="text-sm">Show Instagram icon</label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===== PROMO CARDS EDITOR =====
  const renderPromoCardsTab = () => {
    const pc = settings?.promoCards || { cards: [] };
    const updateCard = (index: number, field: string, value: string) => {
      const newCards = [...(pc.cards || [])];
      newCards[index] = { ...newCards[index], [field]: value };
      setSettings({ ...settings, promoCards: { ...pc, cards: newCards } });
    };
    const addCard = () => {
      setSettings({ ...settings, promoCards: { ...pc, cards: [...(pc.cards || []), { category: '', title: '', buttonText: 'Book a consultation', buttonLink: '/contact', image: '', note: '' }] } });
    };
    const removeCard = (index: number) => {
      setSettings({ ...settings, promoCards: { ...pc, cards: (pc.cards || []).filter((_: any, i: number) => i !== index) } });
    };
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">Two tall promo cards with frosted glass text overlay.</p>
          <button onClick={addCard} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">+ Add Card</button>
        </div>
        <div className="space-y-4">
          {(pc.cards || []).map((card: any, index: number) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Card {index + 1}</h4>
                <button onClick={() => removeCard(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
              </div>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category Label (small text)</label>
                    <input type="text" value={card.category || ''} onChange={(e) => updateCard(index, 'category', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="e.g. Modular Kitchens" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Headline</label>
                    <input type="text" value={card.title || ''} onChange={(e) => updateCard(index, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="e.g. Looking for a new kitchen?" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Button Text</label>
                    <input type="text" value={card.buttonText || ''} onChange={(e) => updateCard(index, 'buttonText', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Button Link</label>
                    <input type="text" value={card.buttonLink || ''} onChange={(e) => updateCard(index, 'buttonLink', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="/contact" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Note (optional small text below button)</label>
                  <input type="text" value={card.note || ''} onChange={(e) => updateCard(index, 'note', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="e.g. Available in your city" />
                </div>
                <ImageUploader value={card.image} onChange={(url) => updateCard(index, 'image', url)} label="Background Image" folder="home/promo-cards" hint="800×1000px (portrait, tall card)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===== STATS BANNER EDITOR =====
  const renderStatsBannerTab = () => {
    const sb = settings?.statsBanner || { title: '', subtitle: '', bgColor: '#f05a54', stats: [] };
    const updateStat = (index: number, field: string, value: string) => {
      const newStats = [...(sb.stats || [])];
      newStats[index] = { ...newStats[index], [field]: value };
      setSettings({ ...settings, statsBanner: { ...sb, stats: newStats } });
    };
    const addStat = () => {
      setSettings({ ...settings, statsBanner: { ...sb, stats: [...(sb.stats || []), { value: '', label: '' }] } });
    };
    const removeStat = (index: number) => {
      setSettings({ ...settings, statsBanner: { ...sb, stats: (sb.stats || []).filter((_: any, i: number) => i !== index) } });
    };
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" value={sb.title || ''} onChange={(e) => setSettings({ ...settings, statsBanner: { ...sb, title: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="e.g. Our Brand for India" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input type="text" value={sb.subtitle || ''} onChange={(e) => setSettings({ ...settings, statsBanner: { ...sb, subtitle: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="e.g. Providing comfort and style for modern living" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Background Color</label>
          <div className="flex gap-3 items-center">
            <input type="color" value={sb.bgColor || '#f05a54'} onChange={(e) => setSettings({ ...settings, statsBanner: { ...sb, bgColor: e.target.value } })} className="w-10 h-10 rounded cursor-pointer border border-gray-300" />
            <input type="text" value={sb.bgColor || '#f05a54'} onChange={(e) => setSettings({ ...settings, statsBanner: { ...sb, bgColor: e.target.value } })} className="w-40 px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium">Stats</label>
            <button onClick={addStat} className="text-sm text-green-600 hover:text-green-700">+ Add Stat</button>
          </div>
          <div className="space-y-3">
            {(sb.stats || []).map((stat: any, index: number) => (
              <div key={index} className="flex gap-3 items-center">
                <input type="text" value={stat.value || ''} onChange={(e) => updateStat(index, 'value', e.target.value)} placeholder="e.g. 30+" className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm" />
                <input type="text" value={stat.label || ''} onChange={(e) => updateStat(index, 'label', e.target.value)} placeholder="e.g. Products launched every year" className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
                <button onClick={() => removeStat(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sections': return renderSectionsTab();
      case 'hero': return renderHeroTab();
      case 'clients': return renderClientsTab();
      case 'categorySlider': return renderCategorySliderTab();
      case 'collections': return renderCollectionsTab();
      case 'photoGrid': return renderPhotoGridTab();
      case 'promoCards': return renderPromoCardsTab();
      case 'statsBanner': return renderStatsBannerTab();
      case 'products': return renderProductsTab();
      case 'testimonials': return renderTestimonialsTab();
      case 'brandStory': return renderBrandStoryTab();
      case 'benefits': return renderBenefitsTab();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/admin" className="text-accent hover:text-secondary text-sm mb-2 inline-block">&larr; Back to Dashboard</Link>
            <h1 className="text-3xl font-bold">Home Page Settings</h1>
          </div>
          <button onClick={handleSave} disabled={saving} className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${saving ? 'bg-gray-400' : 'bg-accent hover:bg-secondary'}`}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Tabs */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-accent text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-6">
            {renderTabContent()}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

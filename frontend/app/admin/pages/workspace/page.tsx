'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { uploadSingleImage, deleteFile } from '@/services/uploadService';
import { useAuthState } from '@/hooks/useAuthState';
import api from '@/services/api';

const PAGE_SLUG = 'business-workspace';
const PAGE_TITLE = 'Workspace';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (match?.[1]) return match[1].replace(/\.[^.]+$/, '');
  } catch {}
  return null;
}
async function deleteOldImage(url: string) {
  const pid = extractCloudinaryPublicId(url);
  if (pid) try { await deleteFile(pid, 'image'); } catch {}
}

// ─── ImageUploader ────────────────────────────────────────────────────────────

function ImageUploader({ value, onChange, label, folder = 'pages' }: { value: string; onChange: (url: string) => void; label: string; folder?: string }) {
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      if (value) await deleteOldImage(value);
      const result = await uploadSingleImage(file, folder);
      onChange(result.data.url);
    } catch { alert('Image upload failed.'); }
    finally { setUploading(false); }
  };
  const handleRemove = async () => {
    if (value) await deleteOldImage(value);
    onChange('');
  };
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2 items-start flex-wrap">
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Image URL or upload" className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
        <label className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors whitespace-nowrap ${uploading ? 'bg-gray-300 text-gray-500' : 'bg-accent text-white hover:bg-secondary'}`}>
          {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
        {value && <button onClick={handleRemove} className="px-3 py-2 text-sm rounded-md bg-red-50 text-red-600 hover:bg-red-100">Remove</button>}
      </div>
      {value && <img src={value} alt="Preview" className="mt-2 h-24 w-auto rounded object-cover border border-gray-200" />}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, value, onChange, textarea = false, placeholder = '', hint = '' }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; placeholder?: string; hint?: string }) {
  const cls = 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent';
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {textarea ? (
        <textarea rows={3} className={cls} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input type="text" className={cls} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Default section templates ────────────────────────────────────────────────

const DEFAULT_SECTIONS: Record<string, any> = {
  hero: {
    sectionId: 'hero', type: 'hero', bgColor: 'dark', order: 0, isVisible: true,
    title: '', subtitle: '',
    description: 'Premium office and workspace furniture that enhances productivity, promotes ergonomic well-being, and elevates the aesthetics of every professional environment.',
    link: '#just-arrived', linkText: 'Explore Products',
    secondaryLink: '/contact', secondaryLinkText: 'Request a Quote',
    image: '', items: [],
  },
  'text-highlight': {
    sectionId: 'text-highlight', type: 'content', bgColor: 'light', order: 1, isVisible: true,
    title: 'Highlight Text',
    description: 'Our workspace furniture solutions create productive, comfortable environments that inspire creativity and collaboration — for offices of every scale, from startups to enterprise.',
    image: '', items: [],
  },
  placeholder: {
    sectionId: 'placeholder', type: 'content', bgColor: 'white', order: 2, isVisible: false,
    title: '', description: '', image: '', link: '', linkText: '', items: [],
  },
  'just-arrived': {
    sectionId: 'just-arrived', type: 'custom', bgColor: 'white', order: 3, isVisible: true,
    title: 'Just arrived',
    description: 'for-business/workspace',
    link: '/products', linkText: 'View all products',
    image: '', items: [],
  },
  'ideas-section': {
    sectionId: 'ideas-section', type: 'cards', bgColor: 'white', order: 4, isVisible: true,
    title: 'Ideas for modern workspaces',
    link: '/industries', linkText: 'Explore all',
    image: '', description: '',
    items: [
      {
        title: 'Designing the Modern Office for 2025',
        description: 'Hybrid work has redefined what offices need to be. Flexible seating, collaborative zones, and height-adjustable desks are driving the next generation of workplaces.',
        image: '',
        link: '/industries',
        linkText: 'Read more',
        icon: 'Workspace',
        stats: '7 mins read',
        statsLabel: '',
      },
    ],
  },
};

// ─── Idea Item Editor ─────────────────────────────────────────────────────────

function IdeaItemEditor({ item, idx, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: { item: any; idx: number; onChange: (updated: any) => void; onRemove: () => void; onMoveUp: () => void; onMoveDown: () => void; isFirst: boolean; isLast: boolean }) {
  const set = (key: string, val: string) => onChange({ ...item, [key]: val });
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Idea #{idx + 1}</span>
        <div className="flex gap-1">
          <button onClick={onMoveUp} disabled={isFirst} className="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40">↑</button>
          <button onClick={onMoveDown} disabled={isLast} className="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40">↓</button>
          <button onClick={onRemove} className="px-2 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200">Remove</button>
        </div>
      </div>
      <Field label="Title" value={item.title || ''} onChange={(v) => set('title', v)} placeholder="e.g. Designing the Modern Office for 2025" />
      <Field label="Description" value={item.description || ''} onChange={(v) => set('description', v)} textarea placeholder="Article description / excerpt..." />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category label" value={item.icon || ''} onChange={(v) => set('icon', v)} placeholder="e.g. Workspace" />
        <Field label="Read time" value={item.stats || ''} onChange={(v) => set('stats', v)} placeholder="e.g. 7 mins read" />
      </div>
      <Field label="Link URL" value={item.link || ''} onChange={(v) => set('link', v)} placeholder="/industries/workspace" />
      <Field label="Button label" value={item.linkText || ''} onChange={(v) => set('linkText', v)} placeholder="Read more" />
      <ImageUploader label="Article image" value={item.image || ''} onChange={(v) => set('image', v)} folder="workspace" />
    </div>
  );
}

// ─── Visibility toggle ────────────────────────────────────────────────────────

function VisibilityToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <button type="button" onClick={() => onChange(!value)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-accent' : 'bg-gray-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
      <span className="text-sm text-gray-600">{value ? 'Visible on page' : 'Hidden'}</span>
    </div>
  );
}

// ─── Hero image grid (drag-and-drop multi-image upload) ──────────────────────

function HeroImageGrid({ section, onChangeImage, onChangeItems }: { section: any; onChangeImage: (url: string) => void; onChangeItems: (items: any[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const dragIdx = useRef<number | null>(null);

  const images: string[] = [
    ...(section.image ? [section.image as string] : []),
    ...((section.items || []).filter((i: any) => i.image).map((i: any) => i.image as string)),
  ];

  const commit = (newImages: string[]) => {
    onChangeImage(newImages[0] ?? '');
    onChangeItems(newImages.slice(1).map((url) => ({ image: url, title: '', description: '', link: '', stats: '', statsLabel: '' })));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const result = await uploadSingleImage(file, 'workspace');
        urls.push(result.data.url);
      }
      commit([...images, ...urls]);
    } catch { alert('Upload failed. Please try again.'); }
    finally { setUploading(false); }
  };

  const remove = async (i: number) => {
    await deleteOldImage(images[i]);
    commit(images.filter((_, idx) => idx !== i));
  };

  const onDragStart = (i: number) => { dragIdx.current = i; };
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    const reordered = [...images];
    const [moved] = reordered.splice(dragIdx.current, 1);
    reordered.splice(i, 0, moved);
    dragIdx.current = i;
    commit(reordered);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Slideshow Images <span className="text-xs font-normal text-gray-400">— drag to reorder, first image shown first</span>
        </label>
        <label className={`px-3 py-1.5 text-sm rounded-md cursor-pointer transition-colors ${uploading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-accent text-white hover:bg-secondary'}`}>
          {uploading ? 'Uploading…' : '+ Add Images'}
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      {images.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex items-center justify-center text-sm text-gray-400">
          No images yet — click "+ Add Images" to upload
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((url, i) => (
            <div
              key={url + i}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => onDragOver(e, i)}
              className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-accent cursor-grab active:cursor-grabbing aspect-video bg-gray-100"
            >
              {i === 0 && (
                <span className="absolute top-1 left-1 z-10 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded">MAIN</span>
              )}
              <img src={url} alt={`slide ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button type="button" onClick={() => remove(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center leading-none">×</button>
              <div className="absolute bottom-1 left-0 right-0 text-center">
                <span className="text-[10px] text-white/80 bg-black/40 px-1 rounded">{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hero tab ─────────────────────────────────────────────────────────────────

function HeroTab({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">The hero fills the full screen. Upload multiple images to create a slideshow — drag thumbnails to reorder.</p>
      <Field label="Headline" value={data.title || ''} onChange={(v) => set('title', v)} placeholder="Designed for Modern Workspaces" />
      <Field label="Sub-headline" value={data.subtitle || ''} onChange={(v) => set('subtitle', v)} placeholder="Optional tagline below headline" />
      <Field label="Description text" value={data.description || ''} onChange={(v) => set('description', v)} textarea placeholder="One or two sentences about workspace furniture..." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Field label="Primary button label" value={data.linkText || ''} onChange={(v) => set('linkText', v)} placeholder="Explore Products" />
          <Field label="Primary button link" value={data.link || ''} onChange={(v) => set('link', v)} placeholder="#just-arrived" />
        </div>
        <div className="space-y-2">
          <Field label="Secondary button label" value={data.secondaryLinkText || ''} onChange={(v) => set('secondaryLinkText', v)} placeholder="Request a Quote" />
          <Field label="Secondary button link" value={data.secondaryLink || ''} onChange={(v) => set('secondaryLink', v)} placeholder="/contact" />
        </div>
      </div>
      <div className="border-t pt-5">
        <HeroImageGrid
          section={data}
          onChangeImage={(v) => set('image', v)}
          onChangeItems={(items) => onChange({ ...data, items })}
        />
      </div>
      <VisibilityToggle value={data.isVisible ?? true} onChange={(v) => set('isVisible', v)} />
    </div>
  );
}

// ─── Highlight Text tab ───────────────────────────────────────────────────────

function HighlightTextTab({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">This section shows a large centered coral-coloured quote on a warm cream background.</p>
      <Field label="Highlight text" value={data.description || ''} onChange={(v) => set('description', v)} textarea placeholder="Our workspace furniture solutions create productive, comfortable environments..." hint="Keep it to 1–3 sentences. Displayed in large coral text." />
      <VisibilityToggle value={data.isVisible ?? true} onChange={(v) => set('isVisible', v)} />
    </div>
  );
}

// ─── Placeholder tab ──────────────────────────────────────────────────────────

function PlaceholderTab({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">Reserved section between highlight text and "Just arrived". Enable when ready.</p>
      <VisibilityToggle value={data.isVisible ?? false} onChange={(v) => set('isVisible', v)} />
      {data.isVisible && (
        <>
          <Field label="Title" value={data.title || ''} onChange={(v) => set('title', v)} />
          <Field label="Description" value={data.description || ''} onChange={(v) => set('description', v)} textarea />
          <ImageUploader label="Image (optional)" value={data.image || ''} onChange={(v) => set('image', v)} folder="workspace" />
          <Field label="Button label" value={data.linkText || ''} onChange={(v) => set('linkText', v)} />
          <Field label="Button link" value={data.link || ''} onChange={(v) => set('link', v)} />
          <div>
            <label className="block text-sm font-medium mb-1">Background colour</label>
            <select value={data.bgColor || 'white'} onChange={(e) => set('bgColor', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="white">White</option>
              <option value="light">Light (cream)</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Product Picker ───────────────────────────────────────────────────────────

function ProductPicker({ pinned, onAdd, onRemove }: { pinned: any[]; onAdd: (product: any) => void; onRemove: (ref: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get('/products', { params: { search: query.trim(), limit: 20 } });
        setResults(res.data?.data || res.data?.products || []);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const pinnedIds = new Set(pinned.map((p) => p._ref));
  const toggle = (p: any) => {
    if (pinnedIds.has(p._id)) onRemove(p._id);
    else onAdd({ _ref: p._id, title: p.name, image: p.images?.[0] || '', variant: p.variants?.[0]?.name || p.material || '' });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products by name…" className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
        <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </div>
      {query.trim() && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {searching ? (
            <p className="text-sm text-gray-400 px-3 py-3">Searching…</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-gray-400 px-3 py-3">No products found for "{query}".</p>
          ) : (
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
              {results.map((p) => {
                const isAdded = pinnedIds.has(p._id);
                return (
                  <div key={p._id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors">
                    <div className="flex-none w-10 h-10 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      {(p.variants?.[0]?.name || p.material) && <p className="text-xs text-gray-400">{p.variants?.[0]?.name || p.material}</p>}
                    </div>
                    <button onClick={() => toggle(p)} className={`flex-none text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${isAdded ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-accent text-white hover:bg-secondary'}`}>
                      {isAdded ? 'Remove' : '+ Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {pinned.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Pinned products ({pinned.length})</p>
          <div className="space-y-2">
            {pinned.map((item, i) => (
              <div key={item._ref || i} className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                <div className="flex-none w-9 h-9 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                  {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title || item._ref}</p>
                  {item.variant && <p className="text-xs text-gray-400">{item.variant}</p>}
                </div>
                <button onClick={() => onRemove(item._ref)} className="flex-none text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 font-semibold">Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Just Arrived tab ─────────────────────────────────────────────────────────

function JustArrivedTab({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  const pinned: any[] = (data.items || []).filter((i: any) => i._ref);
  const addPinned = (product: any) => {
    const items = [...(data.items || []).filter((i: any) => i._ref !== product._ref), product];
    onChange({ ...data, items });
  };
  const removePinned = (ref: string) => onChange({ ...data, items: (data.items || []).filter((i: any) => i._ref !== ref) });

  return (
    <div className="space-y-5">
      <Field label="Section title" value={data.title || ''} onChange={(v) => set('title', v)} placeholder="Just arrived" />
      <div className="border border-gray-200 rounded-lg p-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-700">Pinned products</p>
          <p className="text-xs text-gray-400 mt-0.5">Search and pick specific products to show. Pinned products take priority over the category path.</p>
        </div>
        <ProductPicker pinned={pinned} onAdd={addPinned} onRemove={removePinned} />
      </div>
      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-700">Auto-fetch by category</p>
          <p className="text-xs text-gray-400 mt-0.5">Used only when no pinned products are set. Enter the category slug path (e.g. <code className="bg-gray-100 px-1 rounded">for-business/workspace</code>).</p>
        </div>
        <Field label="Category path" value={data.description || ''} onChange={(v) => set('description', v)} placeholder="for-business/workspace" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label='"View all" button label' value={data.linkText || ''} onChange={(v) => set('linkText', v)} placeholder="View all products" />
        <Field label='"View all" button link' value={data.link || ''} onChange={(v) => set('link', v)} placeholder="/products" />
      </div>
      <VisibilityToggle value={data.isVisible ?? true} onChange={(v) => set('isVisible', v)} />
    </div>
  );
}

// ─── Ideas tab ────────────────────────────────────────────────────────────────

function IdeasTab({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  const items: any[] = data.items || [];

  const addItem = () => onChange({ ...data, items: [...items, { title: '', description: '', image: '', link: '', linkText: 'Read more', icon: 'Workspace', stats: '7 mins read', statsLabel: '' }] });
  const updateItem = (i: number, updated: any) => { const arr = [...items]; arr[i] = updated; onChange({ ...data, items: arr }); };
  const removeItem = (i: number) => onChange({ ...data, items: items.filter((_, idx) => idx !== i) });
  const moveUp = (i: number) => { if (i === 0) return; const arr = [...items]; [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; onChange({ ...data, items: arr }); };
  const moveDown = (i: number) => { if (i === items.length - 1) return; const arr = [...items]; [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; onChange({ ...data, items: arr }); };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">Each idea is an article card displayed alternating left/right.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Section heading" value={data.title || ''} onChange={(v) => set('title', v)} placeholder="Ideas for modern workspaces" />
        <Field label='"Explore all" button label' value={data.linkText || ''} onChange={(v) => set('linkText', v)} placeholder="Explore all" />
        <Field label='"Explore all" button link' value={data.link || ''} onChange={(v) => set('link', v)} placeholder="/industries" />
      </div>
      <VisibilityToggle value={data.isVisible ?? true} onChange={(v) => set('isVisible', v)} />
      <div className="border-t pt-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold">Articles / ideas ({items.length})</h4>
          <button onClick={addItem} className="text-xs px-3 py-1.5 bg-accent text-white rounded-md hover:bg-secondary">+ Add idea</button>
        </div>
        <div className="space-y-4">
          {items.map((item, i) => (
            <IdeaItemEditor key={i} item={item} idx={i} onChange={(updated) => updateItem(i, updated)} onRemove={() => removeItem(i)} onMoveUp={() => moveUp(i)} onMoveDown={() => moveDown(i)} isFirst={i === 0} isLast={i === items.length - 1} />
          ))}
          {items.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No ideas yet. Click "+ Add idea" to create the first one.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Settings tab ─────────────────────────────────────────────────────────────

function SettingsTab({ published, onToggle }: { published: boolean; onToggle: () => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-5 flex items-start gap-4">
        <div className="flex-1">
          <h4 className="font-semibold">Page visibility</h4>
          <p className="text-sm text-gray-500 mt-1">
            When published, the page is accessible at{' '}
            <code className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">/business/workspace</code>.
          </p>
        </div>
        <button onClick={onToggle} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
          {published ? 'Published' : 'Draft'}
        </button>
      </div>
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
        <strong>Tip:</strong> Remember to click <strong>Save all changes</strong> after making edits in any tab.
      </div>
    </div>
  );
}

// ─── Main admin page ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'hero', label: 'Hero' },
  { id: 'text-highlight', label: 'Highlight Text' },
  { id: 'placeholder', label: 'Placeholder' },
  { id: 'just-arrived', label: 'Just Arrived' },
  { id: 'ideas-section', label: 'Ideas' },
  { id: 'settings', label: 'Settings' },
];

export default function AdminWorkspacePage() {
  const router = useRouter();
  const { status, isAdmin } = useAuthState();

  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [sectionData, setSectionData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/sign-in'); return; }
    if (status === 'authenticated' && !isAdmin) { router.push('/'); return; }
    if (status === 'authenticated' && isAdmin) loadPage();
  }, [status, isAdmin]);

  const loadPage = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/pages/${PAGE_SLUG}/admin`);
      const page = res.data?.data;
      if (page) {
        setIsPublished(page.isPublished ?? true);
        const map: Record<string, any> = {};
        (page.sections || []).forEach((s: any) => { map[s.sectionId] = s; });
        Object.keys(DEFAULT_SECTIONS).forEach((key) => { if (!map[key]) map[key] = { ...DEFAULT_SECTIONS[key] }; });
        setSectionData(map);
      } else {
        const defaults: Record<string, any> = {};
        Object.keys(DEFAULT_SECTIONS).forEach((k) => { defaults[k] = { ...DEFAULT_SECTIONS[k] }; });
        setSectionData(defaults);
      }
    } catch {
      const defaults: Record<string, any> = {};
      Object.keys(DEFAULT_SECTIONS).forEach((k) => { defaults[k] = { ...DEFAULT_SECTIONS[k] }; });
      setSectionData(defaults);
    } finally {
      setLoading(false);
    }
  };

  const updateSection = (id: string, data: any) => { setSectionData((prev) => ({ ...prev, [id]: data })); setSaved(false); };

  const saveAll = async () => {
    setSaving(true);
    try {
      const sections = Object.values(sectionData).map((s, i) => ({ ...s, order: s.order ?? i }));
      try {
        await api.put(`/pages/${PAGE_SLUG}`, { title: PAGE_TITLE, isPublished, sections });
      } catch (err: any) {
        if (err?.response?.status === 404) {
          await api.post('/pages', { slug: PAGE_SLUG, title: PAGE_TITLE, description: 'Workspace furniture solutions page', isPublished, sections });
        } else { throw err; }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded" />)}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) return null;

  const sec = (id: string) => sectionData[id] || DEFAULT_SECTIONS[id] || {};

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/admin" className="hover:text-gray-800">Dashboard</Link>
          <span>/</span>
          <Link href="/admin/pages" className="hover:text-gray-800">Pages</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Workspace</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Workspace Page</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manages content at{' '}
              <Link href="/business/workspace" target="_blank" className="text-accent underline underline-offset-2">
                /business/workspace ↗
              </Link>
            </p>
          </div>
          <button onClick={saveAll} disabled={saving} className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm ${saved ? 'bg-green-500 text-white' : saving ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-accent hover:bg-secondary text-white'}`}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save all changes'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-6 pb-1 border-b border-gray-200">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-md transition-colors ${activeTab === tab.id ? 'bg-white border border-gray-200 border-b-white text-accent' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
          {activeTab === 'hero' && <HeroTab data={sec('hero')} onChange={(d) => updateSection('hero', d)} />}
          {activeTab === 'text-highlight' && <HighlightTextTab data={sec('text-highlight')} onChange={(d) => updateSection('text-highlight', d)} />}
          {activeTab === 'placeholder' && <PlaceholderTab data={sec('placeholder')} onChange={(d) => updateSection('placeholder', d)} />}
          {activeTab === 'just-arrived' && <JustArrivedTab data={sec('just-arrived')} onChange={(d) => updateSection('just-arrived', d)} />}
          {activeTab === 'ideas-section' && <IdeasTab data={sec('ideas-section')} onChange={(d) => updateSection('ideas-section', d)} />}
          {activeTab === 'settings' && <SettingsTab published={isPublished} onToggle={() => { setIsPublished((v) => !v); setSaved(false); }} />}
        </div>

        {/* Bottom save */}
        <div className="mt-6 flex justify-end">
          <button onClick={saveAll} disabled={saving} className={`px-8 py-3 rounded-full font-semibold text-sm transition-all shadow-sm ${saved ? 'bg-green-500 text-white' : saving ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-accent hover:bg-secondary text-white'}`}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save all changes'}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

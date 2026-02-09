'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getPageContentAdmin, updatePageContent, deleteSection } from '@/services/pageService';
import { uploadSingleImage, deleteFile } from '@/services/uploadService';
import { useAuthState } from '@/hooks/useAuthState';

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'content', label: 'Content' },
  { value: 'features', label: 'Features Grid' },
  { value: 'stats', label: 'Statistics' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'cards', label: 'Cards' },
  { value: 'text-image', label: 'Text + Image' },
  { value: 'list', label: 'List with Images' },
  { value: 'contact-info', label: 'Contact Info' },
  { value: 'custom', label: 'Custom' },
];

const BG_OPTIONS = [
  { value: 'white', label: 'White' },
  { value: 'light', label: 'Light Gray' },
  { value: 'gradient', label: 'Gradient (Accent)' },
];

function extractCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  try {
    // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123/home/pages/abc123.jpg
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (match && match[1]) {
      // Remove file extension
      return match[1].replace(/\.[^.]+$/, '');
    }
  } catch {
    // ignore
  }
  return null;
}

async function deleteOldCloudinaryImage(url: string) {
  const publicId = extractCloudinaryPublicId(url);
  if (publicId) {
    try {
      await deleteFile(publicId, 'image');
    } catch (error) {
      console.error('Failed to delete old image from Cloudinary:', error);
    }
  }
}

function ImageUploader({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Delete old image from Cloudinary before uploading new one
      if (value) {
        await deleteOldCloudinaryImage(value);
      }
      const result = await uploadSingleImage(file, 'pages');
      onChange(result.data.url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (value) {
      await deleteOldCloudinaryImage(value);
    }
    onChange('');
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2 items-start">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL or upload"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <label className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${uploading ? 'bg-gray-300 text-gray-500' : 'bg-accent text-white hover:bg-secondary'}`}>
          {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      {value && (
        <div className="mt-2 relative w-32 h-20 rounded overflow-hidden border border-gray-200">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={handleRemove}
            className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
          >
            x
          </button>
        </div>
      )}
    </div>
  );
}

function SectionItemEditor({ item, index, onChange, onRemove }: any) {
  const update = (field: string, value: any) => {
    onChange({ ...item, [field]: value });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-600">Item {index + 1}</span>
        <button onClick={onRemove} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Title</label>
          <input
            type="text"
            value={item.title || ''}
            onChange={(e) => update('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Stats Value</label>
          <input
            type="text"
            value={item.stats || ''}
            onChange={(e) => update('stats', e.target.value)}
            placeholder="e.g. 85%"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1">Description</label>
          <textarea
            value={item.description || ''}
            onChange={(e) => update('description', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Stats Label</label>
          <input
            type="text"
            value={item.statsLabel || ''}
            onChange={(e) => update('statsLabel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Link</label>
          <input
            type="text"
            value={item.link || ''}
            onChange={(e) => update('link', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="md:col-span-2">
          <ImageUploader value={item.image || ''} onChange={(url) => update('image', url)} label="Item Image" />
        </div>
      </div>
    </div>
  );
}

function SectionEditor({ section, index, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: any) {
  const [expanded, setExpanded] = useState(false);

  const update = (field: string, value: any) => {
    onChange({ ...section, [field]: value });
  };

  const addItem = () => {
    const items = [...(section.items || []), { title: '', description: '', image: '', stats: '', statsLabel: '' }];
    update('items', items);
  };

  const updateItem = (idx: number, item: any) => {
    const items = [...(section.items || [])];
    items[idx] = item;
    update('items', items);
  };

  const removeItem = (idx: number) => {
    const items = (section.items || []).filter((_: any, i: number) => i !== idx);
    update('items', items);
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${section.isVisible ? 'border-gray-200' : 'border-yellow-300 bg-yellow-50/30'}`}>
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-400 w-6">{index + 1}</span>
          <div>
            <span className="font-semibold text-gray-900">{section.title || section.sectionId || 'Untitled Section'}</span>
            <span className="ml-2 text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full">{section.type}</span>
            {!section.isVisible && <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Hidden</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={isFirst} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30" title="Move Up">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={isLast} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30" title="Move Down">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:bg-red-100 rounded text-red-500" title="Delete Section">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Section ID</label>
              <input
                type="text"
                value={section.sectionId || ''}
                onChange={(e) => update('sectionId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={section.type || 'content'}
                onChange={(e) => update('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {SECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Background</label>
              <select
                value={section.bgColor || 'white'}
                onChange={(e) => update('bgColor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {BG_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={section.title || ''}
              onChange={(e) => update('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              type="text"
              value={section.subtitle || ''}
              onChange={(e) => update('subtitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={section.description || ''}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Additional Content</label>
            <textarea
              value={section.content || ''}
              onChange={(e) => update('content', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <ImageUploader value={section.image || ''} onChange={(url) => update('image', url)} label="Section Image" />

          <div>
            <label className="block text-sm font-medium mb-1">Image Alt Text</label>
            <input
              type="text"
              value={section.imageAlt || ''}
              onChange={(e) => update('imageAlt', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Primary Link URL</label>
              <input
                type="text"
                value={section.link || ''}
                onChange={(e) => update('link', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Primary Link Text</label>
              <input
                type="text"
                value={section.linkText || ''}
                onChange={(e) => update('linkText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Secondary Link URL</label>
              <input
                type="text"
                value={section.secondaryLink || ''}
                onChange={(e) => update('secondaryLink', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Secondary Link Text</label>
              <input
                type="text"
                value={section.secondaryLinkText || ''}
                onChange={(e) => update('secondaryLinkText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`visible-${index}`}
              checked={section.isVisible !== false}
              onChange={(e) => update('isVisible', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor={`visible-${index}`} className="text-sm font-medium">Visible on page</label>
          </div>

          {/* Items */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-sm">Items ({(section.items || []).length})</h4>
              <button
                onClick={addItem}
                className="px-3 py-1.5 text-sm bg-accent text-white rounded-md hover:bg-secondary transition-colors"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-3">
              {(section.items || []).map((item: any, idx: number) => (
                <SectionItemEditor
                  key={idx}
                  item={item}
                  index={idx}
                  onChange={(updated: any) => updateItem(idx, updated)}
                  onRemove={() => removeItem(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPageEditorPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { status, isAdmin } = useAuthState();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/sign-in'); return; }
    if (status === 'authenticated' && !isAdmin) { router.push('/'); return; }
    if (status === 'authenticated' && isAdmin) fetchPage();
  }, [status, isAdmin, router, slug]);

  const fetchPage = async () => {
    try {
      const data = await getPageContentAdmin(slug);
      setPage(data.data);
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!page) return;
    setSaving(true);
    try {
      await updatePageContent(slug, {
        title: page.title,
        description: page.description,
        isPublished: page.isPublished,
        sections: page.sections
      });
      setHasChanges(false);
      alert('Page saved successfully!');
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Failed to save page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updatePage = useCallback((field: string, value: any) => {
    setPage((prev: any) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const updateSection = useCallback((index: number, section: any) => {
    setPage((prev: any) => {
      const sections = [...prev.sections];
      sections[index] = section;
      return { ...prev, sections };
    });
    setHasChanges(true);
  }, []);

  const handleDeleteSection = useCallback((index: number) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    setPage((prev: any) => ({
      ...prev,
      sections: prev.sections.filter((_: any, i: number) => i !== index)
    }));
    setHasChanges(true);
  }, []);

  const moveSection = useCallback((index: number, direction: 'up' | 'down') => {
    setPage((prev: any) => {
      const sections = [...prev.sections];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= sections.length) return prev;
      [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
      // Update order values
      sections.forEach((s: any, i: number) => { s.order = i; });
      return { ...prev, sections };
    });
    setHasChanges(true);
  }, []);

  const addNewSection = useCallback(() => {
    setPage((prev: any) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          sectionId: `section-${Date.now()}`,
          type: 'content',
          title: 'New Section',
          subtitle: '',
          description: '',
          image: '',
          imageAlt: '',
          bgColor: 'white',
          items: [],
          content: '',
          link: '',
          linkText: '',
          secondaryLink: '',
          secondaryLinkText: '',
          order: prev.sections.length,
          isVisible: true
        }
      ]
    }));
    setHasChanges(true);
  }, []);

  if (status === 'loading' || (status === 'authenticated' && isAdmin && loading)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === 'unauthenticated' || !isAdmin) return null;

  if (!page) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <p className="text-neutral-dark mb-6">The page &quot;{slug}&quot; was not found. Make sure you&apos;ve run the seed script.</p>
          <Link href="/admin/pages" className="text-accent hover:underline">Back to Manage Pages</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Bar */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/pages" className="text-neutral-dark hover:text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Edit: {page.title}</h1>
              <p className="text-sm text-neutral-dark">/{page.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${page.slug}`} target="_blank" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm transition-colors">
              Preview
            </Link>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${
                hasChanges
                  ? 'bg-accent text-white hover:bg-secondary'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
            </button>
          </div>
        </div>

        {/* Page Settings */}
        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Page Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Page Title</label>
              <input
                type="text"
                value={page.title || ''}
                onChange={(e) => updatePage('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={page.description || ''}
                onChange={(e) => updatePage('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={page.isPublished !== false}
              onChange={(e) => updatePage('isPublished', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="published" className="text-sm font-medium">Published</label>
          </div>
        </div>

        {/* Sections */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Sections ({page.sections?.length || 0})</h2>
          <button
            onClick={addNewSection}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary text-sm font-semibold transition-colors"
          >
            + Add Section
          </button>
        </div>

        <div className="space-y-3">
          {(page.sections || []).map((section: any, index: number) => (
            <SectionEditor
              key={section._id || section.sectionId || index}
              section={section}
              index={index}
              onChange={(updated: any) => updateSection(index, updated)}
              onDelete={() => handleDeleteSection(index)}
              onMoveUp={() => moveSection(index, 'up')}
              onMoveDown={() => moveSection(index, 'down')}
              isFirst={index === 0}
              isLast={index === (page.sections || []).length - 1}
            />
          ))}
        </div>

        {(page.sections || []).length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Sections</h3>
            <p className="text-gray-500 mb-4">Add sections to build your page content.</p>
            <button
              onClick={addNewSection}
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary text-sm font-semibold transition-colors"
            >
              + Add First Section
            </button>
          </div>
        )}

        {/* Bottom Save */}
        {hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 shadow-lg z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <p className="text-sm text-neutral-dark">You have unsaved changes</p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-accent text-white rounded-md hover:bg-secondary text-sm font-semibold transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

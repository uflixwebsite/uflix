'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCategory, updateCategory, getCategoryTree } from '@/services/categoryService';
import { useAuthState } from '@/hooks/useAuthState';

interface CategoryNode { _id: string; name: string; children: CategoryNode[] }
function flattenTree(nodes: CategoryNode[], depth = 0): { _id: string; name: string; depth: number }[] {
  return nodes.flatMap((n) => [
    { _id: n._id, name: n.name, depth },
    ...flattenTree(n.children, depth + 1),
  ]);
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const { status, isAdmin } = useAuthState();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [treeFlat, setTreeFlat] = useState<{ _id: string; name: string; depth: number }[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
    icon: '',
    order: '0',
    parentId: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/sign-in'); return; }
    if (status === 'authenticated' && !isAdmin) { router.push('/'); return; }
    if (status === 'authenticated' && isAdmin) loadData();
  }, [status, isAdmin]);

  const loadData = async () => {
    try {
      const [catRes, treeRes] = await Promise.all([
        getCategory(categoryId),
        getCategoryTree(),
      ]);
      const cat = catRes.data;
      const parentId = cat.parent?._id || cat.parent || '';
      setForm({
        name: cat.name || '',
        description: cat.description || '',
        image: cat.image || '',
        icon: cat.icon || '',
        order: String(cat.order ?? 0),
        parentId,
      });
      // Exclude self from parent options to prevent circular ref
      // Also exclude root-level options so parent must remain within tree
      const flat = flattenTree(treeRes.data || []).filter((n) => n._id !== categoryId);
      setTreeFlat(flat);
    } catch (err) {
      console.error(err);
      alert('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { alert('Name is required'); return; }
    setSaving(true);
    try {
      await updateCategory(categoryId, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        image: form.image.trim() || undefined,
        icon: form.icon.trim() || undefined,
        order: parseInt(form.order) || 0,
        parent: form.parentId || null,
      });
      router.push('/admin/categories');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded-lg" />)}
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  if (status === 'unauthenticated' || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link href="/admin/categories" className="text-accent hover:text-accent/80 text-sm">
            ← Back to Categories
          </Link>
          <h1 className="text-3xl font-bold mt-3">Edit Category</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Parent */}
          <div>
            <label className="block text-sm font-medium mb-1">Parent Category</label>
            <select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">— Top Level (no parent) —</option>
              {treeFlat.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {'  '.repeat(cat.depth) + (cat.depth > 0 ? '↳ ' : '') + cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Icon & Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="🛏️"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {form.image && (
              <img src={form.image} alt="preview" className="mt-2 h-24 object-cover rounded-lg" />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <Link
              href="/admin/categories"
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-center text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

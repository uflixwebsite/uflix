'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createCategory, getCategoryTree } from '@/services/categoryService';
import { useAuthState } from '@/hooks/useAuthState';

interface CategoryNode {
  _id: string;
  name: string;
  slug?: string;
  children: CategoryNode[];
}

function flattenTree(nodes: CategoryNode[], depth = 0): { _id: string; name: string; depth: number }[] {
  return nodes.flatMap((n) => [
    { _id: n._id, name: n.name, depth },
    ...flattenTree(n.children, depth + 1),
  ]);
}

export default function NewCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, isAdmin } = useAuthState();

  const preParentId = searchParams.get('parentId') || '';
  const preParentName = searchParams.get('parentName') || '';

  const [saving, setSaving] = useState(false);
  const [treeFlat, setTreeFlat] = useState<{ _id: string; name: string; depth: number }[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
    icon: '',
    order: '0',
    parentId: preParentId,
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/sign-in'); return; }
    if (status === 'authenticated' && !isAdmin) { router.push('/'); return; }
    if (status === 'authenticated' && isAdmin) loadTree();
  }, [status, isAdmin]);

  const loadTree = async () => {
    try {
      const res = await getCategoryTree();
      setTreeFlat(flattenTree(res.data || []));
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { alert('Name is required'); return; }
    if (!form.parentId) { alert('Please select a parent category. Top-level categories are fixed and cannot be created here.'); return; }

    setSaving(true);
    try {
      await createCategory({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        image: form.image.trim() || undefined,
        icon: form.icon.trim() || undefined,
        order: parseInt(form.order) || 0,
        parent: form.parentId || null,
      });
      router.push('/admin/categories');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') return null;
  if (status === 'unauthenticated' || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link href="/admin/categories" className="text-accent hover:text-accent/80 text-sm">
            ← Back to Categories
          </Link>
          <h1 className="text-3xl font-bold mt-3">
            {preParentName ? `Add Sub-category under "${preParentName}"` : 'New Sub-category'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Parent */}
          <div>
            <label className="block text-sm font-medium mb-1">Parent Category <span className="text-red-500">*</span></label>
            <select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">— Select a parent category —</option>
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
              placeholder="e.g. King Size Beds"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Slug is auto-generated from the name</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Optional description..."
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
              {saving ? 'Creating…' : 'Create Category'}
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

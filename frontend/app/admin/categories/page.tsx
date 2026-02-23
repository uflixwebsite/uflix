'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCategoryTree, deleteCategory, updateCategory, createCategory } from '@/services/categoryService';
import { useAuthState } from '@/hooks/useAuthState';

interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  children: CategoryNode[];
}

interface ModalState {
  open: boolean;
  mode: 'add' | 'edit';
  id?: string;
  name: string;
  description: string;
  image: string;
  order: string;
}

const EMPTY_MODAL: ModalState = {
  open: false,
  mode: 'add',
  name: '',
  description: '',
  image: '',
  order: '0',
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { status, isAdmin } = useAuthState();
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>(EMPTY_MODAL);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/sign-in'); return; }
    if (status === 'authenticated' && !isAdmin) { router.push('/'); return; }
    if (status === 'authenticated' && isAdmin) fetchTree();
  }, [status, isAdmin, router]);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const res = await getCategoryTree();
      setTree(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => setModal({ ...EMPTY_MODAL, open: true, mode: 'add' });

  const openEdit = (cat: CategoryNode) => setModal({
    open: true,
    mode: 'edit',
    id: cat._id,
    name: cat.name,
    description: cat.description || '',
    image: cat.image || '',
    order: String(cat.order ?? 0),
  });

  const closeModal = () => setModal(EMPTY_MODAL);

  const handleSave = async () => {
    if (!modal.name.trim()) { alert('Name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: modal.name.trim(),
        description: modal.description.trim() || undefined,
        image: modal.image.trim() || undefined,
        order: parseInt(modal.order) || 0,
        parent: null,
      };
      if (modal.mode === 'edit' && modal.id) {
        await updateCategory(modal.id, payload);
      } else {
        await createCategory(payload);
      }
      closeModal();
      await fetchTree();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm('Delete "' + name + '"? Sub-categories must be deleted first.')) return;
    try {
      await deleteCategory(id);
      await fetchTree();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  if (status === 'loading' || (status === 'authenticated' && isAdmin && loading)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-lg" />)}
            </div>
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Main Categories</h1>
            <p className="text-sm text-gray-500 mt-0.5">{tree.length} categories</p>
          </div>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            + Add Category
          </button>
        </div>

        {tree.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200 text-gray-500">
            <p className="font-medium">No categories yet</p>
            <button onClick={openAdd} className="mt-3 text-accent text-sm hover:underline">
              Create your first category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {tree.map((cat) => (
              <div
                key={cat._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-28 bg-gray-100 overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm capitalize truncate">{cat.name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{cat.slug}</p>
                  {cat.children.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{cat.children.length} sub-categories</p>
                  )}
                </div>
                <div className="flex border-t border-gray-100 text-xs">
                  <button
                    onClick={() => openEdit(cat)}
                    className="flex-1 py-2 text-center text-gray-500 hover:text-accent hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id, cat.name)}
                    className="flex-1 py-2 text-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors border-l border-gray-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href="/admin" className="text-sm text-accent hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </main>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">
                {modal.mode === 'add' ? 'Add Category' : 'Edit Category'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={modal.name}
                onChange={e => setModal(m => ({ ...m, name: e.target.value }))}
                placeholder="e.g. Bedroom"
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={modal.description}
                onChange={e => setModal(m => ({ ...m, description: e.target.value }))}
                rows={2}
                placeholder="Short description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              {modal.image && (
                <div className="relative w-full h-28 rounded-lg overflow-hidden mb-2 border border-gray-200">
                  <img src={modal.image} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setModal(m => ({ ...m, image: '' }))}
                    className="absolute top-1.5 right-1.5 bg-white rounded-full w-5 h-5 text-xs shadow flex items-center justify-center text-gray-500 hover:text-red-600"
                  >
                    x
                  </button>
                </div>
              )}
              <input
                type="url"
                value={modal.image}
                onChange={e => setModal(m => ({ ...m, image: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <input
                type="number"
                value={modal.order}
                onChange={e => setModal(m => ({ ...m, order: e.target.value }))}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : modal.mode === 'add' ? 'Create' : 'Save Changes'}
              </button>
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

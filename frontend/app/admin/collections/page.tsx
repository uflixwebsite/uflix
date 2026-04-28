'use client';

import { useEffect, useMemo, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthState } from '@/hooks/useAuthState';
import { uploadSingleImage } from '@/services/uploadService';
import { getProducts } from '@/services/productService';
import {
  createCollection,
  deleteCollection,
  getCollections,
  updateCollection,
} from '@/services/collectionService';

type CollectionForm = {
  name: string;
  subtitle: string;
  image: string;
  showOnHome: boolean;
  isActive: boolean;
  sortOrder: number;
  products: string[];
};

const emptyForm: CollectionForm = {
  name: '',
  subtitle: '',
  image: '',
  showOnHome: true,
  isActive: true,
  sortOrder: 0,
  products: [],
};

export default function AdminCollectionsPage() {
  const router = useRouter();
  const { status, isAdmin } = useAuthState();

  const [collections, setCollections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('new');
  const [form, setForm] = useState<CollectionForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/sign-in');
      return;
    }
    if (status === 'authenticated' && !isAdmin) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [collectionRes, productRes] = await Promise.all([
          getCollections({ includeInactive: true }),
          getProducts({ limit: 1000, page: 1 }),
        ]);

        setCollections(collectionRes?.data || []);
        setProducts(productRes?.data || []);
      } catch (error) {
        console.error('Failed to load collections data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, isAdmin, router]);

  const selectedCollection = useMemo(() => {
    if (selectedCollectionId === 'new') return null;
    return collections.find((collection) => collection._id === selectedCollectionId) || null;
  }, [collections, selectedCollectionId]);

  useEffect(() => {
    if (!selectedCollection) {
      setForm(emptyForm);
      return;
    }

    setForm({
      name: selectedCollection.name || '',
      subtitle: selectedCollection.subtitle || '',
      image: selectedCollection.image || '',
      showOnHome: selectedCollection.showOnHome !== false,
      isActive: selectedCollection.isActive !== false,
      sortOrder: Number.isFinite(selectedCollection.sortOrder) ? selectedCollection.sortOrder : 0,
      products: Array.isArray(selectedCollection.productIds) ? selectedCollection.productIds : [],
    });
  }, [selectedCollection]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.trim().toLowerCase();
    return products.filter((product) =>
      [product.name, product.slug, product.sku].filter(Boolean).some((value) => value.toLowerCase().includes(q))
    );
  }, [products, search]);

  const handleUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadSingleImage(file, 'home/collections');
      setForm((prev) => ({ ...prev, image: response?.data?.url || '' }));
    } catch (error) {
      console.error('Image upload failed', error);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const toggleProduct = (productId: string) => {
    setForm((prev) => {
      const exists = prev.products.includes(productId);
      return {
        ...prev,
        products: exists
          ? prev.products.filter((id) => id !== productId)
          : [...prev.products, productId],
      };
    });
  };

  const refreshCollections = async (nextSelectedId = 'new') => {
    const response = await getCollections({ includeInactive: true });
    const data = response?.data || [];
    setCollections(data);
    setSelectedCollectionId(nextSelectedId);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('Collection name is required');
      return;
    }
    if (!form.image.trim()) {
      alert('Collection image is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        subtitle: form.subtitle,
        image: form.image,
        showOnHome: form.showOnHome,
        isActive: form.isActive,
        sortOrder: Number.isFinite(form.sortOrder) ? form.sortOrder : 0,
        products: form.products,
      };

      if (selectedCollection) {
        await updateCollection(selectedCollection._id, payload);
        await refreshCollections(selectedCollection._id);
        alert('Collection updated successfully');
      } else {
        const created = await createCollection(payload);
        await refreshCollections(created?.data?._id || 'new');
        alert('Collection created successfully');
      }
    } catch (error: any) {
      console.error('Failed to save collection', error);
      alert(error?.response?.data?.message || 'Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCollection) return;
    const confirmed = window.confirm(`Delete collection "${selectedCollection.name}"?`);
    if (!confirmed) return;

    setSaving(true);
    try {
      await deleteCollection(selectedCollection._id);
      await refreshCollections('new');
      alert('Collection deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete collection', error);
      alert(error?.response?.data?.message || 'Failed to delete collection');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="animate-pulse h-96 bg-gray-200 rounded"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status !== 'authenticated' || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">Collections Manager</h1>
          <p className="text-neutral-dark mt-2">
            Create collections, add image/title/subtitle, choose homepage visibility, and link existing products.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="bg-white border border-gray-200 rounded-lg p-4 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">All Collections</h2>
              <button
                type="button"
                onClick={() => setSelectedCollectionId('new')}
                className="px-3 py-1.5 text-sm rounded bg-green-600 text-white hover:bg-green-700"
              >
                + New
              </button>
            </div>

            <div className="space-y-2 max-h-140 overflow-auto pr-1">
              {collections.map((collection) => (
                <button
                  key={collection._id}
                  type="button"
                  onClick={() => setSelectedCollectionId(collection._id)}
                  className={`w-full text-left border rounded-md px-3 py-2 transition-colors ${
                    selectedCollectionId === collection._id
                      ? 'border-accent bg-accent/10'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm text-black">{collection.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {collection.itemCount || 0} product(s) • {collection.showOnHome ? 'Shown on home' : 'Hidden from home'}
                  </div>
                </button>
              ))}
              {collections.length === 0 && (
                <p className="text-sm text-gray-500">No collections yet.</p>
              )}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{selectedCollection ? 'Edit Collection' : 'Create Collection'}</h2>
              {selectedCollection && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                >
                  Delete
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g. Office Workstations"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Short collection subtitle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="flex items-center gap-6 pt-7">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.showOnHome}
                    onChange={(e) => setForm((prev) => ({ ...prev, showOnHome: e.target.checked }))}
                  />
                  Show on Home
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Collection Image</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Image URL"
                />
                <label className={`px-3 py-2 text-sm rounded-md cursor-pointer text-white ${uploading ? 'bg-gray-400' : 'bg-accent hover:bg-accent-dark'}`}>
                  {uploading ? 'Uploading...' : 'Upload'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleUploadImage} disabled={uploading} />
                </label>
              </div>
              {form.image && (
                <img src={form.image} alt="Collection preview" className="mt-3 h-36 rounded-md border border-gray-200 object-cover" />
              )}
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Link Existing Products</h3>
                <span className="text-xs text-gray-500">{form.products.length} selected</span>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product name, slug or SKU"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3"
              />

              <div className="max-h-80 overflow-auto border border-gray-200 rounded-md divide-y">
                {filteredProducts.map((product) => (
                  <label key={product._id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={form.products.includes(product._id)}
                      onChange={() => toggleProduct(product._id)}
                    />
                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 truncate">/{product.slug || product._id}</p>
                    </div>
                  </label>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="px-3 py-4 text-sm text-gray-500">No products found.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-md bg-accent text-white hover:bg-accent-dark disabled:opacity-60"
              >
                {saving ? 'Saving...' : selectedCollection ? 'Update Collection' : 'Create Collection'}
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

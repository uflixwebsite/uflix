'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCategories, deleteCategory } from '@/services/categoryService';
import { useAuthState } from '@/hooks/useAuthState';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { status, isAdmin } = useAuthState();
  const [categories, setCategories] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (status === 'loading') {
      return;
    }

    // Only redirect when we know the auth state
    if (status === 'unauthenticated') {
      router.push('/sign-in');
      return;
    }

    if (status === 'authenticated' && !isAdmin) {
      router.push('/');
      return;
    }

    // User is authenticated and is admin - fetch categories
    if (status === 'authenticated' && isAdmin) {
      fetchCategories();
    }
  }, [status, isAdmin, router]);

  const fetchCategories = async () => {
    setDataLoading(true);
    try {
      const data = await getCategories();
      setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) return;

    try {
      await deleteCategory(categoryId);
      alert('Category deleted successfully!');
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  // Show loading while auth is hydrating OR while fetching categories data
  if (status === 'loading' || (status === 'authenticated' && isAdmin && dataLoading && !categories.length)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Don't render content if not authorized (will redirect)
  if (status === 'unauthenticated' || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Categories Management</h1>
            <p className="text-neutral-dark mt-2">Manage product categories</p>
          </div>
          <Link
            href="/admin/categories/new"
            className="px-6 py-3 bg-accent text-white rounded-md hover:bg-secondary transition-colors font-semibold"
          >
            + Add New Category
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category._id} className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
              {category.image && (
                <div className="h-48 bg-gray-200">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                <p className="text-neutral-dark text-sm mb-4 line-clamp-2">
                  {category.description || 'No description'}
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  Slug: {category.slug}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/categories/${category._id}/edit`}
                    className="flex-1 px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary transition-colors text-center text-sm font-semibold"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(category._id, category.name)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-border">
            <p className="text-neutral-dark">No categories found</p>
            <Link
              href="/admin/categories/new"
              className="inline-block mt-4 text-accent hover:text-secondary font-semibold"
            >
              Create your first category
            </Link>
          </div>
        )}

        <div className="mt-6">
          <Link href="/admin" className="text-accent hover:text-secondary">
            ← Back to Dashboard
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

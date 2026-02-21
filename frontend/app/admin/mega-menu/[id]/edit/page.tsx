'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/services/authService';
import { getNavbarItem, updateNavbarItem } from '@/services/megaMenuService';
import { useAuthState } from '@/hooks/useAuthState';

export default function EditNavbarItemPage() {
  const router = useRouter();
  const params = useParams();
  const { status, isAdmin } = useAuthState();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    enableMegaMenu: false,
    order: 1,
    enabled: true
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && isAdmin) {
      fetchNavbarItem();
    }
  }, [status, isAdmin, router]);

  const fetchNavbarItem = async () => {
    try {
      setLoading(true);
      const itemId = params?.id as string;
      
      if (!itemId) {
        router.push('/admin/mega-menu');
        return;
      }

      const response = await getNavbarItem(itemId);
      
      if (response?.success) {
        setFormData({
          title: response.data.title,
          enableMegaMenu: response.data.enableMegaMenu,
          order: response.data.order,
          enabled: response.data.enabled
        });
      } else {
        alert('Failed to load navbar item');
        router.push('/admin/mega-menu');
      }
    } catch (error: any) {
      console.error('Error fetching navbar item:', error);
      alert('Error loading navbar item');
      router.push('/admin/mega-menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      setSaving(true);
      const itemId = params?.id as string;
      const response = await updateNavbarItem(itemId, formData);
      
      if (response?.success) {
        router.push('/admin/mega-menu');
      } else {
        alert('Failed to update navbar item');
      }
    } catch (error: any) {
      console.error('Error updating navbar item:', error);
      alert('Error updating navbar item');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (status === 'loading' || (status === 'authenticated' && !isAdmin)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-2/4 mb-8"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Edit Navbar Item</h1>
          <Link
            href="/admin/mega-menu"
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Mega Menu
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading navbar item...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter navbar item title"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableMegaMenu"
                    checked={formData.enableMegaMenu}
                    onChange={(e) => handleInputChange('enableMegaMenu', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enableMegaMenu" className="ml-2 text-sm font-medium text-gray-700">
                    Enable Mega Menu
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => handleInputChange('enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enabled" className="ml-2 text-sm font-medium text-gray-700">
                    Enabled
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    id="order"
                    value={formData.order}
                    onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/admin/mega-menu')}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? 'Updating...' : 'Update Navbar Item'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

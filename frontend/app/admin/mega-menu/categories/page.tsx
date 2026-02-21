'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthState } from '@/hooks/useAuthState';
import { getNavbarItems, getMegaMenuCategories } from '@/services/megaMenuService';

interface MegaMenuCategory {
  _id: string;
  title: string;
  slug: string;
  icon: string;
  order: number;
  enabled: boolean;
  parentNavbarItem: string;
  blocks: MegaMenuBlock[];
}

interface MegaMenuBlock {
  id: string;
  type: 'image-card' | 'link-list' | 'promotional-banner';
  order: number;
  enabled: boolean;
  content: {
    // Image Card
    image?: string;
    title?: string;
    subtitle?: string;
    link?: string;
    openInNewTab?: boolean;
    // Link List
    sectionTitle?: string;
    links?: Array<{
      label: string;
      url: string;
      icon?: string;
    }>;
    // Promotional Banner
    backgroundImage?: string;
    heading?: string;
    description?: string;
    ctaText?: string;
    ctaUrl?: string;
  };
}

export default function MegaMenuCategoriesPage() {
  const router = useRouter();
  const { status, isAdmin } = useAuthState();
  const [navbarItems, setNavbarItems] = useState<any[]>([]);
  const [selectedNavbarItem, setSelectedNavbarItem] = useState<string>('');
  const [categories, setCategories] = useState<MegaMenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && isAdmin) {
      fetchNavbarItems();
    }
  }, [status, isAdmin]);

  const fetchNavbarItems = async () => {
    try {
      const response = await getNavbarItems();
      if (response?.success) {
        const itemsWithMegaMenu = response.data.filter((item: any) => item.enableMegaMenu);
        setNavbarItems(itemsWithMegaMenu);
        if (itemsWithMegaMenu.length > 0 && !selectedNavbarItem) {
          setSelectedNavbarItem(itemsWithMegaMenu[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching navbar items:', error);
    }
  };

  const handleAddCategory = () => {
    router.push(`/admin/mega-menu/categories/new?navbar=${selectedNavbarItem}`);
  };

  const handleEditCategory = (categoryId: string) => {
    router.push(`/admin/mega-menu/categories/${categoryId}/edit`);
  };

  if (status === 'loading' || (status === 'authenticated' && !isAdmin)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-8"></div>
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
          <div>
            <h1 className="text-3xl font-bold">Mega Menu Categories</h1>
            <p className="text-gray-600 mt-2">Manage categories for mega menu dropdowns</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/mega-menu"
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Mega Menu
            </Link>
            {selectedNavbarItem && (
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Category
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Navbar Item
          </label>
          <select
            value={selectedNavbarItem}
            onChange={(e) => setSelectedNavbarItem(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a navbar item with mega menu enabled</option>
            {navbarItems.map((item) => (
              <option key={item._id} value={item._id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        {selectedNavbarItem ? (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                Categories for "{navbarItems.find(item => item._id === selectedNavbarItem)?.title}"
              </h2>
            </div>
            
            <div className="p-6">
              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H7m-8 8v8m0 8l8-8m0 9 10h.01M21 12a9 9 011-18 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold">No Categories Found</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Create categories to organize your mega menu content.
                  </p>
                  <button
                    onClick={handleAddCategory}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create First Category
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {category.icon && <span className="text-2xl">{category.icon}</span>}
                          <div>
                            <h3 className="font-semibold">{category.title}</h3>
                            <p className="text-sm text-gray-600">{category.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            category.enabled 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {category.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <button
                            onClick={() => handleEditCategory(category._id)}
                            className="px-3 py-1 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-600">
                        {category.blocks.length} block{category.blocks.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl font-semibold">Select a Navbar Item</h3>
            </div>
            <p className="text-gray-600">
              Choose a navbar item from the dropdown above to manage its mega menu categories.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

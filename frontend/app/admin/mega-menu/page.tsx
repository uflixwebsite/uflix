'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthState } from '@/hooks/useAuthState';
import { getNavbarConfig } from '@/services/navbarService';
import { getAllMegaMenus, saveMegaMenu } from '@/services/megaMenuV2Service';
import { uploadSingleImage } from '@/services/uploadService';

const createUniqueId = (prefix: 'cat' | 'item') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const normalizeCategories = (categoryList: any[] = []) =>
  categoryList.map((category, index) => ({
    ...category,
    id: String(category?.id || createUniqueId('cat')),
    order: Number.isFinite(category?.order) ? category.order : index + 1,
    enabled: category?.enabled !== false,
  }));

const normalizeItems = (itemList: any[] = []) =>
  itemList.map((item, index) => ({
    ...item,
    id: String(item?.id || createUniqueId('item')),
    order: Number.isFinite(item?.order) ? item.order : index + 1,
    enabled: item?.enabled !== false,
  }));

const pageOptions = [
  { value: '*', label: 'Default (All Pages)' },
  { value: '/', label: 'Home' },
  { value: '/shop', label: 'Shop' },
  { value: '/products', label: 'Products' },
  { value: '/categories', label: 'Categories' },
  { value: '/business', label: 'Main Business Page' },
  { value: '/business/workspace', label: 'Business Workspace Page' },
  { value: '/business/healthcare', label: 'Business Healthcare Page' },
  { value: '/business/education', label: 'Business Education Page' },
  { value: '/steel-fabrication-delhi-ncr', label: 'Steel Fabrication Canonical Page' },
  { value: '/msfabrication-delhi-ncr', label: 'MS Fabrication Page' },
  { value: '/laser-sheet-cutting-delhi-ncr', label: 'Laser Sheet Cutting Page' },
  { value: '/powder-coating-delhi-ncr', label: 'Powder Coating Page' },
  { value: '/laser-pipe-cutting-delhi-ncr', label: 'Laser Pipe Cutting Page' },
  { value: '/shop-fittings/metal-sheet', label: 'Metal Sheet Page' },
  { value: '/contact', label: 'Contact' },
  { value: '/about', label: 'About' },
  { value: '/projects', label: 'Projects' },
];

const getPageLabel = (value: string) => pageOptions.find((option) => option.value === value)?.label || value;

export default function MegaMenuPage() {
  const { status, isAdmin } = useAuthState();
  
  const [selectedPage, setSelectedPage] = useState('*');
  const [navbarLinks, setNavbarLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  
  // Mega menu builder state
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingImageFor, setUploadingImageFor] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPage) {
      fetchNavbarLinks();
    }
  }, [selectedPage]);

  const fetchNavbarLinks = async () => {
    try {
      setLoading(true);
      const data = await getNavbarConfig(selectedPage);
      const links = data?.data?.configs?.[0]?.links || data?.data?.links;
      if (data?.success && links) {
        setNavbarLinks(links);
      } else {
        setNavbarLinks([]);
      }
    } catch (error) {
      console.error('Error fetching navbar links:', error);
      setNavbarLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const openMegaMenuBuilder = async (link: any) => {
    setEditingLink(link);
    setLoading(true);
    
    try {
      const response = await getAllMegaMenus(selectedPage);
      const megaMenu = response.data?.find(
        (m: any) => m.pagePath === selectedPage && m.navbarLinkUrl === link.url
      );
      
      if (megaMenu) {
        const normalizedCategories = normalizeCategories(megaMenu.categories || []);
        const normalizedItems = normalizeItems(megaMenu.items || []);

        setCategories(normalizedCategories);
        setItems(normalizedItems);
        if (normalizedCategories.length > 0) {
          setSelectedCategoryId(normalizedCategories[0].id);
        }
      } else {
        setCategories([]);
        setItems([]);
        setSelectedCategoryId('');
      }
      
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error loading mega menu:', error);
      setCategories([]);
      setItems([]);
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLink(null);
    setCategories([]);
    setItems([]);
    setSelectedCategoryId('');
    setMessage('');
  };

  const addCategory = () => {
    const newCategory = {
      id: createUniqueId('cat'),
      name: 'New Category',
      order: categories.length + 1,
      enabled: true
    };
    setCategories(prev => [...prev, newCategory]);
    setSelectedCategoryId(newCategory.id);
  };

  const updateCategoryName = (categoryId: string, newName: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, name: newName } : cat
    ));
  };

  const deleteCategory = (categoryId: string) => {
    if (!confirm('Delete this category and all its items?')) return;
    setCategories(prev => {
      const remaining = prev.filter(cat => cat.id !== categoryId);
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(remaining[0]?.id || '');
      }
      return remaining;
    });
    setItems(prev => prev.filter(item => item.categoryId !== categoryId));
  };

  const addItem = () => {
    if (!selectedCategoryId) {
      alert('Please select a category first');
      return;
    }
    
    const newItem = {
      id: createUniqueId('item'),
      categoryId: selectedCategoryId,
      title: 'New Item',
      url: '/shop',
      image: '',
      order: items.filter(i => i.categoryId === selectedCategoryId).length + 1,
      enabled: true
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (itemId: string, field: string, value: any) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const deleteItem = (itemId: string) => {
    if (!confirm('Delete this item?')) return;
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleImageUpload = async (itemId: string, file: File) => {
    if (!file) return;
    
    try {
      setUploadingImageFor(itemId);
      const response = await uploadSingleImage(file, 'mega-menu');
      
      if (response.success && response.data?.url) {
        updateItem(itemId, 'image', response.data.url);
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploadingImageFor(null);
    }
  };

  const handleSave = async () => {
    if (!editingLink) return;
    
    if (categories.length === 0) {
      alert('Please add at least one category');
      return;
    }
    
    setSaving(true);
    setMessage('');
    
    try {
      await saveMegaMenu({
        pagePath: selectedPage,
        navbarLinkUrl: editingLink.url,
        navbarLinkLabel: editingLink.label,
        categories: normalizeCategories(categories),
        items: normalizeItems(items),
        enabled: true
      });
      
      setMessage('✅ Mega menu saved successfully!');
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      console.error('Error saving mega menu:', error);
      setMessage('❌ Error saving mega menu');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && !isAdmin)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const currentCategoryItems = items.filter(item => item.categoryId === selectedCategoryId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mega Menu Manager</h1>
            <p className="text-gray-600 mt-2">Build mega menus for navbar links</p>
          </div>
          <Link
            href="/admin/navbar"
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Navbar
          </Link>
        </div>

        {/* Page Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Page</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page / Path
              </label>
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {pageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchNavbarLinks}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load Links'}
            </button>
          </div>
        </div>

        {/* Navbar Links */}
        {navbarLinks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Navbar Links for "{getPageLabel(selectedPage)}"</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {navbarLinks.map((link: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="mb-3">
                    <div className="font-medium text-lg">{link.label}</div>
                    <div className="text-sm text-gray-500">{link.url}</div>
                  </div>
                  <button
                    onClick={() => openMegaMenuBuilder(link)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Build Mega Menu
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {navbarLinks.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-lg mb-2">Get Started</h3>
            <p className="text-gray-700">Select a page and click "Load Links" to see navbar links</p>
          </div>
        )}
      </main>
      <Footer />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between bg-gray-50">
              <h2 className="text-2xl font-bold">
                Build Mega Menu: {editingLink?.label}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {message && (
                <div className={`mb-4 p-3 rounded ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {message}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Categories */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Left Column - Categories</h3>
                    <button
                      onClick={addCategory}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      + Add Category
                    </button>
                  </div>
                  
                  <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50 min-h-75">
                    {categories.length === 0 ? (
                      <p className="text-gray-500 text-center py-12">Click "+ Add Category" to start</p>
                    ) : (
                      categories.map((category) => (
                        <div
                          key={category.id}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            selectedCategoryId === category.id
                              ? 'bg-blue-100 border-2 border-blue-500'
                              : 'bg-white border border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedCategoryId(category.id)}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={category.name}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateCategoryName(category.id, e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Category name"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCategory(category.id);
                              }}
                              className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right: Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                      Right Column - Items
                      {selectedCategoryId && categories.find((c: any) => c.id === selectedCategoryId) && (
                        <span className="text-sm font-normal text-gray-600">
                          {' '}for "{categories.find((c: any) => c.id === selectedCategoryId).name}"
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={addItem}
                      disabled={!selectedCategoryId}
                      className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-3 border border-gray-200 rounded-lg p-3 bg-gray-50 min-h-75 max-h-125 overflow-y-auto">
                    {!selectedCategoryId ? (
                      <p className="text-gray-500 text-center py-12">Select a category from the left to add items</p>
                    ) : currentCategoryItems.length === 0 ? (
                      <p className="text-gray-500 text-center py-12">Click "+ Add Item" to start</p>
                    ) : (
                      currentCategoryItems.map((item) => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3">
                          {/* Image Preview - Small thumbnail at top */}
                          {item.image && (
                            <div className="mb-3 flex justify-center">
                              <img 
                                src={item.image} 
                                alt={item.title} 
                                className="h-16 w-auto object-contain rounded border border-gray-200" 
                              />
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., Sofas & Loungers"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                              <input
                                type="text"
                                value={item.url}
                                onChange={(e) => updateItem(item.id, 'url', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="/shop/sofas"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Image</label>
                              <p className="text-xs text-gray-400 mb-1.5">📐 Recommended: 400×300px (4:3, JPG/WEBP)</p>
                              <div className="flex gap-2">
                                <label key={`upload-${item.id}`} className="flex-1">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      const capturedId = item.id;
                                      if (file) {
                                        handleImageUpload(capturedId, file);
                                        e.target.value = ''; // reset so same file can be re-uploaded
                                      }
                                    }}
                                    className="hidden"
                                    disabled={uploadingImageFor === item.id}
                                  />
                                  <div className={`w-full px-2 py-1.5 border-2 border-dashed rounded text-center text-xs cursor-pointer transition-colors ${
                                    uploadingImageFor === item.id 
                                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                                      : 'border-green-300 hover:border-green-500 hover:bg-green-50'
                                  }`}>
                                    {uploadingImageFor === item.id ? '⏳ Uploading...' : item.image ? '📤 Change' : '📤 Upload'}
                                  </div>
                                </label>
                                {item.image && (
                                  <button
                                    onClick={() => updateItem(item.id, 'image', '')}
                                    className="px-2 py-1.5 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                                    title="Remove image"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="w-full px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t px-6 py-4 flex items-center justify-end gap-3 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || categories.length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {saving ? 'Saving...' : '💾 Save Mega Menu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthState } from '@/hooks/useAuthState';
import { getNavbarItems, createMegaMenuCategory } from '@/services/megaMenuService';

interface MegaMenuBlock {
  id: string;
  type: 'image-card' | 'link-list' | 'promotional-banner';
  order: number;
  enabled: boolean;
  content: {
    image?: string;
    title?: string;
    subtitle?: string;
    link?: string;
    openInNewTab?: boolean;
    sectionTitle?: string;
    links?: Array<{
      label: string;
      url: string;
      icon?: string;
    }>;
    backgroundImage?: string;
    heading?: string;
    description?: string;
    ctaText?: string;
    ctaUrl?: string;
  };
}

export default function NewMegaMenuCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, isAdmin } = useAuthState();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [navbarItems, setNavbarItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    icon: '',
    order: 1,
    enabled: true,
    parentNavbarItem: searchParams.get('navbar') || ''
  });
  const [blocks, setBlocks] = useState<MegaMenuBlock[]>([]);

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
      }
    } catch (error) {
      console.error('Error fetching navbar items:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (field: string, value: any) => {
    if (field === 'title') {
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: generateSlug(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addBlock = (type: 'image-card' | 'link-list' | 'promotional-banner') => {
    const newBlock: MegaMenuBlock = {
      id: `block-${Date.now()}`,
      type,
      order: blocks.length + 1,
      enabled: true,
      content: type === 'link-list' 
        ? { sectionTitle: '', links: [] }
        : type === 'image-card'
        ? { title: '', subtitle: '', image: '', link: '', openInNewTab: false }
        : { heading: '', description: '', backgroundImage: '', ctaText: '', ctaUrl: '' }
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (blockId: string, field: string, value: any) => {
    setBlocks(blocks.map(block => 
      block.id === blockId 
        ? { ...block, [field]: value }
        : block
    ));
  };

  const updateBlockContent = (blockId: string, field: string, value: any) => {
    setBlocks(blocks.map(block => 
      block.id === blockId 
        ? { ...block, content: { ...block.content, [field]: value } }
        : block
    ));
  };

  const addLinkToBlock = (blockId: string) => {
    setBlocks(blocks.map(block => 
      block.id === blockId && block.type === 'link-list'
        ? { 
            ...block, 
            content: { 
              ...block.content, 
              links: [...(block.content.links || []), { label: '', url: '', icon: '' }] 
            } 
          }
        : block
    ));
  };

  const updateLinkInBlock = (blockId: string, linkIndex: number, field: string, value: any) => {
    setBlocks(blocks.map(block => 
      block.id === blockId && block.type === 'link-list'
        ? {
            ...block,
            content: {
              ...block.content,
              links: block.content.links?.map((link, index) =>
                index === linkIndex ? { ...link, [field]: value } : link
              )
            }
          }
        : block
    ));
  };

  const removeLinkFromBlock = (blockId: string, linkIndex: number) => {
    setBlocks(blocks.map(block => 
      block.id === blockId && block.type === 'link-list'
        ? {
            ...block,
            content: {
              ...block.content,
              links: block.content.links?.filter((_, index) => index !== linkIndex)
            }
          }
        : block
    ));
  };

  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    if (!formData.parentNavbarItem) {
      alert('Please select a navbar item');
      return;
    }

    try {
      setSaving(true);
      const response = await createMegaMenuCategory({
        ...formData,
        blocks
      });
      
      if (response?.success) {
        router.push('/admin/mega-menu/categories');
      } else {
        alert('Failed to create category');
      }
    } catch (error: any) {
      console.error('Error creating category:', error);
      alert('Error creating category');
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-3xl font-bold">Create New Mega Menu Category</h1>
          <Link
            href="/admin/mega-menu/categories"
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Categories
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Category title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="category-slug"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="🏠 or emoji"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Navbar Item *
                </label>
                <select
                  value={formData.parentNavbarItem}
                  onChange={(e) => handleInputChange('parentNavbarItem', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select navbar item</option>
                  {navbarItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
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
            </div>
          </div>

          {/* Content Blocks */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Content Blocks</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addBlock('link-list')}
                  className="px-3 py-1 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm"
                >
                  + Link List
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('image-card')}
                  className="px-3 py-1 border border-green-300 text-green-600 rounded-md hover:bg-green-50 transition-colors text-sm"
                >
                  + Image Card
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('promotional-banner')}
                  className="px-3 py-1 border border-purple-300 text-purple-600 rounded-md hover:bg-purple-50 transition-colors text-sm"
                >
                  + Banner
                </button>
              </div>
            </div>

            {blocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No content blocks added yet. Add blocks to create your mega menu content.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {blocks.map((block, index) => (
                  <div key={block.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold capitalize">
                        {block.type.replace('-', ' ')} {index + 1}
                      </h3>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={block.enabled}
                            onChange={(e) => updateBlock(block.id, 'enabled', e.target.checked)}
                            className="h-4 w-4"
                          />
                          Enabled
                        </label>
                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          className="px-2 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {block.type === 'link-list' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={block.content.sectionTitle || ''}
                            onChange={(e) => updateBlockContent(block.id, 'sectionTitle', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Section title"
                          />
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Links
                            </label>
                            <button
                              type="button"
                              onClick={() => addLinkToBlock(block.id)}
                              className="px-2 py-1 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm"
                            >
                              + Add Link
                            </button>
                          </div>
                          
                          {block.content.links?.map((link, linkIndex) => (
                            <div key={linkIndex} className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={link.label}
                                onChange={(e) => updateLinkInBlock(block.id, linkIndex, 'label', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Link label"
                              />
                              <input
                                type="text"
                                value={link.url}
                                onChange={(e) => updateLinkInBlock(block.id, linkIndex, 'url', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="/url"
                              />
                              <button
                                type="button"
                                onClick={() => removeLinkFromBlock(block.id, linkIndex)}
                                className="px-2 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {block.type === 'image-card' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image URL
                          </label>
                          <input
                            type="text"
                            value={block.content.image || ''}
                            onChange={(e) => updateBlockContent(block.id, 'image', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={block.content.title || ''}
                              onChange={(e) => updateBlockContent(block.id, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Card title"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Subtitle
                            </label>
                            <input
                              type="text"
                              value={block.content.subtitle || ''}
                              onChange={(e) => updateBlockContent(block.id, 'subtitle', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Card subtitle"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link URL
                          </label>
                          <input
                            type="text"
                            value={block.content.link || ''}
                            onChange={(e) => updateBlockContent(block.id, 'link', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="/product-url"
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`open-in-new-tab-${block.id}`}
                            checked={block.content.openInNewTab || false}
                            onChange={(e) => updateBlockContent(block.id, 'openInNewTab', e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`open-in-new-tab-${block.id}`} className="ml-2 text-sm font-medium text-gray-700">
                            Open in new tab
                          </label>
                        </div>
                      </div>
                    )}

                    {block.type === 'promotional-banner' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Background Image URL
                          </label>
                          <input
                            type="text"
                            value={block.content.backgroundImage || ''}
                            onChange={(e) => updateBlockContent(block.id, 'backgroundImage', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/bg-image.jpg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Heading
                          </label>
                          <input
                            type="text"
                            value={block.content.heading || ''}
                            onChange={(e) => updateBlockContent(block.id, 'heading', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Banner heading"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={block.content.description || ''}
                            onChange={(e) => updateBlockContent(block.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Banner description"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CTA Button Text
                            </label>
                            <input
                              type="text"
                              value={block.content.ctaText || ''}
                              onChange={(e) => updateBlockContent(block.id, 'ctaText', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Shop Now"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CTA Button URL
                            </label>
                            <input
                              type="text"
                              value={block.content.ctaUrl || ''}
                              onChange={(e) => updateBlockContent(block.id, 'ctaUrl', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="/shop"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/mega-menu/categories"
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDownIcon, ChevronRightIcon, XIcon, PlusIcon, GripVerticalIcon, TrashIcon, EditIcon, ImageIcon, LinkIcon, BannerIcon } from 'lucide-react';

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

interface MegaMenuCategory {
  _id: string;
  title: string;
  slug: string;
  icon?: string;
  order: number;
  enabled: boolean;
  parentNavbarItem?: string;
  blocks: MegaMenuBlock[];
}

interface NavbarItem {
  _id: string;
  title: string;
  enableMegaMenu: boolean;
  order: number;
  enabled: boolean;
  megaMenuCategories: MegaMenuCategory[];
}

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: NavbarItem[];
  onUpdateCategories?: (categories: NavbarItem[]) => void;
}

export default function MegaMenu({ isOpen, onClose, categories, onUpdateCategories }: MegaMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MegaMenuCategory | null>(null);
  const [editingBlock, setEditingBlock] = useState<MegaMenuBlock | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: 'category' | 'block'; id: string } | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      setSelectedCategory(null);
      setIsEditing(false);
      setEditingCategory(null);
        setEditingBlock(null);
      setDraggedItem(null);
        setDragOverItem(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleDragStart = (type: 'category' | 'block', id: string) => {
    setDraggedItem({ type, id });
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverItem(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string, targetType: 'category' | 'block') => {
    e.preventDefault();
    setDragOverItem(null);

    if (!draggedItem) return;

    // Handle category reordering
    if (draggedItem.type === 'category' && targetType === 'category') {
      const updatedCategories = [...categories];
      const draggedIndex = updatedCategories.findIndex(cat => cat._id === draggedItem.id);
      const targetIndex = updatedCategories.findIndex(cat => cat._id === targetId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedCategory] = updatedCategories.splice(draggedIndex, 1);
        updatedCategories.splice(targetIndex, 0, draggedCategory[0]);
        
        // Update order numbers
        updatedCategories.forEach((cat, index) => {
          cat.order = index + 1;
        });
        
        onUpdateCategories(updatedCategories);
      }
    }

    // Handle block reordering within category
    if (draggedItem.type === 'block' && targetType === 'block') {
      setSelectedCategory(prev => {
        if (!prev) return prev;
        
        const updatedCategory = { ...prev };
        const draggedIndex = updatedCategory.blocks.findIndex(block => block.id === draggedItem.id);
        const targetIndex = updatedCategory.blocks.findIndex(block => block.id === targetId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
          const [draggedBlock] = updatedCategory.blocks.splice(draggedIndex, 1);
          updatedCategory.blocks.splice(targetIndex, 0, draggedBlock[0]);
          
          // Update order numbers
          updatedCategory.blocks.forEach((block, index) => {
            block.order = index + 1;
          });
          
          return updatedCategory;
        }
        return prev;
      });
    }

    setDraggedItem(null);
  };

  const addBlock = (categoryId: string, type: MegaMenuBlock['type']) => {
    const newBlock: MegaMenuBlock = {
      id: Date.now().toString(),
      type,
      order: 1,
      enabled: true,
      content: type === 'image-card' ? {
        title: 'New Image Card',
        link: '#',
      } : type === 'link-list' ? {
        sectionTitle: 'New Link Section',
        links: [],
      } : {
        heading: 'New Promotion',
        description: 'Description here',
        ctaText: 'Shop Now',
        ctaUrl: '#',
      }
    };

    setSelectedCategory(prev => {
      if (!prev) return prev;
      
      const updatedCategory = { ...prev };
      const maxOrder = Math.max(...updatedCategory.blocks.map(b => b.order), 0);
      newBlock.order = maxOrder + 1;
      updatedCategory.blocks = [...updatedCategory.blocks, newBlock];
      
      return updatedCategory;
    });
  };

  const updateBlock = (blockId: string, updates: Partial<MegaMenuBlock>) => {
    setSelectedCategory(prev => {
      if (!prev) return prev;
      
      const updatedCategory = { ...prev };
      const blockIndex = updatedCategory.blocks.findIndex(block => block.id === blockId);
      
      if (blockIndex !== -1) {
        updatedCategory.blocks[blockIndex] = { ...updatedCategory.blocks[blockIndex], ...updates };
        return updatedCategory;
      }
      
      return prev;
    });
  };

  const deleteBlock = (blockId: string) => {
    setSelectedCategory(prev => {
      if (!prev) return prev;
      
      const updatedCategory = { ...prev };
      updatedCategory.blocks = updatedCategory.blocks.filter(block => block.id !== blockId);
      
      // Reorder remaining blocks
      updatedCategory.blocks.forEach((block, index) => {
        block.order = index + 1;
      });
      
      return updatedCategory;
    });
  };

  const addLink = (blockId: string) => {
    updateBlock(blockId, {
      content: {
        ...selectedCategory?.blocks.find(b => b.id === blockId)?.content,
        links: [
          ...(selectedCategory?.blocks.find(b => b.id === blockId)?.content as any)?.links || []),
          { label: 'New Link', url: '#', icon: '' }
        ]
      }
    });
  };

  const updateLink = (blockId: string, linkIndex: number, updates: { label?: string; url?: string; icon?: string }) => {
    setSelectedCategory(prev => {
      if (!prev) return prev;
      
      const updatedCategory = { ...prev };
      const block = updatedCategory.blocks.find(b => b.id === blockId);
      
      if (block && block.type === 'link-list') {
        const updatedLinks = [...(block.content as any).links];
        updatedLinks[linkIndex] = { ...updatedLinks[linkIndex], ...updates };
        
        updateBlock(blockId, {
          content: {
            ...block.content,
            links: updatedLinks
          }
        });
      }
      
      return prev;
    });
  };

  const deleteLink = (blockId: string, linkIndex: number) => {
    setSelectedCategory(prev => {
      if (!prev) return prev;
      
      const updatedCategory = { ...prev };
      const block = updatedCategory.blocks.find(b => b.id === blockId);
      
      if (block && block.type === 'link-list') {
        const updatedLinks = [...(block.content as any).links];
        updatedLinks.splice(linkIndex, 1);
        
        updateBlock(blockId, {
          content: {
            ...block.content,
            links: updatedLinks
          }
        });
      }
      
      return prev;
    });
  };

  const toggleBlock = (blockId: string) => {
    updateBlock(blockId, { enabled: !selectedCategory?.blocks.find(b => b.id === blockId)?.enabled });
  };

  const renderBlock = (block: MegaMenuBlock, categoryId: string) => {
    const isEditingThisBlock = isEditing && editingBlock?.id === block.id;

    switch (block.type) {
      case 'image-card':
        return (
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium">Image Card</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingBlock(block)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <EditIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleBlock(block.id)}
                  className={`p-1 rounded ${block.enabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <BannerIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={block.content.image || ''}
                  onChange={(e) => updateBlock(block.id, { content: { ...block.content, image: e.target.value } })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={block.content.title || ''}
                  onChange={(e) => updateBlock(block.id, { content: { ...block.content, title: e.target.value } })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle (Optional)</label>
                <input
                  type="text"
                  value={block.content.subtitle || ''}
                  onChange={(e) => updateBlock(block.id, { content: { ...block.content, subtitle: e.target.value } })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter subtitle"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Link URL</label>
                <input
                  type="url"
                  value={block.content.link || ''}
                  onChange={(e) => updateBlock(block.id, { content: { ...block.content, link: e.target.value } })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={block.content.openInNewTab || false}
                  onChange={(e) => updateBlock(block.id, { content: { ...block.content, openInNewTab: e.target.checked } })}
                  className="mr-2"
                />
                <label className="text-sm">Open in new tab</label>
              </div>
            </div>
          </div>
        );

      case 'link-list':
        return (
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium">Link List</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingBlock(block)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <EditIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleBlock(block.id)}
                  className={`p-1 rounded ${block.enabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <BannerIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Section Title</label>
                <input
                  type="text"
                  value={block.content.sectionTitle || ''}
                  onChange={(e) => updateBlock(block.id, { content: { ...block.content, sectionTitle: e.target.value } })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter section title"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium">Links</h5>
                  <button
                    onClick={() => addLink(block.id)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                
                {(block.content as any).links?.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLink(block.id, index, { label: e.target.value })}
                        className="p-1 border border-gray-300 rounded"
                        placeholder="Link label"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(block.id, index, { url: e.target.value })}
                        className="p-1 border border-gray-300 rounded"
                        placeholder="https://example.com"
                      />
                      <input
                        type="text"
                        value={link.icon || ''}
                        onChange={(e) => updateLink(block.id, index, { icon: e.target.value })}
                        className="p-1 border border-gray-300 rounded"
                        placeholder="Icon name (optional)"
                      />
                    </div>
                    <button
                      onClick={() => deleteLink(block.id, index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'promotional-banner':
        return (
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium">Promotional Banner</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingBlock(block)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <EditIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleBlock(block.id)}
                  className={`p-1 rounded ${block.enabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <BannerIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Background Image URL</label>
                <input
                  type="url"
                  value={block.content.backgroundImage || ''}
                  onChange={(e) => updateBlock(block.id, { content: { ...block.content, backgroundImage: e.target.value } })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Heading</label>
                <input
                  type="text"
                  value={block.content.heading || ''}
                  onChange={(e) => updateBlock(block.id, { content: { ...block.content, heading: e.target.value } })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter heading"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={block.content.description || ''}
                  onChange={(e) => updateBlock(block.id, { content: { ...block.content, description: e.target.value } })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={block.content.ctaText || ''}
                  onChange={(e) => updateBlock(block.id, { content: { ...block.content, ctaText: e.target.value } })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Shop Now"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">CTA URL</label>
                <input
                  type="url"
                  value={block.content.ctaUrl || ''}
                  onChange={(e) => updateBlock(block.id, { content: { ...block.content, ctaUrl: e.target.value } })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderCategoryEditor = () => {
    if (!selectedCategory || !isEditing) return null;

    const category = categories.find(cat => cat._id === selectedCategory);
    if (!category) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Edit Category: {category.title}</h2>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingCategory(null);
              }}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Category Title</label>
                <input
                  type="text"
                  value={editingCategory?.title || ''}
                  onChange={(e) => setEditingCategory(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={editingCategory?.slug || ''}
                  onChange={(e) => setEditingCategory(prev => prev ? { ...prev, slug: e.target.value } : null)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Icon (Optional)</label>
                <input
                  type="text"
                  value={editingCategory?.icon || ''}
                  onChange={(e) => setEditingCategory(prev => prev ? { ...prev, icon: e.target.value } : null)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="lucide-icon-name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input
                  type="number"
                  value={editingCategory?.order || 1}
                  onChange={(e) => setEditingCategory(prev => prev ? { ...prev, order: parseInt(e.target.value) || 1 } : null)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="1"
                />
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Mega Menu Blocks</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => addBlock(selectedCategory, 'image-card')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Add Image Card
                  </button>
                  
                  <button
                    onClick={() => addBlock(selectedCategory, 'link-list')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Add Link List
                  </button>
                  
                  <button
                    onClick={() => addBlock(selectedCategory, 'promotional-banner')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    <BannerIcon className="w-4 h-4 mr-2" />
                    Add Promotional Banner
                  </button>
                </div>
                
                {category.blocks
                  .sort((a, b) => a.order - b.order)
                  .map(block => (
                    <div key={block.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            draggable
                            onDragStart={() => handleDragStart('block', block.id)}
                            onDragOver={(e) => handleDragOver(e, block.id)}
                            onDrop={(e) => handleDrop(e, block.id, 'block')}
                            className="cursor-move"
                          >
                            <GripVerticalIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="text-sm font-medium">
                            {block.type === 'image-card' && 'Image Card'}
                            {block.type === 'link-list' && 'Link List'}
                            {block.type === 'promotional-banner' && 'Promotional Banner'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleBlock(block.id)}
                            className={`p-1 rounded ${block.enabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                          >
                            <BannerIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBlock(block.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {renderBlock(block, selectedCategory)}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMegaMenuContent = () => {
    if (!selectedCategory) return null;

    const category = categories.find(cat => cat._id === selectedCategory);
    if (!category) return null;

    const enabledBlocks = category.blocks
      .filter(block => block.enabled)
      .sort((a, b) => a.order - b.order);

    return (
      <div className="absolute left-full top-full mt-2 w-screen max-w-6xl bg-white shadow-2xl border border-gray-200 rounded-b-lg z-50">
        <div className="grid grid-cols-12 gap-0">
          {/* Left Panel - Category List */}
          <div className="col-span-4 bg-gray-50 border-r border-gray-200 p-4">
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            <div className="space-y-2">
              {categories
                .filter(cat => cat.enabled)
                .sort((a, b) => a.order - b.order)
                .map(cat => (
                  <div
                    key={cat._id}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      cat._id === selectedCategory
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedCategory(cat._id)}
                  >
                    <div className="flex items-center gap-3">
                      {cat.icon && <span className="text-xl">{cat.icon}</span>}
                      <span className="font-medium">{cat.title}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Right Panel - Dynamic Content */}
          <div className="col-span-8 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{category.title}</h2>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditingCategory(category);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Edit Category
              </button>
            </div>

            <div className="space-y-6">
              {enabledBlocks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BannerIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No content blocks enabled for this category.</p>
                  <p className="text-sm">Edit this category to add content blocks.</p>
                </div>
              ) : (
                enabledBlocks.map(block => (
                  <div key={block.id}>
                    {block.type === 'image-card' && (
                      <Link
                        href={block.content.link || '#'}
                        target={block.content.openInNewTab ? '_blank' : '_self'}
                        className="block group"
                      >
                        <div className="relative overflow-hidden rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                          {block.content.image && (
                            <div className="aspect-video bg-gray-100">
                              <Image
                                src={block.content.image}
                                alt={block.content.title}
                                width={400}
                                height={300}
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-6">
                            <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600">
                              {block.content.title}
                            </h3>
                            {block.content.subtitle && (
                              <p className="text-gray-600 text-sm mb-4">
                                {block.content.subtitle}
                              </p>
                            )}
                            <div className="flex items-center text-blue-600 font-medium">
                              Shop Now
                              <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    )}

                    {block.type === 'link-list' && (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-4">
                          {block.content.sectionTitle}
                        </h3>
                        <div className="space-y-3">
                          {(block.content as any).links?.map((link, index) => (
                            <Link
                              key={index}
                              href={link.url}
                              className="flex items-center p-3 rounded-lg hover:bg-white transition-colors group"
                            >
                              {link.icon && <span className="text-xl mr-3">{link.icon}</span>}
                              <span className="font-medium group-hover:text-blue-600">{link.label}</span>
                              <ChevronRightIcon className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {block.type === 'promotional-banner' && (
                      <div className="relative overflow-hidden rounded-lg">
                        {block.content.backgroundImage && (
                          <div className="aspect-video">
                            <Image
                              src={block.content.backgroundImage}
                              alt={block.content.heading}
                              width={800}
                              height={400}
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/40 flex items-center justify-center p-8">
                          <div className="text-center text-white">
                            <h3 className="text-3xl font-bold mb-4">
                              {block.content.heading}
                            </h3>
                            {block.content.description && (
                              <p className="text-lg mb-6 max-w-2xl">
                                {block.content.description}
                              </p>
                            )}
                            <Link
                              href={block.content.ctaUrl || '#'}
                              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              {block.content.ctaText || 'Shop Now'}
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="relative" ref={menuRef}>
      {renderMegaMenuContent()}
      {renderCategoryEditor()}
    </div>
  );
}

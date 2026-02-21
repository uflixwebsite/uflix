'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRightIcon,
  XIcon,
  PlusIcon,
  GripVerticalIcon,
  TrashIcon,
  EditIcon,
  ImageIcon,
  LinkIcon,
  LayoutIcon
} from 'lucide-react';

interface MegaMenuBlock {
  id: string;
  type: 'image-card' | 'link-list' | 'promotional-banner';
  order: number;
  enabled: boolean;
  content: any;
}

interface MegaMenuCategory {
  _id: string;
  title: string;
  slug: string;
  icon?: string;
  order: number;
  enabled: boolean;
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
  categories: MegaMenuCategory[];
  onUpdateCategories?: (categories: MegaMenuCategory[]) => void;
}

export default function MegaMenu({
  isOpen,
  onClose,
  categories,
  onUpdateCategories
}: MegaMenuProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find(c => c._id === selectedCategoryId) || null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
        setSelectedCategoryId(null);
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const updateCategory = (updatedCategory: MegaMenuCategory) => {
    const updated = categories.map(cat =>
      cat._id === updatedCategory._id ? updatedCategory : cat
    );
    onUpdateCategories?.(updated);
  };

  const updateBlock = (blockId: string, updates: Partial<MegaMenuBlock>) => {
    if (!selectedCategory) return;

    const updatedBlocks = selectedCategory.blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );

    updateCategory({ ...selectedCategory, blocks: updatedBlocks });
  };

  const deleteBlock = (blockId: string) => {
    if (!selectedCategory) return;

    const updatedBlocks = selectedCategory.blocks
      .filter(b => b.id !== blockId)
      .map((b, i) => ({ ...b, order: i + 1 }));

    updateCategory({ ...selectedCategory, blocks: updatedBlocks });
  };

  const addBlock = (type: MegaMenuBlock['type']) => {
    if (!selectedCategory) return;

    const newBlock: MegaMenuBlock = {
      id: Date.now().toString(),
      type,
      order: selectedCategory.blocks.length + 1,
      enabled: true,
      content: {}
    };

    updateCategory({
      ...selectedCategory,
      blocks: [...selectedCategory.blocks, newBlock]
    });
  };

  const toggleBlock = (blockId: string) => {
    if (!selectedCategory) return;

    const block = selectedCategory.blocks.find(b => b.id === blockId);
    if (!block) return;

    updateBlock(blockId, { enabled: !block.enabled });
  };

  if (!isOpen) return null;

  return (
    <div className="relative" ref={menuRef}>
      <div className="absolute left-0 top-full mt-2 w-screen max-w-6xl bg-white shadow-2xl border border-gray-200 rounded-b-lg z-50">
        <div className="grid grid-cols-12">
          {/* LEFT PANEL */}
          <div className="col-span-4 bg-gray-50 border-r border-gray-200 p-4">
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            {categories
              .filter(cat => cat.enabled)
              .sort((a, b) => a.order - b.order)
              .map(cat => (
                <div
                  key={cat._id}
                  onClick={() => setSelectedCategoryId(cat._id)}
                  className={`p-3 rounded cursor-pointer ${
                    selectedCategoryId === cat._id
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {cat.title}
                </div>
              ))}
          </div>

          {/* RIGHT PANEL */}
          <div className="col-span-8 p-6">
            {selectedCategory ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{selectedCategory.title}</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    <EditIcon className="w-4 h-4 inline mr-2" />
                    Edit Category
                  </button>
                </div>

                <div className="space-y-6">
                  {selectedCategory.blocks
                    .filter(b => b.enabled)
                    .sort((a, b) => a.order - b.order)
                    .map(block => (
                      <div key={block.id} className="border rounded-lg p-4">
                        <div className="flex justify-between mb-3">
                          <span className="font-medium">{block.type}</span>
                          <div className="flex gap-2">
                            <button onClick={() => toggleBlock(block.id)}>
                              <ImageIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteBlock(block.id)}>
                              <TrashIcon className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {isEditing && (
                  <div className="mt-6 space-x-4">
                    <button
                      onClick={() => addBlock('image-card')}
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                      <ImageIcon className="w-4 h-4 inline mr-2" />
                      Add Image Card
                    </button>
                    <button
                      onClick={() => addBlock('link-list')}
                      className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                      <LinkIcon className="w-4 h-4 inline mr-2" />
                      Add Link List
                    </button>
                    <button
                      onClick={() => addBlock('promotional-banner')}
                      className="px-4 py-2 bg-purple-600 text-white rounded"
                    >
                      <LayoutIcon className="w-4 h-4 inline mr-2" />
                      Add Banner
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-500">Select a category</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
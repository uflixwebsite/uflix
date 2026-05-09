'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import api from '@/services/api';
import { uploadMultipleImages } from '@/services/uploadService';

interface Variant {
  _id: string;
  name?: string;
  sku: string;
  color: string;
  size: string;
  price?: number;
  discountPrice?: number;
  stock: { quantity: number; reserved: number };
  images: Array<{ url: string; alt?: string }>;
  description?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  weight?: {
    value?: number;
    unit?: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface VariantManagerEnhancedProps {
  productId: string;
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
  productFolder?: string;
  baseName?: string;
  baseDescription?: string;
  basePrice?: number;
  baseDiscountPrice?: number;
  baseImages?: Array<{ url: string; alt?: string }>;
  baseDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  baseWeight?: {
    value?: number;
    unit?: string;
  };
}

export default function VariantManagerEnhanced({
  productId,
  variants,
  onVariantsChange,
  productFolder = 'uncategorized',
  baseName = '',
  baseDescription = '',
  basePrice,
  baseDiscountPrice,
  baseImages = [],
  baseDimensions,
  baseWeight
}: VariantManagerEnhancedProps) {
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [variantType, setVariantType] = useState<'color' | 'size' | ''>('');
  const [selectedBaseImageIndexes, setSelectedBaseImageIndexes] = useState<number[]>([]);
  const [variantImages, setVariantImages] = useState<File[]>([]);
  const [variantImagePreviews, setVariantImagePreviews] = useState<string[]>([]);
  const [variantExistingImages, setVariantExistingImages] = useState<Array<{ url: string; alt?: string }>>([]);
  const [newVariant, setNewVariant] = useState({
    name: baseName || '',
    color: '',
    size: '',
    price: basePrice?.toString() || '',
    discountPrice: baseDiscountPrice?.toString() || '',
    stock: '0',
    sku: '',
    description: baseDescription || '',
    dimensions: {
      length: baseDimensions?.length?.toString() || '',
      width: baseDimensions?.width?.toString() || '',
      height: baseDimensions?.height?.toString() || '',
      unit: baseDimensions?.unit || 'cm'
    },
    weight: {
      value: baseWeight?.value?.toString() || '',
      unit: baseWeight?.unit || 'kg'
    }
  });

  useEffect(() => {
    setSelectedBaseImageIndexes(baseImages.map((_, index) => index));
  }, [baseImages]);

  const createEmptyVariantState = () => ({
    name: baseName || '',
    color: '',
    size: '',
    price: basePrice?.toString() || '',
    discountPrice: baseDiscountPrice?.toString() || '',
    stock: '0',
    sku: '',
    description: baseDescription || '',
    dimensions: {
      length: baseDimensions?.length?.toString() || '',
      width: baseDimensions?.width?.toString() || '',
      height: baseDimensions?.height?.toString() || '',
      unit: baseDimensions?.unit || 'cm'
    },
    weight: {
      value: baseWeight?.value?.toString() || '',
      unit: baseWeight?.unit || 'kg'
    }
  });

  const closeVariantModal = () => {
    setShowVariantModal(false);
    setModalMode('add');
    setEditingVariantId(null);
    setVariantType('');
    setNewVariant(createEmptyVariantState());
    setVariantImages([]);
    setVariantImagePreviews([]);
    setVariantExistingImages([]);
    setSelectedBaseImageIndexes(baseImages.map((_, index) => index));
  };

  const openAddVariantModal = () => {
    setModalMode('add');
    setEditingVariantId(null);
    setVariantType('');
    setNewVariant(createEmptyVariantState());
    setVariantImages([]);
    setVariantImagePreviews([]);
    setVariantExistingImages([]);
    setSelectedBaseImageIndexes(baseImages.map((_, index) => index));
    setShowVariantModal(true);
  };

  const openEditVariantModal = (variant: Variant) => {
    setModalMode('edit');
    setEditingVariantId(variant._id);
    setVariantType(variant.color ? 'color' : 'size');
    setNewVariant({
      name: variant.name || baseName || '',
      color: variant.color || '',
      size: variant.size || '',
      price: variant.price?.toString() || basePrice?.toString() || '',
      discountPrice: variant.discountPrice?.toString() || baseDiscountPrice?.toString() || '',
      stock: variant.stock?.quantity?.toString() || '0',
      sku: variant.sku || '',
      description: variant.description || baseDescription || '',
      dimensions: {
        length: variant.dimensions?.length?.toString() || baseDimensions?.length?.toString() || '',
        width: variant.dimensions?.width?.toString() || baseDimensions?.width?.toString() || '',
        height: variant.dimensions?.height?.toString() || baseDimensions?.height?.toString() || '',
        unit: variant.dimensions?.unit || baseDimensions?.unit || 'cm'
      },
      weight: {
        value: variant.weight?.value?.toString() || baseWeight?.value?.toString() || '',
        unit: variant.weight?.unit || baseWeight?.unit || 'kg'
      }
    });
    setSelectedBaseImageIndexes(
      baseImages
        .map((image, index) => ({ image, index }))
        .filter(({ image }) => variant.images?.some((variantImage) => variantImage.url === image.url))
        .map(({ index }) => index)
    );
    setVariantExistingImages(variant.images || []);
    setVariantImages([]);
    setVariantImagePreviews([]);
    setShowVariantModal(true);
  };

  const handleVariantImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const totalImages = selectedBaseImageIndexes.length + variantImages.length + files.length;
    if (totalImages > 6) {
      alert('You can include up to 6 images in a variant.');
      return;
    }

    setVariantImages((prev) => [...prev, ...files]);
    setVariantImagePreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
  };

  const toggleBaseImage = (index: number) => {
    setSelectedBaseImageIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const removeVariantImage = (index: number) => {
    setVariantImages((prev) => prev.filter((_, i) => i !== index));
    setVariantImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveVariant = async () => {
    if (!variantType) {
      alert('Please select a variant type (Color or Size)');
      return;
    }

    if (!newVariant[variantType]) {
      alert(`Please fill in ${variantType}`);
      return;
    }

    try {
      const selectedBaseImages = selectedBaseImageIndexes.map((index) => baseImages[index]).filter(Boolean);
      let imagePayload = [...selectedBaseImages, ...variantExistingImages];
      if (variantImages.length > 0) {
        const uploadResponse = await uploadMultipleImages(variantImages, `${productFolder}/variants`);
        imagePayload = [...imagePayload, ...(uploadResponse.data || [])];
      }

      const payload = {
        name: newVariant.name || undefined,
        color: newVariant.color,
        size: newVariant.size,
        price: newVariant.price ? parseFloat(newVariant.price) : undefined,
        discountPrice: newVariant.discountPrice ? parseFloat(newVariant.discountPrice) : undefined,
        stock: newVariant.stock ? parseInt(newVariant.stock, 10) : 0,
        sku: newVariant.sku || undefined,
        description: newVariant.description || undefined,
        dimensions: {
          length: newVariant.dimensions.length ? parseFloat(newVariant.dimensions.length) : undefined,
          width: newVariant.dimensions.width ? parseFloat(newVariant.dimensions.width) : undefined,
          height: newVariant.dimensions.height ? parseFloat(newVariant.dimensions.height) : undefined,
          unit: newVariant.dimensions.unit || 'cm'
        },
        weight: {
          value: newVariant.weight.value ? parseFloat(newVariant.weight.value) : undefined,
          unit: newVariant.weight.unit || 'kg'
        },
        images: imagePayload,
      };

      const response = modalMode === 'edit' && editingVariantId
        ? await api.put(`/products/${productId}/variants/${editingVariantId}`, payload)
        : await api.post(`/products/${productId}/variants`, payload);

      const data = response.data;
      onVariantsChange(data.data.variants);
      closeVariantModal();
    } catch (error: any) {
      console.error('Error saving variant:', error);
      alert(error.message || 'Failed to save variant');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const response = await api.delete(`/products/${productId}/variants/${variantId}`);
      const data = response.data;
      onVariantsChange(data.data.variants);
    } catch (error: any) {
      console.error('Error deleting variant:', error);
      alert(error.message || 'Failed to delete variant');
    }
  };

  const handleVariantFieldChange = (variantId: string, field: string, value: any) => {
    const updatedVariants = variants.map((variant) => {
      if (variant._id !== variantId) return variant;
      if (field.includes('.')) {
        const parts = field.split('.');
        if (parts.length === 2) {
          const [parent, child] = parts;
          if (parent === 'stock') {
            return { ...variant, stock: { ...variant.stock, [child]: value } };
          } else if (parent === 'dimensions') {
            return { ...variant, dimensions: { ...variant.dimensions, [child]: value } };
          } else if (parent === 'weight') {
            return { ...variant, weight: { ...variant.weight, [child]: value } };
          }
        }
      }
      return { ...variant, [field]: value };
    });
    onVariantsChange(updatedVariants);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Product Variants</h2>

      <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div>
          <p className="text-xs text-gray-600 mb-1">Total Variants</p>
          <p className="text-2xl font-bold text-accent">{variants.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Total Stock</p>
          <p className="text-2xl font-bold text-blue-600">
            {variants.reduce((sum, variant) => sum + (variant.stock.quantity || 0), 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Active Variants</p>
          <p className="text-2xl font-bold text-green-600">{variants.filter((variant) => variant.isActive).length}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dims / Weight</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {variants.map((variant, rowIdx) => {
              const isColor = !!variant.color;
              const isSize = !!variant.size;
              const variantValue = variant.color || variant.size || '—';
              const dims = variant.dimensions?.length && variant.dimensions?.width && variant.dimensions?.height
                ? `${variant.dimensions.length}×${variant.dimensions.width}×${variant.dimensions.height} ${variant.dimensions.unit || 'cm'}`
                : null;
              const wt = variant.weight?.value
                ? `${variant.weight.value} ${variant.weight.unit || 'kg'}`
                : null;

              return (
                <tr key={variant._id} className="hover:bg-gray-50 transition-colors">
                  {/* Row number */}
                  <td className="px-3 py-2.5 text-xs text-gray-400">{rowIdx + 1}</td>

                  {/* Type badge */}
                  <td className="px-3 py-2.5">
                    {isColor && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
                        Colour
                      </span>
                    )}
                    {isSize && !isColor && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                        Size
                      </span>
                    )}
                    {!isColor && !isSize && (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  {/* Value */}
                  <td className="px-3 py-2.5">
                    <span className={`font-semibold text-sm ${isColor ? 'text-blue-700' : 'text-purple-700'}`}>
                      {variantValue}
                    </span>
                  </td>

                  {/* SKU */}
                  <td className="px-3 py-2.5">
                    <span className="inline-block font-mono text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded max-w-[100px] truncate" title={variant.sku}>
                      {variant.sku || '—'}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {variant.discountPrice ? (
                      <span className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-xs">₹{variant.discountPrice}</span>
                        <span className="text-xs line-through text-gray-400">₹{variant.price}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-700">{variant.price ? `₹${variant.price}` : <span className="text-gray-400">Base</span>}</span>
                    )}
                  </td>

                  {/* Dims + Weight */}
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-0.5">
                      {dims && <span className="text-xs text-gray-600 whitespace-nowrap">{dims}</span>}
                      {wt  && <span className="text-xs text-gray-400 whitespace-nowrap">{wt}</span>}
                      {!dims && !wt && <span className="text-xs text-gray-300">—</span>}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                      variant.stock.quantity > 10
                        ? 'bg-green-50 text-green-700'
                        : variant.stock.quantity > 0
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {variant.stock.quantity}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${variant.isActive ? 'bg-green-500' : 'bg-gray-300'}`} title={variant.isActive ? 'Active' : 'Inactive'} />
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openEditVariantModal(variant)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-1"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVariant(variant._id)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Del
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t pt-6">
        <button
          type="button"
          onClick={openAddVariantModal}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
        >
          + Add New Variant
        </button>
      </div>

      {showVariantModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{modalMode === 'edit' ? 'Edit Variant' : 'Add New Variant'}</h3>
              <button
                type="button"
                onClick={closeVariantModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="block text-sm font-semibold text-blue-900 mb-2">Select Variant Type *</label>
                <p className="text-xs text-blue-700 mb-3">Choose what makes this variant different from the base product</p>
                <div className="flex gap-2">
                  {(['color', 'size'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVariantType(type)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium capitalize transition-all ${
                        variantType === type
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-gray-300 text-gray-700 hover:border-accent'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {variantType && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1 capitalize">{variantType} *</label>
                      <input
                        type="text"
                        placeholder={`e.g., ${variantType === 'color' ? 'Black, Blue, Red' : 'S, M, L or 1.5x2.5'}`}
                        value={newVariant[variantType]}
                        onChange={(e) => setNewVariant({ ...newVariant, [variantType]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">SKU (Optional)</label>
                      <input
                        type="text"
                        placeholder="Auto-generated if left blank"
                        value={newVariant.sku}
                        onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Price (Optional - overrides base)</label>
                      <input
                        type="number"
                        placeholder={`Base: ₹${basePrice ?? 0}`}
                        value={newVariant.price}
                        onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Discount Price (Optional)</label>
                      <input
                        type="number"
                        placeholder="Sale price for this variant"
                        value={newVariant.discountPrice}
                        onChange={(e) => setNewVariant({ ...newVariant, discountPrice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newVariant.stock}
                        onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Variant Name (Optional)</label>
                      <input
                        type="text"
                        placeholder={`Base: ${baseName || 'No base name'}`}
                        value={newVariant.name}
                        onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                      <textarea
                        placeholder={`Base: ${baseDescription || 'No base description'}`}
                        value={newVariant.description}
                        onChange={(e) => setNewVariant({ ...newVariant, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Length (Optional)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder={`Base: ${baseDimensions?.length || 'N/A'}`}
                            value={newVariant.dimensions.length}
                            onChange={(e) => setNewVariant({
                              ...newVariant,
                              dimensions: { ...newVariant.dimensions, length: e.target.value }
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <select
                            value={newVariant.dimensions.unit}
                            onChange={(e) => setNewVariant({
                              ...newVariant,
                              dimensions: { ...newVariant.dimensions, unit: e.target.value }
                            })}
                            className="px-2 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="cm">cm</option>
                            <option value="mm">mm</option>
                            <option value="in">in</option>
                            <option value="ft">ft</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Width (Optional)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder={`Base: ${baseDimensions?.width || 'N/A'}`}
                            value={newVariant.dimensions.width}
                            onChange={(e) => setNewVariant({
                              ...newVariant,
                              dimensions: { ...newVariant.dimensions, width: e.target.value }
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <span className="px-2 py-2 text-sm text-gray-500">{newVariant.dimensions.unit}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Height (Optional)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder={`Base: ${baseDimensions?.height || 'N/A'}`}
                            value={newVariant.dimensions.height}
                            onChange={(e) => setNewVariant({
                              ...newVariant,
                              dimensions: { ...newVariant.dimensions, height: e.target.value }
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <span className="px-2 py-2 text-sm text-gray-500">{newVariant.dimensions.unit}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Weight (Optional)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder={`Base: ${baseWeight?.value || 'N/A'}`}
                            value={newVariant.weight.value}
                            onChange={(e) => setNewVariant({
                              ...newVariant,
                              weight: { ...newVariant.weight, value: e.target.value }
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <select
                            value={newVariant.weight.unit}
                            onChange={(e) => setNewVariant({
                              ...newVariant,
                              weight: { ...newVariant.weight, unit: e.target.value }
                            })}
                            className="px-2 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="lb">lb</option>
                            <option value="oz">oz</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium">Variant Images</label>
                  <p className="text-xs text-gray-500">Reuse base images and add new files in the same gallery.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {baseImages.map((img, index) => {
                      const selected = selectedBaseImageIndexes.includes(index);
                      return (
                        <div key={`base-${index}`} className={`relative rounded overflow-hidden border ${selected ? 'border-accent' : 'border-gray-200'}`}>
                          <img src={img.url} alt={img.alt || `Base image ${index + 1}`} className="w-full h-20 object-cover" />
                          <button
                            type="button"
                            onClick={() => toggleBaseImage(index)}
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 text-red-600 flex items-center justify-center text-xs font-bold hover:bg-red-100"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] px-1 py-0.5 text-center">
                            {selected ? 'Included' : 'Excluded'}
                          </div>
                        </div>
                      );
                    })}

                    {variantImagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative rounded overflow-hidden border border-gray-200">
                        <img src={preview} alt={`Variant new ${index + 1}`} className="w-full h-20 object-cover" />
                        <button
                          type="button"
                          onClick={() => removeVariantImage(index)}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 text-red-600 flex items-center justify-center text-xs font-bold hover:bg-red-100"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] px-1 py-0.5 text-center">
                          New
                        </div>
                      </div>
                    ))}

                    <label className="flex items-center justify-center rounded border border-dashed border-gray-300 bg-white/80 p-4 text-sm text-gray-600 cursor-pointer hover:border-accent hover:text-accent transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleVariantImageSelect}
                      />
                      Add images
                    </label>
                  </div>

                  <p className="text-xs text-gray-500">Click the × to remove an image from this variant. Base images show as "Included" or "Excluded". New uploaded images are removed individually.</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleSaveVariant}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {modalMode === 'edit' ? 'Save Changes' : 'Add Variant'}
                </button>
                <button
                  type="button"
                  onClick={closeVariantModal}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';

interface Variant {
  _id: string;
  sku: string;
  color: string;
  size: string;
  price?: number;
  discountPrice?: number;
  stock: { quantity: number; reserved: number };
  images: Array<{ url: string; alt?: string }>;
  isActive: boolean;
  createdAt: string;
}

interface VariantManagerProps {
  productId: string;
  variants: Variant[];
  baseProductName?: string;
  baseDescription?: string;
  onVariantsChange: (variants: Variant[]) => void;
  productName?: string;
  basePrice?: number;
  baseDiscountPrice?: number;
  baseImages?: Array<{ url: string; alt?: string }>;
  baseStock?: number;
}

export default function VariantManager({
  productId,
  variants,
  baseProductName = 'Product',
  baseDescription = '',
  onVariantsChange,
  productName = 'Product',
  basePrice,
  baseDiscountPrice,
  baseImages = [],
  baseStock = 0
}: VariantManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newVariantImages, setNewVariantImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [variantType, setVariantType] = useState<'color' | 'size' | ''>('');
  const [useBaseImages, setUseBaseImages] = useState(true);
  const [newVariant, setNewVariant] = useState({
    color: '',
    size: '',
    price: basePrice?.toString() || '',
    discountPrice: baseDiscountPrice?.toString() || '',
    stock: baseStock?.toString() || '0',
    sku: '',
    description: baseDescription || '',
    variantImages: [] as File[]
  });

  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];

  const handleAddVariant = async () => {
    if (!variantType) {
      alert('Please select a variant type (Color or Size)');
      return;
    }
    if (!newVariant[variantType]) {
      alert(`Please fill in ${variantType}`);
      return;
    }

    try {
      let images: any[] = [];
      
      // Add base images if selected
      if (useBaseImages && baseImages?.length > 0) {
        images = [...baseImages];
      }

      // Upload new variant images if selected
      if (newVariantImages.length > 0) {
        const formData = new FormData();
        newVariantImages.forEach((file) => {
          formData.append('images', file);
        });

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) throw new Error('Failed to upload images');
        
        const uploadData = await uploadResponse.json();
        if (uploadData.data) {
          images = [...images, ...uploadData.data];
        }
      }

      const response = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color: newVariant.color,
          size: newVariant.size,
          price: newVariant.price ? parseFloat(newVariant.price) : undefined,
          discountPrice: newVariant.discountPrice ? parseFloat(newVariant.discountPrice) : undefined,
          stock: newVariant.stock ? parseInt(newVariant.stock) : 0,
          sku: newVariant.sku,
          images: images
        })
      });

      if (!response.ok) throw new Error('Failed to add variant');
      
      const data = await response.json();
      onVariantsChange(data.data.variants);
      setNewVariant({
        color: '',
        size: '',
        price: basePrice?.toString() || '',
        discountPrice: baseDiscountPrice?.toString() || '',
        stock: baseStock?.toString() || '0',
        sku: '',
        description: baseDescription || '',
        variantImages: []
      });
      setVariantType('');
      setUseBaseImages(true);
      setNewVariantImages([]);
      setImagePreviewUrls([]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding variant:', error);
      alert('Failed to add variant');
    }
  };

  const handleUpdateVariant = async (variantId: string) => {
    try {
      const variant = variants.find(v => v._id === variantId);
      if (!variant) return;

      const response = await fetch(`/api/products/${productId}/variants/${variantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variant)
      });

      if (!response.ok) throw new Error('Failed to update variant');
      
      const data = await response.json();
      onVariantsChange(data.data.variants);
      setEditingId(null);
    } catch (error) {
      console.error('Error updating variant:', error);
      alert('Failed to update variant');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const response = await fetch(`/api/products/${productId}/variants/${variantId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to delete variant');
      
      const data = await response.json();
      onVariantsChange(data.data.variants);
    } catch (error) {
      console.error('Error deleting variant:', error);
      alert('Failed to delete variant');
    }
  };

  const handleVariantFieldChange = (variantId: string, field: string, value: any) => {
    const updatedVariants = variants.map(v => {
      if (v._id === variantId) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          if (parent === 'stock') {
            return { ...v, stock: { ...v.stock, [child]: value } };
          }
          return { ...v, [parent]: value };
        }
        return { ...v, [field]: value };
      }
      return v;
    });
    onVariantsChange(updatedVariants);
  };

  const toggleBulkVariantCreation = () => {
    if (!colors.length || !sizes.length) {
      alert('You need at least one color and size to generate bulk variants');
      return;
    }
    // Bulk creation logic can be added here
  };

  return (
    <div className="space-y-6">
      {/* Quick Info */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-600 mb-1">Total Variants</p>
          <p className="text-2xl font-bold text-accent">{variants.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Total Stock</p>
          <p className="text-2xl font-bold text-blue-600">
            {variants.reduce((sum, v) => sum + (v.stock.quantity || 0), 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Active Variants</p>
          <p className="text-2xl font-bold text-green-600">
            {variants.filter(v => v.isActive).length}
          </p>
        </div>
      </div>

      {/* Variants Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">SKU</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Price</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Stock</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  {editingId === variant._id ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) => handleVariantFieldChange(variant._id, 'color', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Color"
                      />
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => handleVariantFieldChange(variant._id, 'size', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Size"
                      />
                    </div>
                  ) : (
                    <span className="text-sm font-medium">
                      {variant.color && <span className="text-blue-600">{variant.color}</span>}
                      {variant.size && <span className="text-purple-600">{variant.size}</span>}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === variant._id ? (
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => handleVariantFieldChange(variant._id, 'sku', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  ) : (
                    <span className="text-xs text-gray-600 font-mono">{variant.sku}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === variant._id ? (
                    <div className="space-y-1">
                      <input
                        type="number"
                        placeholder="Price"
                        value={variant.price || ''}
                        onChange={(e) => handleVariantFieldChange(variant._id, 'price', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Discount"
                        value={variant.discountPrice || ''}
                        onChange={(e) => handleVariantFieldChange(variant._id, 'discountPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  ) : (
                    <span className="text-sm">
                      ₹{variant.discountPrice || variant.price || 'Base'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === variant._id ? (
                    <input
                      type="number"
                      value={variant.stock.quantity}
                      onChange={(e) => handleVariantFieldChange(variant._id, 'stock.quantity', parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  ) : (
                    <span className={`text-sm font-semibold ${variant.stock.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {variant.stock.quantity}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={variant.isActive}
                      onChange={(e) => handleVariantFieldChange(variant._id, 'isActive', e.target.checked)}
                      disabled={editingId !== variant._id}
                      className="rounded"
                    />
                    <span className="ml-2 text-xs text-gray-600">
                      {variant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </td>
                <td className="px-4 py-3 space-x-2">
                  {editingId === variant._id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateVariant(variant._id)}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingId(variant._id)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVariant(variant._id)}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Variant Section */}
      <div className="border-t pt-6">
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
        >
          + Add New Variant
        </button>
      </div>

      {/* Add Variant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Variant</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Variant Type Selector */}
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

              {/* Variant Value Input - only show selected type */}
              {variantType && (
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

                  {/* SKU */}
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

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (Optional - overrides base)</label>
                    <input
                      type="number"
                      placeholder={`Base: ₹${basePrice || 0}`}
                      value={newVariant.price}
                      onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  {/* Discount Price */}
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

                  {/* Stock */}
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
              )}

              {/* Base Product Images */}
              {baseImages && baseImages.length > 0 && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium">Images</label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useBaseImages}
                        onChange={(e) => setUseBaseImages(e.target.checked)}
                        className="rounded"
                      />
                      Use base product images
                    </label>
                  </div>
                  {useBaseImages && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {baseImages.map((img, index) => (
                        <img key={index} src={img.url} alt="Base product" className="w-full h-16 object-cover rounded" />
                      ))}
                    </div>
                  )}
                  {!useBaseImages && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Upload variant images</label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (!files) return;
                          const fileArray = Array.from(files);
                          setNewVariantImages(fileArray);
                          setImagePreviewUrls(fileArray.map((file) => URL.createObjectURL(file)));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <div className="flex gap-2 mt-2">
                        {imagePreviewUrls.map((url, index) => (
                          <img key={index} src={url} alt="Preview" className="w-16 h-16 object-cover rounded" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Variant
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewVariantImages([]);
                    setImagePreviewUrls([]);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
// ...
      {/* Suggested Quick Options */}
      {variants.length === 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 mb-3 font-medium">
            💡 Tip: Start adding variants for your product. Use the form above to add your first variant.
          </p>
          <p className="text-xs text-blue-800">
            Common variants: Color (Black, White, Blue), Size (S, M, L)
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';

interface Variant {
  _id: string;
  color: string;
  size: string;
  price?: number;
  discountPrice?: number;
  stock: { quantity: number };
  isActive: boolean;
  images?: Array<{ url: string; alt?: string }>;
}

interface VariantSelectorProps {
  variants: Variant[];
  onVariantSelect: (variant: Variant | null) => void;
  basePrice: number;
  baseDiscountPrice?: number;
  baseImages?: Array<{ url: string; alt?: string }>;
  onImagesChange?: (images: Array<{ url: string; alt?: string }>) => void;
}

export default function VariantSelector({
  variants,
  onVariantSelect,
  basePrice,
  baseDiscountPrice,
  baseImages = [],
  onImagesChange,
}: VariantSelectorProps) {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  const hasColors = useMemo(() => variants.some(v => v.color), [variants]);
  const hasSizes = useMemo(() => variants.some(v => v.size), [variants]);

  const availableColors = useMemo(
    () => [...new Set(variants.filter(v => v.color).map(v => v.color))].sort(),
    [variants]
  );

  const availableSizes = useMemo(() => {
    let filtered = variants.filter(v => v.size);
    if (selectedColor && hasColors) {
      filtered = filtered.filter(v => v.color === selectedColor);
    }
    return [...new Set(filtered.map(v => v.size))].sort();
  }, [variants, selectedColor, hasColors]);

  const selectedVariant = useMemo(() => {
    return variants.find(v => {
      if (!v.isActive) return false;
      if (hasColors && v.color !== selectedColor) return false;
      if (hasSizes && v.size !== selectedSize) return false;
      return true;
    }) || null;
  }, [variants, selectedColor, selectedSize, hasColors, hasSizes]);

  const displayPrice = selectedVariant
    ? selectedVariant.discountPrice || selectedVariant.price || baseDiscountPrice || basePrice
    : baseDiscountPrice || basePrice;

  const displayOriginalPrice = selectedVariant ? selectedVariant.price || basePrice : basePrice;
  const isInStock = selectedVariant ? (selectedVariant.stock?.quantity || 0) > 0 : true;

  const handleVariantSelect = (color: string, size: string) => {
    setSelectedColor(color);
    setSelectedSize(size);

    const variant = variants.find(v => {
      if (!v.isActive) return false;
      if (hasColors && v.color !== color) return false;
      if (hasSizes && v.size !== size) return false;
      return true;
    }) || null;

    if (variant && onImagesChange && variant.images?.length) {
      onImagesChange(variant.images);
    } else if (!variant && onImagesChange) {
      onImagesChange(baseImages);
    }

    onVariantSelect(variant);
  };

  if (variants.length === 0) return null;

  return (
    <div className="space-y-6 py-4">
      {hasColors && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Color {selectedColor && <span className="text-accent">✓</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  const nextColor = selectedColor === color ? '' : color;
                  const nextSize = nextColor ? selectedSize : '';
                  setSelectedColor(nextColor);
                  if (!nextColor) setSelectedSize('');
                  handleVariantSelect(nextColor, nextSize);
                }}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedColor === color
                    ? 'border-accent bg-accent/10 text-accent font-semibold'
                    : 'border-gray-300 text-gray-700 hover:border-accent'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasSizes && (!hasColors || selectedColor) && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Size {selectedSize && <span className="text-accent">✓</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.length > 0 ? availableSizes.map((size) => {
              const variant = variants.find(v => {
                if (!v.isActive) return false;
                if (hasColors && v.color !== selectedColor) return false;
                if (hasSizes && v.size !== size) return false;
                return true;
              });
              const inStock = (variant?.stock?.quantity || 0) > 0;

              return (
                <button
                  key={size}
                  onClick={() => {
                    const nextSize = selectedSize === size ? '' : size;
                    setSelectedSize(nextSize);
                    handleVariantSelect(selectedColor, nextSize);
                  }}
                  disabled={!inStock}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedSize === size
                      ? 'border-accent bg-accent/10 text-accent font-semibold'
                      : inStock
                      ? 'border-gray-300 text-gray-700 hover:border-accent cursor-pointer'
                      : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  {size}
                  {!inStock && <span className="text-xs ml-1">(Out of Stock)</span>}
                </button>
              );
            }) : (
              <p className="text-sm text-gray-500">No sizes available</p>
            )}
          </div>
        </div>
      )}

      {selectedVariant && (
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-accent" />
            <p className="text-sm text-gray-700">
              {selectedColor && <span className="font-semibold">{selectedColor}</span>}
              {selectedColor && selectedSize && ' • '}
              {selectedSize && <span className="font-semibold">{selectedSize}</span>}
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-accent">₹{displayPrice.toLocaleString()}</span>
            {selectedVariant.discountPrice && (
              <span className="text-sm text-gray-500 line-through">₹{displayOriginalPrice.toLocaleString()}</span>
            )}
          </div>
          <p className={`text-xs font-semibold ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
            {isInStock ? `${selectedVariant.stock.quantity} in stock` : 'Out of stock'}
          </p>
        </div>
      )}

      {!selectedVariant && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Base Price</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">₹{basePrice.toLocaleString()}</span>
            {baseDiscountPrice && (
              <span className="text-sm text-gray-500 line-through">₹{displayOriginalPrice.toLocaleString()}</span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {(hasColors ? 'color' : '') + (hasColors && hasSizes ? ', ' : '') + (hasSizes ? 'size' : '')}
            {' to see variant pricing'}
          </p>
        </div>
      )}
    </div>
  );
}

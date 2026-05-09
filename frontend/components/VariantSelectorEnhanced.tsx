'use client';

import { useEffect, useMemo, useState } from 'react';

interface Variant {
  _id: string;
  name?: string;
  color: string;
  size: string;
  price?: number;
  discountPrice?: number;
  stock: { quantity: number };
  images?: Array<{ url: string; alt?: string }>;
  description?: string;
  isActive: boolean;
}

interface VariantSelectorEnhancedProps {
  variants: Variant[];
  onVariantSelect: (variant: Variant | null) => void;
  basePrice: number;
  baseDiscountPrice?: number;
  baseName?: string;
  baseDescription?: string;
  productImages?: Array<{ url: string; alt?: string }>;
  onImagesChange?: (images: Array<{ url: string; alt?: string }>) => void;
  onDescriptionChange?: (description: string) => void;
  onNameChange?: (name: string) => void;
}

export default function VariantSelectorEnhanced({
  variants,
  onVariantSelect,
  basePrice,
  baseDiscountPrice,
  baseName = '',
  baseDescription = '',
  productImages = [],
  onImagesChange,
  onDescriptionChange,
  onNameChange,
}: VariantSelectorEnhancedProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const activeVariants = useMemo(
    () => variants.filter((variant) => variant.isActive),
    [variants]
  );

  const inStockVariants = useMemo(
    () => activeVariants.filter((variant) => (variant.stock?.quantity || 0) > 0),
    [activeVariants]
  );

  // Get unique values for each dimension. Use activeVariants so options created from
  // the product data are visible even when currently out of stock. We mark
  // options as disabled when no in-stock variant exists for that value.
  const availableColors = useMemo(
    () => [...new Set(activeVariants.map((variant) => variant.color).filter(Boolean))],
    [activeVariants]
  );

  const availableSizes = useMemo(() => {
    let filteredVariants = activeVariants;

    if (selectedColor && availableColors.length > 0) {
      filteredVariants = filteredVariants.filter((variant) => variant.color === selectedColor);
    }

    return [...new Set(filteredVariants.map((variant) => variant.size).filter(Boolean))];
  }, [activeVariants, availableColors.length, selectedColor]);

  // Helper to check whether a color/size has any in-stock variants
  const colorHasStock = (color: string) => inStockVariants.some((v) => v.color === color);
  const sizeHasStock = (size: string) => inStockVariants.some((v) => v.size === size);

  const hasColorOptions = availableColors.length > 1;
  const hasSizeOptions = availableSizes.length > 1;

  // Find selected variant — only set when user has explicitly chosen all required options
  const selectedVariant = useMemo(() => {
    if (hasColorOptions && hasSizeOptions) {
      if (!selectedColor || !selectedSize) return null;
      return inStockVariants.find(
        (variant) => variant.color === selectedColor && variant.size === selectedSize
      ) || null;
    }

    if (hasColorOptions) {
      if (!selectedColor) return null;
      return inStockVariants.find((variant) => variant.color === selectedColor) || null;
    }

    if (hasSizeOptions) {
      if (!selectedSize) return null;
      return inStockVariants.find((variant) => variant.size === selectedSize) || null;
    }

    // No multi-choice dimensions — user must explicitly click the variant button
    return selectedColor || selectedSize ? (inStockVariants[0] || null) : null;
  }, [inStockVariants, hasColorOptions, hasSizeOptions, selectedColor, selectedSize]);

  // Handle variant selection change
  const handleVariantChange = (variant: Variant | null) => {
    onVariantSelect(variant);

    // Update images if variant has specific images
    if (variant?.images && variant.images.length > 0 && onImagesChange) {
      onImagesChange(variant.images);
    } else if (onImagesChange && productImages.length > 0) {
      // Reset to product images
      onImagesChange(productImages);
    }

    // Update description if variant has specific description
    if (onDescriptionChange) {
      onDescriptionChange(variant?.description || baseDescription);
    }

    if (onNameChange) {
      onNameChange(variant?.name || baseName);
    }
  };

  // If selected size becomes unavailable after a color change, clear it
  useEffect(() => {
    if (selectedSize && availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(null);
    }
  }, [availableSizes, selectedSize]);

  useEffect(() => {
    handleVariantChange(selectedVariant);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant]);

  const resetSelection = () => {
    setSelectedColor(null);
    setSelectedSize(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold mb-3">Variants</h3>

        {/* Color Selection */}
        {availableColors.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-neutral-dark">
              Color {selectedColor && <span className="text-foreground font-semibold">{selectedColor}</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableColors.map(color => {
                const disabled = !colorHasStock(color);
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => {
                      if (disabled) return;
                      const next = selectedColor === color ? null : color;
                      setSelectedColor(next);
                      setSelectedSize(null);
                    }}
                    disabled={disabled}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      isSelected
                        ? 'border-accent bg-accent text-white'
                        : disabled
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 bg-white text-foreground hover:border-accent'
                    }`}
                  >
                    {color}
                    {disabled && <span className="ml-2 text-xs text-red-600">OOS</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size Selection — show when sizes exist; if there are multiple colors, wait for color pick */}
        {availableSizes.length > 0 && (availableColors.length === 0 || selectedColor || !hasColorOptions) && (
          <div className="mb-6 animate-in fade-in-50">
            <label className="block text-sm font-medium mb-3 text-neutral-dark">
              Size {selectedSize && <span className="text-foreground font-semibold">{selectedSize}</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const disabled = Boolean(!sizeHasStock(size) || (!!selectedColor && !inStockVariants.some(v => v.size === size && v.color === selectedColor)));
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => { if (disabled) return; setSelectedSize(selectedSize === size ? null : size); }}
                    disabled={disabled}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      isSelected
                        ? 'border-accent bg-accent text-white'
                        : disabled
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 bg-white text-foreground hover:border-accent'
                    }`}
                  >
                    {size}
                    {disabled && <span className="ml-2 text-xs text-red-600">OOS</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reset Button */}
        {(selectedColor || selectedSize) && (
          <button
            onClick={resetSelection}
            className="text-sm text-accent hover:underline font-medium"
          >
            Clear Selection
          </button>
        )}
      </div>
    </div>
  );
}

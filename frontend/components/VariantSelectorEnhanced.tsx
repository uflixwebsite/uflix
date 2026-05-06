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

  // Get unique values for each dimension
  const availableColors = useMemo(
    () => [...new Set(inStockVariants.map((variant) => variant.color).filter(Boolean))],
    [inStockVariants]
  );

  const availableSizes = useMemo(() => {
    let filteredVariants = inStockVariants;

    if (selectedColor && availableColors.length > 0) {
      filteredVariants = filteredVariants.filter((variant) => variant.color === selectedColor);
    }

    return [...new Set(filteredVariants.map((variant) => variant.size).filter(Boolean))];
  }, [inStockVariants, availableColors.length, selectedColor]);

  const hasColorOptions = availableColors.length > 1;
  const hasSizeOptions = availableSizes.length > 1;

  // Find selected variant
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

    return inStockVariants[0] || null;
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

  useEffect(() => {
    if (availableColors.length === 1 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor]);

  useEffect(() => {
    if (selectedSize && availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(null);
      return;
    }

    if (availableSizes.length === 1 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  useEffect(() => {
    if (!selectedColor && !selectedSize && !hasColorOptions && !hasSizeOptions && inStockVariants.length === 1) {
      onVariantSelect(inStockVariants[0]);
    }
  }, [hasColorOptions, hasSizeOptions, inStockVariants, onVariantSelect, selectedColor, selectedSize]);

  useEffect(() => {
    handleVariantChange(selectedVariant);
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
              {availableColors.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedSize(null);
                  }}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                    selectedColor === color
                      ? 'border-accent bg-accent text-white'
                      : 'border-gray-300 bg-white text-foreground hover:border-accent'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {availableSizes.length > 0 && (!hasColorOptions || selectedColor) && (
          <div className="mb-6 animate-in fade-in-50">
            <label className="block text-sm font-medium mb-3 text-neutral-dark">
              Size {selectedSize && <span className="text-foreground font-semibold">{selectedSize}</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const sizeVariant = inStockVariants.find((variant) => {
                  if (hasColorOptions && variant.color !== selectedColor) return false;
                  return variant.size === size;
                });
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      selectedSize === size
                        ? 'border-accent bg-accent text-white'
                        : 'border-gray-300 bg-white text-foreground hover:border-accent'
                    }`}
                  >
                    {size}
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

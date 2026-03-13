'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import Link from 'next/link';
import { getProducts } from '@/services/productService';

interface CategoryProductsProps {
  category: string;
  title?: string;
  subtitle?: string;
  limit?: number;
  ctaText?: string;
  ctaLink?: string;
  primaryButtonBg?: string;
  primaryButtonTextColor?: string;
}

export default function CategoryProducts({ category, title, subtitle, limit, ctaText, ctaLink, primaryButtonBg, primaryButtonTextColor }: CategoryProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const productLimit = limit || 8;

  useEffect(() => {
    fetchProducts();
  }, [category, productLimit]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts({ category, limit: productLimit });
      setProducts(data.data);
    } catch (error) {
      console.error(`Error fetching ${category} products:`, error);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title || category}</h2>
          {subtitle && (
            <p className="text-lg text-neutral-dark max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} {...product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href={ctaLink || `/category/${category}`} className="inline-block btn-primary px-8 py-3 rounded-md font-semibold transition-colors shadow-md" style={{ backgroundColor: primaryButtonBg || undefined, color: primaryButtonTextColor || undefined }}>
            {ctaText || `View All ${title || category}`}
          </Link>
        </div>
      </div>
    </section>
  );
}

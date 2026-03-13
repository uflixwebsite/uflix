'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import Link from 'next/link';
import { getProducts } from '@/services/productService';

interface NewArrivalsProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  ctaText?: string;
  ctaLink?: string;
  primaryButtonBg?: string;
  primaryButtonTextColor?: string;
}

export default function NewArrivals({ title, subtitle, limit, ctaText, ctaLink, primaryButtonBg, primaryButtonTextColor }: NewArrivalsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const productLimit = limit || 8;

  useEffect(() => {
    fetchProducts();
  }, [productLimit]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts({ limit: productLimit, newArrival: true });
      setProducts(data.data);
    } catch (error) {
      console.error('Error fetching new arrival products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-neutral-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title || 'New Arrivals'}</h2>
          <p className="text-lg text-neutral-dark max-w-2xl mx-auto">
            {subtitle || 'Discover our latest furniture collections and designs'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              🆕
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No New Arrivals Yet</h3>
            <p className="text-gray-500">Check back soon for our latest products!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} {...product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href={ctaLink || '/shop'} className="inline-block btn-primary px-8 py-3 rounded-md font-semibold transition-colors shadow-md" style={{ backgroundColor: primaryButtonBg || undefined, color: primaryButtonTextColor || undefined }}>
            {ctaText || 'View All Products'}
          </Link>
        </div>
      </div>
    </section>
  );
}

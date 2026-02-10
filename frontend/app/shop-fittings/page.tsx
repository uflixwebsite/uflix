'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { getProducts } from '@/services/productService';
import { getPageContent } from '@/services/pageService';
import { renderSection } from '@/components/DynamicPage';
import type { Section } from '@/components/DynamicPage';

export default function ShopFittingsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchPageContent();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts({ 
        category: 'shop-fitting',
        limit: 6 
      });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching shop fittings products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPageContent = async () => {
    try {
      const data = await getPageContent('shop-fittings');
      setSections(data.data?.sections || []);
    } catch (error) {
      console.error('Error fetching page content:', error);
    }
  };

  const getSection = (id: string) => sections.find(s => s.sectionId === id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Render dynamic sections before products */}
        {sections.filter(s => s.sectionId !== 'products' && s.sectionId !== 'cta').map(section => (
          <div key={section._id || section.sectionId}>
            {renderSection(section)}
          </div>
        ))}

        {/* Products section - kept as dynamic component */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                {getSection('products')?.title || 'Our Shop Fitting Products'}
              </h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
                {getSection('products')?.subtitle || 'Browse our selection of professional shop fitting solutions'}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Available</h3>
                <p className="text-gray-500">Shop fitting products will appear here once added.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} {...product} />
                  ))}
                </div>
                <div className="text-center mt-12">
                  <Link href="/shop-fittings/products" className="inline-block bg-accent hover:bg-secondary text-white px-8 py-3 rounded-md font-semibold transition-colors shadow-md">
                    Show More Products
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Render CTA section from DB */}
        {getSection('cta') && renderSection(getSection('cta')!)}
      </main>
      <Footer />
    </div>
  );
}

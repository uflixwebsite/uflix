'use client';

import { useState, useEffect } from 'react';
import BusinessHeader from '@/components/BusinessHeader';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { getProducts } from '@/services/productService';
import { getPageContent } from '@/services/pageService';
import { renderSection } from '@/components/DynamicPage';
import type { Section } from '@/components/DynamicPage';

export default function BusinessPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchPageContent();
  }, []);

  const fetchProducts = async () => {
    try {
      // Fetch both for-businesses and shop-fitting products
      const [businessProducts, shopFittingProducts] = await Promise.all([
        getProducts({ category: 'for-businesses', limit: 6 }),
        getProducts({ category: 'shop-fitting', limit: 6 })
      ]);
      
      // Combine both product arrays
      const allProducts = [...(businessProducts.data || []), ...(shopFittingProducts.data || [])];
      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPageContent = async () => {
    try {
      const data = await getPageContent('business');
      setSections(data.data?.sections || []);
    } catch (error) {
      console.error('Error fetching page content:', error);
    } finally {
      // done
    }
  };

  const getSection = (id: string) => sections.find(s => s.sectionId === id);

  return (
    <div className="min-h-screen bg-background">
      <BusinessHeader />
      <main className="homepage-main">
        {/* Render dynamic sections before products */}
        {sections.filter(s => s.sectionId !== 'products' && s.sectionId !== 'bulk-cta').map(section => (
          <div key={section._id || section.sectionId}>
            {renderSection(section)}
          </div>
        ))}

        {/* Products section - kept as dynamic component */}
        <section id="products" className="pt-16 pb-4 bg-neutral-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {getSection('products')?.title || 'Premium Business Furniture Collection'}
              </h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
                {getSection('products')?.subtitle || 'Handpicked furniture designed for productivity, comfort, and style'}
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
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Business Products Available</h3>
                <p className="text-gray-500">Business products will appear here once added.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} {...product} />
                  ))}
                </div>
                <div className="text-center mt-12">
                  <Link href="/business/products" className="inline-block bg-accent hover:bg-secondary text-white px-8 py-3 rounded-md font-semibold transition-colors shadow-md">
                    Show More Products
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Render bulk-cta section from DB */}
        {getSection('bulk-cta') && renderSection(getSection('bulk-cta')!)}
      </main>
      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/services/productService';

export default function ShopFittingsProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts({ 
        category: 'shop-fitting',
        limit: 100 
      });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching shop fittings products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMobileScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const maxScroll = element.scrollWidth - element.clientWidth;
    setScrollPct(maxScroll > 0 ? element.scrollLeft / maxScroll : 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Shop Fittings Products</h1>
          <p className="text-lg text-neutral-dark">
            Browse our complete range of shop fitting solutions and retail fixtures
          </p>
        </div>

        {loading ? (
          <>
            <div className="lg:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory pb-4" onScroll={handleMobileScroll} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex gap-4 w-max">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse shrink-0 snap-start w-[82vw] sm:w-[58vw] max-w-90">
                    <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:hidden mt-4 h-0.5 bg-gray-300 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-200" style={{ width: `${Math.max(10, scrollPct * 100)}%` }} />
            </div>
            <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Available</h3>
            <p className="text-gray-500">Shop fitting products will appear here once added.</p>
          </div>
        ) : (
          <>
            <div className="lg:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory pb-4" onScroll={handleMobileScroll} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex gap-4 w-max">
                {products.map((product) => (
                  <div key={product._id} className="shrink-0 snap-start w-[82vw] sm:w-[58vw] max-w-90">
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:hidden mt-4 h-0.5 bg-gray-300 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-200" style={{ width: `${Math.max(10, scrollPct * 100)}%` }} />
            </div>
            <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} {...product} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

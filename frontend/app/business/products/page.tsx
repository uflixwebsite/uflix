'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/services/productService';
import { getCategoryByPath } from '@/services/categoryService';

function BusinessProductsContent() {
  const searchParams = useSearchParams();
  const subcategory = searchParams.get('subcategory') || '';
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [subcategory]);

  useEffect(() => {
    fetchProducts();
  }, [subcategory, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Resolve category ObjectIds so products assigned via CategoryTreePicker are included
      let businessCatId: string | null = null;
      let shopFittingCatId: string | null = null;
      try {
        const [bizRes, sfRes] = await Promise.all([
          getCategoryByPath(['for-businesses']),
          getCategoryByPath(['shop-fitting']),
        ]);
        businessCatId = bizRes?.data?._id || null;
        shopFittingCatId = sfRes?.data?._id || null;
      } catch {}

      const limit = subcategory ? 15 : 8;
      const [businessResponse, shopFittingResponse] = await Promise.all([
        getProducts({
          ...(businessCatId ? { categoryId: businessCatId } : { category: 'for-businesses' }),
          page,
          limit,
          ...(subcategory && { subcategory }),
        }),
        getProducts({
          ...(shopFittingCatId ? { categoryId: shopFittingCatId } : { category: 'shop-fitting' }),
          page,
          limit: subcategory ? 15 : 7,
          ...(subcategory && { subcategory }),
        }),
      ]);

      const allProducts = [...(businessResponse.data || []), ...(shopFittingResponse.data || [])];
      setProducts(allProducts);

      const totalCombined = (businessResponse.pagination?.total || 0) + (shopFittingResponse.pagination?.total || 0);
      setTotalProducts(totalCombined);
      setTotalPages(Math.ceil(totalCombined / 15));
    } catch (error) {
      console.error('Error fetching business products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="homepage-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 capitalize">
            {subcategory ? subcategory : 'For Businesses'}
          </h1>
          <p className="text-lg text-neutral-dark">
            {subcategory
              ? `Showing products in ${subcategory}`
              : 'Professional furniture and solutions tailored for business environments'
            }
          </p>
          {totalProducts > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Showing {(page - 1) * 15 + 1}-{Math.min(page * 15, totalProducts)} of {totalProducts} products
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Available</h3>
            <p className="text-gray-500">
              {subcategory
                ? `No products found in "${subcategory}".`
                : 'Business products will appear here once added.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} {...product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 border rounded-md ${
                      page === i + 1
                        ? 'bg-accent text-white border-accent'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ForBusinessesProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <main className="homepage-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <BusinessProductsContent />
    </Suspense>
  );
}

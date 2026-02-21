'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { getProducts } from '@/services/productService';
import { getCategoryByPath } from '@/services/categoryService';
import api from '@/services/api';

export default function NestedCategoryPage() {
  const params = useParams();
  const rawSlugs = params.slugs;
  const slugs: string[] = Array.isArray(rawSlugs) ? rawSlugs : rawSlugs ? [rawSlugs] : [];

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryChain, setCategoryChain] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  // tracks the full slug path when using subcategory fallback mode
  const [subPath, setSubPath] = useState<string | null>(null);
  const productsPerPage = 18;

  useEffect(() => {
    if (slugs.length > 0) {
      setCurrentPage(1);
      setSubPath(null);  // reset on slug change
      fetchData();
    }
  }, [slugs.join('/')]);

  useEffect(() => {
    if (!currentCategory) return;
    if (subPath) {
      // subcategory fallback mode — use path filter
      getProducts({ subcategory: subPath, page: currentPage, limit: productsPerPage, sort: sortBy })
        .then(res => { setProducts(res?.data || []); setTotal(res?.pagination?.total || 0); })
        .catch(err => console.error('Error re-fetching products:', err));
    } else {
      // Only fetch by category id when we have a valid id (fallbacks may set a plain object without _id)
      if (currentCategory._id) {
        fetchProducts(currentCategory._id);
      }
    }
  }, [currentPage, sortBy, currentCategory, subPath]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Try resolving category chain from URL slugs via Categories API
      let chainRes = null;
      try {
        chainRes = await getCategoryByPath(slugs);
      } catch (err: any) {
        // If not found in Categories collection, fall back to matching subcategory by slug/name
        if (err?.response?.status === 404 && slugs.length > 0) {
          const lastSlug = slugs[slugs.length - 1];
          // Build a simple chain from the path segments for breadcrumb/UI
          const chain = slugs.map((seg: string) => ({ name: seg.replace(/-/g, ' '), slug: seg }));
          setCategoryChain(chain);
          setCurrentCategory({ name: lastSlug.replace(/-/g, ' '), slug: lastSlug });
          setSubPath(lastSlug);

          // Fetch products by subcategory name/slug (backend now matches by subcategory.name or id)
          const productRes = await getProducts({
            subcategory: lastSlug,
            page: 1,
            limit: productsPerPage,
            sort: sortBy,
          });
          setProducts(productRes?.data || []);
          setTotal(productRes?.pagination?.total || 0);
          return;
        }
        throw err;
      }

      if (chainRes?.success && chainRes.data?.length) {
        setCategoryChain(chainRes.data);
        const lastCat = chainRes.data[chainRes.data.length - 1];
        setCurrentCategory(lastCat);

        // Fetch direct children for sub-navigation
        const childRes = await api.get('/categories', { params: { parentId: lastCat._id } });
        setSubCategories(childRes.data?.data || []);

        await fetchProducts(lastCat._id);
      } else {
        // fallback: use last slug as subcategory filter
        const lastSlug = slugs[slugs.length - 1];
        const productRes = await getProducts({
          subcategory: lastSlug,
          page: 1,
          limit: productsPerPage,
          sort: sortBy,
        });
        setProducts(productRes?.data || []);
        setTotal(productRes?.pagination?.total || 0);
        setCategoryChain(slugs.map(s => ({ name: s.replace(/-/g, ' '), slug: s })));
        setCurrentCategory({ name: lastSlug.replace(/-/g, ' '), slug: lastSlug });
        setSubPath(lastSlug);
      }
    } catch (err) {
      console.error('Error fetching category page:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (categoryId: string) => {
    try {
      const res = await getProducts({
        categoryId,
        page: currentPage,
        limit: productsPerPage,
        sort: sortBy,
      });
      setProducts(res?.data || []);
      setTotal(res?.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const buildSlugPath = (index: number) =>
    '/category/' + slugs.slice(0, index + 1).join('/');

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-border p-4">
                  <div className="w-full h-64 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb + page title */}
        <div className="mb-6">
          <nav className="flex flex-wrap items-center gap-1 text-sm text-neutral-dark mb-3">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            {categoryChain.map((cat, i) => (
              <span key={cat._id || i} className="flex items-center gap-1">
                <span className="text-gray-400">/</span>
                {i < categoryChain.length - 1 ? (
                  <Link href={buildSlugPath(i)} className="hover:text-accent transition-colors capitalize">
                    {cat.name}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-800 capitalize">{cat.name}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="text-3xl font-bold capitalize">
            {currentCategory?.name || slugs[slugs.length - 1]}
          </h1>
          <p className="text-neutral-dark mt-2">
            {total > 0 ? `Showing ${total} product${total !== 1 ? 's' : ''}` : 'No products found'}
          </p>
        </div>

        {/* Sub-category navigation */}
        {subCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {subCategories.map((sub) => (
              <Link
                key={sub._id}
                href={`/category/${slugs.join('/')}/${sub.slug}`}
                className="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium hover:bg-accent hover:text-white hover:border-accent transition-all"
              >
                {sub.icon && <span className="mr-1">{sub.icon}</span>}
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        {/* Sort toolbar */}
        <div className="flex items-center justify-end mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6">
              {subCategories.length > 0
                ? 'Browse a sub-category above to find products.'
                : 'Check back soon or explore other categories.'}
            </p>
            <Link href="/categories" className="inline-block px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
              Browse Categories
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} {...product} />
              ))}
            </div>

            {/* Pagination */}
            {total > productsPerPage && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.ceil(total / productsPerPage) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`px-4 py-2 border rounded-md ${
                      p === currentPage
                        ? 'bg-accent text-white border-accent'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => { setCurrentPage(p => Math.min(Math.ceil(total / productsPerPage), p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === Math.ceil(total / productsPerPage)}
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

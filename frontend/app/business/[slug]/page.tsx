'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { getProducts } from '@/services/productService';
import { getCategoryByPath, getCategoryTree } from '@/services/categoryService';

interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  children: CategoryNode[];
}

function toTitleCase(str: string) {
  return str
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function BusinessSubcategoryPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryNode | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) fetchData();
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    setNotFound(false);

    try {
      // Try to resolve category by path: for-businesses/slug  or just /slug under business hierarchy
      let resolvedCategory: CategoryNode | null = null;
      let categoryId: string | null = null;

      try {
        const pathRes = await getCategoryByPath(['for-business', slug]);
        if (pathRes?.data) {
          resolvedCategory = pathRes.data;
          categoryId = pathRes.data._id;
        }
      } catch {
        // try alternate path
      }

      if (!resolvedCategory) {
        try {
          const pathRes = await getCategoryByPath([slug]);
          if (pathRes?.data) {
            resolvedCategory = pathRes.data;
            categoryId = pathRes.data._id;
          }
        } catch {}
      }

      if (!resolvedCategory) {
        // Walk the category tree to find a slug match
        try {
          const treeRes = await getCategoryTree();
          const treeData: CategoryNode[] = treeRes?.data || [];
          const findInTree = (nodes: CategoryNode[]): CategoryNode | null => {
            for (const node of nodes) {
              if (node.slug === slug || node.name.toLowerCase().replace(/\s+/g, '-') === slug) {
                return node;
              }
              const found = findInTree(node.children || []);
              if (found) return found;
            }
            return null;
          };
          resolvedCategory = findInTree(treeData);
          if (resolvedCategory) categoryId = resolvedCategory._id;
        } catch {}
      }

      if (!resolvedCategory && !categoryId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCategory(resolvedCategory);

      // Fetch products — try by categoryId first, fallback to slug/name
      let fetchedProducts: any[] = [];

      if (categoryId) {
        try {
          const res = await getProducts({ categoryId, limit: 50 });
          fetchedProducts = res?.data || [];
        } catch {}
      }

      if (fetchedProducts.length === 0) {
        // Fallback: fetch by category slug string (legacy field)
        try {
          const res = await getProducts({ category: slug, limit: 50 });
          fetchedProducts = res?.data || [];
        } catch {}
      }

      if (fetchedProducts.length === 0) {
        // Fallback: fetch by category name without dashes
        try {
          const name = slug.replace(/-/g, ' ');
          const res = await getProducts({ category: name, limit: 50 });
          fetchedProducts = res?.data || [];
        } catch {}
      }

      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error loading subcategory page:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = category?.name || toTitleCase(slug);
  const description = category?.description || `Browse our ${displayName} collection designed for professional environments.`;

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
          <p className="text-gray-500 mb-8">The category "{toTitleCase(slug)}" doesn't exist yet.</p>
          <Link href="/business" className="inline-block btn-primary px-6 py-3 rounded-md font-semibold hover:bg-accent/90 transition-colors">
            ← Back to Business
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero banner */}
        <section
          className="relative py-24 flex items-center justify-center overflow-hidden"
          style={{
            background: category?.image
              ? `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)) center/cover, url('${category.image}') center/cover no-repeat`
              : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          }}
        >
          <div className="relative z-10 text-center text-white px-4">
            {/* Breadcrumb */}
            <nav className="flex justify-center items-center gap-2 text-sm text-white/70 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/business" className="hover:text-white transition-colors">Business</Link>
              <span>/</span>
              <span className="text-white font-medium">{displayName}</span>
            </nav>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">{displayName}</h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">{description}</p>
          </div>
        </section>

        {/* Products grid */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-lg mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Products Yet</h3>
                <p className="text-gray-500 mb-8">Products in the <strong>{displayName}</strong> collection will appear here once added.</p>
                <Link href="/business" className="inline-block btn-primary px-6 py-3 rounded-md font-semibold hover:bg-accent/90 transition-colors">
                  ← Back to Business
                </Link>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-3xl font-bold">{displayName}</h2>
                    <p className="text-gray-500 mt-1">{products.length} product{products.length !== 1 ? 's' : ''} available</p>
                  </div>
                  <Link href="/business" className="text-accent hover:text-accent/80 text-sm font-medium">
                    ← All Business Products
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} {...product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

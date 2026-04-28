'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import ProductCard from '@/components/ProductCard';
import { getCollectionBySlug } from '@/services/collectionService';

export default function CollectionDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchCollection = async () => {
      try {
        setLoading(true);
        const response = await getCollectionBySlug(String(slug));
        setCollection(response?.data?.collection || null);
      } catch (error) {
        console.error('Failed to fetch collection detail', error);
        setCollection(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [slug]);

  const products = useMemo(() => collection?.products || [], [collection]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'Collections', href: '/collections' },
            { label: collection?.name || 'Collection' },
          ]}
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : !collection ? (
          <div className="text-center py-16 border border-gray-200 rounded-lg bg-white">
            <h1 className="text-2xl font-bold mb-2">Collection not found</h1>
            <p className="text-gray-600 mb-6">This collection may be removed or inactive.</p>
            <Link href="/collections" className="btn-primary px-5 py-2 rounded-md">
              Browse Collections
            </Link>
          </div>
        ) : (
          <>
            <section className="mb-8 mt-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-black">{collection.name}</h1>
              {collection.subtitle ? <p className="text-neutral-dark mt-2">{collection.subtitle}</p> : null}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">Products in this collection</h2>
                <span className="text-sm text-gray-500">{products.length} item(s)</span>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-14 border border-gray-200 rounded-lg bg-white">
                  <p className="text-gray-600 mb-4">No products linked to this collection yet.</p>
                  <Link href="/shop" className="btn-primary px-5 py-2 rounded-md">
                    Browse All Products
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} {...product} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

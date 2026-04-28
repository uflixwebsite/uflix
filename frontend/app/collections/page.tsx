'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { getCollections } from '@/services/collectionService';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await getCollections();
        setCollections(response?.data || []);
      } catch (error) {
        console.error('Failed to fetch collections', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Collections' }]} />

        <div className="mb-8 mt-4">
          <h1 className="text-3xl sm:text-4xl font-bold">All Collections</h1>
          <p className="text-neutral-dark mt-2">Browse curated sets and open a collection to view linked products.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 rounded-lg bg-white">
            <p className="text-gray-600">No collections are available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link
                key={collection._id}
                href={`/collections/${collection.slug}`}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-52 bg-gray-100">
                  {collection.image ? (
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-lg text-black group-hover:text-accent transition-colors">{collection.name}</h2>
                  {collection.subtitle ? (
                    <p className="text-sm text-gray-600 mt-1">{collection.subtitle}</p>
                  ) : null}
                  <p className="text-xs text-gray-500 mt-3">{collection.itemCount || 0} product(s)</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

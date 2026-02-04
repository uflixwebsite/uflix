'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/services/productService';

const categories = [
  {
    name: 'Living',
    slug: 'living',
    description: 'Sofas, coffee tables, TV units, and more',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  },
  {
    name: 'Bedroom',
    slug: 'bedroom',
    description: 'Beds, wardrobes, nightstands, and dressers',
    image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80',
  },
  {
    name: 'Home Office',
    slug: 'home-office',
    description: 'Desks, office chairs, and storage solutions',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
  },
  {
    name: 'Modular Kitchen',
    slug: 'modular-kitchen',
    description: 'Kitchen cabinets, islands, and dining solutions',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
  },
  {
    name: 'Storage',
    slug: 'storage',
    description: 'Shelving units, cabinets, and organizers',
    image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80',
  },
];

export default function CategoriesPage() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  const fetchCategoryCounts = async () => {
    try {
      const counts: Record<string, number> = {};
      
      for (const category of categories) {
        const response = await getProducts({ category: category.slug, limit: 1 });
        counts[category.slug] = response.pagination?.total || 0;
      }
      
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Categories' }]} />
        
        <h1 className="text-4xl font-bold mb-4">Browse by Category</h1>
        <p className="text-lg text-neutral-dark mb-12">Find the perfect furniture for every room in your home</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group bg-white rounded-xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-64">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
                  <p className="text-sm opacity-90 mb-2">{category.description}</p>
                  <p className="text-sm font-semibold">
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      `${categoryCounts[category.slug] || 0} Products`
                    )}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

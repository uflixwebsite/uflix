'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';
import { getCategoryTree } from '@/services/categoryService';

interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  children: CategoryNode[];
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
  'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
  'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategoryTree()
      .then(res => setCategories(res?.data || []))
      .catch(err => console.error('Error fetching categories:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Categories' }]} />

        <h1 className="text-4xl font-bold mb-4">Browse by Category</h1>
        <p className="text-lg text-neutral-dark mb-12">Find the perfect furniture for every room in your home</p>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl overflow-hidden bg-gray-200 h-64" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No categories found.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, idx) => (
              <Link
                key={category._id}
                href={`/category/${category.slug}`}
                className="group bg-white rounded-xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={category.image || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      {category.icon && <span className="text-2xl">{category.icon}</span>}
                      <h2 className="text-2xl font-bold capitalize">{category.name}</h2>
                    </div>
                    {category.description && (
                      <p className="text-sm opacity-90 mb-1">{category.description}</p>
                    )}
                    {category.children?.length > 0 && (
                      <p className="text-xs opacity-75">{category.children.length} sub-categories</p>
                    )}
                  </div>
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


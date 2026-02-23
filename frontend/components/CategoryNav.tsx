'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';

// Fallback emoji icons for common slugs (used when a category has no icon field set in admin)
const FALLBACK_ICONS: Record<string, string> = {
  living: '🛋️',
  bedroom: '🛏️',
  dining: '🍽️',
  'home-office': '💼',
  'modular-kitchen': '🍳',
  storage: '📦',
  'for-business': '🏢',
  'shop-fitting': '🏪',
};

export default function CategoryNav() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api
      .get('/categories', { params: { parentId: 'null' } })
      .then((res: any) => setCategories(res.data?.data || []))
      .catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 py-6 overflow-x-auto scrollbar-hide justify-start sm:justify-center">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center justify-center min-w-[110px] p-4 rounded-lg border border-border transition-all hover:border-accent hover:shadow-md group"
            >
              <div className="h-10 w-10 mb-2 flex items-center justify-center text-2xl transition-transform group-hover:scale-110">
                {cat.icon || FALLBACK_ICONS[cat.slug] || '📦'}
              </div>
              <span className="text-sm font-medium text-center whitespace-nowrap">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


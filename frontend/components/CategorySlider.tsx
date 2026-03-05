'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Subcategory {
  name: string;
  image: string;
  link: string;
}

interface CategoryTab {
  name: string;
  subcategories: Subcategory[];
}

interface CategorySliderProps {
  title?: string;
  categories?: CategoryTab[];
}

const defaultCategories: CategoryTab[] = [];

export default function CategorySlider({ title, categories: propCategories }: CategorySliderProps) {
  const categories = propCategories && propCategories.length > 0 ? propCategories : defaultCategories;
  const [activeTab, setActiveTab] = useState(0);

  if (categories.length === 0) {
    return (
      <section className="py-14 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            {title || 'How can we help you?'}
          </h2>
          <div className="flex items-center justify-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-400 text-sm">Add categories in the admin panel</p>
          </div>
        </div>
      </section>
    );
  }

  const activeSubcategories = categories[activeTab]?.subcategories || [];

  return (
    <section className="py-14 bg-[#f5f0eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          {title || 'How can we help you?'}
        </h2>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-300 overflow-x-auto scrollbar-hide mb-8">
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex-shrink-0 px-6 py-3 text-sm sm:text-base font-medium border-r border-gray-300 transition-all whitespace-nowrap
                ${activeTab === index
                  ? 'border-b-2 border-b-accent text-foreground bg-white relative -mb-[2px]'
                  : 'text-neutral-dark hover:text-foreground hover:bg-gray-50'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Subcategory images horizontal scroll */}
        <div className="relative">
          <div className="flex gap-5 overflow-x-auto scrollbar-thin pb-4">
            {activeSubcategories.map((sub, index) => (
              <Link
                key={index}
                href={sub.link || '/shop'}
                className="shrink-0 group w-72"
              >
                <div className="relative w-72 h-48 rounded-lg overflow-hidden bg-gray-100">
                  {sub.image ? (
                    <Image
                      src={sub.image}
                      alt={sub.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-400"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">No Image</div>
                  )}
                </div>
                <p className="mt-3 text-sm sm:text-base font-medium text-foreground border-b-2 border-accent inline-block">
                  {sub.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

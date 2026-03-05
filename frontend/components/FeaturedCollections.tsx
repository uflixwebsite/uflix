'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const defaultCollections: Array<{ title: string; description?: string; image: string; itemCount?: number; link?: string }> = [];

interface FeaturedCollectionsProps {
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description?: string; image: string; itemCount?: number; link?: string }>;
}

export default function FeaturedCollections({ title, subtitle, items }: FeaturedCollectionsProps) {
  const collections = items && items.length > 0 ? items : defaultCollections;
  const [currentSlide, setCurrentSlide] = useState(0);

  const goTo = (index: number) => setCurrentSlide(index);
  const prev = () => setCurrentSlide((s) => (s - 1 + collections.length) % collections.length);
  const next = () => setCurrentSlide((s) => (s + 1) % collections.length);

  if (collections.length === 0) {
    return (
      <section className="py-0 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {title || 'Shop by collection'}
          </h2>
          <div className="relative w-full h-[55vh] max-h-[500px] min-h-[300px] overflow-hidden rounded-2xl mt-6 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-300 text-sm">Add collections in the admin panel</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-0 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          {title || 'Shop by collection'}
        </h2>
        {subtitle && <p className="text-neutral-dark mt-2">{subtitle}</p>}

        {/* Contained photo carousel — cut from sides, rounded */}
        <div className="relative w-full h-[55vh] max-h-[500px] min-h-[300px] overflow-hidden rounded-2xl mt-6">
        {collections.map((col, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {col.image ? (
              <Image
                src={col.image}
                alt={col.title}
                fill
                className="object-cover"
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
            {/* Gradient at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

            {/* Text overlay */}
            <div className="absolute bottom-10 left-6 sm:left-14 text-white z-10">
              <h3 className="text-2xl sm:text-4xl font-bold mb-2">{col.title}</h3>
              {col.description && (
                <p className="text-sm sm:text-base text-white/80 mb-4 max-w-md">{col.description}</p>
              )}
              <Link
                href={col.link || '/shop'}
                className="inline-block bg-white text-foreground px-6 py-2.5 rounded-md font-semibold hover:bg-accent hover:text-white transition-colors text-sm"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        ))}

        {/* Prev / Next */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-colors"
          aria-label="Previous"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-colors"
          aria-label="Next"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {collections.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-7 h-3 bg-white' : 'w-3 h-3 bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}

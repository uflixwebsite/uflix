'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getHomeCollections } from '@/services/collectionService';

const defaultCollections: Array<{ title: string; description?: string; image: string; itemCount?: number; link?: string; buttonText?: string; primaryButtonBg?: string; primaryButtonTextColor?: string }> = [];

interface FeaturedCollectionsProps {
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description?: string; image: string; itemCount?: number; link?: string; buttonText?: string; primaryButtonBg?: string; primaryButtonTextColor?: string }>;
}

export default function FeaturedCollections({ title, subtitle, items }: FeaturedCollectionsProps) {
  const [collections, setCollections] = useState(defaultCollections);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const response = await getHomeCollections();
        const apiCollections = (response?.data || []).map((collection: any) => ({
          title: collection.name,
          description: collection.subtitle,
          image: collection.image,
          itemCount: collection.itemCount,
          link: `/collections/${collection.slug}`,
          buttonText: 'Explore Collection',
          primaryButtonBg: '',
          primaryButtonTextColor: '',
        }));

        if (apiCollections.length > 0) {
          setCollections(apiCollections);
          setCurrentSlide(0);
          return;
        }

        setCollections(items && items.length > 0 ? items : defaultCollections);
      } catch {
        setCollections(items && items.length > 0 ? items : defaultCollections);
      }
    };

    loadCollections();
  }, [items]);

  const goTo = (index: number) => setCurrentSlide(index);
  const prev = () => setCurrentSlide((s) => (s - 1 + collections.length) % collections.length);
  const next = () => setCurrentSlide((s) => (s + 1) % collections.length);

  if (collections.length === 0) {
    return (
      <section className="py-0 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center md:text-left">
            {title || 'Shop by collection'}
          </h2>
          <div className="relative w-full h-[55vh] max-h-125 min-h-75 overflow-hidden rounded-2xl mt-6 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-300 text-sm">Add collections in the admin panel</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-0 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center md:text-left">
          {title || 'Shop by collection'}
        </h2>
        {subtitle && <p className="text-neutral-dark mt-2 text-center md:text-left">{subtitle}</p>}

        {/* Contained photo carousel — cut from sides, rounded */}
        <div className="relative w-full h-[64vh] max-h-140 min-h-95 overflow-hidden rounded-2xl mt-6">
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
                className="object-cover object-center"
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
            {/* Gradient at bottom */}
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />

            {/* Text overlay */}
            <div className="absolute left-4 right-4 sm:left-14 sm:right-auto bottom-16 sm:bottom-10 text-white z-10 text-center sm:text-left p-0">
              <h3 className="text-2xl sm:text-3xl font-bold mb-1.5 leading-tight">{col.title}</h3>
              {col.description && (
                <p className="text-xs sm:text-sm text-white/85 mb-3 max-w-md mx-auto sm:mx-0 line-clamp-2 sm:line-clamp-none">{col.description}</p>
              )}
              <Link
                href={col.link || '/shop'}
                className="inline-block bg-white text-foreground px-5 py-2 rounded-md font-semibold hover:bg-accent hover:text-white transition-colors text-xs sm:text-sm shadow-md"
                style={{ backgroundColor: col.primaryButtonBg || undefined, color: col.primaryButtonTextColor || undefined }}
              >
                {col.buttonText || 'Explore Collection'}
              </Link>
            </div>
          </div>
        ))}

        {/* Prev / Next */}
        <button
          onClick={prev}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-colors"
          aria-label="Previous"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={next}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-colors"
          aria-label="Next"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        </div>

        {/* Dot indicators */}
        <div className="mt-4 flex justify-center gap-2">
          {collections.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 h-3 bg-accent' : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

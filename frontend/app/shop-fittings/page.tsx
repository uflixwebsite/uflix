'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { getProducts } from '@/services/productService';
import { getPageContent } from '@/services/pageService';
import { renderSection } from '@/components/DynamicPage';
import type { Section } from '@/components/DynamicPage';

const STATS = [
  { value: '20+', label: 'Years of Experience' },
  { value: '500+', label: 'Projects Delivered' },
  { value: 'ISO 9001:2015', label: 'Certified Quality' },
  { value: '50+', label: 'Retail Clients' },
];

const SOLUTIONS = [
  { title: 'Display Fixtures', desc: 'Premium gondola shelving, pegboard panels, and display risers engineered to maximise product visibility.', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80' },
  { title: 'Checkout Counters', desc: 'Custom-built cash-wrap counters and POS stations that combine functionality with your brand aesthetic.', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80' },
  { title: 'Garment & Apparel', desc: 'Wall-mounted rails, floor racks, and hanging systems for apparel retailers of any size.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80' },
  { title: 'Lighting & Signage', desc: 'Integrated LED display lighting and branded signage solutions to elevate the in-store experience.', img: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=80' },
  { title: 'Storage Systems', desc: 'Back-office shelving, stockroom racking, and modular storage units built for high-volume retail.', img: 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?auto=format&fit=crop&w=800&q=80' },
  { title: 'Custom Fabrication', desc: 'Bespoke metal and wood fabrication for unique retail environments — from concept to installation.', img: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80' },
];

const PROCESS = [
  { step: '01', title: 'Consultation', desc: 'We assess your space, brand, and product range to design the ideal layout and fitting solution.' },
  { step: '02', title: 'Design & Quote', desc: 'Our design team creates detailed renderings and a transparent, itemised quotation.' },
  { step: '03', title: 'Manufacturing', desc: 'Every unit is fabricated in our ISO-certified facility with rigorous quality control at each stage.' },
  { step: '04', title: 'Delivery & Install', desc: 'White-glove delivery and professional installation with zero disruption to your operations.' },
];



function ShopFittingsHero({ section }: { section?: Section }) {
  const title    = section?.title             || 'Transform Your Retail Space';
  const desc     = section?.description      || 'Premium shop fittings designed and manufactured in-house for leading retail brands across India.';
  const mainLink = section?.link             || '#products';
  const mainText = section?.linkText         || 'Explore Products';
  const secLink  = section?.secondaryLink     || '/contact';
  const secText  = section?.secondaryLinkText || 'Get a Quote';

  const allImages: string[] = [
    ...(section?.image ? [section.image] : []),
    ...((section?.items || []).filter((i: any) => i.image).map((i: any) => i.image as string)),
  ];

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = allImages.length;

  const prev = () => setIdx((n) => (n - 1 + total) % total);
  const next = () => setIdx((n) => (n + 1) % total);

  useEffect(() => {
    if (total <= 1 || paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, paused, idx]);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#000' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Crossfade slides */}
      {allImages.map((url, i) => (
        <div
          key={url + i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === idx ? 1 : 0 }}
        >
          <Image src={url} alt={`slide ${i + 1}`} fill sizes="100vw" className="object-cover" priority={i === 0} />
        </div>
      ))}
      {allImages.length === 0 && <div className="absolute inset-0 bg-gray-900" />}

      {/* Left arrow */}
      {total > 1 && (
        <button
          onClick={prev}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white transition-all"
          aria-label="Previous"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {total > 1 && (
        <button
          onClick={next}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white transition-all"
          aria-label="Next"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-4 py-24 max-w-5xl mx-auto">
        <span className="inline-block bg-white/10 text-white border border-white/20 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          Shop Fitting Solutions
        </span>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">{title}</h1>
        <p className="text-xl text-white/70 max-w-3xl mx-auto mb-10">{desc}</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href={mainLink} className="bg-accent hover:bg-accent/90 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg transition-all">
            {mainText}
          </Link>
          <Link href={secLink} className="border border-white/30 hover:border-white text-white px-8 py-3.5 rounded-full font-semibold transition-all hover:bg-white/10">
            {secText}
          </Link>
        </div>
      </div>

      {/* Dot nav */}
      {total > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {allImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`transition-all rounded-full ${
                i === idx ? 'w-6 h-2.5 bg-accent' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Section 1: Intro Statement + Stats ─────────────────────────────────────
function IntroSection({ section }: { section?: Section }) {
  const heading = section?.title || 'Retail Spaces,\nEngineered to Perform';
  const body = section?.description || 'For over two decades, Uflix has delivered precision-fabricated shop fitting solutions for retail brands, government institutions, and commercial spaces across India.';
  const link = section?.link || '/contact';
  const linkText = section?.linkText || 'Get a Consultation';

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: '#F5F0EB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-14 items-center">
          <div className="lg:col-span-3 text-center lg:text-left">
            <div className="w-10 h-0.5 bg-accent mb-6 mx-auto lg:mx-0" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 whitespace-pre-line">
              {heading}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">{body}</p>
            <Link
              href={link}
              className="inline-flex items-center gap-2 font-semibold text-accent hover:gap-3 transition-all text-base"
            >
              {linkText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {(section?.items && section.items.length > 0
              ? (section.items as any[]).map((item) => ({ value: item.stats || item.title || '', label: item.statsLabel || item.description || '' }))
              : STATS
            ).map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 md:p-6 text-center shadow-sm min-h-32 flex flex-col justify-center">
                <p className="text-2xl md:text-4xl font-bold text-gray-900 wrap-break-word leading-tight">{stat.value}</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1.5 leading-snug wrap-break-word">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 2: Solutions — image cards with text overlay ───────────────────
function SolutionsImageGrid({ section }: { section?: Section }) {
  const heading = section?.title || 'Complete Retail Fitout Solutions';
  const items = (section?.items && section.items.length > 0)
    ? (section.items as any[]).map((item) => ({ title: item.title || '', desc: item.description || '', img: item.image || '' }))
    : SOLUTIONS;
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <span className="text-accent text-sm font-semibold uppercase tracking-widest">What We Offer</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3">{heading}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((sol, i) => (
            <div key={sol.title + i} className="group relative h-72 rounded-2xl overflow-hidden">
              {sol.img ? (
                <Image src={sol.img} alt={sol.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gray-300" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/5" />
              <span className="absolute top-5 right-5 text-white/20 font-bold text-5xl leading-none select-none pointer-events-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white font-bold text-lg mb-2">{sol.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed overflow-hidden max-h-0 group-hover:max-h-24 transition-all duration-500">
                  {sol.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 3: Project Gallery (bento image layout) ───────────────────────────
function EditorialGallery({ section }: { section?: Section }) {
  const heading = section?.title || 'Projects That Speak for Themselves';
  const ctaLink = section?.link || '/contact';
  const ctaText = section?.linkText || 'Start Your Project';

  const defaultGallery = [
    { src: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80', label: 'Flagship Retail Fitout', tag: 'Display Fixtures' },
    { src: 'https://images.unsplash.com/photo-1493476523860-a6de6ce1b0c3?auto=format&fit=crop&w=800&q=80', label: 'Custom Checkout Counter', tag: 'Checkout & POS' },
    { src: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=800&q=80', label: 'Modular Shelving System', tag: 'Storage & Display' },
  ];
  const gallery = (section?.items && section.items.length > 0)
    ? (section.items as any[]).slice(0, 3).map((item) => ({ src: item.image || '', label: item.title || '', tag: item.description || '' }))
    : defaultGallery;
  const g0 = gallery[0] || defaultGallery[0];
  const rest = gallery.slice(1);

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: '#F5F0EB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-center md:text-left">
          <div className="mx-auto md:mx-0">
            <span className="text-accent text-sm font-semibold uppercase tracking-widest">Our Work</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 max-w-md leading-tight">{heading}</h2>
          </div>
          <Link
            href={ctaLink}
            className="self-center md:self-start inline-flex items-center gap-2 text-sm font-semibold text-gray-700 underline underline-offset-4 hover:text-accent transition-colors whitespace-nowrap"
          >
            {ctaText}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Bento grid */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Large card — 60% */}
          <div className="group relative rounded-2xl overflow-hidden shrink-0 lg:w-3/5" style={{ height: '480px' }}>
            {g0.src ? (
              <Image src={g0.src} alt={g0.label} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="absolute inset-0 bg-gray-300" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <span className="hidden sm:inline-block bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">{g0.tag}</span>
              <h3 className="text-white text-2xl font-bold">{g0.label}</h3>
            </div>
          </div>

          {/* Two stacked cards — 40% */}
          <div className="flex flex-row lg:flex-col gap-4 flex-1">
            {rest.map((img, idx) => (
              <div key={img.label + idx} className="group relative rounded-2xl overflow-hidden flex-1" style={{ minHeight: '225px' }}>
                {img.src ? (
                  <Image src={img.src} alt={img.label} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-gray-300" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="hidden sm:inline-block bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-2">{img.tag}</span>
                  <h3 className="text-white font-bold text-base">{img.label}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stat strip */}
        <div className="mt-6 grid grid-cols-3 divide-x divide-gray-200 bg-white rounded-2xl">
          {[
            { value: '200+', label: 'Stores Fitted' },
            { value: '15+', label: 'States Served' },
            { value: '100%', label: 'On-Time Delivery' },
          ].map((s) => (
            <div key={s.label} className="py-6 text-center">
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 4: Product Horizontal Scroll Strip ───────────────────────────────
function ProductScrollStrip({
  products,
  loading,
  section,
}: {
  products: any[];
  loading: boolean;
  section?: Section;
}) {
  const title = section?.title || 'Featured Products';
  const link = section?.link || '/shop';
  const linkText = section?.linkText || 'View all products';
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollPct, setScrollPct] = useState(0);

  const scroll = (dir: 'l' | 'r') => {
    sliderRef.current?.scrollBy({ left: dir === 'l' ? -320 : 320, behavior: 'smooth' });
  };
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const pct = el.scrollLeft / (el.scrollWidth - el.clientWidth);
    setScrollPct(isNaN(pct) ? 0 : pct);
  };

  return (
    <section id="products" className="py-20 md:py-28" style={{ backgroundColor: '#F5F0EB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-5 mb-10 text-center md:text-left">
          <div>
            <span className="text-accent text-sm font-semibold uppercase tracking-widest">Our Range</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">{title}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => scroll('l')}
                className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                aria-label="Previous"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll('r')}
                className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                aria-label="Next"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <Link
              href={link}
              className="text-sm font-semibold text-gray-700 underline underline-offset-4 decoration-gray-400 hover:text-accent hover:decoration-accent transition-colors whitespace-nowrap"
            >
              {linkText}
            </Link>
          </div>
        </div>

        <div
          ref={sliderRef}
          className="overflow-x-auto scrollbar-hide"
          onScroll={onScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-5 pb-4" style={{ width: 'max-content' }}>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex-none w-64 animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-xl mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))
            ) : products.length === 0 ? (
              <p className="text-gray-400 text-sm py-16">No products available yet. Add products tagged &lsquo;shop-fitting&rsquo; in the admin panel.</p>
            ) : (
              products.map((p: any) => {
                const rawImg = p.images?.[0] || p.image || '';
                const imgUrl = typeof rawImg === 'string' ? rawImg : rawImg?.url || '';
                return (
                  <Link key={p._id} href={`/product/${p._id}`} className="group flex-none w-64 md:w-72">
                    <div className="relative h-64 rounded-xl overflow-hidden bg-gray-200">
                      {imgUrl ? (
                        <Image src={imgUrl} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 bg-gray-200" />
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-accent transition-colors">
                        {p.name}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {products.length > 0 && (
          <div className="mt-4 h-0.5 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-700 rounded-full transition-all duration-200"
              style={{ width: `${Math.max(8, scrollPct * 100)}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Section 5: Industries We Serve ─────────────────────────────────────────
function IndustriesSection({ section }: { section?: Section }) {
  const heading = section?.title || 'Built for Every Industry';
  const subheading = section?.description || 'From high-street retail to government institutions, our solutions adapt to any commercial environment.';

  const defaultIndustries = [
    { name: 'Retail & Fashion', desc: 'End-to-end fitouts for apparel, accessories, and lifestyle stores of any size.', img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80' },
    { name: 'Hospitality', desc: 'Display counters, service stations, and décor solutions for hotels, cafes, and restaurants.', img: 'https://images.unsplash.com/photo-1578474846132-04be8ae33fdc?auto=format&fit=crop&w=800&q=80' },
    { name: 'Government & Institutional', desc: 'ISO-certified supply and professional installation for public sector and institutional spaces.', img: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=800&q=80' },
    { name: 'Corporate Offices', desc: 'Reception desks, storage solutions, and branded display systems for modern workspaces.', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
  ];
  const industries = (section?.items && section.items.length > 0)
    ? (section.items as any[]).map((item, i) => ({ name: item.title || '', desc: item.description || '', img: item.image || '', tag: String(i + 1).padStart(2, '0') }))
    : defaultIndustries.map((d, i) => ({ ...d, tag: String(i + 1).padStart(2, '0') }));

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <span className="text-accent text-sm font-semibold uppercase tracking-widest">Sectors</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3">{heading}</h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto text-base leading-relaxed">{subheading}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {industries.map((ind) => (
            <div key={ind.name} className="group relative rounded-2xl overflow-hidden" style={{ height: '420px' }}>
              {ind.img ? (
                <Image src={ind.img} alt={ind.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gray-300" />
              )}
              {/* Base gradient */}
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/10" />
              {/* Hover darkener */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />
              <span className="absolute top-5 left-5 text-white/20 font-bold text-6xl leading-none select-none">
                {ind.tag}
              </span>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white font-bold text-xl mb-2">{ind.name}</h3>
                <p className="text-white/60 text-sm leading-relaxed overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-500">
                  {ind.desc}
                </p>
                <div className="mt-4 w-8 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 6: Process + Why Uflix + CTA (dark) ─────────────────────────────
function ProcessAndCTA({ processSection, whyCtaSection }: { processSection?: Section; whyCtaSection?: Section }) {
  const processTitle = processSection?.title || 'From Vision to Reality';
  const steps = (processSection?.items && processSection.items.length > 0)
    ? (processSection.items as any[]).map((item) => ({ step: item.stats || '', title: item.title || '', desc: item.description || '' }))
    : PROCESS;

  const ctaTitle = whyCtaSection?.title || 'Ready to Transform Your Store?';
  const ctaDesc = whyCtaSection?.description || 'Get a free consultation and custom quote from our expert team.';
  const ctaLink = whyCtaSection?.link || '/contact';
  const ctaLinkText = whyCtaSection?.linkText || 'Get Free Quote';
  const ctaSecLink = whyCtaSection?.secondaryLink || 'https://wa.me/917303836300';
  const ctaSecLinkText = whyCtaSection?.secondaryLinkText || 'Chat on WhatsApp';

  const defaultFeatures = [
    'ISO 9001:2015 certified manufacturing',
    'In-house design and fabrication team',
    'Government & retail sector expertise',
    'Pan-India delivery and installation',
    'Lifetime technical support',
    'Competitive bulk-order pricing',
  ];
  const features = (whyCtaSection?.items && whyCtaSection.items.length > 0)
    ? (whyCtaSection.items as any[]).map((item) => item.title || '').filter(Boolean)
    : defaultFeatures;

  return (
    <section style={{ backgroundColor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Process steps */}
        <div className="mb-20">
          <div className="mb-12 text-center">
            <span className="text-accent text-sm font-semibold uppercase tracking-widest">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3">{processTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-white/10" />
            {steps.map((p) => (
              <div key={p.step + p.title} className="text-center">
                <div
                  className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-5 relative z-10"
                  style={{ backgroundColor: '#0f172a' }}
                >
                  <span className="text-accent font-bold text-lg">{p.step}</span>
                </div>
                <h3 className="font-bold text-white text-base mb-2">{p.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Why Uflix + CTA card */}
        <div className="grid lg:grid-cols-2 gap-14 items-center pt-20">
          <div className="text-center lg:text-left">
            <span className="text-accent text-sm font-semibold uppercase tracking-widest">Why Uflix</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-6">
              Built for Retail.<br />Trusted by Brands.
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-8">
              With over two decades of manufacturing excellence, Uflix delivers shop fitting solutions that combine aesthetics, durability, and functionality — on time and on budget.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {features.map((f) => (
                <div key={f} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  <span className="text-white/70 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{ctaTitle}</h3>
            <p className="text-white/60 mb-8 leading-relaxed">{ctaDesc}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={ctaLink}
                className="bg-accent hover:bg-accent/90 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg transition-all"
              >
                {ctaLinkText}
              </Link>
              {ctaSecLink && (
                <Link
                  href={ctaSecLink}
                  target={ctaSecLink.startsWith('http') ? '_blank' : undefined}
                  className="border border-white/30 hover:border-white text-white px-8 py-3.5 rounded-full font-semibold transition-all hover:bg-white/10"
                >
                  {ctaSecLinkText}
                </Link>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ShopFittingsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchPageContent();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts({ category: 'shop-fitting', limit: 6 });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching shop fittings products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPageContent = async () => {
    try {
      const data = await getPageContent('shop-fittings');
      setSections(data.data?.sections || []);
      setPageReady(true);
    } catch (error) {
      console.error('Error fetching page content:', error);
      setPageReady(true);
    }
  };

  // Look up a section by id — returns undefined if not found (falls back to static defaults)
  const getSection = (id: string) => sections.find(s => s.sectionId === id);

  // Fixed render order. CMS data is merged in where available; static defaults used otherwise.
  // Sections hidden via the admin toggle are suppressed.
  const isHidden = (id: string) => {
    const s = getSection(id);
    return s !== undefined && s.isVisible === false;
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="homepage-main">
        {!pageReady ? (
          <div className="min-h-screen" style={{ background: '#000' }} />
        ) : (
          <>
            {!isHidden('hero')       && <ShopFittingsHero section={getSection('hero')} />}
            {!isHidden('intro')      && <IntroSection section={getSection('intro')} />}
            {!isHidden('solutions')  && <SolutionsImageGrid section={getSection('solutions')} />}
            {!isHidden('gallery')    && <EditorialGallery section={getSection('gallery')} />}
            {!isHidden('products')   && <ProductScrollStrip products={products} loading={loading} section={getSection('products')} />}
            {!isHidden('industries') && <IndustriesSection section={getSection('industries')} />}
            {!isHidden('process')    && <ProcessAndCTA processSection={getSection('process')} whyCtaSection={getSection('why-cta')} />}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

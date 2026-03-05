'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts } from '@/services/productService';
import { getPageContent } from '@/services/pageService';
import { getCategoryByPath } from '@/services/categoryService';
import api from '@/services/api';
import { renderSection } from '@/components/DynamicPage';
import type { Section } from '@/components/DynamicPage';

// ─── Placeholder data (shows until admin configures each section) ────────────
const PH_STATS = [
  { stats: '75+', statsLabel: 'National & International Awards' },
  { stats: '900+', statsLabel: 'Design Registrations' },
  { stats: '3500+', statsLabel: 'Exclusive Product Designs' },
  { stats: '400+', statsLabel: 'Skilled Artisans' },
  { stats: '20+', statsLabel: 'Years of Excellence' },
  { stats: '300+', statsLabel: 'Corporate Clients' },
];

const PH_IMAGE_GRID = [
  {
    title: 'Designs for a Better Workspace',
    description: 'Ergonomic, modular office systems built around people.',
    image: '',
    link: '/category/for-business',
    linkText: 'Explore Office',
  },
  {
    title: 'Collaborative Spaces',
    description: 'Meeting rooms and open-plan furniture that inspire teamwork.',
    image: '',
    link: '/categories',
    linkText: 'View Collection',
  },
];

const PH_SPLIT_1 = {
  title: 'Audio-Visual for Your Space',
  description:
    'Integrated AV furniture and cable-managed media walls — designed to complement your workspace aesthetic while keeping technology tidy and accessible.',
  image: '',
  link: '/contact',
  linkText: 'Get a Quote',
};

const PH_SPLIT_2 = {
  title: 'Shop for Home — Modern Indian Living',
  description:
    'Bring the same quality and craftsmanship home. Explore our residential collection designed for modern Indian families — functional, beautiful, and built to last.',
  image: '',
  link: '/shop',
  linkText: 'Shop Collection',
};

const PH_PROJECTS: never[] = [];

// ─── Category Tabs + Horizontal Scroll Slider ─────────────────────────────────
const PH_SLIDER_IMAGES: Record<string, string[]> = {};
const PH_SLIDER_NAMES: Record<string, string[]> = {};

function SliderCard({ image, name, link }: { image: string; name: string; link: string }) {
  return (
    <Link
      href={link}
      className="group flex-none w-64 md:w-72 cursor-pointer"
    >
      <div className="relative h-52 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-400"
        />
      </div>
      <div className="mt-3 pb-3 border-b border-gray-200">
        <p className="font-semibold text-gray-800 text-sm group-hover:text-accent transition-colors">
          {name}
        </p>
        <span className="inline-block mt-1 text-accent text-base leading-none">→</span>
      </div>
    </Link>
  );
}

function CategoryProductTabs({
  subCategories,
  businessRootSlug,
  businessRootId,
  adminSliderItems,
}: {
  subCategories: any[];
  businessRootSlug: string;
  businessRootId?: string;
  // items from the single 'slider' section; each item has description=tabName, title, image, link
  adminSliderItems?: any[];
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  // Build tabs from admin items grouped by description, or fall back to real subcategories / placeholders.
  const adminTabs: { name: string; cards: any[] }[] = [];
  if (adminSliderItems && adminSliderItems.length > 0) {
    const map = new Map<string, any[]>();
    adminSliderItems.forEach((item: any) => {
      const tab = item.description?.trim() || 'Other';
      if (!map.has(tab)) map.set(tab, []);
      map.get(tab)!.push(item);
    });
    map.forEach((cards, name) => adminTabs.push({ name, cards }));
  }
  const hasAdminTabs = adminTabs.length > 0;

  const tabs = hasAdminTabs
    ? adminTabs
    : subCategories.length
    ? subCategories.map((c: any) => ({ name: c.name, slug: c.slug, _id: c._id, cards: [] }))
    : [
        { name: 'Seating',       slug: 'seating',       cards: [] },
        { name: 'Desking',       slug: 'desking',       cards: [] },
        { name: 'Workstations',  slug: 'workstations',  cards: [] },
        { name: 'Office Storage',slug: 'office-storage',cards: [] },
        { name: 'Laboratory',    slug: 'laboratory',    cards: [] },
        { name: 'Healthcare',    slug: 'healthcare',    cards: [] },
      ] as any[];

  useEffect(() => {
    if (hasAdminTabs) return;
    if (subCategories.length === 0) {
      // No subcategories — try fetching all products from the root business category
      if (businessRootId) fetchTabProducts({ _id: businessRootId });
      return;
    }
    const cat = (subCategories as any[])[activeIdx];
    if (!cat) return;
    fetchTabProducts(cat);
  }, [subCategories, activeIdx, hasAdminTabs, businessRootId]);

  const fetchTabProducts = async (cat: any) => {
    setLoading(true);
    try {
      const res = await getProducts({ categoryId: cat._id, limit: 10 });
      const prods = (res.data || []).slice(0, 10);
      // If subcategory yielded no products, try the root business category as fallback
      if (prods.length === 0 && businessRootId && cat._id !== businessRootId) {
        const rootRes = await getProducts({ categoryId: businessRootId, limit: 10 });
        setProducts((rootRes.data || []).slice(0, 10));
      } else {
        setProducts(prods);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const pct = el.scrollLeft / (el.scrollWidth - el.clientWidth);
    setScrollPct(isNaN(pct) ? 0 : pct);
  };

  const activeSlug = (tabs[activeIdx] as any)?.slug || 'seating';
  const phImages = PH_SLIDER_IMAGES[activeSlug] || PH_SLIDER_IMAGES.seating;
  const phNames  = PH_SLIDER_NAMES[activeSlug]  || PH_SLIDER_NAMES.seating;

  return (
    <section className="py-16 bg-[#F5F0EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          Designed for better working, every day
        </h2>

        {/* Rectangular segmented tabs — scrollable on mobile */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none' }}>
          <div className="flex border border-gray-300 rounded-none overflow-hidden w-fit mb-8 min-w-max">
            {tabs.map((cat, i) => (
            <button
              key={cat._id || cat.name || i}
              onClick={() => setActiveIdx(i)}
              className={`px-6 py-3 text-sm font-medium border-r border-gray-300 last:border-r-0 transition-colors relative ${
                activeIdx === i
                  ? 'bg-white text-gray-900'
                  : 'bg-transparent text-gray-600 hover:bg-white/60'
              }`}
            >
              {cat.name}
              {activeIdx === i && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
          ))}
          </div>
        </div>

        {/* Horizontal scroll slider */}
        <div
          className="overflow-x-auto scrollbar-hide"
          onScroll={onScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="flex-none w-64 animate-pulse">
                  <div className="bg-gray-300 h-52 rounded-lg mb-3" />
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-1" />
                </div>
              ))
            ) : hasAdminTabs ? (
              (() => {
                const cards = (tabs[activeIdx] as any)?.cards || [];
                if (cards.length === 0) return (
                  <p className="text-gray-400 py-12">No cards added to this tab yet.</p>
                );
                return cards.map((item: any, i: number) => (
                  <SliderCard key={i} image={item.image || ''} name={item.title || ''} link={item.link || `/${businessRootSlug}`} />
                ));
              })()
            ) : !subCategories.length && products.length === 0 ? (
              phImages && phImages.length > 0 ? (
                phImages.map((src, i) => (
                  <SliderCard key={i} image={src} name={phNames[i] || 'Office Chair'} link={`/category/for-business/${activeSlug}`} />
                ))
              ) : (
                <p className="text-gray-400 py-12">No products added yet. Add products to this category.</p>
              )
            ) : products.length === 0 ? (
              <p className="text-gray-400 py-12">No products in this category yet.</p>
            ) : (
              products.map((p: any) => (
                <SliderCard key={p._id} image={p.images?.[0] || p.image || ''} name={p.name} link={`/product/${p._id}`} />
              ))
            )}
          </div>
        </div>

        {/* Scroll progress bar */}
        <div className="mt-4 h-0.5 bg-gray-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-200"
            style={{ width: `${Math.max(10, scrollPct * 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar (coral) ───────────────────────────────────────────────────────────
function StatsBar({ items }: { items: { stats: string; statsLabel: string }[] }) {
  return (
    <section style={{ backgroundColor: '#E87059' }} className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item, i) => (
            <div key={i} className="text-center text-white">
              <p className="text-4xl md:text-5xl font-bold">{item.stats}</p>
              <p className="text-white/80 mt-2 text-sm leading-snug">{item.statsLabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Image Grid (2-col with overlay) ────────────────────────────────────────────
type GridItem = { title: string; description: string; image: string; link: string; linkText: string };

function ImageGrid({ items }: { items: GridItem[] }) {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Designs for a Better Workspace</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <div key={i} className="relative h-80 rounded-2xl overflow-hidden group">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-300" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold">{item.title}</h3>
                {item.description && (
                  <p className="text-white/80 text-sm mt-1">{item.description}</p>
                )}
                {item.link && (
                  <Link
                    href={item.link}
                    className="inline-block mt-3 text-sm font-semibold text-white border-b border-white/50 hover:border-white transition-colors"
                  >
                    {item.linkText} →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Split Content ───────────────────────────────────────────────────────────────
type SplitProps = {
  title: string;
  description: string;
  image: string;
  link: string;
  linkText: string;
  imageRight?: boolean;
  bgLight?: boolean;
};

function SplitContent({ title, description, image, link, linkText, imageRight = false, bgLight = false }: SplitProps) {
  return (
    <section className={`py-20 ${bgLight ? 'bg-neutral-50' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid md:grid-cols-2 gap-16 items-center`}>
          {/* Image — swap order via CSS order property */}
          <div className={`relative h-105 rounded-2xl overflow-hidden shadow-2xl ${imageRight ? 'md:order-2' : ''}`}>
            {image ? (
              <Image src={image} alt={title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gray-200" />
            )}
          </div>
          {/* Text */}
          <div className={imageRight ? 'md:order-1' : ''}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{title}</h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">{description}</p>
            <Link
              href={link}
              className="inline-block bg-accent hover:bg-secondary text-white px-8 py-3.5 rounded-full font-semibold transition-colors shadow-md"
            >
              {linkText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Flagship Projects ───────────────────────────────────────────────────────────
type ProjectItem = { title: string; description: string; image: string; link: string; linkText: string };

function ProjectsSection({ items }: { items: ProjectItem[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = items[activeIdx];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Our flagship projects</h2>
          <p className="text-gray-500 mt-3 text-base max-w-xl leading-relaxed">
            We create diverse spaces by blending strategy, design, engineering, and construction
            into a seamless, collaborative process, delivering innovative solutions tailored to
            your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-[340px_1fr] gap-0 rounded-2xl overflow-hidden shadow-xl border border-gray-100">
          {/* Left: project list */}
          <div className="bg-white py-6 px-4">
            <ul className="space-y-0">
              {items.map((item, i) => (
                <li key={i}>
                  <button
                    onClick={() => setActiveIdx(i)}
                    className={`w-full text-left py-4 px-5 rounded-lg text-sm font-semibold transition-all ${
                      activeIdx === i
                        ? 'bg-accent text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: active image */}
          <div className="relative min-h-120">
            {active.image ? (
              <Image
                key={activeIdx}
                src={active.image}
                alt={active.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-200" />
            )}
            {/* Dark gradient at bottom */}
            <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent" />
            {/* Bottom bar: title left + View project right */}
            <div className="absolute bottom-0 left-0 right-0 px-8 py-6 flex items-end justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{active.title}</h3>
                {active.description && (
                  <p className="text-white/75 text-sm mt-1 max-w-xs leading-snug">
                    {active.description}
                  </p>
                )}
              </div>
              {active.link && (
                <Link
                  href={active.link}
                  className="text-white text-sm font-semibold underline underline-offset-4 decoration-white/60 hover:decoration-white whitespace-nowrap ml-6 pb-1"
                >
                  {active.linkText || 'View project'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Business Hero (always dark, carousel if multiple images) ───────────────
function BusinessHero({ section }: { section?: Section }) {
  const title    = section?.title       || '';
  const desc     = section?.description || section?.subtitle || '';
  const mainLink = section?.link        || '#products';
  const mainText = section?.linkText    || 'Browse Collection';
  const secLink  = section?.secondaryLink     || '/contact';
  const secText  = section?.secondaryLinkText || 'Request a Quote';

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
          <Image src={url} alt={`slide ${i + 1}`} fill className="object-cover" priority={i === 0} />
        </div>
      ))}
      {/* no images fallback */}
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
      <div className="relative z-10 text-center px-4 pt-32 pb-16 max-w-5xl mx-auto">
        <span className="inline-block bg-white/10 text-white border border-white/20 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          Business Furniture Solutions
        </span>
        {title ? (
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">{title}</h1>
        ) : (
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Furniture That <br />
            <span className="text-accent">Means Business</span>
          </h1>
        )}
        <p className="text-xl text-white/70 max-w-3xl mx-auto mb-10">
          {desc || 'From corporate offices to government institutions — premium, ISO-certified furniture solutions designed for productivity, durability, and your brand.'}
        </p>
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
              className={`transition-all rounded-full ${i === idx ? 'w-6 h-2.5 bg-accent' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Helpers: map DB section → typed items ────────────────────────────────────
function dbToStats(s: Section) {
  return (s.items || []).map((it) => ({
    stats: it.stats || it.title || '',
    statsLabel: it.statsLabel || it.description || '',
  }));
}
function dbToGridItems(s: Section): GridItem[] {
  return (s.items || []).map((it) => ({
    title: it.title || '',
    description: it.description || '',
    image: it.image || '',
    link: it.link || '',
    linkText: it.linkText || 'Learn more',
  }));
}
function dbToProjects(s: Section): ProjectItem[] {
  return (s.items || []).map((it) => ({
    title: it.title || '',
    description: it.description || '',
    image: it.image || '',
    link: it.link || '',
    linkText: it.linkText || 'View project',
  }));
}
function dbToSplit(s: Section, fallback: SplitProps): SplitProps {
  return {
    title: s.title || fallback.title,
    description: s.description || s.subtitle || fallback.description,
    image: s.image || fallback.image,
    link: s.link || fallback.link,
    linkText: s.linkText || fallback.linkText,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────────
export default function BusinessPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [businessRootSlug, setBusinessRootSlug] = useState('for-business');
  const [businessRootId, setBusinessRootId] = useState<string | undefined>();
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    fetchPageContent();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategoryByPath(['for-business']);
      const chain = res?.data;
      const node = Array.isArray(chain) ? chain[chain.length - 1] : chain;
      if (node?.slug) setBusinessRootSlug(node.slug);
      if (node?._id) {
        setBusinessRootId(node._id);
        const r = await api.get('/categories', { params: { parentId: node._id } });
        setSubCategories(r.data?.data || []);
      }
    } catch {}
  };

  const fetchPageContent = async () => {
    try {
      const data = await getPageContent('business');
      setSections(data.data?.sections || []);
      setPageReady(true);
    } catch {}
  };

  const get = (id: string) => sections.find((s) => s.sectionId === id || s.type === id);

  // DB overrides or placeholder fallbacks
  const heroSection = sections.find((s) => s.type === 'hero');

  const statsItems     = get('stats-bar')?.items?.length ? dbToStats(get('stats-bar')!)            : PH_STATS;
  const gridItems      = get('image-grid')?.items?.length ? dbToGridItems(get('image-grid')!)      : PH_IMAGE_GRID;
  const split1Data     = get('split-1')                   ? dbToSplit(get('split-1')!, PH_SPLIT_1)  : PH_SPLIT_1;
  const split2Data     = get('split-2')                   ? dbToSplit(get('split-2')!, PH_SPLIT_2)  : PH_SPLIT_2;
  const projectItems   = get('projects')?.items?.length   ? dbToProjects(get('projects')!)          : [];
  const adminSliderItems = get('slider')?.items?.length   ? get('slider')!.items                   : undefined;
  const ctaSection     = get('cta') || get('bulk-cta');
  // Visibility: only hide when section exists in DB AND isVisible is explicitly false.
  // If section has never been saved (no DB entry), always show with placeholder.
  const visible = (id: string) => { const s = get(id); return !s || s.isVisible !== false; };

  const HANDLED = new Set(['hero','slider','stats-bar','image-grid','split-1','split-2','text-image','projects','cta','bulk-cta']);
  const extraSections = sections.filter((s) => !HANDLED.has(s.type) && !HANDLED.has(s.sectionId));

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="homepage-main">

        {/* 1. Hero */}
        {!pageReady
          ? <div className="min-h-screen" style={{ background: '#000' }} />
          : visible('hero') && <BusinessHero section={heroSection} />}

        {/* 2. Category Tabs + Products */}
        {visible('slider') && (
          <CategoryProductTabs
            subCategories={subCategories}
            businessRootSlug={businessRootSlug}
            businessRootId={businessRootId}
            adminSliderItems={adminSliderItems}
          />
        )}

        {/* 3. Stats Bar */}
        {visible('stats-bar') && <StatsBar items={statsItems} />}

        {/* 4. Image Grid */}
        {visible('image-grid') && <ImageGrid items={gridItems} />}

        {/* 5. Split — Audio-Visual (image left) */}
        {visible('split-1') && <SplitContent {...split1Data} imageRight={false} bgLight={false} />}

        {/* 6. Split — Shop for Home (image right) */}
        {visible('split-2') && <SplitContent {...split2Data} imageRight={true} bgLight={true} />}

        {/* 7. Flagship Projects — only renders when admin has added items AND section is visible */}
        {visible('projects') && projectItems.length > 0 && <ProjectsSection items={projectItems} />}

        {/* 8. Any extra DB sections */}
        {extraSections.filter(s => s.isVisible !== false).map((s) => (
          <div key={s._id || s.sectionId}>{renderSection(s)}</div>
        ))}

        {/* 9. CTA */}
        {visible('cta') && (ctaSection ? (
          renderSection(ctaSection)
        ) : (
          <section
            className="py-20"
            style={{ background: '#000' }}
          >
            <div className="max-w-5xl mx-auto px-4 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Need Bulk Orders or Custom Solutions?
              </h2>
              <p className="text-white/70 text-lg mb-8">
                We specialise in large-scale corporate and institutional projects.
                Talk to our business solutions team for a personalised quote.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact" className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-full font-bold transition-all">
                  Get Bulk Quote
                </Link>
                <Link href="https://wa.me/917303836300" target="_blank" className="border border-white/30 hover:border-white text-white px-8 py-4 rounded-full font-bold transition-all hover:bg-white/10">
                  WhatsApp Us
                </Link>
              </div>
            </div>
          </section>
        ))}

      </main>
      <Footer />
    </div>
  );
}

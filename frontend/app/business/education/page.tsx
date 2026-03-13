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
import type { Section } from '@/components/DynamicPage';

// This file was moved from /category/education to /business/education
// Content derived from the Healthcare template and adapted for Education

const PH_HIGHLIGHT_TEXT =
  'Flexible learning spaces and durable furniture solutions crafted for modern educational institutions.';

const PH_IDEAS = [
  {
    category: 'Education',
    readTime: '8 mins read',
    title: 'Designing Classrooms for Engagement',
    description:
      'Adaptive classroom furniture supports collaborative learning and flexible pedagogies. Ergonomic desks and chairs, modular seating, and flexible configurations help students focus while teachers adapt the space to every lesson.',
    image: '',
    link: '#',
    linkText: 'Read more',
  },
  {
    category: 'Education',
    readTime: '6 mins read',
    title: 'Spaces That Inspire Learning',
    description:
      'Modern educational institutions recognise that the physical environment has a direct impact on student performance. Thoughtfully designed libraries, labs, and breakout areas create a culture of curiosity and collaboration.',
    image: '',
    link: '#',
    linkText: 'Read more',
  },
];

const PH_STATS = [
  { stats: '75+', statsLabel: 'National & International Awards' },
  { stats: '900+', statsLabel: 'Design Registrations' },
  { stats: '3500+', statsLabel: 'Exclusive Product Designs' },
  { stats: '400+', statsLabel: 'Skilled Artisans' },
  { stats: '20+', statsLabel: 'Years of Excellence' },
  { stats: '300+', statsLabel: 'Institutional Clients' },
];

function EducationHero({ section }: { section?: Section }) {
  const allSlides = [
    {
      image: section?.image || '',
      title: section?.title || '',
      subtitle: section?.subtitle || '',
      description: section?.description || '',
      linkText: section?.linkText || 'Explore Products',
      link: section?.link || '#just-arrived',
      secondaryLinkText: section?.secondaryLinkText || 'Request a Quote',
      secondaryLink: section?.secondaryLink || '/contact',
      titleColor: section?.titleColor || '',
      subtitleColor: section?.subtitleColor || '',
      primaryButtonBg: section?.primaryButtonBg || '',
      primaryButtonTextColor: section?.primaryButtonTextColor || '',
      secondaryButtonBg: section?.secondaryButtonBg || '',
      secondaryButtonTextColor: section?.secondaryButtonTextColor || '',
    },
    ...((section?.items || [])
      .filter((i: any) => i.image)
      .map((i: any) => ({
        image: i.image as string,
        title: i.title || section?.title || '',
        subtitle: i.subtitle || section?.subtitle || '',
        description: i.description || section?.description || '',
        linkText: i.linkText || section?.linkText || 'Explore Products',
        link: i.link || section?.link || '#just-arrived',
        secondaryLinkText: i.secondaryLinkText || section?.secondaryLinkText || 'Request a Quote',
        secondaryLink: i.secondaryLink || section?.secondaryLink || '/contact',
        titleColor: i.titleColor || section?.titleColor || '',
        subtitleColor: i.subtitleColor || section?.subtitleColor || '',
        primaryButtonBg: i.primaryButtonBg || section?.primaryButtonBg || '',
        primaryButtonTextColor: i.primaryButtonTextColor || section?.primaryButtonTextColor || '',
        secondaryButtonBg: i.secondaryButtonBg || section?.secondaryButtonBg || '',
        secondaryButtonTextColor: i.secondaryButtonTextColor || section?.secondaryButtonTextColor || '',
      }))),
  ].filter((s) => s.image);

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = allSlides.length;
  const cur = allSlides[idx] ?? { title: '', subtitle: '', description: '', linkText: 'Explore Products', link: '#just-arrived', secondaryLinkText: 'Request a Quote', secondaryLink: '/contact', titleColor: '', subtitleColor: '', primaryButtonBg: '', primaryButtonTextColor: '', secondaryButtonBg: '', secondaryButtonTextColor: '' };

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
      {allSlides.map((s, i) => (
        <div
          key={s.image + i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === idx ? 1 : 0 }}
        >
          <Image src={s.image} alt={`slide ${i + 1}`} fill sizes="100vw" className="object-cover" priority={i === 0} />
        </div>
      ))}
      {allSlides.length === 0 && (
        <div className="absolute inset-0 bg-gray-900" />
      )}

      {total > 1 && (
        <button onClick={prev} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white transition-all" aria-label="Previous">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      {total > 1 && (
        <button onClick={next} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white transition-all" aria-label="Next">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      )}

      <div className="relative z-10 text-center px-4 pt-32 pb-16 max-w-5xl mx-auto">
        <span className="inline-block bg-white/10 text-white border border-white/20 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          Education Furniture Solutions
        </span>
        {cur.title ? (
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" style={{ color: cur.titleColor || undefined }}>{cur.title}</h1>
        ) : (
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Designed for <br />
            <span style={{ color: '#E87059' }}>Learning Environments</span>
          </h1>
        )}
        <p className="text-xl text-white/70 max-w-3xl mx-auto mb-10" style={{ color: cur.subtitleColor || undefined }}>
          {cur.description || cur.subtitle || 'Durable, flexible furniture systems that support modern teaching methods and student well-being.'}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href={cur.link}
            className="btn-primary px-8 py-3.5 rounded-full font-semibold shadow-lg transition-all"
            style={{ backgroundColor: cur.primaryButtonBg || undefined, color: cur.primaryButtonTextColor || undefined }}
          >
            {cur.linkText}
          </Link>
          <Link
            href={cur.secondaryLink}
            className="btn-outline-inverse px-8 py-3.5 rounded-full font-semibold transition-all hover:bg-white/10"
            style={{ backgroundColor: cur.secondaryButtonBg || undefined, color: cur.secondaryButtonTextColor || undefined }}
          >
            {cur.secondaryLinkText}
          </Link>
        </div>
      </div>
      {total > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {allSlides.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`transition-all rounded-full ${i === idx ? 'w-6 h-2.5 bg-accent' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'}`} aria-label={`Go to slide ${i + 1}`} />
          ))}
        </div>
      )}
    </section>
  );
}

function HighlightTextSection({ text }: { text: string }) {
  return (
    <section style={{ backgroundColor: '#F5EFE8' }} className="py-10 md:py-14">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p
          className="text-lg md:text-xl lg:text-2xl font-semibold leading-relaxed"
          style={{ color: '#E87059' }}
        >
          {text}
        </p>
      </div>
    </section>
  );
}

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

function dbToStats(s: Section) {
  return (s.items || []).map((it: any) => ({ stats: it.stats || it.title || '', statsLabel: it.statsLabel || it.description || '' }));
}

function PlaceholderSection({ section }: { section?: Section }) {
  if (!section) return null;
  if (!section.title && !section.description && !section.image) return null;
  return (
    <section
      className="py-16"
      style={{ backgroundColor: section.bgColor === 'dark' ? '#000' : section.bgColor === 'light' ? '#F5F0EB' : '#fff' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.image && (
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden mb-8">
            <Image src={section.image} alt={section.title || 'Section image'} fill className="object-cover" />
          </div>
        )}
        {section.title && (
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${section.bgColor === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            {section.title}
          </h2>
        )}
        {section.description && (
          <p className={`text-lg leading-relaxed max-w-3xl ${section.bgColor === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
            {section.description}
          </p>
        )}
        {section.link && (
          <Link
            href={section.link}
            className="inline-block mt-6 btn-primary px-8 py-3.5 rounded-full font-semibold transition-all"
            style={{ backgroundColor: section.primaryButtonBg || undefined, color: section.primaryButtonTextColor || undefined }}
          >
            {section.linkText || 'Learn More'}
          </Link>
        )}
      </div>
    </section>
  );
}

// ─── Product Slider ───────────────────────────────────────────────────────────

function ProductSliderCard({ image, name, variant, link }: { image: string; name: string; variant?: string; link: string }) {
  return (
    <Link href={link} className="group flex-none w-64 md:w-72">
      <div className="relative h-64 rounded-xl overflow-hidden bg-gray-100">
        {image ? (
          <Image src={image} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-400" />
        ) : (
          <div className="absolute inset-0 bg-gray-200" />
        )}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
      </div>
      <div className="mt-3">
        <p className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-accent transition-colors">{name}</p>
        {variant && <p className="text-xs text-gray-500 mt-0.5">{variant}</p>}
      </div>
    </Link>
  );
}

function JustArrivedSection({ section, products, loading }: { section?: Section; products: any[]; loading: boolean }) {
  const sectionTitle = section?.title || 'Just arrived';
  const viewAllLink = section?.link || '/business/products';
  const viewAllText = section?.linkText || 'View all products';
  const [scrollPct, setScrollPct] = useState(0);
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const pct = el.scrollLeft / (el.scrollWidth - el.clientWidth);
    setScrollPct(isNaN(pct) ? 0 : pct);
  };
  return (
    <section id="just-arrived" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{sectionTitle}</h2>
          <Link href={viewAllLink} className="text-sm font-semibold text-gray-700 underline underline-offset-4 decoration-gray-400 hover:text-accent hover:decoration-accent transition-colors whitespace-nowrap">{viewAllText}</Link>
        </div>
        <div className="overflow-x-auto scrollbar-hide" onScroll={onScroll} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
              <p className="text-gray-400 py-12 text-sm">No products configured yet. Go to Admin → Just Arrived to pin products or set a category path.</p>
            ) : (
              products.map((p: any) => {
                const rawImg = p.images?.[0] || p.image || '';
                const imgUrl = typeof rawImg === 'string' ? rawImg : rawImg?.url || '';
                return (
                  <ProductSliderCard key={p._id} image={imgUrl} name={p.name} variant={p.variants?.[0]?.name || p.material || ''} link={`/product/${p._id}`} />
                );
              })
            )}
          </div>
        </div>
        {products.length > 0 && (
          <div className="mt-4 h-0.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gray-700 rounded-full transition-all duration-200" style={{ width: `${Math.max(8, scrollPct * 100)}%` }} />
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Ideas / Articles ──────────────────────────────────────────────────────────

interface IdeaItem {
  category: string;
  readTime: string;
  title: string;
  description: string;
  image: string;
  link: string;
  linkText: string;
  primaryButtonBg?: string;
  primaryButtonTextColor?: string;
}

function IdeasSection({ heading, exploreLink, exploreText, ideas }: { heading: string; exploreLink: string; exploreText: string; ideas: IdeaItem[] }) {
  if (ideas.length === 0) return null;
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{heading}</h2>
          <Link href={exploreLink} className="text-sm font-semibold text-gray-700 underline underline-offset-4 decoration-gray-400 hover:text-accent hover:decoration-accent transition-colors whitespace-nowrap">{exploreText}</Link>
        </div>
      </div>
      <div className="overflow-hidden">
        {ideas.map((idea, i) => {
          const imageLeft = i % 2 === 0;
          return (
            <article key={i} className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: 500 }}>
              <div className={`relative min-h-72 md:min-h-full ${imageLeft ? 'md:order-1' : 'md:order-2'}`}>
                {idea.image ? (
                  <Image src={idea.image} alt={idea.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center"><span className="text-gray-400 text-sm">No image</span></div>
                )}
              </div>
              <div className={`flex items-center bg-gray-50 px-8 sm:px-12 md:px-16 lg:px-20 py-14 ${imageLeft ? 'md:order-2' : 'md:order-1'}`}>
                <div className="max-w-lg w-full">
                  <p className="text-sm font-semibold tracking-wide mb-4" style={{ color: '#E87059' }}>{idea.category}</p>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{idea.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-base mb-8">{idea.description}</p>
                  {idea.link && (
                    <Link href={idea.link} className="inline-block btn-primary px-7 py-3 rounded-full text-sm font-semibold transition-colors" style={{ backgroundColor: idea.primaryButtonBg || undefined, color: idea.primaryButtonTextColor || undefined }}>{idea.linkText || 'Read more'}</Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="pb-16" />
    </section>
  );
}

export default function EducationPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const data = await getPageContent('business-education');
      const secs: Section[] = data.data?.sections || [];
      setSections(secs);
      setPageReady(true);
      const jaSection = secs.find((s) => s.sectionId === 'just-arrived');
      const pinnedItems = (jaSection?.items || []).filter((i: any) => i._ref);
      if (pinnedItems.length > 0) {
        setProductsLoading(true);
        try {
          const ids: string[] = pinnedItems.map((i: any) => i._ref as string);
          const results = await Promise.all(ids.map((id) => api.get(`/products/${id}`).catch(() => null)));
          setProducts(
            pinnedItems.map((i: any, idx: number) => {
              const pd = results[idx]?.data?.data; // backend: { success, data: product }
              // images are stored as [{url, alt}] objects — extract the url string
              const imgUrls = pd?.images?.length
                ? pd.images.map((img: any) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
                : [];
              return {
                _id: i._ref,
                name: i.title || pd?.name || '',
                images: imgUrls.length ? imgUrls : (i.image ? [i.image] : []),
                variants: pd?.variants || [],
                material: i.variant || pd?.variants?.[0]?.name || '',
              };
            })
          );
        } catch {
          setProducts(pinnedItems.map((i: any) => ({ _id: i._ref, name: i.title || '', images: [i.image || ''], material: i.variant || '' })));
        }
        setProductsLoading(false);
      } else {
        const categoryPath = jaSection?.description?.trim();
        if (categoryPath) {
          fetchProducts(categoryPath.split('/'));
        } else {
          setProductsLoading(false);
        }
      }
    } catch {
      setProductsLoading(false);
    }
  };

  const fetchProducts = async (slugs: string[]) => {
    setProductsLoading(true);
    try {
      const catRes = await getCategoryByPath(slugs).catch(() => null);
      const chain = catRes?.data;
      const node = Array.isArray(chain) ? chain[chain.length - 1] : chain;
      if (node?._id) {
        const res = await getProducts({ categoryId: node._id, limit: 12, sort: 'newest' });
        setProducts(res.data || []);
      } else {
        const fallbackCat = await getCategoryByPath(['for-business']).catch(() => null);
        const fallbackNode = Array.isArray(fallbackCat?.data) ? fallbackCat?.data[fallbackCat.data.length - 1] : fallbackCat?.data;
        if (fallbackNode?._id) {
          const res = await getProducts({ categoryId: fallbackNode._id, limit: 12 });
          setProducts(res.data || []);
        }
      }
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const get = (id: string) => sections.find((s) => s.sectionId === id);

  const heroSection = sections.find((s) => s.type === 'hero');
  const textSection = get('text-highlight');
  const placeholderSection = get('placeholder');
  const justArrivedSection = get('just-arrived');
  const ideasSection = get('ideas-section');

  const highlightText = textSection?.description || textSection?.content || PH_HIGHLIGHT_TEXT;

  const ideasItems: any[] = (() => {
    const cmsItems = ideasSection?.items?.length
      ? ideasSection.items.map((it: any, idx: number) => ({
          category: it.icon || 'Education',
          readTime: it.stats || '8 mins read',
          title: it.title || '',
          description: it.description || '',
          image: it.image || PH_IDEAS[idx % PH_IDEAS.length]?.image || '',
          link: it.link || '#',
          linkText: it.linkText || 'Read more',
          primaryButtonBg: it.primaryButtonBg || '',
          primaryButtonTextColor: it.primaryButtonTextColor || '',
        }))
      : PH_IDEAS;
    return cmsItems.length < 2 ? [...cmsItems, ...PH_IDEAS.slice(cmsItems.length, 2)] : cmsItems;
  })();

  const ideasHeading = ideasSection?.title || 'Ideas for educational spaces';
  const ideasExploreLink = ideasSection?.link || '/industries';
  const ideasExploreText = ideasSection?.linkText || 'Explore all';
  const justArrivedLink = justArrivedSection?.link || '/business/products';

  const visible = (id: string) => {
    const s = id === 'hero' ? sections.find((s) => s.type === 'hero') : get(id);
    return !s || s.isVisible !== false;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="homepage-main">
        {!pageReady
          ? <div className="min-h-screen" style={{ background: '#000' }} />
          : visible('hero') && <EducationHero section={heroSection} />}
        {visible('text-highlight') && (
          <HighlightTextSection text={highlightText} />
        )}
        {visible('stats-bar') && (() => {
          const statsItems = get('stats-bar')?.items?.length ? dbToStats(get('stats-bar')!) : PH_STATS;
          return <StatsBar items={statsItems} />;
        })()}
        {visible('placeholder') && <PlaceholderSection section={placeholderSection} />}

        {/* 4. Just arrived products */}
        {visible('just-arrived') && (
          <JustArrivedSection section={justArrivedSection} products={products} loading={productsLoading} />
        )}

        {/* 5. Ideas / Articles */}
        {visible('ideas-section') && (
          <IdeasSection
            heading={ideasHeading}
            exploreLink={ideasExploreLink}
            exploreText={ideasExploreText}
            ideas={ideasItems}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

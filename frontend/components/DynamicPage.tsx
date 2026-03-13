'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPageContent } from '@/services/pageService';

interface SectionItem {
  _id?: string;
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
  link?: string;
  linkText?: string;
  items?: string[];
  stats?: string;
  statsLabel?: string;
}

interface Section {
  _id?: string;
  sectionId: string;
  type: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  bgColor?: string;
  items?: SectionItem[];
  content?: string;
  link?: string;
  linkText?: string;
  secondaryLink?: string;
  secondaryLinkText?: string;
  titleColor?: string;
  subtitleColor?: string;
  primaryButtonBg?: string;
  primaryButtonTextColor?: string;
  secondaryButtonBg?: string;
  secondaryButtonTextColor?: string;
  order: number;
  isVisible: boolean;
}

interface PageData {
  slug: string;
  title: string;
  description?: string;
  sections: Section[];
}

function getBgClass(bgColor?: string) {
  switch (bgColor) {
    case 'light': return 'bg-neutral-light';
    case 'gradient': return 'bg-linear-to-br from-accent to-secondary';
    case 'dark': return 'bg-gray-900';
    case 'white':
    default: return 'bg-white';
  }
}

function HeroSection({ section }: { section: Section }) {
  const hasImage = !!section.image;
  const isDark = section.bgColor === 'dark' || section.bgColor === 'gradient';

  if (isDark) {
    return (
      <section
        className={`relative ${hasImage ? 'min-h-screen' : 'h-64'} overflow-hidden`}
        style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f3460 100%)' }}
      >
        {hasImage && (
          <Image
            src={section.image!}
            alt={section.imageAlt || section.title || ''}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center text-white z-10">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6" style={{ color: section.titleColor || undefined }}>{section.title}</h1>
            {section.description && (
              <p className="text-base sm:text-lg md:text-2xl mb-7 md:mb-8 max-w-3xl mx-auto text-white/80" style={{ color: section.subtitleColor || undefined }}>{section.description}</p>
            )}
            {(section.link || section.secondaryLink) && (
              <div className="flex flex-wrap justify-center gap-4">
                {section.link && section.linkText && (
                  <Link href={section.link} className="inline-block btn-primary px-7 md:px-10 py-3 md:py-4 rounded-full font-bold transition-colors shadow-xl text-sm md:text-lg" style={{ backgroundColor: section.primaryButtonBg || undefined, color: section.primaryButtonTextColor || undefined }}>
                    {section.linkText}
                  </Link>
                )}
                {section.secondaryLink && section.secondaryLinkText && (
                  <Link href={section.secondaryLink} className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-accent px-7 md:px-10 py-3 md:py-4 rounded-full font-bold transition-colors text-sm md:text-lg" style={{ backgroundColor: section.secondaryButtonBg || undefined, color: section.secondaryButtonTextColor || undefined }}>
                    {section.secondaryLinkText}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative ${hasImage ? 'min-h-screen' : 'h-64'} ${getBgClass(section.bgColor)} overflow-hidden`}>
      {hasImage && (
        <Image
          src={section.image!}
          alt={section.imageAlt || section.title || ''}
          fill
          className="object-cover opacity-20"
          priority
        />
      )}
      <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6" style={{ color: section.titleColor || undefined }}>{section.title}</h1>
          {section.description && (
            <p className="text-base sm:text-lg md:text-2xl mb-7 md:mb-8 max-w-3xl mx-auto" style={{ color: section.subtitleColor || undefined }}>{section.description}</p>
          )}
          {(section.link || section.secondaryLink) && (
            <div className="flex flex-wrap justify-center gap-4">
              {section.link && section.linkText && (
                <Link href={section.link} className="inline-block bg-white text-accent hover:bg-neutral-light px-7 md:px-10 py-3 md:py-4 rounded-lg font-bold transition-colors shadow-xl text-sm md:text-lg" style={{ backgroundColor: section.primaryButtonBg || undefined, color: section.primaryButtonTextColor || undefined }}>
                  {section.linkText}
                </Link>
              )}
              {section.secondaryLink && section.secondaryLinkText && (
                <Link href={section.secondaryLink} className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-accent px-7 md:px-10 py-3 md:py-4 rounded-lg font-bold transition-colors text-sm md:text-lg" style={{ backgroundColor: section.secondaryButtonBg || undefined, color: section.secondaryButtonTextColor || undefined }}>
                  {section.secondaryLinkText}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ContentSection({ section }: { section: Section }) {
  return (
    <section className={`py-12 md:py-20 ${getBgClass(section.bgColor)}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{section.title}</h2>
          {(section.subtitle || section.description) && (
            <p className="text-base md:text-lg text-neutral-dark max-w-3xl mx-auto">
              {section.subtitle || section.description}
            </p>
          )}
        </div>
        {section.content && (
          <div className="max-w-4xl mx-auto text-base md:text-lg text-neutral-dark leading-relaxed whitespace-pre-line text-center md:text-left">
            {section.content}
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturesSection({ section }: { section: Section }) {
  const items = section.items || [];
  const cols = items.length <= 3 ? `lg:grid-cols-3` : `lg:grid-cols-4`;
  return (
    <section className={`py-20 ${getBgClass(section.bgColor)}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
            {section.subtitle && <p className="text-lg text-neutral-dark max-w-3xl mx-auto">{section.subtitle}</p>}
          </div>
        )}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
            {items.map((item, idx) => (
              <div key={idx} className="snap-center shrink-0 w-[86vw] max-w-sm text-center p-6 rounded-2xl shadow-lg bg-white border border-gray-100">
                {item.image ? (
                  <div className="w-18 h-18 rounded-2xl mx-auto mb-5 overflow-hidden">
                    <img src={item.image} alt={item.title || ''} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-18 h-18 bg-linear-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2 leading-tight">{item.title}</h3>
                <p className="text-neutral-dark line-clamp-3">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={`hidden md:grid md:grid-cols-2 ${cols} gap-8`}>
          {items.map((item, idx) => (
            <div key={idx} className="text-center p-8 rounded-lg hover:shadow-lg transition-shadow bg-white">
              {item.image ? (
                <div className="w-20 h-20 rounded-2xl mx-auto mb-6 overflow-hidden">
                  <img src={item.image} alt={item.title || ''} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-linear-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-neutral-dark">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection({ section }: { section: Section }) {
  const items = section.items || [];
  return (
    <section className={`py-20 ${getBgClass(section.bgColor)}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
            {section.subtitle && <p className="text-lg text-neutral-dark">{section.subtitle}</p>}
          </div>
        )}
        <div className={`grid md:grid-cols-${Math.min(items.length, 4)} gap-8 max-w-4xl mx-auto`}>
          {items.map((item, idx) => (
            <div key={idx} className="text-center p-6 bg-neutral-light rounded-xl">
              <div className="text-5xl font-bold text-accent mb-3">{item.title || item.stats}</div>
              <div className="text-lg font-semibold mb-1">{item.description}</div>
              {item.statsLabel && <div className="text-sm text-neutral-dark">{item.statsLabel}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ section }: { section: Section }) {
  const isGradient = section.bgColor === 'gradient';
  return (
    <section className={`py-20 ${getBgClass(section.bgColor)}`}>
      <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center ${isGradient ? 'text-white' : ''}`}>
        <h2 className="text-4xl font-bold mb-6" style={{ color: section.titleColor || undefined }}>{section.title}</h2>
        {section.description && (
          <p className={`text-xl mb-10 ${isGradient ? 'opacity-90' : 'text-neutral-dark'}`} style={{ color: section.subtitleColor || undefined }}>{section.description}</p>
        )}
        <div className="flex flex-wrap justify-center gap-4">
          {section.link && section.linkText && (
            <Link
              href={section.link}
              className={`inline-block px-10 py-4 rounded-lg font-bold transition-colors shadow-xl text-lg ${
                isGradient
                  ? 'bg-white text-accent hover:bg-neutral-light'
                  : 'btn-primary'
              }`}
              style={{ backgroundColor: section.primaryButtonBg || undefined, color: section.primaryButtonTextColor || undefined }}
            >
              {section.linkText}
            </Link>
          )}
          {section.secondaryLink && section.secondaryLinkText && (
            <Link
              href={section.secondaryLink}
              className={`inline-block px-10 py-4 rounded-lg font-bold transition-colors text-lg ${
                isGradient
                  ? 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-accent'
                  : 'btn-outline'
              }`}
              style={{ backgroundColor: section.secondaryButtonBg || undefined, color: section.secondaryButtonTextColor || undefined }}
            >
              {section.secondaryLinkText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function CardsSection({ section }: { section: Section }) {
  const items = section.items || [];
  const cols = items.length <= 2 ? 'md:grid-cols-2' : items.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3';
  return (
    <section className={`py-20 ${getBgClass(section.bgColor)}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
            {section.subtitle && <p className="text-lg text-neutral-dark max-w-3xl mx-auto">{section.subtitle}</p>}
          </div>
        )}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
            {items.map((item, idx) => (
              <div key={idx} className="snap-center shrink-0 w-[86vw] max-w-sm bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                {item.image && (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden mb-5">
                    <img src={item.image} alt={item.title || ''} className="w-full h-full object-cover" />
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2 leading-tight">{item.title}</h3>
                <p className="text-neutral-dark whitespace-pre-line line-clamp-4">{item.description}</p>
                {item.stats && (
                  <div className="mt-4">
                    <div className="text-3xl font-bold text-accent">{item.stats}</div>
                    {item.statsLabel && <p className="text-sm text-neutral-dark">{item.statsLabel}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className={`hidden md:grid ${cols} gap-8`}>
          {items.map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg">
              {item.image && (
                <div className="w-16 h-16 rounded-2xl overflow-hidden mb-6">
                  <img src={item.image} alt={item.title || ''} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-neutral-dark whitespace-pre-line">{item.description}</p>
              {item.stats && (
                <div className="mt-4">
                  <div className="text-3xl font-bold text-accent">{item.stats}</div>
                  {item.statsLabel && <p className="text-sm text-neutral-dark">{item.statsLabel}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TextImageSection({ section }: { section: Section }) {
  const items = section.items || [];
  return (
    <section className={`py-12 md:py-20 ${getBgClass(section.bgColor)}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.subtitle && (
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{section.subtitle}</h2>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="order-2 md:order-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">{section.title}</h2>
            {section.description && (
              <p className="text-base md:text-lg text-neutral-dark mb-4 leading-relaxed">{section.description}</p>
            )}
            {section.content && (
              <p className="text-base md:text-lg text-neutral-dark mb-4 leading-relaxed whitespace-pre-line">{section.content}</p>
            )}
            {items.length > 0 && (
              <div className="space-y-4 mt-6">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-accent shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-neutral-dark">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {section.image && (
            <div className="order-1 md:order-2 relative h-72 md:h-100 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={section.image}
                alt={section.imageAlt || section.title || ''}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ListSection({ section }: { section: Section }) {
  const items = section.items || [];
  return (
    <section className={`py-12 md:py-20 ${getBgClass(section.bgColor)}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && (
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{section.title}</h2>
            {section.subtitle && <p className="text-base md:text-lg text-neutral-dark max-w-3xl mx-auto">{section.subtitle}</p>}
          </div>
        )}
        <div className="space-y-10 md:space-y-16">
          {items.map((item, idx) => (
            <div key={idx} className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {item.image && (
                <div className={`relative h-72 md:h-100 rounded-2xl overflow-hidden shadow-2xl ${idx % 2 === 1 ? 'md:order-2' : ''}`}>
                  <Image src={item.image} alt={item.title || ''} fill className="object-cover" />
                </div>
              )}
              <div className={`${idx % 2 === 1 ? 'md:order-1' : ''} text-center md:text-left`}>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">{item.title}</h3>
                <p className="text-base md:text-lg text-neutral-dark mb-4 leading-relaxed">{item.description}</p>
                {item.statsLabel && (
                  <p className="text-sm font-semibold text-accent">{item.statsLabel}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactInfoSection({ section }: { section: Section }) {
  const items = section.items || [];
  return (
    <section className={`py-16 ${getBgClass(section.bgColor)}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">{section.title}</h2>
          {section.description && (
            <p className="text-base md:text-lg text-neutral-dark mb-8">{section.description}</p>
          )}
          <div className="space-y-6">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-neutral-dark whitespace-pre-line">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function renderSection(section: Section) {
  switch (section.type) {
    case 'hero': return <HeroSection section={section} />;
    case 'content': return <ContentSection section={section} />;
    case 'features': return <FeaturesSection section={section} />;
    case 'stats': return <StatsSection section={section} />;
    case 'cta': return <CTASection section={section} />;
    case 'cards': return <CardsSection section={section} />;
    case 'text-image': return <TextImageSection section={section} />;
    case 'list': return <ListSection section={section} />;
    case 'contact-info': return <ContactInfoSection section={section} />;
    case 'custom': return <ContentSection section={section} />;
    default: return <ContentSection section={section} />;
  }
}

interface DynamicPageProps {
  slug: string;
  fallback?: React.ReactNode;
  children?: (sections: Section[], pageData: PageData) => React.ReactNode;
}

export default function DynamicPage({ slug, fallback, children }: DynamicPageProps) {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [slug]);

  const fetchContent = async () => {
    try {
      const data = await getPageContent(slug);
      setPageData(data.data);
    } catch (err) {
      console.error(`Error fetching page content for "${slug}":`, err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <div className="h-125 bg-gray-200 animate-pulse" />
          <div className="max-w-7xl mx-auto px-4 py-16 space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto animate-pulse" />
            <div className="grid grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !pageData) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <p className="text-neutral-dark">This page content has not been configured yet.</p>
        </main>
        <Footer />
      </div>
    );
  }

  // If children render prop is provided, use it for custom rendering
  if (children) {
    const hasHeroSection = (pageData.sections || []).some((s) => s.type === 'hero' && s.isVisible !== false);
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className={hasHeroSection ? 'homepage-main' : ''}>
          {children(pageData.sections, pageData)}
        </main>
        <Footer />
      </div>
    );
  }

  // Default: render all sections automatically
  const hasHeroSection = (pageData.sections || []).some((s) => s.type === 'hero' && s.isVisible !== false);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={hasHeroSection ? 'homepage-main' : ''}>
        {pageData.sections.map((section) => (
          <div key={section._id || section.sectionId}>
            {renderSection(section)}
          </div>
        ))}
      </main>
      <Footer />
    </div>
  );
}

export { renderSection };
export type { Section, PageData, SectionItem };

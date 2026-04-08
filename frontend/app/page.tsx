'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategorySlider from '@/components/CategorySlider';
import FeaturedCollections from '@/components/FeaturedCollections';
import PhotoGrid from '@/components/PhotoGrid';
import PromoCards from '@/components/PromoCards';
import StatsBanner from '@/components/StatsBanner';
import BestSellers from '@/components/BestSellers';
import NewArrivals from '@/components/NewArrivals';
import CategoryProducts from '@/components/CategoryProducts';
import BrandStory from '@/components/BrandStory';
import Benefits from '@/components/Benefits';
import ClientCarousel from '@/components/ClientCarousel';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import Footer from '@/components/Footer';
import { getHomeSettings } from '@/services/homeSettingsService';

const HOME_SETTINGS_CACHE_KEY = 'uflix_home_settings_cache_v1';
const HOME_SETTINGS_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const readHomeSettingsCache = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(HOME_SETTINGS_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.data || !parsed?.savedAt) return null;

    const isExpired = Date.now() - parsed.savedAt > HOME_SETTINGS_CACHE_TTL_MS;
    if (isExpired) {
      window.localStorage.removeItem(HOME_SETTINGS_CACHE_KEY);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
};

const writeHomeSettingsCache = (data: any) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      HOME_SETTINGS_CACHE_KEY,
      JSON.stringify({ data, savedAt: Date.now() })
    );
  } catch {
    // Ignore storage quota and serialization errors.
  }
};

export default function Home() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedSettings = readHomeSettingsCache();
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
    }

    const fetchSettings = async () => {
      try {
        const res = await getHomeSettings();
        setSettings(res.data);
        writeHomeSettingsCache(res.data);
      } catch (error) {
        console.error('Error fetching home settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const DEFAULT_SECTION_ORDER = [
    { type: 'hero', enabled: true, order: 0 },
    { type: 'clients', enabled: true, order: 1 },
    { type: 'categorySlider', enabled: true, order: 2 },
    { type: 'collections', enabled: true, order: 3 },
    { type: 'photoGrid', enabled: true, order: 4 },
    { type: 'promoCards', enabled: true, order: 5 },
    { type: 'statsBanner', enabled: true, order: 6 },
    { type: 'products', enabled: true, order: 7 },
    { type: 'testimonials', enabled: true, order: 8 },
    { type: 'brandStory', enabled: true, order: 9 },
    { type: 'benefits', enabled: true, order: 10 },
  ];

  const sections = (() => {
    if (!settings?.sections) return DEFAULT_SECTION_ORDER;
    const existing = [...settings.sections];
    const existingTypes = new Set(existing.map((s: any) => s.type));
    const maxOrder = existing.reduce((m: number, s: any) => Math.max(m, s.order ?? 0), existing.length - 1);
    let nextOrder = maxOrder + 1;
    DEFAULT_SECTION_ORDER.forEach((def) => {
      if (!existingTypes.has(def.type)) {
        existing.push({ ...def, order: nextOrder++ });
      }
    });
    return existing
      .filter((s: any) => s.type !== 'categories') // remove legacy
      .sort((a: any, b: any) => a.order - b.order);
  })();

  const renderSection = (section: any) => {
    if (!section.enabled) return null;

    switch (section.type) {
      case 'hero':
        return <Hero key="hero" slides={settings?.hero?.slides} />;
      case 'clients':
        return <ClientCarousel key="clients" title={settings?.clients?.title} logos={settings?.clients?.logos} />;
      case 'categories':
        return null; // removed — replaced by categorySlider
      case 'categorySlider':
        return (
          <CategorySlider
            key="categorySlider"
            title={settings?.categorySlider?.title}
            categories={settings?.categorySlider?.categories}
          />
        );
      case 'collections':
        return <FeaturedCollections key="collections" title={settings?.collections?.title} subtitle={settings?.collections?.subtitle} items={settings?.collections?.items} />;
      case 'photoGrid':
        return (
          <PhotoGrid
            key="photoGrid"
            title={settings?.photoGrid?.title}
            photos={settings?.photoGrid?.photos}
          />
        );
      case 'promoCards':
        return (
          <PromoCards
            key="promoCards"
            cards={settings?.promoCards?.cards}
          />
        );
      case 'statsBanner':
        return (
          <StatsBanner
            key="statsBanner"
            title={settings?.statsBanner?.title}
            subtitle={settings?.statsBanner?.subtitle}
            bgColor={settings?.statsBanner?.bgColor}
            stats={settings?.statsBanner?.stats}
          />
        );
      case 'products':
        return (
          <div key="products">
            {(settings?.productSections?.bestSellers?.enabled !== false) && (
              <BestSellers
                title={settings?.productSections?.bestSellers?.title}
                subtitle={settings?.productSections?.bestSellers?.subtitle}
                limit={settings?.productSections?.bestSellers?.limit}
                ctaText={settings?.productSections?.bestSellers?.ctaText}
                ctaLink={settings?.productSections?.bestSellers?.ctaLink}
                primaryButtonBg={settings?.productSections?.bestSellers?.primaryButtonBg}
                primaryButtonTextColor={settings?.productSections?.bestSellers?.primaryButtonTextColor}
              />
            )}
            {(settings?.productSections?.newArrivals?.enabled !== false) && (
              <NewArrivals
                title={settings?.productSections?.newArrivals?.title}
                subtitle={settings?.productSections?.newArrivals?.subtitle}
                limit={settings?.productSections?.newArrivals?.limit}
                ctaText={settings?.productSections?.newArrivals?.ctaText}
                ctaLink={settings?.productSections?.newArrivals?.ctaLink}
                primaryButtonBg={settings?.productSections?.newArrivals?.primaryButtonBg}
                primaryButtonTextColor={settings?.productSections?.newArrivals?.primaryButtonTextColor}
              />
            )}
            {(settings?.productSections?.categoryProducts || [])
              .filter((cp: any) => cp.enabled && cp.category)
              .map((cp: any, i: number) => (
                <CategoryProducts
                  key={`cat-${cp.category}-${i}`}
                  category={cp.category}
                  title={cp.title || cp.categoryName}
                  subtitle={cp.subtitle}
                  limit={cp.limit}
                  ctaText={cp.ctaText}
                  ctaLink={cp.ctaLink}
                  primaryButtonBg={cp.primaryButtonBg}
                  primaryButtonTextColor={cp.primaryButtonTextColor}
                />
              ))}
          </div>
        );
      case 'testimonials':
        const testimonialItems = (settings?.testimonials?.items || []).map((t: any) => ({
          author: { name: t.name, handle: t.handle, avatar: t.avatar },
          text: t.text
        }));
        return testimonialItems.length > 0 ? (
          <TestimonialsSection
            key="testimonials"
            title={settings?.testimonials?.title || 'Loved by Thousands of Happy Customers'}
            description={settings?.testimonials?.description || ''}
            testimonials={testimonialItems}
          />
        ) : null;
      case 'brandStory':
        return <BrandStory key="brandStory" data={settings?.brandStory} />;
      case 'benefits':
        return <Benefits key="benefits" data={settings?.benefits} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="homepage-main">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : (
          sections.map((section: any) => renderSection(section))
        )}
      </main>
      <Footer />
    </div>
  );
}

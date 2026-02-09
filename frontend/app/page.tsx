'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategoryNav from '@/components/CategoryNav';
import FeaturedCollections from '@/components/FeaturedCollections';
import BestSellers from '@/components/BestSellers';
import NewArrivals from '@/components/NewArrivals';
import CategoryProducts from '@/components/CategoryProducts';
import BrandStory from '@/components/BrandStory';
import Benefits from '@/components/Benefits';
import ClientCarousel from '@/components/ClientCarousel';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import Footer from '@/components/Footer';
import { getHomeSettings } from '@/services/homeSettingsService';

export default function Home() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getHomeSettings();
        setSettings(res.data);
      } catch (error) {
        console.error('Error fetching home settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const sections = settings?.sections
    ? [...settings.sections].sort((a: any, b: any) => a.order - b.order)
    : [
        { type: 'hero', enabled: true, order: 0 },
        { type: 'clients', enabled: true, order: 1 },
        { type: 'categories', enabled: true, order: 2 },
        { type: 'collections', enabled: true, order: 3 },
        { type: 'products', enabled: true, order: 4 },
        { type: 'testimonials', enabled: true, order: 5 },
        { type: 'brandStory', enabled: true, order: 6 },
        { type: 'benefits', enabled: true, order: 7 },
      ];

  const renderSection = (section: any) => {
    if (!section.enabled) return null;

    switch (section.type) {
      case 'hero':
        return <Hero key="hero" slides={settings?.hero?.slides} />;
      case 'clients':
        return <ClientCarousel key="clients" title={settings?.clients?.title} logos={settings?.clients?.logos} />;
      case 'categories':
        return <CategoryNav key="categories" />;
      case 'collections':
        return <FeaturedCollections key="collections" title={settings?.collections?.title} subtitle={settings?.collections?.subtitle} items={settings?.collections?.items} />;
      case 'products':
        return (
          <div key="products">
            {(settings?.productSections?.bestSellers?.enabled !== false) && (
              <BestSellers
                title={settings?.productSections?.bestSellers?.title}
                subtitle={settings?.productSections?.bestSellers?.subtitle}
                limit={settings?.productSections?.bestSellers?.limit}
              />
            )}
            {(settings?.productSections?.newArrivals?.enabled !== false) && (
              <NewArrivals
                title={settings?.productSections?.newArrivals?.title}
                subtitle={settings?.productSections?.newArrivals?.subtitle}
                limit={settings?.productSections?.newArrivals?.limit}
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

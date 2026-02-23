'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { getProducts } from '@/services/productService';
import { getPageContent } from '@/services/pageService';
import { getCategoryByPath } from '@/services/categoryService';
import api from '@/services/api';
import { renderSection } from '@/components/DynamicPage';
import type { Section } from '@/components/DynamicPage';

const STATS = [
  { value: '300+', label: 'Corporate Clients' },
  { value: '15+', label: 'Industries Served' },
  { value: 'ISO 9001:2015', label: 'Certified Quality' },
  { value: '20+', label: 'Years of Excellence' },
];

const INDUSTRIES = [
  { icon: '🏦', title: 'Banking & Finance', desc: 'Executive workstations, meeting rooms, and reception furniture for financial institutions.' },
  { icon: '🏥', title: 'Healthcare', desc: 'Ergonomic clinical furniture and sterile storage solutions for hospitals and clinics.' },
  { icon: '🏫', title: 'Education', desc: 'Durable classroom furniture, library systems, and administrative workstations.' },
  { icon: '🏛️', title: 'Government', desc: 'Compliant, GST-ready office furniture for government bodies and PSUs.' },
  { icon: '🏨', title: 'Hospitality', desc: 'Bespoke lobby, guest room, and F&B furniture for hotels and resorts.' },
  { icon: '💼', title: 'Corporate Offices', desc: 'Open-plan workstations, cabins, and collaborative spaces for modern enterprises.' },
];

const CATEGORIES = [
  { slug: 'workstation', icon: '🖥️', title: 'Workstations', desc: 'Ergonomic, modular workstations for open-plan and private offices.' },
  { slug: 'seating', icon: '🪑', title: 'Seating', desc: 'Executive, task, and lounge chairs designed for all-day comfort.' },
  { slug: 'storage', icon: '📦', title: 'Storage Solutions', desc: 'Filing cabinets, pedestals, and overhead storage units.' },
  { slug: 'conference', icon: '📋', title: 'Conference', desc: 'Conference tables, boardroom furniture, and presentation stands.' },
];

const FEATURES = [
  'ISO 9001:2015 certified manufacturing',
  'Custom branding & colour matching',
  'GST-compliant billing for corporates',
  'Project management & installation',
  'Pan-India delivery network',
  'AMC and after-sale service',
];

export default function BusinessPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionsLoaded, setSectionsLoaded] = useState(false);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [businessRootSlug, setBusinessRootSlug] = useState('for-business');

  useEffect(() => {
    fetchProducts();
    fetchPageContent();
  }, []);

  const fetchProducts = async () => {
    try {
      // Resolve category ObjectIds so products assigned via CategoryTreePicker are included
      let businessCatId: string | null = null;
      try {
        const bizRes = await getCategoryByPath(['for-business']);
        const bizChain = bizRes?.data;
        const bizNode = Array.isArray(bizChain) ? bizChain[bizChain.length - 1] : bizChain;
        businessCatId = bizNode?._id || null;
        if (bizNode?.slug) setBusinessRootSlug(bizNode.slug);
        // Fetch children for dynamic category cards
        if (businessCatId) {
          api.get('/categories', { params: { parentId: businessCatId } })
            .then((r: any) => setSubCategories(r.data?.data || []))
            .catch(() => {});
        }
      } catch {}

      const businessProducts = await getProducts(businessCatId
        ? { categoryId: businessCatId, limit: 6 }
        : { category: 'for-business', limit: 6 });
      setProducts((businessProducts.data || []).slice(0, 6));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPageContent = async () => {
    try {
      const data = await getPageContent('business');
      setSections(data.data?.sections || []);
    } catch (error) {
      console.error('Error fetching page content:', error);
    } finally {
      setSectionsLoaded(true);
    }
  };

  const getSection = (id: string) => sections.find(s => s.sectionId === id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="homepage-main">

        {/* ── Hero (dynamic from DB) ─────────────────────────────── */}
        {sections.filter(s => !['products', 'bulk-cta'].includes(s.sectionId)).map(section => (
          <div key={section._id || section.sectionId}>{renderSection(section)}</div>
        ))}

        {/* ── Fallback hero if no DB sections ───────────────────── */}
        {sectionsLoaded && sections.length === 0 && (
          <section
            className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f3460 100%)' }}
          >
            <div className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,107,53,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(15,52,96,0.6) 0%, transparent 50%)',
              }}
            />
            <div className="relative z-10 text-center px-4 py-24 max-w-5xl mx-auto">
              <span className="inline-block bg-accent/20 text-accent border border-accent/30 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                Business Furniture Solutions
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Furniture That <br /><span className="text-accent">Means Business</span>
              </h1>
              <p className="text-xl text-white/70 max-w-3xl mx-auto mb-10">
                From corporate offices to government institutions — premium, ISO-certified furniture solutions designed for productivity, durability, and your brand.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="#products" className="bg-accent hover:bg-accent/90 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg transition-all hover:shadow-accent/30 hover:shadow-xl">
                  Browse Collection
                </Link>
                <Link href="/contact" className="border border-white/30 hover:border-white text-white px-8 py-3.5 rounded-full font-semibold transition-all hover:bg-white/10">
                  Request a Quote
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Stats bar ──────────────────────────────────────────── */}
        <section className="bg-accent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
              {STATS.map((stat) => (
                <div key={stat.label} className="py-8 px-6 text-center text-white">
                  <p className="text-3xl md:text-4xl font-bold">{stat.value}</p>
                  <p className="text-sm text-white/80 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Industries ─────────────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-accent text-sm font-semibold uppercase tracking-widest">Sectors We Serve</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Solutions for Every Industry</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Decades of experience serving diverse sectors with tailored commercial furniture and fitout solutions.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {INDUSTRIES.map((ind) => (
                <div key={ind.title} className="group flex gap-5 p-6 rounded-2xl border border-gray-100 hover:border-accent/30 hover:shadow-lg transition-all duration-300">
                  <div className="text-4xl shrink-0">{ind.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors">{ind.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{ind.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Category cards ─────────────────────────────────────── */}
        <section className="py-24 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-accent text-sm font-semibold uppercase tracking-widest">Browse By Category</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Find Your Perfect Solution</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Explore our range of specialised business furniture categories.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(subCategories.length > 0 ? subCategories : CATEGORIES).map((cat: any) => (
                <Link
                  key={cat.slug || cat._id}
                  href={subCategories.length > 0
                    ? `/category/${businessRootSlug}/${cat.slug}`
                    : `/business/${cat.slug}`}
                  className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-accent/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center"
                >
                  <div className="text-5xl mb-4">{cat.icon || '📦'}</div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors">{cat.title || cat.name}</h3>
                  <p className="text-gray-500 text-sm">{cat.desc || cat.description || ''}</p>
                  <span className="inline-block mt-4 text-accent text-sm font-semibold group-hover:underline">
                    Explore →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Products ───────────────────────────────────────────── */}
        <section id="products" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-accent text-sm font-semibold uppercase tracking-widest">Featured Products</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
                {getSection('products')?.title || 'Premium Business Furniture Collection'}
              </h2>
              <p className="text-lg text-gray-500 max-w-3xl mx-auto">
                {getSection('products')?.subtitle || 'Handpicked furniture designed for productivity, comfort, and style'}
              </p>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-xl mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">💼</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Business Products Available</h3>
                <p className="text-gray-500">Business products will appear here once added.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} {...product} />
                  ))}
                </div>
                <div className="text-center mt-12">
                  <Link href="/business/products" className="inline-block bg-accent hover:bg-secondary text-white px-10 py-4 rounded-full font-semibold transition-colors shadow-md">
                    View All Products →
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Why Uflix ──────────────────────────────────────────── */}
        <section className="py-24 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl bg-gray-800 h-40 flex items-center justify-center p-5">
                    <p className="text-white font-bold text-center text-sm">300+ Corporate Clients Trust Uflix</p>
                  </div>
                  <div className="rounded-2xl bg-accent/10 h-52 flex items-center justify-center text-6xl">🏢</div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="rounded-2xl bg-gray-100 h-52 flex items-center justify-center text-6xl">🖥️</div>
                  <div className="rounded-2xl bg-accent h-40 flex items-center justify-center p-5">
                    <p className="text-white font-bold text-center text-sm">ISO 9001:2015 Certified Manufacturing</p>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-accent text-sm font-semibold uppercase tracking-widest">Why Choose Us</span>
                <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6">The Uflix Business Advantage</h2>
                <p className="text-gray-500 text-lg mb-10 leading-relaxed">
                  We understand that business furniture is an investment. Our solutions are built to last, customised to your brand, and backed by dedicated post-sale support.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  {FEATURES.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <span className="text-accent font-bold shrink-0">✓</span>
                      <span className="text-gray-700 text-sm">{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/contact" className="inline-block bg-accent hover:bg-secondary text-white px-8 py-4 rounded-full font-semibold transition-colors shadow-md">
                  Schedule a Consultation
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA from DB or static fallback ─────────────────────── */}
        {getSection('bulk-cta') ? renderSection(getSection('bulk-cta')!) : (
          <section className="py-20" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f3460 100%)' }}>
            <div className="max-w-5xl mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Need Bulk Orders or Custom Solutions?</h2>
                  <p className="text-white/70 text-lg mb-8">
                    We specialise in large-scale corporate and institutional projects. Talk to our business solutions team for a personalised quote.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link href="/contact" className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-full font-bold shadow-lg transition-all">
                      Get Bulk Quote
                    </Link>
                    <Link href="https://wa.me/917303836300" target="_blank" className="border border-white/30 hover:border-white text-white px-8 py-4 rounded-full font-bold transition-all hover:bg-white/10">
                      WhatsApp Us
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { num: '₹', label: 'Transparent Pricing' },
                    { num: '🚚', label: 'Pan-India Delivery' },
                    { num: '📐', label: 'Custom Dimensions' },
                    { num: '🤝', label: 'Dedicated Account Manager' },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/10 rounded-2xl p-5 text-center backdrop-blur-sm border border-white/10">
                      <div className="text-3xl mb-2">{item.num}</div>
                      <p className="text-white text-sm font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
}

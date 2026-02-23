'use client';

import { useState, useEffect } from 'react';
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
  { icon: '🛍️', title: 'Display Fixtures', desc: 'Premium gondola shelving, pegboard panels, and display risers engineered to maximise product visibility.' },
  { icon: '🏪', title: 'Checkout Counters', desc: 'Custom-built cash-wrap counters and POS stations that combine functionality with your brand aesthetic.' },
  { icon: '👗', title: 'Garment & Apparel', desc: 'Wall-mounted rails, floor racks, and hanging systems for apparel retailers of any size.' },
  { icon: '💡', title: 'Lighting & Signage', desc: 'Integrated LED display lighting and branded signage solutions to elevate the in-store experience.' },
  { icon: '📦', title: 'Storage Systems', desc: 'Back-office shelving, stockroom racking, and modular storage units built for high-volume retail.' },
  { icon: '🔧', title: 'Custom Fabrication', desc: 'Bespoke metal and wood fabrication for unique retail environments — from concept to installation.' },
];

const PROCESS = [
  { step: '01', title: 'Consultation', desc: 'We assess your space, brand, and product range to design the ideal layout and fitting solution.' },
  { step: '02', title: 'Design & Quote', desc: 'Our design team creates detailed renderings and a transparent, itemised quotation.' },
  { step: '03', title: 'Manufacturing', desc: 'Every unit is fabricated in our ISO-certified facility with rigorous quality control at each stage.' },
  { step: '04', title: 'Delivery & Install', desc: 'White-glove delivery and professional installation with zero disruption to your operations.' },
];

const FEATURES = [
  'ISO 9001:2015 certified manufacturing',
  'In-house design and fabrication team',
  'Government & retail sector expertise',
  'Pan-India delivery and installation',
  'Lifetime technical support',
  'Competitive bulk-order pricing',
];

export default function ShopFittingsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);

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
    } catch (error) {
      console.error('Error fetching page content:', error);
    }
  };

  const getSection = (id: string) => sections.find(s => s.sectionId === id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>

        {/* ── Hero (dynamic from DB) ─────────────────────────────── */}
        {sections.filter(s => !['products', 'cta'].includes(s.sectionId)).map(section => (
          <div key={section._id || section.sectionId}>{renderSection(section)}</div>
        ))}

        {/* ── Fallback hero if no DB sections ───────────────────── */}
        {sections.length === 0 && (
          <section
            className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)' }}
          >
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
            />
            <div className="relative z-10 text-center px-4 py-24">
              <span className="inline-block bg-accent/20 text-accent border border-accent/30 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                Shop Fitting Solutions
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                Transform Your<br /><span className="text-accent">Retail Space</span>
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10">
                Premium shop fittings designed and manufactured in-house for leading retail brands across India.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="#products" className="bg-accent hover:bg-accent/90 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg transition-all">
                  Explore Products
                </Link>
                <Link href="/contact" className="border border-white/30 hover:border-white text-white px-8 py-3.5 rounded-full font-semibold transition-all hover:bg-white/10">
                  Get a Quote
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

        {/* ── Solutions grid ─────────────────────────────────────── */}
        <section className="py-24 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-accent text-sm font-semibold uppercase tracking-widest">What We Offer</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Complete Shop Fitting Solutions</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                From concept to installation, we provide end-to-end retail fitout solutions tailored to every sector.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {SOLUTIONS.map((sol) => (
                <div key={sol.title} className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-accent/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="text-4xl mb-5">{sol.icon}</div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">{sol.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{sol.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Products ───────────────────────────────────────────── */}
        <section id="products" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-accent text-sm font-semibold uppercase tracking-widest">Our Range</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
                {getSection('products')?.title || 'Featured Shop Fitting Products'}
              </h2>
              <p className="text-lg text-gray-500 max-w-3xl mx-auto">
                {getSection('products')?.subtitle || 'Browse our selection of professional shop fitting solutions'}
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
                <div className="text-5xl mb-4">🏪</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Available</h3>
                <p className="text-gray-500">Shop fitting products will appear here once added.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} {...product} />
                  ))}
                </div>
                <div className="text-center mt-12">
                  <Link href="/shop-fittings/products" className="inline-block bg-accent hover:bg-secondary text-white px-10 py-4 rounded-full font-semibold transition-colors shadow-md">
                    View All Products →
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Our Process ────────────────────────────────────────── */}
        <section className="py-24 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-accent text-sm font-semibold uppercase tracking-widest">How It Works</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">From Vision to Reality</h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                Our streamlined process ensures a smooth experience from first enquiry to final installation.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {PROCESS.map((p) => (
                <div key={p.step} className="bg-white rounded-2xl p-8 text-center border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
                    <span className="text-accent font-bold text-xl">{p.step}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-3">{p.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why choose us ──────────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-accent text-sm font-semibold uppercase tracking-widest">Why Uflix</span>
                <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6">Built for Retail.<br />Trusted by Brands.</h2>
                <p className="text-gray-500 text-lg mb-10 leading-relaxed">
                  With over two decades of manufacturing excellence, Uflix delivers shop fitting solutions that combine aesthetics, durability, and functionality — on time and on budget.
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
                  Request a Consultation
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl bg-gray-100 h-48 flex items-center justify-center text-6xl">🏪</div>
                  <div className="rounded-2xl bg-accent/10 h-32 flex items-center justify-center p-4">
                    <p className="text-accent font-bold text-center text-sm">Pan-India Delivery & Installation</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="rounded-2xl bg-gray-800 h-32 flex items-center justify-center p-4">
                    <p className="text-white font-bold text-center text-sm">Custom Fabrication Available</p>
                  </div>
                  <div className="rounded-2xl bg-gray-100 h-48 flex items-center justify-center text-6xl">🔧</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────── */}
        {getSection('cta') ? renderSection(getSection('cta')!) : (
          <section className="py-20" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Store?</h2>
              <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
                Get a free consultation and custom quote from our expert team.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact" className="bg-accent hover:bg-accent/90 text-white px-10 py-4 rounded-full font-bold shadow-lg transition-all">
                  Get Free Quote
                </Link>
                <Link href="https://wa.me/917303836300" target="_blank" className="border border-white/30 hover:border-white text-white px-10 py-4 rounded-full font-bold transition-all hover:bg-white/10">
                  Chat on WhatsApp
                </Link>
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/services/productService';

const caseStudies = [
  {
    company: 'Tech Innovations Pvt Ltd',
    industry: 'Technology',
    employees: '250+',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    testimonial: 'Uflix transformed our entire office space. The quality and design have significantly improved employee satisfaction and productivity.',
    logo: 'TI'
  },
  {
    company: 'Global Finance Corp',
    industry: 'Finance',
    employees: '500+',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
    testimonial: 'Professional service and premium furniture that reflects our brand values. The bulk pricing made it an excellent investment.',
    logo: 'GF'
  },
  {
    company: 'Creative Studios',
    industry: 'Design & Media',
    employees: '150+',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
    testimonial: 'The modern aesthetic and ergonomic designs have created an inspiring workspace for our creative team.',
    logo: 'CS'
  }
];

export default function BusinessPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts({ 
        category: 'for-businesses',
        limit: 6 
      });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching business products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <section className="relative h-[600px] bg-gradient-to-r from-accent to-secondary overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
            alt="UFLIX for Business"
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/40" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-3xl">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
                  Elevate Your Workspace
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
                  Premium furniture solutions for businesses that value quality, design, and employee well-being
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/contact" className="inline-block bg-accent hover:bg-secondary text-white px-10 py-4 rounded-md font-semibold transition-colors shadow-lg">
                    Request Consultation
                  </Link>
                  <Link href="#products" className="inline-block bg-white hover:bg-neutral-light text-foreground px-10 py-4 rounded-md font-semibold transition-colors">
                    View Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Leading Businesses Choose Uflix</h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">Trusted by over 500+ companies for premium workspace solutions</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-8 rounded-lg hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Bulk Pricing</h3>
                <p className="text-neutral-dark">Up to 50% off on bulk orders with flexible payment terms</p>
              </div>

              <div className="text-center p-8 rounded-lg hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">1-Year Warranty</h3>
                <p className="text-neutral-dark">Extended warranty on all commercial furniture pieces</p>
              </div>

              <div className="text-center p-8 rounded-lg hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Fast Installation</h3>
                <p className="text-neutral-dark">Professional setup within 7-10 business days</p>
              </div>

              <div className="text-center p-8 rounded-lg hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Dedicated Support</h3>
                <p className="text-neutral-dark">24/7 account manager for all your needs</p>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="py-20 bg-neutral-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Premium Business Furniture Collection</h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">Handpicked furniture designed for productivity, comfort, and style</p>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
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
                  <Link href="/business/products" className="inline-block bg-accent hover:bg-secondary text-white px-8 py-3 rounded-md font-semibold transition-colors shadow-md">
                    Show More Products
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">Need Bulk Orders?</h2>
            <p className="text-xl text-neutral-dark mb-10">Get special pricing for bulk orders and business furniture solutions</p>
            <Link href="/contact" className="inline-block bg-accent hover:bg-secondary text-white px-10 py-4 rounded-lg font-bold transition-colors shadow-xl text-lg">
              Request Bulk Order Quote
            </Link>
          </div>
        </section>

              </main>

      <Footer />
    </div>
  );
}

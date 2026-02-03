'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/services/productService';

export default function ShopFittingsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts({ 
        category: 'shop-fittings',
        limit: 6 
      });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching shop fittings products:', error);
    } finally {
      setLoading(false);
    }
  };
  const fittingCategories = [
    {
      title: 'Display Fixtures & Merchandising',
      description: 'Custom-designed display units, shelving systems, and merchandising fixtures that showcase your products effectively',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      solutions: [
        'Wall-mounted display systems',
        'Freestanding display units',
        'Gondola shelving',
        'Slatwall and gridwall systems',
        'Product display tables',
        'Rotating display stands'
      ]
    },
    {
      title: 'Checkout & Service Counters',
      description: 'Functional and aesthetically designed checkout counters, cash wraps, and service desks for seamless customer transactions',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
      solutions: [
        'Cash wrap counters',
        'Point-of-sale stations',
        'Service desks',
        'Reception counters',
        'Queue management systems',
        'Impulse purchase displays'
      ]
    },
    {
      title: 'Mannequins & Display Props',
      description: 'High-quality mannequins, busts, and display props to bring your merchandise to life',
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea1c8e77?w=800&q=80',
      solutions: [
        'Full-body mannequins',
        'Torso forms and busts',
        'Adjustable dress forms',
        'Child and infant mannequins',
        'Display props and accessories',
        'Window display elements'
      ]
    },
    {
      title: 'Shelving & Storage Systems',
      description: 'Versatile shelving solutions for organized product display and efficient back-of-house storage',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      solutions: [
        'Heavy-duty retail shelving',
        'Adjustable shelving systems',
        'Wire basket displays',
        'Pegboard systems',
        'Back-of-house storage',
        'Stockroom racking'
      ]
    },
    {
      title: 'Fitting Rooms & Trial Areas',
      description: 'Comfortable and well-designed fitting rooms that enhance the customer shopping experience',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',
      solutions: [
        'Modular fitting room cubicles',
        'Mirrors and lighting',
        'Seating and hooks',
        'Privacy curtains and doors',
        'Accessible fitting rooms',
        'Fitting room signage'
      ]
    },
    {
      title: 'Signage & Branding Elements',
      description: 'Custom signage, branding displays, and wayfinding solutions to reinforce your brand identity',
      image: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?w=800&q=80',
      solutions: [
        'Illuminated signage',
        'Directional wayfinding',
        'Price tag holders',
        'Promotional displays',
        'Brand logo installations',
        'Digital signage mounts'
      ]
    }
  ];

  const clientLogos = [
    { name: 'Lifestyle', image: '/Logos/lifetsyle.png' },
    { name: 'Landmark Group', image: '/Logos/landmark.jpg' },
    { name: 'Time House', image: '/Logos/timehouse.jpg' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <section className="relative h-[600px] bg-gradient-to-r from-accent to-secondary overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
            alt="Shop Fittings"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="max-w-5xl mx-auto px-4 text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Complete Shop Fitting Solutions</h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">Transform your retail space with custom-designed fixtures, displays, and fit-out solutions that drive sales and enhance customer experience</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact" className="inline-block bg-white text-accent hover:bg-neutral-light px-10 py-4 rounded-lg font-bold transition-colors shadow-xl text-lg">
                  Request Quote
                </Link>
                <Link href="/projects" className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-accent px-10 py-4 rounded-lg font-bold transition-colors text-lg">
                  View Projects
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose UFLIX for Shop Fittings?</h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
                From concept to installation, we deliver complete retail fit-out solutions that maximize space, enhance product visibility, and create memorable shopping experiences
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-gradient-to-br from-neutral-light to-white p-8 rounded-2xl shadow-lg border border-border">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">Custom Design</h3>
                <p className="text-neutral-dark">Bespoke shop fitting designs tailored to your brand identity, space constraints, and merchandising strategy</p>
              </div>

              <div className="bg-gradient-to-br from-neutral-light to-white p-8 rounded-2xl shadow-lg border border-border">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">Fast Installation</h3>
                <p className="text-neutral-dark">Efficient project management and installation teams to minimize downtime and get your store operational quickly</p>
              </div>

              <div className="bg-gradient-to-br from-neutral-light to-white p-8 rounded-2xl shadow-lg border border-border">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">Cost-Effective</h3>
                <p className="text-neutral-dark">Competitive pricing with bulk discounts for multi-location rollouts and franchise setups</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-neutral-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Shop Fitting Solutions</h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
                Comprehensive range of retail fixtures and fittings for every store type and merchandising need
              </p>
            </div>

            <div className="space-y-16">
              {fittingCategories.map((category, index) => (
                <div key={index} className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  <div className={`relative h-[400px] rounded-2xl overflow-hidden shadow-2xl ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                    <h3 className="text-3xl font-bold mb-4">{category.title}</h3>
                    <p className="text-lg text-neutral-dark mb-6 leading-relaxed">
                      {category.description}
                    </p>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <h4 className="font-semibold mb-4 text-lg">Available Solutions:</h4>
                      <ul className="grid grid-cols-2 gap-3">
                        {category.solutions.map((solution, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-neutral-dark text-sm">{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Our Shop Fitting Products</h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
                Browse our selection of professional shop fitting solutions
              </p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
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
                  <Link href="/shop-fittings/products" className="inline-block bg-accent hover:bg-secondary text-white px-8 py-3 rounded-md font-semibold transition-colors shadow-md">
                    Show More Products
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="py-20 bg-neutral-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Trusted by Leading Retail Brands</h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
                We've successfully delivered shop fitting solutions for major retail chains and boutique stores
              </p>
            </div>

            <div className="flex justify-center gap-8 flex-wrap">
              {clientLogos.map((client, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <img
                    src={client.image}
                    alt={client.name}
                    className="object-contain h-16 w-32"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">Need Bulk Orders?</h2>
            <p className="text-xl text-neutral-dark mb-10">Get special pricing for bulk orders and multi-location projects</p>
            <Link href="/contact" className="inline-block bg-accent hover:bg-secondary text-white px-10 py-4 rounded-lg font-bold transition-colors shadow-xl text-lg">
              Request Bulk Order Quote
            </Link>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-accent to-secondary">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Retail Space?</h2>
            <p className="text-xl mb-10 opacity-90">Get a free consultation and quote for your shop fitting project</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="inline-block bg-white text-accent hover:bg-neutral-light px-10 py-4 rounded-lg font-bold transition-colors shadow-xl text-lg">
                Request Free Quote
              </Link>
              <Link href="/projects" className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-accent px-10 py-4 rounded-lg font-bold transition-colors text-lg">
                View Our Work
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

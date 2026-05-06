'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPageContent } from '@/services/pageService';
import { submitContactForm } from '@/services/contactService';
import { getProducts } from '@/services/productService';
import { renderSection } from '@/components/DynamicPage';
import type { Section } from '@/components/DynamicPage';

function ContactPageContent() {
  const searchParams = useSearchParams();
  const [sections, setSections] = useState<Section[]>([]);
  const [products, setProducts] = useState([]);
  const [productQuery, setProductQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    selectedProduct: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPageContent();
    fetchProducts();
    
    // Pre-select subject from URL parameter
    const subject = searchParams.get('subject');
    if (subject) {
      setFormData(prev => ({ ...prev, subject }));
    }
  }, [searchParams]);

  const fetchPageContent = async () => {
    try {
      const data = await getPageContent('contact');
      setSections(data.data?.sections || []);
    } catch (error) {
      console.error('Error fetching contact page content:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await getProducts({ limit: 1000 }); // Get all products
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const getSection = (id: string) => sections.find(s => s.sectionId === id);
  const contactInfo = getSection('contact-info');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'subject' && value !== 'customize-existing') {
      setFormData({
        ...formData,
        subject: value,
        selectedProduct: '',
      });
      setProductQuery('');
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectProduct = (product: any) => {
    const label = `${product.name}${product.category?.name ? ` (${product.category.name})` : ''}`;
    setFormData({
      ...formData,
      selectedProduct: label,
    });
    setProductQuery(product.name || '');
  };

  const filteredProducts = products.filter((product: any) => {
    const query = productQuery.trim().toLowerCase();
    if (!query) return true;
    const title = product.name?.toLowerCase() || '';
    const category = product.category?.name?.toLowerCase() || '';
    return title.includes(query) || category.includes(query);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContactForm(formData);
      alert('Thank you for contacting us! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        selectedProduct: '',
        message: '',
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const heroSection = getSection('hero');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {heroSection ? renderSection(heroSection) : (
          <section className="relative h-64 bg-linear-to-r from-accent to-secondary">
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="max-w-4xl mx-auto px-4 text-center">
                <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
                <p className="text-xl">We&apos;d love to hear from you</p>
              </div>
            </div>
          </section>
        )}

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  {contactInfo?.title || 'Get in Touch'}
                </h2>
                <p className="text-lg text-neutral-dark mb-8">
                  {contactInfo?.description || 'Have a question about our products or services? Fill out the form and our team will get back to you within 24 hours.'}
                </p>

                <div className="space-y-6">
                  {(contactInfo?.items || []).map((item, idx) => (
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
                  {(!contactInfo || !contactInfo.items || contactInfo.items.length === 0) && (
                    <>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Phone</h3>
                          <p className="text-neutral-dark">Office: 0120 491 1871</p>
                          <p className="text-neutral-dark">Mobile: +91 730 383 6300</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Email</h3>
                          <p className="text-neutral-dark">ebusiness@uflix.co.in</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Address</h3>
                          <p className="text-neutral-dark">Sector 80, Greater Noida, Noida</p>
                          <p className="text-neutral-dark">Uttar Pradesh 201305, India</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white p-8 rounded-lg border border-border">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" required />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone Number</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" required />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
                    <select id="subject" name="subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" required>
                      <option value="">Select a subject</option>
                      <option value="custom-built">Custom Built Furniture</option>
                      <option value="customize-existing">Customize Existing Product</option>
                      <option value="shop-fittings">Shop Fittings</option>
                      <option value="business-order">For Business - Custom Order</option>
                      <option value="become-dealer">Become a Dealer/Assembler</option>
                      <option value="general">General Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {formData.subject === 'customize-existing' && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="productQuery" className="block text-sm font-medium mb-2">Search and select a product</label>
                        <input
                          id="productQuery"
                          name="productQuery"
                          type="text"
                          value={productQuery}
                          onChange={(e) => setProductQuery(e.target.value)}
                          placeholder="Type product name or category"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium">Matching products</label>
                          {formData.selectedProduct && (
                            <span className="text-sm text-accent">Selected: {formData.selectedProduct}</span>
                          )}
                        </div>
                        <div className="border border-gray-300 rounded-md bg-white max-h-60 overflow-auto">
                          {filteredProducts.length > 0 ? (
                            filteredProducts.slice(0, 10).map((product: any) => {
                              const label = `${product.name}${product.category?.name ? ` (${product.category.name})` : ''}`;
                              return (
                                <button
                                  key={product._id}
                                  type="button"
                                  onClick={() => handleSelectProduct(product)}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 transition-colors"
                                >
                                  <span className="font-medium block">{product.name}</span>
                                  <span className="text-sm text-neutral-dark">{product.category?.name || 'Uncategorized'}</span>
                                </button>
                              );
                            })
                          ) : (
                            <p className="p-4 text-sm text-neutral-dark">No products match your search. Try a different name or category.</p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-neutral-dark">Click a product from the list to select it for customization.</p>
                    </div>
                  )}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      {formData.subject === 'customize-existing' 
                        ? 'Describe the Changes You Want' 
                        : 'Message'
                      }
                    </label>
                    <textarea 
                      id="message" 
                      name="message" 
                      value={formData.message} 
                      onChange={handleChange} 
                      rows={5} 
                      placeholder={formData.subject === 'customize-existing' 
                        ? 'Please describe what changes you would like to make to the selected product...' 
                        : 'Enter your message here...'
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" 
                      required 
                    />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full btn-primary py-3 rounded-md font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ContactPageContent />
    </Suspense>
  );
}

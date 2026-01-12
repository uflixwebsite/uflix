import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

const businessProducts = [
  {
    id: 101,
    name: 'Executive Office Desk',
    price: '₹45,999',
    originalPrice: '₹89,000',
    discount: '48%',
    image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&q=80',
    category: 'Office Furniture'
  },
  {
    id: 102,
    name: 'Ergonomic Office Chair',
    price: '₹18,999',
    originalPrice: '₹35,000',
    discount: '46%',
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&q=80',
    category: 'Office Furniture'
  },
  {
    id: 103,
    name: 'Conference Table Set',
    price: '₹89,999',
    originalPrice: '₹165,000',
    discount: '45%',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    category: 'Meeting Rooms'
  },
  {
    id: 104,
    name: 'Reception Desk',
    price: '₹52,999',
    originalPrice: '₹98,000',
    discount: '46%',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80',
    category: 'Reception'
  },
  {
    id: 105,
    name: 'Modular Workstation',
    price: '₹35,999',
    originalPrice: '₹68,000',
    discount: '47%',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80',
    category: 'Workstations'
  },
  {
    id: 106,
    name: 'Executive Lounge Sofa',
    price: '₹65,999',
    originalPrice: '₹125,000',
    discount: '47%',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80',
    category: 'Lounge'
  }
];

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
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Premium Business Furniture Collection</h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">Handpicked furniture designed for productivity, comfort, and style</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businessProducts.map((product) => (
                <div key={product.id} className="group bg-white rounded-lg overflow-hidden border border-border hover:shadow-2xl transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.discount && (
                      <span className="absolute top-4 left-4 bg-accent text-white px-4 py-2 rounded-md text-sm font-bold shadow-lg">
                        {product.discount} Off
                      </span>
                    )}
                    <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-md text-xs font-semibold">
                      {product.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">{product.name}</h3>
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-2xl font-bold text-foreground">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-base text-neutral-dark line-through">{product.originalPrice}</span>
                      )}
                    </div>
                    <Link href="/contact" className="block w-full text-center bg-accent hover:bg-secondary text-white py-3 rounded-md font-semibold transition-colors">
                      Request Quote
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Success Stories</h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">See how we've transformed workspaces for leading companies</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {caseStudies.map((study, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-300">
                  <div className="relative h-48">
                    <Image
                      src={study.image}
                      alt={study.company}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center font-bold text-accent text-lg">
                        {study.logo}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{study.company}</h3>
                    <div className="flex gap-4 mb-4 text-sm text-neutral-dark">
                      <span>{study.industry}</span>
                      <span>•</span>
                      <span>{study.employees} employees</span>
                    </div>
                    <p className="text-neutral-dark italic">"{study.testimonial}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-accent to-secondary">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Transform Your Workspace Today</h2>
            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">Get a personalized consultation and custom quote from our business furniture experts</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="inline-block bg-white text-accent hover:bg-neutral-light px-10 py-4 rounded-md font-bold transition-colors shadow-xl text-lg">
                Schedule Consultation
              </Link>
              <Link href="tel:+911234567890" className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-accent px-10 py-4 rounded-md font-bold transition-colors text-lg">
                Call: +91 123 456 7890
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

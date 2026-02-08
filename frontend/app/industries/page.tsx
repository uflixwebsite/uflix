import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function IndustriesPage() {
  const industries = [
    {
      title: 'Retail & Commercial Spaces',
      description: 'Custom display fixtures, shelving systems, checkout counters, and complete store fit-outs for retail chains and boutique stores.',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      clientLogos: [
        { name: 'Lifestyle', image: '/Logos/lifetsyle.png' },
        { name: 'Landmark Group', image: '/Logos/landmark.jpg' },
        { name: 'Time House', image: '/Logos/timehouse.jpg' }
      ],
      solutions: [
        'Display fixtures and merchandising units',
        'Custom shelving and storage systems',
        'Checkout counters and cash wraps',
        'Mannequin stands and display tables',
        'Complete retail store fit-outs'
      ]
    },
    {
      title: 'Corporate Offices',
      description: 'Ergonomic workstations, executive furniture, conference room solutions, and modular office systems for modern workplaces.',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      clientLogos: [
        { name: 'L&T', image: '/Logos/lnt.png' },
        { name: 'Daikin', image: '/Logos/daikin.jpg' }
      ],
      solutions: [
        'Modular workstations and cubicles',
        'Executive desks and seating',
        'Conference and meeting room furniture',
        'Reception desks and waiting areas',
        'Office storage and filing systems'
      ]
    },
    {
      title: 'Education & Institutions',
      description: 'Durable classroom furniture, laboratory equipment, library solutions, and auditorium seating for schools and universities.',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
      clientLogos: [
        { name: 'Amity University', image: '/Logos/amity.jpg' },
        { name: 'Bundelkhand University', image: '/Logos/bundelkhand.jpg' },
        { name: 'Vishwakarma University', image: '/Logos/vishwakarma.png' }
      ],
      solutions: [
        'Classroom desks and chairs',
        'Laboratory workbenches and storage',
        'Library shelving and study tables',
        'Auditorium and seminar hall seating',
        'Administrative office furniture'
      ]
    },
    {
      title: 'Healthcare Facilities',
      description: 'Medical-grade furniture, patient room solutions, laboratory equipment, and specialized healthcare furniture for hospitals and clinics.',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
      clientLogos: [
        { name: 'AIIMS Kalyani', image: '/Logos/aiimskalyani.png' },
        { name: 'HLL Lifecare', image: '/Logos/hll.jpg' },
        { name: 'National Medical Commission', image: '/Logos/nationalmedical.jpg' }
      ],
      solutions: [
        'Patient room furniture and bedside tables',
        'Medical storage cabinets and trolleys',
        'Laboratory benches and equipment',
        'Waiting area seating',
        'Nurse stations and reception desks'
      ]
    },
    {
      title: 'Industrial & Warehousing',
      description: 'Heavy-duty storage racks, industrial workbenches, material handling equipment, and warehouse organization systems.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
      clientLogos: [
        { name: 'ECIL', image: '/Logos/ecil.jpg' },
        { name: 'Falcon', image: '/Logos/falcon.png' }
      ],
      solutions: [
        'Heavy-duty pallet racking systems',
        'Industrial workbenches and tool storage',
        'Mezzanine flooring and platforms',
        'Material handling equipment',
        'Warehouse office furniture'
      ]
    },
    {
      title: 'Hospitality & F&B',
      description: 'Restaurant furniture, hotel room solutions, banquet seating, and custom hospitality furniture for hotels and restaurants.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      clientLogos: [
        { name: 'Landmark Group', image: '/Logos/landmark.jpg' },
        { name: 'Time House', image: '/Logos/timehouse.jpg' }
      ],
      solutions: [
        'Restaurant tables and seating',
        'Hotel room furniture packages',
        'Banquet and event furniture',
        'Bar counters and stools',
        'Outdoor patio furniture'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <section className="relative h-[500px] bg-gradient-to-r from-accent to-secondary overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&q=80"
            alt="Industries We Serve"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="max-w-5xl mx-auto px-4 text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Industries We Serve</h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">Specialized furniture and metal fabrication solutions tailored to diverse commercial and institutional sectors</p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Sector-Specific Expertise</h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
                UFLIX delivers customized furniture and fabrication solutions across multiple industries, understanding the unique requirements, compliance standards, and operational needs of each sector.
              </p>
            </div>

            <div className="space-y-20">
              {industries.map((industry, index) => (
                <div key={index} className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  <div className={`relative h-[400px] rounded-2xl overflow-hidden shadow-2xl ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                    <Image
                      src={industry.image}
                      alt={industry.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                    <h3 className="text-3xl font-bold mb-4">{industry.title}</h3>
                    <p className="text-lg text-neutral-dark mb-6 leading-relaxed">
                      {industry.description}
                    </p>
                    
                    {industry.clientLogos && industry.clientLogos.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm font-semibold text-neutral-dark mb-3">Trusted Clients:</p>
                        <div className="flex gap-4 flex-wrap">
                          {industry.clientLogos.map((client, logoIdx) => (
                            <div key={logoIdx} className="bg-white p-3 rounded-lg shadow-sm border border-border">
                              <img
                                src={client.image}
                                alt={client.name}
                                className="object-contain h-10 w-20"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-neutral-light p-6 rounded-xl">
                      <h4 className="font-semibold mb-4 text-lg">Our Solutions:</h4>
                      <ul className="space-y-2">
                        {industry.solutions.map((solution, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-neutral-dark">{solution}</span>
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

        <section className="py-20 bg-neutral-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Organizations Choose UFLIX</h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
                Trusted partner for large-scale commercial and institutional projects
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Compliance & Standards</h3>
                <p className="text-neutral-dark">All products meet industry-specific safety, quality, and regulatory compliance requirements</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">On-Time Delivery</h3>
                <p className="text-neutral-dark">Proven track record of meeting project deadlines with efficient production and logistics</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Cost-Effective Solutions</h3>
                <p className="text-neutral-dark">Competitive pricing with bulk order discounts and flexible payment terms for large projects</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Custom Design Capability</h3>
                <p className="text-neutral-dark">In-house design team to create bespoke solutions matching your brand and space requirements</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Dedicated Project Support</h3>
                <p className="text-neutral-dark">Assigned account managers and technical support throughout the project lifecycle</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Warranty & After-Sales</h3>
                <p className="text-neutral-dark">Comprehensive warranty coverage and responsive after-sales service and maintenance</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Geographic Reach</h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
                Serving clients across India and the Middle East with reliable delivery and installation
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-gradient-to-br from-neutral-light to-white p-8 rounded-2xl border border-border">
                <h3 className="text-2xl font-bold mb-6">India (Pan India)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-neutral-dark">Delhi NCR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-neutral-dark">Mumbai</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-neutral-dark">Bangalore</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-neutral-dark">Hyderabad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-neutral-dark">Chennai</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-neutral-dark">Pune</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-neutral-dark">Kolkata</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-neutral-dark">Ahmedabad</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-neutral-light to-white p-8 rounded-2xl border border-border">
                <h3 className="text-2xl font-bold mb-6">Middle East</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-neutral-dark">Dubai, UAE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-neutral-dark">Doha, Qatar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-neutral-dark">Muscat, Oman</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-neutral-dark">Manama, Bahrain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-neutral-dark">Riyadh, KSA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-neutral-dark">Kuwait City</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-accent to-secondary">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-4xl font-bold mb-6">Discuss Your Industry-Specific Requirements</h2>
            <p className="text-xl mb-10 opacity-90">Our team understands the unique challenges of your sector and can design the perfect solution</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="inline-block bg-white text-accent hover:bg-neutral-light px-10 py-4 rounded-lg font-bold transition-colors shadow-xl text-lg">
                Request Consultation
              </Link>
              <Link href="/projects" className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-accent px-10 py-4 rounded-lg font-bold transition-colors text-lg">
                View Case Studies
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

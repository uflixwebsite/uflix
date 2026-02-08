import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function ProjectsPage() {
  const featuredProjects = [
    {
      title: 'AIIMS Hospital - Complete Furniture Fit-Out',
      client: 'All India Institute of Medical Sciences',
      sector: 'Healthcare',
      scope: 'Patient room furniture, laboratory equipment, administrative office furniture, and waiting area seating for 500+ bed facility',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
      deliverables: ['2,000+ patient room furniture sets', 'Laboratory benches and storage', 'Administrative office furniture', 'Waiting area seating for 10 floors'],
      timeline: '6 months',
      location: 'New Delhi, India'
    },
    {
      title: 'National Museum - Display & Storage Solutions',
      client: 'Ministry of Culture, Government of India',
      sector: 'Government & Institutional',
      scope: 'Custom display cases, artifact storage systems, and administrative furniture for national heritage museum',
      image: 'https://images.unsplash.com/photo-1565173953406-e7c6a3c2e8c1?w=800&q=80',
      deliverables: ['Climate-controlled display cases', 'Artifact storage systems', 'Administrative office furniture', 'Visitor seating and benches'],
      timeline: '8 months',
      location: 'New Delhi, India'
    },
    {
      title: 'University Campus - Educational Furniture',
      client: 'Central University',
      sector: 'Education',
      scope: 'Classroom furniture, library systems, laboratory equipment, and auditorium seating for 10,000+ student campus',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
      deliverables: ['500+ classroom furniture sets', 'Library shelving and study tables', 'Laboratory workbenches', 'Auditorium seating for 1,000'],
      timeline: '12 months',
      location: 'Bangalore, India'
    },
    {
      title: 'Oil & Energy Company - Corporate Office',
      client: 'Leading Energy Corporation',
      sector: 'Corporate',
      scope: 'Executive offices, workstations, conference rooms, and cafeteria furniture for 15-floor corporate headquarters',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      deliverables: ['1,000+ modular workstations', 'Executive office furniture', '50+ conference rooms', 'Cafeteria and break room furniture'],
      timeline: '10 months',
      location: 'Mumbai, India'
    },
    {
      title: 'International Retail Chain - Store Fit-Outs',
      client: 'Global Fashion Retailer',
      sector: 'Retail',
      scope: 'Complete store fit-outs including display fixtures, shelving, checkout counters, and storage for 25 stores',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      deliverables: ['Custom display fixtures', 'Shelving and storage systems', 'Checkout counters', 'Fitting room furniture'],
      timeline: '18 months (phased)',
      location: 'Pan India & Dubai'
    },
    {
      title: 'Industrial Warehouse - Storage Solutions',
      client: 'Logistics & Distribution Company',
      sector: 'Industrial',
      scope: 'Heavy-duty pallet racking, mezzanine floors, and industrial workbenches for 200,000 sq ft warehouse',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
      deliverables: ['Pallet racking systems', 'Mezzanine flooring', 'Industrial workbenches', 'Material handling equipment'],
      timeline: '4 months',
      location: 'Pune, India'
    }
  ];

  const clientLogos = [
    { name: 'AIIMS Kalyani', image: '/Logos/aiimskalyani.png' },
    { name: 'Indian Oil', image: '/Logos/indianoil.png' },
    { name: 'CPWD', image: '/Logos/cpwd.png' },
    { name: 'L&T', image: '/Logos/lnt.png' },
    { name: 'NBCC', image: '/Logos/nbcc.png' },
    { name: 'IRCON', image: '/Logos/ircon.png' },
    { name: 'ECIL', image: '/Logos/ecil.jpg' },
    { name: 'HSCC', image: '/Logos/hscc.jpg' },
    { name: 'HLL', image: '/Logos/hll.jpg' },
    { name: 'IGL', image: '/Logos/igl.png' },
    { name: 'Daikin', image: '/Logos/daikin.jpg' },
    { name: 'Lifestyle', image: '/Logos/lifetsyle.png' },
    { name: 'Landmark Group', image: '/Logos/landmark.jpg' },
    { name: 'CLP India', image: '/Logos/clp.jpg' },
    { name: 'Government of Delhi', image: '/Logos/delhigov.jpg' },
    { name: 'Bihar Government', image: '/Logos/Bihar.jpg' },
    { name: 'Noida Authority', image: '/Logos/noida.jpg' },
    { name: 'Department of Science', image: '/Logos/departmentofscience.png' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <section className="relative h-[500px] bg-gradient-to-r from-accent to-secondary overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&q=80"
            alt="UFLIX Projects"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="max-w-5xl mx-auto px-4 text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Projects & Case Studies</h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">Proven track record of delivering large-scale furniture and fabrication projects for leading organizations</p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Featured Projects</h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
                From government institutions to corporate headquarters, UFLIX has successfully delivered complex, large-scale projects across multiple sectors
              </p>
            </div>

            <div className="space-y-16">
              {featuredProjects.map((project, index) => (
                <div key={index} className="bg-neutral-light rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-80 md:h-auto">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-accent text-white px-4 py-2 rounded-lg font-semibold">
                        {project.sector}
                      </div>
                    </div>
                    <div className="p-8 md:p-10">
                      <h3 className="text-3xl font-bold mb-3">{project.title}</h3>
                      <p className="text-lg text-accent font-semibold mb-4">{project.client}</p>
                      <p className="text-neutral-dark mb-6 leading-relaxed">{project.scope}</p>
                      
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">Key Deliverables:</h4>
                        <ul className="space-y-2">
                          {project.deliverables.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-neutral-dark">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-300">
                        <div>
                          <p className="text-sm text-neutral-dark mb-1">Timeline</p>
                          <p className="font-semibold">{project.timeline}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-dark mb-1">Location</p>
                          <p className="font-semibold">{project.location}</p>
                        </div>
                      </div>
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
              <h2 className="text-4xl font-bold mb-4">Trusted by Leading Organizations</h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
                UFLIX has established partnerships with government institutions, Fortune 500 companies, and leading organizations across India and the Middle East
              </p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
              {clientLogos.map((client, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center justify-center">
                  <img
                    src={client.image}
                    alt={client.name}
                    className="object-contain w-full h-20 max-w-[150px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Project Capabilities</h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
                We handle projects of all scales with the same commitment to quality and timely delivery
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-neutral-light to-white p-8 rounded-2xl border border-border shadow-md">
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">Large-Scale Projects</h3>
                <p className="text-neutral-dark mb-4">Multi-floor buildings, campuses, and facilities with 1,000+ furniture units</p>
                <ul className="space-y-2 text-sm text-neutral-dark">
                  <li>• Corporate headquarters</li>
                  <li>• Hospital complexes</li>
                  <li>• University campuses</li>
                  <li>• Government buildings</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-neutral-light to-white p-8 rounded-2xl border border-border shadow-md">
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">Multi-Location Rollouts</h3>
                <p className="text-neutral-dark mb-4">Standardized furniture solutions across multiple locations and cities</p>
                <ul className="space-y-2 text-sm text-neutral-dark">
                  <li>• Retail chain fit-outs</li>
                  <li>• Bank branch furniture</li>
                  <li>• Franchise setups</li>
                  <li>• Regional offices</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-neutral-light to-white p-8 rounded-2xl border border-border shadow-md">
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">Fast-Track Delivery</h3>
                <p className="text-neutral-dark mb-4">Expedited production and installation for time-sensitive projects</p>
                <ul className="space-y-2 text-sm text-neutral-dark">
                  <li>• Emergency replacements</li>
                  <li>• Quick turnaround projects</li>
                  <li>• Phased delivery options</li>
                  <li>• 24/7 production capability</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        
        <section className="py-20 bg-gradient-to-br from-accent to-secondary">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-4xl font-bold mb-6">Start Your Project with UFLIX</h2>
            <p className="text-xl mb-10 opacity-90">Let's discuss how we can bring your vision to life with our proven project execution capabilities</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="inline-block bg-white text-accent hover:bg-neutral-light px-10 py-4 rounded-lg font-bold transition-colors shadow-xl text-lg">
                Request Project Quote
              </Link>
              <Link href="/manufacturing" className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-accent px-10 py-4 rounded-lg font-bold transition-colors text-lg">
                View Capabilities
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

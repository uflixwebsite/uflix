import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <section className="relative h-[500px] bg-gradient-to-r from-accent to-secondary overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
            alt="UFLIX Manufacturing Facility"
            fill
            className="object-cover opacity-20"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="max-w-5xl mx-auto px-4 text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Transforming Spaces Through Design & Precision</h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">Leading manufacturer of customized furniture and metal fabrication solutions for commercial, institutional, and industrial projects across India and the Middle East</p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
              <div>
                <h2 className="text-4xl font-bold mb-6">Who We Are</h2>
                <p className="text-lg text-neutral-dark mb-4 leading-relaxed">
                  We create sophisticated solutions for contemporary living and working. Every product is thoughtfully designed to enhance comfort, functionality, and everyday ease, allowing your space to perform effortlessly around you. Crafted with precision and care, our high-quality pieces are available in an array of finishes and configurations, offering a tailored experience that reflects your individual needs.
                </p>
                <p className="text-lg text-neutral-dark mb-4 leading-relaxed">
                  With sustainability embedded from concept to completion, we deliver enduring design that is as responsible as it is refined. Our in-house manufacturing capabilities span precision metal fabrication, wooden furniture production, powder coating, and turnkey interior fit-outs. We serve retail stores, corporate offices, educational institutions, healthcare facilities, and industrial warehouses across Pan India and the Middle East.
                </p>
                <p className="text-lg text-neutral-dark leading-relaxed">
                  From government institutions and AIIMS hospitals to international retail chains and large infrastructure projects, UFLIX has established itself as a trusted partner for organizations that demand quality, reliability, and design excellence.
                </p>
              </div>
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80"
                  alt="UFLIX Manufacturing"
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl order-2 md:order-1">
                <Image
                  src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80"
                  alt="UFLIX Projects"
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-4xl font-bold mb-6">Our Expertise</h2>
                <p className="text-lg text-neutral-dark mb-6 leading-relaxed">
                  With decades of combined experience, UFLIX brings together craftsmanship, innovation, and industrial-scale production capabilities. Our team of designers, engineers, and skilled craftsmen work collaboratively to transform complex requirements into functional, aesthetically refined solutions.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-accent flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h4 className="font-semibold mb-1">Advanced Manufacturing Infrastructure</h4>
                      <p className="text-neutral-dark">State-of-the-art CNC machinery, laser cutting, and automated production lines</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-accent flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h4 className="font-semibold mb-1">End-to-End Project Execution</h4>
                      <p className="text-neutral-dark">Design, manufacturing, installation, and after-sales support under one roof</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-accent flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h4 className="font-semibold mb-1">Proven Track Record</h4>
                      <p className="text-neutral-dark">Successfully delivered large-scale projects for government, healthcare, and corporate sectors</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-neutral-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Mission & Vision</h2>
              <p className="text-lg text-neutral-dark max-w-3xl mx-auto">Driving innovation and excellence in furniture manufacturing and metal fabrication</p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 mb-20">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-neutral-dark leading-relaxed">
                  To deliver innovative, sustainable, and cost-effective furniture and metal fabrication solutions that transform commercial and institutional spaces. We combine advanced manufacturing technology with skilled craftsmanship to exceed client expectations on every project.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-neutral-dark leading-relaxed">
                  To be globally recognized as the most trusted, design-led furniture manufacturing partner, renowned for elevating workspaces and commercial environments through exceptional quality, innovative thinking, and unwavering reliability.
                </p>
              </div>
            </div>

            <h3 className="text-3xl font-bold text-center mb-12">Core Values</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-2">Quality & Durability</h4>
                <p className="text-neutral-dark">Uncompromising standards in materials, manufacturing processes, and finished products built to last</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-2">Innovation</h4>
                <p className="text-neutral-dark">Continuous investment in advanced technology and design thinking to deliver cutting-edge solutions</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-2">Sustainability</h4>
                <p className="text-neutral-dark">Responsible sourcing, eco-friendly materials, and manufacturing practices that minimize environmental impact</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-2">Client Partnership</h4>
                <p className="text-neutral-dark">Building long-term relationships through transparency, reliability, and dedicated project support</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">UFLIX By The Numbers</h2>
              <p className="text-lg text-neutral-dark">Proven track record of excellence and scale</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-neutral-light rounded-xl">
                <div className="text-5xl font-bold text-accent mb-3">1000+</div>
                <div className="text-lg font-semibold mb-1">Projects Delivered</div>
                <div className="text-sm text-neutral-dark">Across India & Middle East</div>
              </div>
              <div className="text-center p-6 bg-neutral-light rounded-xl">
                <div className="text-5xl font-bold text-accent mb-3">200+</div>
                <div className="text-lg font-semibold mb-1">Institutional Clients</div>
                <div className="text-sm text-neutral-dark">Government & corporate</div>
              </div>
              <div className="text-center p-6 bg-neutral-light rounded-xl">
                <div className="text-5xl font-bold text-accent mb-3">7</div>
                <div className="text-lg font-semibold mb-1">Countries Served</div>
                <div className="text-sm text-neutral-dark">India + Middle East markets</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-accent to-secondary">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Space?</h2>
            <p className="text-xl mb-10 opacity-90">Partner with UFLIX for your next furniture manufacturing or metal fabrication project</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="inline-block bg-white text-accent hover:bg-neutral-light px-10 py-4 rounded-lg font-bold transition-colors shadow-xl text-lg">
                Request Consultation
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

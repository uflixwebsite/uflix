'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getPageContent } from '@/services/pageService';
import type { Section } from '@/components/DynamicPage';

// Placeholder data
const PH_HERO = {
  title: 'Steel Fabrication Solutions in Delhi NCR',
  subtitle: 'We provide end-to-end steel fabrication services including MS & SS fabrication, custom metal work, laser cutting, and powder coating for commercial, industrial & retail projects.',
  image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80',
  features: [
    { title: 'Custom Fabrication', subtitle: 'Tailored to your needs' },
    { title: 'High Quality Steel', subtitle: 'Premium MS & SS Material' },
    { title: 'On-time Delivery', subtitle: 'Committed timelines' },
    { title: 'Delhi NCR Service', subtitle: 'Pan India support' }
  ]
};

const PH_SERVICES = [
  { title: 'MS Fabrication', description: 'Mild steel fabrication for industrial & commercial applications.', image: 'https://images.unsplash.com/photo-1565514020179-026b92b2d707?auto=format&fit=crop&q=80', link: '#' },
  { title: 'SS Fabrication', description: 'Stainless steel fabrication for premium & long lasting solutions.', image: 'https://images.unsplash.com/photo-1541888086225-ee593f656ce2?auto=format&fit=crop&q=80', link: '#' },
  { title: 'Display Rack Fabrication', description: 'Custom display racks for retail stores & supermarkets.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80', link: '#' },
  { title: 'Retail Shop Fabrication', description: 'Complete fabrication solutions for retail shop fit-outs.', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80', link: '#' },
  { title: 'Laser Cutting', description: 'Precision laser cutting for MS, SS & other metals.', image: 'https://images.unsplash.com/photo-1586953208448-b95a79491f20?auto=format&fit=crop&q=80', link: '#' },
  { title: 'Powder Coating', description: 'High quality powder coating for long lasting finish.', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80', link: '#' }
];

const PH_WHY_CHOOSE_US = [
  { icon: 'factory', title: 'In-house Manufacturing', description: 'Modern machines and skilled experts' },
  { icon: 'custom', title: 'Custom Solutions', description: 'We build as per your design & requirement' },
  { icon: 'shield-check', title: 'Quality Assurance', description: 'Strict quality checks at every stage' },
  { icon: 'users', title: 'Experienced Team', description: '10+ years of industry experience' },
  { icon: 'truck', title: 'End-to-End Service', description: 'From design to installation' }
];

const PH_PROCESS = [
  { title: 'Requirement Discussion', description: 'Understanding your requirements and project scope.' },
  { title: 'Design & Planning', description: 'Creating drawings and plans as per your needs.' },
  { title: 'Material Selection', description: 'Choosing high quality MS/SS material for durability.' },
  { title: 'Fabrication', description: 'Precision cutting, welding and assembly by experts.' },
  { title: 'Finishing', description: 'Polishing, coating & finishing for a perfect look.' },
  { title: 'Installation', description: 'On-site installation with complete quality check.' }
];

const PH_PROJECTS = [
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1565514020179-026b92b2d707?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1541888086225-ee593f656ce2?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80'
];

function FabricationHero({ section }: { section?: Section }) {
  const parseFeatureString = (value: string) => {
    if (!value?.trim()) return [];
    return value
      .split('|')
      .map((part) => {
        const [title, subtitle] = part.split('::');
        return { title: (title || '').trim(), subtitle: (subtitle || '').trim() };
      })
      .filter((f) => f.title);
  };

  const features = section?.items || PH_HERO.features;
  const title = section?.title || PH_HERO.title;
  const subtitle = section?.subtitle || PH_HERO.subtitle;
  const image = section?.image || PH_HERO.image;

  return (
    <section className="relative min-h-[600px] -mt-[1px]">
      <div className="absolute inset-0">
        <img src={image} alt="Steel Fabrication" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">{title}</h1>
          <p className="text-xl text-gray-200 mb-10">{subtitle}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature: any, i: number) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white font-semibold">{feature.title}</p>
                <p className="text-gray-300 text-sm">{feature.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ section }: { section?: Section }) {
  const services = section?.items || PH_SERVICES;
  const title = section?.title || 'Our Fabrication Services';
  const description = section?.description || '';

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {description && <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service: any, i: number) => (
            <Link key={i} href={service.link || '#'} className="group block">
              <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUsSection({ section }: { section?: Section }) {
  const items = section?.items || PH_WHY_CHOOSE_US;
  const title = section?.title || 'Why Choose Us';
  const description = section?.description || '';

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {description && <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {items.map((item: any, i: number) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-2xl">{item.icon === 'factory' ? '🏭' : item.icon === 'custom' ? '⚙️' : item.icon === 'shield-check' ? '🛡️' : item.icon === 'users' ? '👥' : '🚚'}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection({ section }: { section?: Section }) {
  const steps = section?.items || PH_PROCESS;
  const title = section?.title || 'Our Fabrication Process';
  const description = section?.description || '';

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {description && <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step: any, i: number) => (
            <div key={i} className="relative">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold mb-4">{i + 1}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection({ section }: { section?: Section }) {
  const projects = section?.items || PH_PROJECTS.map((img, i) => ({ image: img, title: `Project ${i + 1}` }));
  const title = section?.title || 'Our Recent Projects';
  const description = section?.description || '';

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {description && <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any, i: number) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-64 overflow-hidden">
                <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900">{project.title || project.linkText || `Project ${i + 1}`}</p>
                {project.stats && <p className="text-gray-600 text-sm">{project.stats}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ section }: { section?: Section }) {
  const title = section?.title || '';
  const subtitle = (section as any)?.subtitle || section?.description || '';
  const image = section?.image || '';
  const phone = (section as any)?.phone || '';
  const phoneLabel = (section as any)?.phoneLabel || '';
  const email = (section as any)?.email || '';
  const emailLabel = (section as any)?.emailLabel || '';
  const buttonLink = section?.secondaryLink || '';
  const buttonText = section?.secondaryLinkText || '';

  if (!section || (!title && !subtitle && !phone && !email)) {
    return null;
  }

  return (
    <section className="relative py-24 bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img src={image} alt="Background" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
            <p className="text-gray-300 mb-8">{subtitle}</p>

            <div className="flex flex-col sm:flex-row items-center md:items-start gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-accent">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm">{phoneLabel}</p>
                  <p className="text-gray-400 text-sm">{phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-accent">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm">{emailLabel}</p>
                  <p className="text-gray-400 text-sm">{email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <Link href={buttonLink} className="bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-md font-bold text-lg shadow-lg shadow-accent/30 transition-all hover:-translate-y-1 inline-block">
              {buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SteelFabricationPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const data = await getPageContent('business-steel-metal');
      setSections(data.data?.sections || []);
    } catch (err) {
      console.error('Error fetching page content:', err);
    } finally {
      setPageReady(true);
    }
  };

  const get = (id: string) => sections.find((s) => s.sectionId === id || s.type === id);

  const heroSection = sections.find((s) => s.type === 'hero');
  const servicesSection = get('services');
  const flagshipProjectsSection = get('flagship-projects');
  const whyChooseUsSection = get('why-choose-us');
  const processSection = get('process');
  const projectsSection = get('projects');
  const ctaSection = get('cta');

  const visible = (id: string) => {
    const s = id === 'hero' ? sections.find((s) => s.type === 'hero') : get(id);
    return !s || s.isVisible !== false;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header navbarContextPath="/steel-fabrication" />
      <main className="homepage-main pt-[118px] md:pt-[132px]">
        {!pageReady ? (
          <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
          </div>
        ) : (
          <>
            {visible('hero') && <FabricationHero section={heroSection} />}
            {visible('flagship-projects') && <ServicesSection section={flagshipProjectsSection} />}
            {visible('services') && <ServicesSection section={servicesSection} />}
            {visible('why-choose-us') && <WhyChooseUsSection section={whyChooseUsSection} />}
            {visible('process') && <ProcessSection section={processSection} />}
            {visible('projects') && <ProjectsSection section={projectsSection} />}
            {visible('cta') && <CTASection section={ctaSection} />}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

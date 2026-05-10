'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getPageContent } from '@/services/pageService';
import { getFooterSettings } from '@/services/footerService';
import type { Section } from '@/components/DynamicPage';

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
  { icon: 'users', title: 'Requirement Discussion', description: 'Understanding your requirements and project scope.' },
  { icon: 'custom', title: 'Design & Planning', description: 'Creating drawings and plans as per your needs.' },
  { icon: 'factory', title: 'Material Selection', description: 'Choosing high quality MS/SS material for durability.' },
  { icon: 'truck', title: 'Fabrication', description: 'Precision cutting, welding and assembly by experts.' },
  { icon: 'badge-check', title: 'Finishing', description: 'Polishing, coating & finishing for a perfect look.' },
  { icon: 'shield-check', title: 'Installation', description: 'On-site installation with complete quality check.' }
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
      .filter((item) => item.title || item.subtitle);
  };

  const sourceItems = section?.items || [];
  const isLegacyBadgeOnlyData = sourceItems.length > 0 && sourceItems.every((item: any) => (
    !item.image &&
    !item.description &&
    !item.link &&
    !item.linkText &&
    !item.secondaryLink &&
    !item.secondaryLinkText &&
    (item.title || item.subtitle)
  ));

  const sectionLevelFeatures = parseFeatureString(section?.content || '');
  const defaultSlide = {
    image: section?.image || PH_HERO.image,
    title: section?.title || PH_HERO.title,
    subtitle: section?.subtitle || section?.description || PH_HERO.subtitle,
    link: section?.link || '/contact',
    linkText: section?.linkText || 'Get a Free Quote',
    secondaryLink: section?.secondaryLink || '#projects',
    secondaryLinkText: section?.secondaryLinkText || 'Our Projects',
    features: sectionLevelFeatures.length ? sectionLevelFeatures : PH_HERO.features,
  };

  const cmsSlides = !isLegacyBadgeOnlyData
    ? sourceItems
        .filter((item: any) => item.image || item.description || item.link || item.linkText || item.secondaryLink || item.secondaryLinkText)
        .map((item: any) => {
          const perSlideFeatures = parseFeatureString(item.statsLabel || item.icon || '');
          return {
            image: item.image || defaultSlide.image,
            title: item.title || defaultSlide.title,
            subtitle: item.subtitle || item.description || defaultSlide.subtitle,
            link: item.link || defaultSlide.link,
            linkText: item.linkText || defaultSlide.linkText,
            secondaryLink: item.secondaryLink || defaultSlide.secondaryLink,
            secondaryLinkText: item.secondaryLinkText || defaultSlide.secondaryLinkText,
            features: perSlideFeatures.length ? perSlideFeatures : defaultSlide.features,
          };
        })
    : [];

  const slides = cmsSlides.length
    ? cmsSlides
    : [{
        ...defaultSlide,
        features: isLegacyBadgeOnlyData
          ? sourceItems
              .map((item: any) => ({ title: item.title || '', subtitle: item.subtitle || item.description || '' }))
              .filter((item) => item.title || item.subtitle)
          : defaultSlide.features,
      }];

  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const totalSlides = slides.length;
  const currentSlide = slides[activeSlide] || slides[0];

  useEffect(() => {
    if (totalSlides <= 1 || paused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, 4500);
    return () => clearInterval(timer);
  }, [totalSlides, paused]);

  return (
    <section
      className="relative min-h-[78vh] lg:min-h-[82vh] flex flex-col bg-gray-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background Image using standard img tag to prevent Next.js optimization timeout errors */}
      <div className="absolute inset-0 z-0">
        <img src={currentSlide.image} alt="Hero Background" className="w-full h-full object-cover transition-all duration-700" />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 w-full flex-1 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 text-center">
          <div className="mx-auto max-w-4xl flex flex-col items-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-[1.08] max-w-3xl">{currentSlide.title}</h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl">{currentSlide.subtitle}</p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href={currentSlide.link} className="bg-accent hover:bg-accent-dark text-white px-8 py-3.5 rounded-md font-semibold transition-colors text-sm uppercase tracking-wide">
                {currentSlide.linkText}
              </Link>
              <Link href={currentSlide.secondaryLink} className="bg-transparent border border-white text-white hover:bg-white hover:text-black px-8 py-3.5 rounded-md font-semibold transition-colors text-sm uppercase tracking-wide">
                {currentSlide.secondaryLinkText}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {totalSlides > 1 && (
        <div className="relative z-10 -mt-2 mb-4 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`h-2.5 rounded-full transition-all ${i === activeSlide ? 'w-7 bg-accent' : 'w-2.5 bg-white/50 hover:bg-white/80'}`}
              aria-label={`Go to hero slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Bottom Features Bar */}
      <div className="relative z-10 w-full border-t border-white/10 bg-black/40 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-4">
            {currentSlide.features.map((feature: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center border border-orange-400/40 text-orange-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold mb-0.5">{feature.title}</h4>
                  <p className="text-gray-400 text-xs">{feature.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUsIcon({ icon }: { icon?: string }) {
  const className = 'w-6 h-6';

  switch (icon) {
    case 'factory':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 21h18M5 21V8l4 2V8l4 2V8l4 2V5h2v16M7 21v-4m4 4v-7m4 7v-5m4 5v-8" />
        </svg>
      );
    case 'custom':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3l7 4v10l-7 4-7-4V7l7-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v8m-4-4h8" />
        </svg>
      );
    case 'users':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20a4 4 0 00-8 0m8 0H7m10 0h3m-13 0H4m13-9a4 4 0 11-8 0 4 4 0 018 0zm6 5a3 3 0 00-4.5-2.6m-8.9 2.6A3 3 0 013 16m3-5a3 3 0 106 0 3 3 0 00-6 0z" />
        </svg>
      );
    case 'truck':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7h11v10H3zM14 10h4l3 3v4h-7zM7 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      );
    case 'badge-check':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3l2.2 1.2 2.5-.4 1.5 2 2.4.8.1 2.6 1.4 2.1-1.4 2.1-.1 2.6-2.4.8-1.5 2-2.5-.4L12 21l-2.2-1.2-2.5.4-1.5-2-2.4-.8-.1-2.6L2 12l1.4-2.1.1-2.6 2.4-.8 1.5-2 2.5.4L12 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="m9 12 2 2 4-4" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
  }
}

function ServicesSection({ section }: { section?: Section }) {
  const items = section?.items?.length ? section.items : PH_SERVICES;
  const sectionTitle = section?.title || 'Our Steel Fabrication Services';
  const sectionSubtitle = section?.subtitle || section?.description || 'Precision-built fabrication services for retail, commercial and industrial environments.';
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [items.length]);

  const activeItem = items[activeIndex] || items[0];

  return (
    <section id="services" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{sectionTitle}</h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">{sectionSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4 lg:gap-6 items-start">
          <div className="overflow-visible">
            <div className="p-0">
              {items.map((item: any, i: number) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-full text-left px-6 py-3.5 transition duration-150 flex items-center justify-between ${
                      isActive ? 'bg-[#ff6b35] text-white' : 'text-gray-800 hover:bg-[#fff4ee]'
                    }`}
                  >
                    <div>
                      <h3 className="text-xl md:text-[22px] font-medium leading-tight">{item.title}</h3>
                    </div>
                    <span className={`shrink-0 text-base transition-transform ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl">
            <div className="relative h-80 md:h-105 w-full rounded-2xl overflow-hidden">
              <img
                src={activeItem?.image || PH_HERO.image}
                alt={activeItem?.title || sectionTitle}
                className="absolute inset-0 h-full w-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
                <h3 className="text-xl md:text-2xl font-semibold leading-tight max-w-2xl">{activeItem?.title}</h3>
                <p className="mt-2 max-w-2xl text-sm text-white/90 leading-relaxed">{activeItem?.description || sectionSubtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUsSection({ section }: { section?: Section }) {
  const sourceItems = section?.items?.length ? section.items : PH_WHY_CHOOSE_US;
  const items = sourceItems.slice(0, Math.max(5, sourceItems.length)); // Support 5+, but use all available

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h4 className="text-accent text-sm font-bold uppercase tracking-wider mb-3">Why Choose Us</h4>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{section?.title || 'Why Choose Uflix Interio?'}</h2>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item: any, i: number) => (
            <div
              key={i}
              className={`px-6 py-8 text-center ${i > 0 ? 'border-t border-gray-200 lg:border-t-0 lg:border-l' : ''}`}
            >
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[#FFF3EB] text-[#FF6B35] flex items-center justify-center">
                <WhyChooseUsIcon icon={item.icon || (PH_WHY_CHOOSE_US[i] as any)?.icon} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection({ section }: { section?: Section }) {
  const items = section?.items?.length ? section.items : PH_PROCESS;

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h4 className="text-accent text-sm font-bold uppercase tracking-wider mb-3">Our Process</h4>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Our Fabrication Process</h2>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-8 left-[8%] right-[8%] h-px bg-gray-300 border-t border-dashed border-gray-300 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-4 relative z-10">
            {items.map((item: any, i: number) => {
              return (
                <div key={i} className="text-center relative">
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-md mb-6 bg-gray-900 text-white">
                    <WhyChooseUsIcon icon={item.icon || 'badge-check'} />
                  </div>
                  <div className="text-accent font-bold text-sm mb-2">0{i + 1}</div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 px-2">{item.title}</h3>
                  <p className="text-xs text-gray-600 px-2">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectsSection({ section }: { section?: Section }) {
  const fallbackProjects = PH_PROJECTS.map((image, idx) => ({
    image,
    title: `Fabrication Project ${idx + 1}`,
    description: 'Custom-built steel fabrication delivered with precision detailing and clean finish for commercial spaces.',
    location: 'Delhi NCR',
    category: idx % 2 === 0 ? 'Commercial Fit-Out' : 'Retail Fabrication',
  }));
  const cmsProjects = (section?.items || [])
    .filter((i: any) => i.image)
    .map((i: any, idx: number) => ({
      image: i.image as string,
      title: i.title || `Project ${idx + 1}`,
      description: i.description || i.subtitle || 'Project details will be updated from admin.',
      location: i.stats || i.icon || 'Delhi NCR',
      category: i.linkText || 'Steel Fabrication',
    }));
  const projects = cmsProjects.length ? cmsProjects : fallbackProjects;
  const [activeIndex, setActiveIndex] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (projects.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % projects.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [projects.length]);

  const getRelativePos = (idx: number) => {
    const diff = (idx - activeIndex + projects.length) % projects.length;
    if (diff === 0) return 0;
    if (diff === 1) return 1;
    if (diff === projects.length - 1) return -1;
    return 99;
  };
  const title = section?.title || 'Our Recent Projects';

  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h4 className="text-accent text-sm font-bold uppercase tracking-wider mb-3">Our Work</h4>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{title}</h2>
        </div>

        <div className="relative mx-auto h-105 w-full max-w-6xl overflow-hidden">
          {projects.map((project, i) => {
            const pos = getRelativePos(i);
            if (pos === 99) return null;

            const cardClasses =
              pos === 0
                ? 'left-1/2 z-30 w-[64%] md:w-[50%] -translate-x-1/2 scale-100 opacity-100'
                : pos === -1
                  ? 'left-[18%] z-20 w-[38%] md:w-[30%] -translate-x-1/2 scale-95 opacity-85'
                  : 'left-[82%] z-20 w-[38%] md:w-[30%] -translate-x-1/2 scale-95 opacity-85';

            return (
              <button
                key={`${project.image}-${i}`}
                onClick={() => {
                  setActiveIndex(i);
                  setOpenIndex(i);
                }}
                className={`absolute top-8 h-72.5 md:h-85 overflow-hidden rounded-2xl border border-white/20 shadow-xl transition-all duration-500 ${cardClasses}`}
                aria-label={`Open details for ${project.title}`}
              >
                <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-left text-white">
                  <p className="text-xs uppercase tracking-[0.15em] text-orange-300">{project.category}</p>
                  <h3 className="text-lg md:text-xl font-bold leading-tight">{project.title}</h3>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2.5 rounded-full transition-all ${i === activeIndex ? 'w-7 bg-accent' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/projects" className="inline-block bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-md font-semibold transition-colors text-sm">
            View More Projects
          </Link>
        </div>
      </div>

      {openIndex !== null && (
        <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-[2px] p-4 md:p-8" onClick={() => setOpenIndex(null)}>
          <div
            className="mx-auto mt-12 w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr]">
              <div className="h-80 md:h-130 bg-gray-100">
                <img src={projects[openIndex].image} alt={projects[openIndex].title} className="h-full w-full object-cover" />
              </div>
              <div className="p-6 md:p-8">
                <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold mb-3">{projects[openIndex].category}</p>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{projects[openIndex].title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-5">{projects[openIndex].description}</p>
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 mb-6">
                  <p className="text-xs uppercase tracking-[0.14em] text-gray-500 mb-1">Location</p>
                  <p className="text-sm font-semibold text-gray-900">{projects[openIndex].location}</p>
                </div>
                <Link href="/contact?subject=steel-metal-fabrication-enquiry" className="inline-flex items-center bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-colors">
                  Discuss Similar Project
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CTASection({ footerContact }: { footerContact?: { phone?: string; email?: string } }) {
  const phone = footerContact?.phone || '+91 99999 99999';
  const email = footerContact?.email || 'info@uflixfurniture.in';

  return (
    <section className="relative py-24 bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80" alt="Background" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Have a Project in Mind?</h2>
            <p className="text-gray-300 mb-8">Get in touch with us today for a free consultation and quote.</p>

            <div className="flex flex-col sm:flex-row items-center md:items-start gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-accent">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm">Call Us</p>
                  <p className="text-gray-400 text-sm">{phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-accent">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm">Email Us</p>
                  <p className="text-gray-400 text-sm">{email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <Link href="/contact?subject=steel-metal-fabrication-enquiry" className="bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-md font-bold text-lg shadow-lg shadow-accent/30 transition-all hover:-translate-y-1 inline-block">
              Request a Quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SteelMetalFabricationPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [pageReady, setPageReady] = useState(false);
  const [footerContact, setFooterContact] = useState<{phone?:string,email?:string}>({});
  const fetchFooter = async () => {
    await fetchFooterSettingsLocal(setFooterContact);
  };

  useEffect(() => {
    fetchPageContent();
    fetchFooter();
  }, []);

  const fetchPageContent = async () => {
    try {
      const data = await getPageContent('steel-fabrication-delhi-ncr');
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
  const projectsSection = get('projects');
  const processSection = get('process');
  const whyChooseUsSection = get('why-choose-us');

  const visible = (id: string) => {
    const s = id === 'hero' ? sections.find((s) => s.type === 'hero') : get(id);
    return !s || s.isVisible !== false;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="homepage-main pt-27 md:pt-31">
        {!pageReady ? (
          <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
          </div>
        ) : (
          <>
            {visible('hero') && <FabricationHero section={heroSection} />}
            {visible('services') && <ServicesSection section={servicesSection} />}
            {visible('why-choose-us') && <WhyChooseUsSection section={whyChooseUsSection} />}
            {visible('process') && <ProcessSection section={processSection} />}
            {visible('projects') && <ProjectsSection section={projectsSection} />}
            <CTASection footerContact={footerContact} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

async function fetchFooterSettingsLocal(setFooterContact: any) {
  try {
    const response = await getFooterSettings();
    const items = response.data?.contactItems || [];
    const phoneItem = items.find((i: any) => i.type === 'phone');
    const emailItem = items.find((i: any) => i.type === 'email');
    setFooterContact({ phone: phoneItem?.value, email: emailItem?.value });
  } catch (e) {
    // ignore
  }
}


'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFooterSettings } from '@/services/footerService';
import { Instagram, Facebook, Twitter, Linkedin, Youtube, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

interface SocialLink {
  _id?: string;
  platform: string;
  url: string;
  enabled: boolean;
}

interface NavLink {
  _id?: string;
  label: string;
  url: string;
  enabled: boolean;
}

interface LinkColumn {
  _id?: string;
  title: string;
  links: NavLink[];
  enabled: boolean;
  order: number;
}

interface ContactItem {
  _id?: string;
  type: string;
  label: string;
  value: string;
  enabled: boolean;
}

interface BottomLink {
  _id?: string;
  label: string;
  url: string;
  enabled: boolean;
}

interface FooterData {
  brandName: string;
  brandDescription: string;
  socialLinks: SocialLink[];
  linkColumns: LinkColumn[];
  contactTitle: string;
  contactItems: ContactItem[];
  copyrightText: string;
  bottomLinks: BottomLink[];
}

const socialIcons: Record<string, JSX.Element> = {
  instagram: <Instagram className="w-5 h-5" strokeWidth={1.5} />,
  facebook: <Facebook className="w-5 h-5" strokeWidth={1.5} />,
  twitter: <Twitter className="w-5 h-5" strokeWidth={1.5} />,
  linkedin: <Linkedin className="w-5 h-5" strokeWidth={1.5} />,
  youtube: <Youtube className="w-5 h-5" strokeWidth={1.5} />,
  pinterest: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.63 7.85 6.35 9.31-.09-.79-.17-2.01.04-2.87.18-.78 1.17-5.01 1.17-5.01s-.3-.6-.3-1.49c0-1.4.81-2.45 1.82-2.45.86 0 1.27.64 1.27 1.41 0 .86-.55 2.15-.83 3.34-.24.99.5 1.8 1.48 1.8 1.78 0 3.15-1.88 3.15-4.59 0-2.4-1.72-4.08-4.2-4.08-2.86 0-4.54 2.15-4.54 4.36 0 .86.33 1.78.75 2.28a.3.3 0 01.07.29l-.28 1.14c-.04.18-.14.22-.33.13-1.25-.58-2.03-2.41-2.03-3.88 0-3.17 2.3-6.08 6.64-6.08 3.48 0 6.19 2.48 6.19 5.8 0 3.46-2.18 6.24-5.21 6.24-1.02 0-1.98-.53-2.31-1.16l-.63 2.38c-.23.87-.84 1.96-1.25 2.63A9.97 9.97 0 0012 22a10 10 0 100-20z" />
    </svg>
  ),
  tiktok: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12a4 4 0 100 8 4 4 0 000-8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 2v8a4 4 0 004 4v-3a1 1 0 01-1-1V2h-3z" />
    </svg>
  ),
  whatsapp: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  )
};

const socialBrandColors: Record<string, string> = {
  instagram: 'text-pink-600 hover:text-pink-500',
  facebook: 'text-blue-600 hover:text-blue-500',
  twitter: 'text-sky-500 hover:text-sky-400',
  linkedin: 'text-blue-700 hover:text-blue-600',
  youtube: 'text-red-600 hover:text-red-500',
  pinterest: 'text-red-700 hover:text-red-600',
  tiktok: 'text-stone-900 hover:text-stone-700',
  whatsapp: 'text-green-600 hover:text-green-500'
};

// Default fallback data
const defaultFooter: FooterData = {
  brandName: 'UFLIX',
  brandDescription: 'Leading manufacturer of customized furniture and metal fabrication solutions for commercial, institutional, and industrial projects across India and the Middle East.',
  socialLinks: [
    { platform: 'instagram', url: 'https://www.instagram.com/uflix_interio?igsh=MXY0cXZidW9kc3JrNw==', enabled: true },
    { platform: 'facebook', url: '#', enabled: true },
    { platform: 'twitter', url: '#', enabled: true },
    { platform: 'linkedin', url: '#', enabled: true }
  ],
  linkColumns: [
    {
      title: 'Company', order: 0, enabled: true,
      links: [
        { label: 'About UFLIX', url: '/about', enabled: true },
        { label: 'Shop Fittings', url: '/shop-fittings', enabled: true },
        { label: 'Quality & Certifications', url: '/quality', enabled: true },
        { label: 'Sustainability', url: '/sustainability', enabled: true },
        { label: 'Contact Us', url: '/contact', enabled: true }
      ]
    },
    {
      title: 'Solutions', order: 1, enabled: true,
      links: [
        { label: 'Industries We Serve', url: '/industries', enabled: true },
        { label: 'Projects & Case Studies', url: '/projects', enabled: true },
        { label: 'For Business', url: '/business', enabled: true },
        { label: 'Shop Products', url: '/shop', enabled: true },
        { label: 'Product Categories', url: '/categories', enabled: true }
      ]
    }
  ],
  contactTitle: 'Contact',
  contactItems: [
    { type: 'address', label: 'Address', value: 'Greater Noida, Noida\nUttar Pradesh 201305\nIndia', enabled: true },
    { type: 'phone', label: 'Phone', value: '0120 491 1871\n+91 730 383 6300', enabled: true },
    { type: 'email', label: 'Email', value: 'ebusiness@uflix.co.in', enabled: true }
  ],
  copyrightText: '© 2026 Uflix. All rights reserved.',
  bottomLinks: [
    { label: 'Privacy Policy', url: '/privacy', enabled: true },
    { label: 'Terms & Conditions', url: '/terms', enabled: true },
    { label: 'Refund Policy', url: '/refund', enabled: true }
  ]
};

const contactIcons: Record<string, JSX.Element> = {
  address: <MapPin className="w-5 h-5 flex-none" strokeWidth={1.5} />,
  phone: <Phone className="w-5 h-5 flex-none" strokeWidth={1.5} />,
  email: <Mail className="w-5 h-5 flex-none" strokeWidth={1.5} />,
};

function renderContactValue(item: ContactItem) {
  const lines = item.value.split(/\\n|\n/);
  if (item.type === 'phone') {
    return (
      <div className="flex flex-col space-y-0.5">
        {lines.map((line, i) => (
          <a key={i} href={`tel:${line.replace(/\s/g, '')}`}
            className="block hover:text-orange-500 hover:translate-x-1 transition-all duration-300 leading-snug">
            {line}
          </a>
        ))}
      </div>
    );
  }
  if (item.type === 'email') {
    return (
      <div className="flex flex-col space-y-0.5">
        {lines.map((line, i) => (
          <a key={i} href={`mailto:${line}`}
            className="block hover:text-orange-500 hover:translate-x-1 transition-all duration-300 leading-snug break-all">
            {line}
          </a>
        ))}
      </div>
    );
  }
  return (
    <span className="leading-snug w-full flex flex-col space-y-0.5">
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </span>
  );
}

const trustItems = [
  {
    icon: (
      <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    text: "Custom Solutions"
  },
  {
    icon: (
      <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    text: "Pan India Delivery"
  },
  {
    icon: (
      <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    text: "10,000+ Clients"
  }
];

export default function Footer() {
  const [data, setData] = useState<FooterData>(defaultFooter);
  const [emailFocus, setEmailFocus] = useState(false);

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const res = await getFooterSettings();
        if (res.data) {
          setData({
            brandName: res.data.brandName || defaultFooter.brandName,
            brandDescription: res.data.brandDescription || defaultFooter.brandDescription,
            socialLinks: res.data.socialLinks?.length ? res.data.socialLinks : defaultFooter.socialLinks,
            linkColumns: res.data.linkColumns?.length ? res.data.linkColumns : defaultFooter.linkColumns,
            contactTitle: res.data.contactTitle || defaultFooter.contactTitle,
            contactItems: res.data.contactItems?.length ? res.data.contactItems : defaultFooter.contactItems,
            copyrightText: res.data.copyrightText || defaultFooter.copyrightText,
            bottomLinks: res.data.bottomLinks?.length ? res.data.bottomLinks : defaultFooter.bottomLinks,
          });
        }
      } catch {
        // Use defaults on error
      }
    };
    fetchFooter();
  }, []);

  const enabledColumns = data.linkColumns.filter(c => c.enabled).sort((a, b) => a.order - b.order);
  const enabledSocial = data.socialLinks.filter(s => s.enabled);
  const enabledContact = data.contactItems.filter(c => c.enabled);
  const enabledBottom = data.bottomLinks.filter(b => b.enabled);

  return (
    <footer className="bg-gradient-to-br from-[#FAFAF9] to-[#F3F2F0] text-stone-800 font-sans border-t border-stone-200 relative overflow-hidden">
      {/* Decorative subtle background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.03] pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-stone-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.1] pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>

      {/* ── Trust Strip ───────────────────────────────────────────────── */}
      <div className="border-b border-stone-200 overflow-hidden">
        
        {/* Desktop View */}
        <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-row items-center justify-center gap-8 text-sm text-stone-600 font-medium tracking-wide">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  {item.icon}
                  {item.text}
                </div>
                {i < trustItems.length - 1 && <span className="text-stone-300">|</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile View (Carousel) */}
        <div className="flex sm:hidden relative py-4 w-full bg-[#FAFAF9]">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 15s linear infinite;
              display: flex;
              width: max-content;
            }
          `}} />
          <div className="animate-marquee items-center gap-8 text-sm text-stone-600 font-medium tracking-wide pl-8">
            {/* We duplicate the array 4 times just to be absolutely sure the scrolling window is wide enough on mobile displays */}
            {[...trustItems, ...trustItems, ...trustItems, ...trustItems].map((item, i) => (
              <div key={i} className="flex items-center gap-8">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  {item.icon}
                  {item.text}
                </div>
                <span className="text-stone-300">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Footer Content ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Section */}
          <div className="flex flex-col relative z-10 w-full sm:max-w-md">
            <Link href="/" className="mb-8 inline-block transition-transform duration-500 hover:scale-105 origin-left">
              <Image
                src="/Logos/Uflix_Logo.png"
                alt={data.brandName}
                width={260}
                height={80}
                className="h-16 md:h-20 w-auto object-contain drop-shadow-sm"
              />
            </Link>
            <p className="text-stone-600 text-sm leading-relaxed mb-6 font-medium">
              {data.brandDescription}
            </p>
            <div className="relative pl-4 border-l-2 border-orange-400/60 mb-8 max-w-sm">
              <p className="text-stone-500 text-sm font-medium italic font-serif">
                "Crafted with precision. Built for lasting spaces."
              </p>
            </div>
            
            {/* Minimal Newsletter */}
            <div className="mt-auto">
              <h4 className="text-stone-900 text-sm font-semibold mb-3">Subscribe</h4>
              <div className={`flex items-center border-b ${emailFocus ? 'border-orange-500' : 'border-stone-300'} transition-colors duration-300 pb-2`}>
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-transparent border-none outline-none w-full text-sm text-stone-800 placeholder-stone-400"
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                />
                <button className="text-stone-400 hover:text-orange-500 transition-colors ml-2" aria-label="Subscribe">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Link Columns */}
          {enabledColumns.map((column, ci) => (
             <div key={ci} className="lg:pl-8 relative z-10">
               <h4 className="text-stone-900 text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-orange-400 rounded-full inline-block"></span>
                 {column.title}
               </h4>
              <ul className="space-y-4">
                {column.links.filter(l => l.enabled).map((link, li) => (
                  <li key={li}>
                    <Link
                      href={link.url}
                      className="text-sm text-stone-500 hover:text-orange-500 hover:underline hover:underline-offset-4 decoration-orange-500/30 transition-all duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Section */}
          {(enabledContact.length > 0 || enabledSocial.length > 0) && (
            <div className="lg:pl-4 relative z-10">
              <h4 className="text-stone-900 text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full inline-block"></span>
                {data.contactTitle}
              </h4>
              
              <ul className="space-y-5 mb-8">
                {enabledContact.map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-stone-500 text-sm group">
                    <span className="text-stone-400 group-hover:text-orange-500 transition-colors duration-300 transform -translate-y-0.5">
                      {contactIcons[item.type] || <MapPin className="w-5 h-5 flex-none" strokeWidth={1.5} />}
                    </span>
                    <div className="flex flex-col w-full text-stone-500">
                      {renderContactValue(item)}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Social Icons */}
              {enabledSocial.length > 0 && (
                <div className="flex gap-4 flex-wrap items-center mt-6">
                  {enabledSocial.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hover:scale-110 transition-transform duration-300 ${socialBrandColors[link.platform] || 'text-stone-500 hover:text-orange-500'}`}
                      aria-label={link.platform}
                    >
                        {socialIcons[link.platform] || <Instagram className="w-5 h-5" strokeWidth={1.5} />}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Bottom Bar ────────────────────────────────────────────────── */}
      <div className="border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500">{data.copyrightText}</p>
          {enabledBottom.length > 0 && (
            <div className="flex gap-6 flex-wrap justify-center">
              {enabledBottom.map((link, i) => (
                <Link
                  key={i}
                  href={link.url}
                  className="text-xs text-stone-500 hover:text-orange-500 transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

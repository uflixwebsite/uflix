'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFooterSettings } from '@/services/footerService';

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
  instagram: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
    </svg>
  ),
  facebook: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  ),
  twitter: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
  ),
  linkedin: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  ),
  youtube: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  ),
  pinterest: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg>
  ),
  tiktok: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
  ),
  whatsapp: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  )
};

const socialHoverColors: Record<string, string> = {
  instagram: 'hover:text-pink-500',
  facebook: 'hover:text-blue-600',
  twitter: 'hover:text-sky-500',
  linkedin: 'hover:text-blue-700',
  youtube: 'hover:text-red-600',
  pinterest: 'hover:text-red-700',
  tiktok: 'hover:text-gray-100',
  whatsapp: 'hover:text-green-500'
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
        { label: 'Manufacturing', url: '/manufacturing', enabled: true },
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

function renderContactValue(item: ContactItem) {
  const lines = item.value.split('\n');
  if (item.type === 'phone') {
    return lines.map((line, i) => (
      <span key={i}>
        {i > 0 && <br />}
        <a href={`tel:${line.replace(/\s/g, '')}`} className="hover:text-accent transition-colors">{line}</a>
      </span>
    ));
  }
  if (item.type === 'email') {
    return lines.map((line, i) => (
      <span key={i}>
        {i > 0 && <br />}
        <a href={`mailto:${line}`} className="hover:text-accent transition-colors">{line}</a>
      </span>
    ));
  }
  return <span className="text-sm" dangerouslySetInnerHTML={{ __html: item.value.replace(/\n/g, '<br />') }} />;
}

export default function Footer() {
  const [data, setData] = useState<FooterData>(defaultFooter);

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
            bottomLinks: res.data.bottomLinks?.length ? res.data.bottomLinks : defaultFooter.bottomLinks
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
  const gridCols = Math.min(2 + enabledColumns.length + (enabledContact.length > 0 ? 1 : 0), 5);
  const gridColsClass: Record<number, string> = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
  };

  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`grid grid-cols-1 md:grid-cols-2 ${gridColsClass[gridCols] || 'lg:grid-cols-5'} gap-8 mb-8`}>
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-accent mb-4">{data.brandName}</h3>
            <p className="text-gray-300 mb-4 leading-relaxed">{data.brandDescription}</p>
            {enabledSocial.length > 0 && (
              <div className="flex space-x-4 mt-6">
                {enabledSocial.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-300 ${socialHoverColors[link.platform] || 'hover:text-accent'} transition-colors`}
                  >
                    {socialIcons[link.platform] || (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {enabledColumns.map((column, colIdx) => (
            <div key={colIdx}>
              <h4 className="font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.filter(l => l.enabled).map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link href={link.url} className="text-gray-300 hover:text-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {enabledContact.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4">{data.contactTitle}</h4>
              <ul className="space-y-2">
                {enabledContact.map((item, i) => (
                  <li key={i} className="text-gray-300">
                    <span className="block text-sm font-medium mb-1">{item.label}</span>
                    {renderContactValue(item)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">{data.copyrightText}</p>
          {enabledBottom.length > 0 && (
            <div className="flex space-x-6">
              {enabledBottom.map((link, i) => (
                <Link key={i} href={link.url} className="text-gray-400 hover:text-accent text-sm transition-colors">
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

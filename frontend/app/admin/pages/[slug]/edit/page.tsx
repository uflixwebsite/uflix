'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getPageContentAdmin, updatePageContent, deleteSection } from '@/services/pageService';
import { uploadSingleImage, deleteFile } from '@/services/uploadService';
import { useAuthState } from '@/hooks/useAuthState';

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'content', label: 'Content' },
  { value: 'features', label: 'Features Grid' },
  { value: 'stats', label: 'Statistics' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'cards', label: 'Cards' },
  { value: 'text-image', label: 'Text + Image' },
  { value: 'list', label: 'List with Images' },
  { value: 'contact-info', label: 'Contact Info' },
  { value: 'custom', label: 'Custom' },
];

const BG_OPTIONS = [
  { value: 'white', label: 'White' },
  { value: 'light', label: 'Light Gray' },
  { value: 'dark', label: 'Dark (Cinematic)' },
  { value: 'gradient', label: 'Gradient (Accent / Orange)' },
];

// Pre-built section templates for the Business page.
// When the admin opens /admin/pages/business/edit, any missing sections are
// automatically inserted so they can be edited right away.
const BUSINESS_REQUIRED_SECTIONS: any[] = [
  {
    sectionId: 'hero', type: 'hero', bgColor: 'dark', order: 0, isVisible: true,
    title: 'Furniture That Means Business',
    subtitle: 'Edit the main headline, description and button labels below.',
    description: 'From corporate offices to government institutions — premium, ISO-certified furniture solutions designed for productivity, durability, and your brand.',
    link: '#products', linkText: 'Browse Collection',
    secondaryLink: '/contact', secondaryLinkText: 'Request a Quote',
    image: '', items: [],
  },
  {
    sectionId: 'slider', type: 'custom', bgColor: 'white', order: 1, isVisible: true,
    title: 'Product Slider',
    description: '', image: '', items: [],
  },
  {
    sectionId: 'stats-bar', type: 'custom', bgColor: 'white', order: 4, isVisible: true,
    title: 'Stats Bar',
    description: '', image: '', items: [],
  },
  {
    sectionId: 'image-grid', type: 'custom', bgColor: 'white', order: 5, isVisible: true,
    title: 'Image Grid',
    description: '', image: '', items: [],
  },
  {
    sectionId: 'split-1', type: 'custom', bgColor: 'white', order: 6, isVisible: true,
    title: 'Split Section 1',
    description: '', image: '', link: '', linkText: 'Learn More', items: [],
  },
  {
    sectionId: 'split-2', type: 'custom', bgColor: 'light', order: 7, isVisible: true,
    title: 'Split Section 2',
    description: '', image: '', link: '', linkText: 'Learn More', items: [],
  },
  {
    sectionId: 'projects', type: 'custom', bgColor: 'white', order: 8, isVisible: true,
    title: 'Flagship Projects',
    description: '', image: '', items: [],
  },
  {
    sectionId: 'cta', type: 'cta', bgColor: 'dark', order: 9, isVisible: true,
    title: 'Need Bulk Orders or Custom Solutions?',
    subtitle: 'Bottom call-to-action section.',
    description: 'We specialise in large-scale corporate and institutional projects. Talk to our business solutions team for a personalised quote.',
    link: '/contact', linkText: 'Get Bulk Quote',
    secondaryLink: 'https://wa.me/917303836300', secondaryLinkText: 'WhatsApp Us',
    image: '', items: [],
  },
];

// Pre-built section templates for the Shop Fittings page.
const SHOP_FITTINGS_REQUIRED_SECTIONS: any[] = [
  {
    sectionId: 'hero', type: 'hero', bgColor: 'dark', order: 0, isVisible: true,
    title: 'Transform Your Retail Space',
    description: 'Premium shop fittings designed and manufactured in-house for leading retail brands across India.',
    link: '#products', linkText: 'Explore Products',
    secondaryLink: '/contact', secondaryLinkText: 'Get a Quote',
    image: '', items: [],
  },
  {
    sectionId: 'intro', type: 'custom', bgColor: 'light', order: 1, isVisible: true,
    title: 'Retail Spaces,\nEngineered to Perform',
    description: 'For over two decades, Uflix has delivered precision-fabricated shop fitting solutions for retail brands, government institutions, and commercial spaces across India.',
    link: '/contact', linkText: 'Get a Consultation', image: '',
    items: [
      { stats: '20+', statsLabel: 'Years of Experience', title: '', description: '', image: '', link: '' },
      { stats: '500+', statsLabel: 'Projects Delivered', title: '', description: '', image: '', link: '' },
      { stats: 'ISO 9001:2015', statsLabel: 'Certified Quality', title: '', description: '', image: '', link: '' },
      { stats: '50+', statsLabel: 'Retail Clients', title: '', description: '', image: '', link: '' },
    ],
  },
  {
    sectionId: 'solutions', type: 'custom', bgColor: 'white', order: 2, isVisible: true,
    title: 'Complete Retail Fitout Solutions', image: '',
    items: [
      { title: 'Display Fixtures', description: 'Premium gondola shelving, pegboard panels, and display risers engineered to maximise product visibility.', image: '', link: '' },
      { title: 'Checkout Counters', description: 'Custom-built cash-wrap counters and POS stations that combine functionality with your brand aesthetic.', image: '', link: '' },
      { title: 'Garment & Apparel', description: 'Wall-mounted rails, floor racks, and hanging systems for apparel retailers of any size.', image: '', link: '' },
      { title: 'Lighting & Signage', description: 'Integrated LED display lighting and branded signage solutions to elevate the in-store experience.', image: '', link: '' },
      { title: 'Storage Systems', description: 'Back-office shelving, stockroom racking, and modular storage units built for high-volume retail.', image: '', link: '' },
      { title: 'Custom Fabrication', description: 'Bespoke metal and wood fabrication for unique retail environments — from concept to installation.', image: '', link: '' },
    ],
  },
  {
    sectionId: 'gallery', type: 'custom', bgColor: 'light', order: 3, isVisible: true,
    title: 'Projects That Speak for Themselves',
    link: '/contact', linkText: 'Start Your Project', image: '',
    items: [
      { title: 'Flagship Retail Fitout', description: 'Display Fixtures', image: '', link: '' },
      { title: 'Custom Checkout Counter', description: 'Checkout & POS', image: '', link: '' },
      { title: 'Modular Shelving System', description: 'Storage & Display', image: '', link: '' },
    ],
  },
  {
    sectionId: 'products', type: 'custom', bgColor: 'light', order: 4, isVisible: true,
    title: 'Featured Products',
    link: '/shop', linkText: 'View all products',
    image: '', items: [],
  },
  {
    sectionId: 'industries', type: 'custom', bgColor: 'white', order: 5, isVisible: true,
    title: 'Built for Every Industry',
    description: 'From high-street retail to government institutions, our solutions adapt to any commercial environment.',
    image: '',
    items: [
      { title: 'Retail & Fashion', description: 'End-to-end fitouts for apparel, accessories, and lifestyle stores of any size.', image: '', link: '' },
      { title: 'Hospitality', description: 'Display counters, service stations, and décor solutions for hotels, cafes, and restaurants.', image: '', link: '' },
      { title: 'Government & Institutional', description: 'ISO-certified supply and professional installation for public sector and institutional spaces.', image: '', link: '' },
      { title: 'Corporate Offices', description: 'Reception desks, storage solutions, and branded display systems for modern workspaces.', image: '', link: '' },
    ],
  },
  {
    sectionId: 'process', type: 'custom', bgColor: 'dark', order: 6, isVisible: true,
    title: 'From Vision to Reality', image: '',
    items: [
      { stats: '01', title: 'Consultation', description: 'We assess your space, brand, and product range to design the ideal layout and fitting solution.', image: '', link: '' },
      { stats: '02', title: 'Design & Quote', description: 'Our design team creates detailed renderings and a transparent, itemised quotation.', image: '', link: '' },
      { stats: '03', title: 'Manufacturing', description: 'Every unit is fabricated in our ISO-certified facility with rigorous quality control at each stage.', image: '', link: '' },
      { stats: '04', title: 'Delivery & Install', description: 'White-glove delivery and professional installation with zero disruption to your operations.', image: '', link: '' },
    ],
  },
  {
    sectionId: 'why-cta', type: 'custom', bgColor: 'dark', order: 7, isVisible: true,
    title: 'Ready to Transform Your Store?',
    description: 'Get a free consultation and custom quote from our expert team.',
    link: '/contact', linkText: 'Get Free Quote',
    secondaryLink: 'https://wa.me/917303836300', secondaryLinkText: 'Chat on WhatsApp',
    image: '',
    items: [
      { title: 'ISO 9001:2015 certified manufacturing', description: '', image: '', link: '' },
      { title: 'In-house design and fabrication team', description: '', image: '', link: '' },
      { title: 'Government & retail sector expertise', description: '', image: '', link: '' },
      { title: 'Pan-India delivery and installation', description: '', image: '', link: '' },
      { title: 'Lifetime technical support', description: '', image: '', link: '' },
      { title: 'Competitive bulk-order pricing', description: '', image: '', link: '' },
    ],
  },
];

function extractCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  try {
    // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123/home/pages/abc123.jpg
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (match && match[1]) {
      // Remove file extension
      return match[1].replace(/\.[^.]+$/, '');
    }
  } catch {
    // ignore
  }
  return null;
}

async function deleteOldCloudinaryImage(url: string) {
  const publicId = extractCloudinaryPublicId(url);
  if (publicId) {
    try {
      await deleteFile(publicId, 'image');
    } catch (error) {
      console.error('Failed to delete old image from Cloudinary:', error);
    }
  }
}

function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value || '#ffffff'} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded-md cursor-pointer border border-gray-200 p-0.5 shrink-0" />
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent" maxLength={9} placeholder="#ffffff" />
      </div>
    </div>
  );
}

function ImageUploader({ value, onChange, label, hint }: { value: string; onChange: (url: string) => void; label: string; hint?: string }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Delete old image from Cloudinary before uploading new one
      if (value) {
        await deleteOldCloudinaryImage(value);
      }
      const result = await uploadSingleImage(file, 'pages');
      onChange(result.data.url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (value) {
      await deleteOldCloudinaryImage(value);
    }
    onChange('');
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">📐 Recommended: {hint}</p>}
      <div className="flex gap-2 items-center">
        <label
          className={`px-4 py-2 text-sm rounded-md cursor-pointer transition-colors ${
            uploading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'btn-primary'
          }`}
        >
          {uploading ? 'Uploading…' : value ? 'Replace Image' : 'Upload Image'}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
        {value && (
          <span className="text-xs text-gray-500 truncate max-w-40">Image uploaded ✓</span>
        )}
      </div>
      {value && (
        <div className="mt-2 relative w-32 h-20 rounded overflow-hidden border border-gray-200">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={handleRemove}
            className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
            type="button"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Schema definitions: what fields each business section needs ─────────────
type SectionSchema = {
  label: string;
  hint?: string;
  showTitle?: boolean;
  titleLabel?: string;
  showDescription?: boolean;
  showImage?: boolean;
  showLink?: boolean;
  showSecondaryLink?: boolean;
  itemLabel?: string;
  itemFields: Array<'title'|'image'|'link'|'description'|'stats'|'statsLabel'>;
  noItems?: boolean;
  isSlider?: boolean;
  isHeroImages?: boolean; // unified drag-drop image grid replaces showImage + items
};

const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  hero: {
    label: 'Hero Banner',
    hint: 'Each slide has its own image, headline, description and buttons. Drag cards to reorder.',
    isHeroImages: true,
    itemFields: [],
  },
  'stats-bar': {
    label: 'Stats Bar',
    hint: 'Coral strip of numbers. Each stat is one card.',
    itemLabel: 'Stat',
    itemFields: ['stats', 'statsLabel'],
  },
  'image-grid': {
    label: 'Image Grid',
    hint: '2-column image tiles. Each tile has a title, description, image and link.',
    itemLabel: 'Tile',
    itemFields: ['title', 'description', 'image', 'link'],
  },
  'split-1': {
    label: 'Split Section 1 — Image Left',
    hint: 'Side-by-side block: image on the left, text on the right.',
    showTitle: true, showDescription: true, showImage: true, showLink: true,
    itemFields: [], noItems: true,
  },
  'split-2': {
    label: 'Split Section 2 — Image Right',
    hint: 'Side-by-side block: text on the left, image on the right.',
    showTitle: true, showDescription: true, showImage: true, showLink: true,
    itemFields: [], noItems: true,
  },
  projects: {
    label: 'Flagship Projects',
    hint: 'Project showcase. Each project has a name, short description, image and link.',
    itemLabel: 'Project',
    itemFields: ['title', 'description', 'image', 'link'],
  },
  cta: {
    label: 'Call to Action',
    hint: 'Dark bottom banner with two buttons.',
    showTitle: true, showDescription: true, showLink: true, showSecondaryLink: true,
    itemFields: [], noItems: true,
  },
  slider: {
    label: 'Product Slider',
    hint: 'One section for all slider tabs. Each card has a Tab Name (Description field) that groups it under a header tab.',
    itemLabel: 'Product Card',
    itemFields: ['description', 'title', 'image', 'link'],
    isSlider: true,
  },
  // ─── Shop Fittings page schemas ───────────────────────────────────────────
  intro: {
    label: 'Intro Statement + Stats',
    hint: 'Headline on left, 2×2 stat cards on right. Use "Number" and "Label" fields for each stat card.',
    showTitle: true, titleLabel: 'Headline',
    showDescription: true, showLink: true,
    itemLabel: 'Stat Card',
    itemFields: ['stats', 'statsLabel'],
  },
  solutions: {
    label: 'What We Offer — Image Cards',
    hint: '6 image cards with text overlay. Title always shown, description slides up on hover.',
    showTitle: true,
    itemLabel: 'Solution',
    itemFields: ['title', 'description', 'image'],
  },
  gallery: {
    label: 'Project Gallery — Bento Layout',
    hint: 'Item 1 = large feature card (60%), items 2 & 3 = stacked cards (40%). Use Description for the category tag.',
    showTitle: true,
    showLink: true,
    itemLabel: 'Gallery Image',
    itemFields: ['title', 'description', 'image'],
  },
  products: {
    label: 'Featured Products Scroll',
    hint: 'Products are fetched from the catalogue automatically (tagged \'shop-fitting\'). Edit the section title and View-all link here.',
    showTitle: true, showLink: true,
    itemFields: [], noItems: true,
  },
  industries: {
    label: 'Industries We Serve — Image Cards',
    hint: '4 tall portrait cards. Description slides in on hover. Upload one image per industry.',
    showTitle: true, showDescription: true,
    itemLabel: 'Industry',
    itemFields: ['title', 'description', 'image'],
  },
  process: {
    label: 'How It Works — Process Steps',
    hint: '4-step horizontal timeline. Use the "Number" field for the step label (01, 02…).',
    showTitle: true,
    itemLabel: 'Step',
    itemFields: ['stats', 'title', 'description'],
  },
  'why-cta': {
    label: 'Why Uflix + CTA Card',
    hint: 'Dark section: bullet-point feature list on the left, CTA card on the right. Items = feature bullets (Title field only).',
    showTitle: true, showDescription: true,
    showLink: true, showSecondaryLink: true,
    itemLabel: 'Feature Bullet',
    itemFields: ['title'],
  },
};

function getSchema(sectionId: string): SectionSchema {
  return SECTION_SCHEMAS[sectionId] || {
    label: 'Section',
    showTitle: true, showDescription: true, showImage: true, showLink: true, showSecondaryLink: true,
    itemLabel: 'Item',
    itemFields: ['title', 'description', 'image', 'link', 'stats', 'statsLabel'],
  };
}

// ─── Schema-aware item editor ─────────────────────────────────────────────────
function SectionItemEditor({ item, index, onChange, onRemove, fields, itemLabel, isSlider }: any) {
  const update = (field: string, value: any) => onChange({ ...item, [field]: value });
  const show = (f: string) => (fields as string[]).includes(f);


  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-700">{itemLabel || 'Item'} {index + 1}</span>
        <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Slider only: description = Tab Name */}
        {isSlider && show('description') && (
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">
              Tab Name <span className="font-normal text-gray-400">(e.g. Seating)</span>
            </label>
            <input type="text" value={item.description || ''} onChange={(e) => update('description', e.target.value)}
              placeholder="Seating"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
        )}
        {show('stats') && (
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Number (e.g. 75+)</label>
            <input type="text" value={item.stats || ''} onChange={(e) => update('stats', e.target.value)}
              placeholder="85%"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
        )}
        {show('statsLabel') && (
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Label (e.g. National Awards)</label>
            <input type="text" value={item.statsLabel || ''} onChange={(e) => update('statsLabel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
        )}
        {show('title') && (
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">
              {isSlider ? 'Product Name' : 'Title'}
            </label>
            <input type="text" value={item.title || ''} onChange={(e) => update('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
        )}
        {/* Non-slider: description = regular description textarea */}
        {!isSlider && show('description') && (
          <div className="md:col-span-2">
            <label className="block text-xs font-medium mb-1 text-gray-600">Description</label>
            <textarea value={item.description || ''} onChange={(e) => update('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
        )}
        {show('link') && (
          <div className={show('image') ? '' : 'md:col-span-2'}>
            <label className="block text-xs font-medium mb-1 text-gray-600">Link URL</label>
            <input type="text" value={item.link || ''} onChange={(e) => update('link', e.target.value)}
              placeholder="/category/seating"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
        )}
        {show('image') && (
          <div className="md:col-span-2">
            <ImageUploader value={item.image || ''} onChange={(url) => update('image', url)} label="Image" hint="1200×600px (2:1 landscape, JPG/WEBP)" />
          </div>
        )}
      </div>
    </div>
  );
}
// ─── Hero per-slide editor ────────────────────────────────────────────────────

type HeroSlide = {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  linkText: string;
  link: string;
  secondaryLinkText: string;
  secondaryLink: string;
  titleColor: string;
  subtitleColor: string;
  primaryButtonBg: string;
  primaryButtonTextColor: string;
  secondaryButtonBg: string;
  secondaryButtonTextColor: string;
};

function heroDataToSlides(data: any): HeroSlide[] {
  const first: HeroSlide = {
    image: data.image || '',
    title: data.title || '',
    subtitle: data.subtitle || '',
    description: data.description || '',
    linkText: data.linkText || '',
    link: data.link || '',
    secondaryLinkText: data.secondaryLinkText || '',
    secondaryLink: data.secondaryLink || '',
    titleColor: data.titleColor || '',
    subtitleColor: data.subtitleColor || '',
    primaryButtonBg: data.primaryButtonBg || '',
    primaryButtonTextColor: data.primaryButtonTextColor || '',
    secondaryButtonBg: data.secondaryButtonBg || '',
    secondaryButtonTextColor: data.secondaryButtonTextColor || '',
  };
  const rest: HeroSlide[] = (data.items || []).map((item: any) => ({
    image: item.image || '',
    title: item.title || '',
    subtitle: item.subtitle || '',
    description: item.description || '',
    linkText: item.linkText || '',
    link: item.link || '',
    secondaryLinkText: item.secondaryLinkText || '',
    secondaryLink: item.secondaryLink || '',
    titleColor: item.titleColor || '',
    subtitleColor: item.subtitleColor || '',
    primaryButtonBg: item.primaryButtonBg || '',
    primaryButtonTextColor: item.primaryButtonTextColor || '',
    secondaryButtonBg: item.secondaryButtonBg || '',
    secondaryButtonTextColor: item.secondaryButtonTextColor || '',
  }));
  return [first, ...rest];
}

function heroSlidesToData(slides: HeroSlide[], existing: any): any {
  const [s0, ...rest] =
    slides.length > 0
      ? slides
      : [{ image: '', title: '', subtitle: '', description: '', linkText: '', link: '', secondaryLinkText: '', secondaryLink: '', titleColor: '', subtitleColor: '', primaryButtonBg: '', primaryButtonTextColor: '', secondaryButtonBg: '', secondaryButtonTextColor: '' }];
  return {
    ...existing,
    image: s0.image,
    title: s0.title,
    subtitle: s0.subtitle,
    description: s0.description,
    linkText: s0.linkText,
    link: s0.link,
    secondaryLinkText: s0.secondaryLinkText,
    secondaryLink: s0.secondaryLink,
    titleColor: s0.titleColor,
    subtitleColor: s0.subtitleColor,
    primaryButtonBg: s0.primaryButtonBg,
    primaryButtonTextColor: s0.primaryButtonTextColor,
    secondaryButtonBg: s0.secondaryButtonBg,
    secondaryButtonTextColor: s0.secondaryButtonTextColor,
    items: rest.map((s) => ({
      image: s.image,
      title: s.title,
      subtitle: s.subtitle,
      description: s.description,
      linkText: s.linkText,
      link: s.link,
      secondaryLinkText: s.secondaryLinkText,
      secondaryLink: s.secondaryLink,
      titleColor: s.titleColor,
      subtitleColor: s.subtitleColor,
      primaryButtonBg: s.primaryButtonBg,
      primaryButtonTextColor: s.primaryButtonTextColor,
      secondaryButtonBg: s.secondaryButtonBg,
      secondaryButtonTextColor: s.secondaryButtonTextColor,
      stats: '',
      statsLabel: '',
    })),
  };
}

function HeroPerSlideEditor({ section, onChange }: { section: any; onChange: (s: any) => void }) {
  const [slides, setSlides] = useState<HeroSlide[]>(() => heroDataToSlides(section));
  const [uploading, setUploading] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number>(0);
  const dragIdx = useRef<number | null>(null);

  const dataKey =
    (section.image || '') + '|' + (section.title || '') + '|' + (section.items || []).length;
  useEffect(() => {
    setSlides(heroDataToSlides(section));
  }, [dataKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = (newSlides: HeroSlide[]) => {
    setSlides(newSlides);
    onChange(heroSlidesToData(newSlides, section));
  };

  const updateSlide = (i: number, key: keyof HeroSlide, value: string) => {
    const next = [...slides];
    next[i] = { ...next[i], [key]: value };
    commit(next);
  };

  const removeSlide = (i: number) => {
    if (slides.length <= 1) { alert('At least one slide is required.'); return; }
    deleteOldCloudinaryImage(slides[i].image);
    const next = slides.filter((_, idx) => idx !== i);
    setExpandedIdx((prev) => (prev >= next.length ? next.length - 1 : prev));
    commit(next);
  };

  const addSlide = () => {
    const blank: HeroSlide = {
      image: '', title: '', subtitle: '', description: '',
      linkText: 'Explore Products', link: '#just-arrived',
      secondaryLinkText: 'Request a Quote', secondaryLink: '/contact',
      titleColor: '', subtitleColor: '',
      primaryButtonBg: '', primaryButtonTextColor: '',
      secondaryButtonBg: '', secondaryButtonTextColor: '',
    };
    const next = [...slides, blank];
    commit(next);
    setExpandedIdx(next.length - 1);
  };

  const uploadImage = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(i);
    try {
      const result = await uploadSingleImage(file, 'pages');
      updateSlide(i, 'image', result.data.url);
    } catch { alert('Upload failed. Please try again.'); }
    finally { setUploading(null); }
  };

  const onDragStart = (i: number) => { dragIdx.current = i; };
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    const next = [...slides];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(i, 0, moved);
    dragIdx.current = i;
    commit(next);
  };
  const onDragEnd = () => { dragIdx.current = null; };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Each slide has its own image, headline, description and buttons. Drag cards to reorder.</p>
      <div className="space-y-2">
        {slides.map((slide, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => onDragOver(e, i)}
            onDragEnd={onDragEnd}
            className="border border-gray-200 rounded-xl overflow-hidden bg-white"
          >
            <div
              className="flex items-center gap-3 p-3 cursor-pointer select-none hover:bg-gray-50"
              onClick={() => setExpandedIdx(expandedIdx === i ? -1 : i)}
            >
              <span className="text-gray-300 text-lg leading-none shrink-0" title="Drag to reorder">⠿</span>
              <div className="w-16 h-10 rounded overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                {slide.image
                  ? <img src={slide.image} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No img</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-800">{slide.title || `Slide ${i + 1}`}</p>
                {i === 0 && <span className="text-[10px] font-bold bg-accent text-white px-1.5 py-0.5 rounded">MAIN</span>}
              </div>
              <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expandedIdx === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              <button
                onClick={(e) => { e.stopPropagation(); removeSlide(i); }}
                className="p-1.5 text-red-400 hover:text-red-600 rounded shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {expandedIdx === i && (
              <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/50">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Hero Image <span className="font-normal text-gray-400">📐 1920×1080px (16:9, JPG/WEBP)</span></p>
                  <div className="flex gap-3 items-start">
                    <div className="w-36 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      {slide.image
                        ? <img src={slide.image} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No image</div>
                      }
                    </div>
                    <div className="flex gap-2 flex-wrap pt-1">
                      <label className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${uploading === i ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'btn-primary'}`}>
                        {uploading === i ? 'Uploading…' : slide.image ? 'Replace' : 'Upload'}
                        <input type="file" accept="image/*" className="hidden" disabled={uploading !== null} onChange={(e) => uploadImage(i, e)} />
                      </label>
                      {slide.image && (
                        <button onClick={() => updateSlide(i, 'image', '')} className="px-3 py-2 text-sm rounded-md bg-red-50 text-red-600 hover:bg-red-100">Remove</button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Headline</label>
                  <input type="text" value={slide.title} onChange={(e) => updateSlide(i, 'title', e.target.value)}
                    placeholder="e.g. Furniture That Means Business"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Sub-headline <span className="font-normal text-gray-400">(optional)</span></label>
                  <input type="text" value={slide.subtitle} onChange={(e) => updateSlide(i, 'subtitle', e.target.value)}
                    placeholder="Optional tagline"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                  <textarea value={slide.description} onChange={(e) => updateSlide(i, 'description', e.target.value)}
                    rows={2} placeholder="One or two sentences..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Primary button label</label>
                    <input type="text" value={slide.linkText} onChange={(e) => updateSlide(i, 'linkText', e.target.value)}
                      placeholder="Explore Products"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Primary button link</label>
                    <input type="text" value={slide.link} onChange={(e) => updateSlide(i, 'link', e.target.value)}
                      placeholder="#just-arrived"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Secondary button label</label>
                    <input type="text" value={slide.secondaryLinkText} onChange={(e) => updateSlide(i, 'secondaryLinkText', e.target.value)}
                      placeholder="Request a Quote"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Secondary button link</label>
                    <input type="text" value={slide.secondaryLink} onChange={(e) => updateSlide(i, 'secondaryLink', e.target.value)}
                      placeholder="/contact"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">🎨 Text &amp; Button Colors</p>
                  <div className="grid grid-cols-2 gap-2">
                    <ColorSwatch label="Heading Color" value={slide.titleColor || '#ffffff'} onChange={(v) => updateSlide(i, 'titleColor', v)} />
                    <ColorSwatch label="Description Color" value={slide.subtitleColor || '#ffffffB3'} onChange={(v) => updateSlide(i, 'subtitleColor', v)} />
                    <ColorSwatch label="Primary Button Bg" value={slide.primaryButtonBg || '#f97316'} onChange={(v) => updateSlide(i, 'primaryButtonBg', v)} />
                    <ColorSwatch label="Primary Button Text" value={slide.primaryButtonTextColor || '#ffffff'} onChange={(v) => updateSlide(i, 'primaryButtonTextColor', v)} />
                    <ColorSwatch label="Secondary Button Bg" value={slide.secondaryButtonBg || 'transparent'} onChange={(v) => updateSlide(i, 'secondaryButtonBg', v)} />
                    <ColorSwatch label="Secondary Button Text" value={slide.secondaryButtonTextColor || '#ffffff'} onChange={(v) => updateSlide(i, 'secondaryButtonTextColor', v)} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={addSlide}
        className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 hover:border-accent hover:text-accent text-sm rounded-xl transition-colors"
      >
        + Add slide
      </button>
    </div>
  );
}
// ─── Slider: nested Tabs → Cards editor ─────────────────────────────────────
function TabGroup({ tab, onRename, onRemove, onAddCard, onUpdateCard, onRemoveCard }: any) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Tab header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100">
        <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-gray-700 text-base w-4">
          {open ? '▾' : '▸'}
        </button>
        <input
          type="text"
          value={tab.name}
          onChange={(e) => onRename(e.target.value)}
          className="flex-1 px-2 py-1 text-sm font-semibold bg-transparent border border-transparent hover:border-gray-300 focus:border-accent rounded focus:outline-none"
          placeholder="Tab name (e.g. Workspace)"
        />
        <span className="text-xs text-gray-400 shrink-0">
          {tab.cards.length} card{tab.cards.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={onRemove}
          className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
        >
          Remove Tab
        </button>
      </div>

      {/* Cards */}
      {open && (
        <div className="p-3 space-y-2 bg-white">
          {tab.cards.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded">
              No cards yet — add one below.
            </p>
          )}
          {tab.cards.map((card: any, ci: number) => (
            <div key={ci} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-600">Card {ci + 1}</span>
                <button
                  onClick={() => onRemoveCard(ci)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500">Product Name</label>
                  <input
                    type="text"
                    value={card.title || ''}
                    onChange={(e) => onUpdateCard(ci, { ...card, title: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500">Link URL</label>
                  <input
                    type="text"
                    value={card.link || ''}
                    onChange={(e) => onUpdateCard(ci, { ...card, link: e.target.value })}
                    placeholder="/product/chair-001"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="md:col-span-2">
                  <ImageUploader
                    value={card.image || ''}
                    onChange={(url) => onUpdateCard(ci, { ...card, image: url })}
                    label="Card Image"
                    hint="400×300px (4:3, JPG/WEBP)"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={onAddCard}
            className="w-full py-1.5 border border-dashed border-gray-300 rounded text-xs text-gray-500 hover:border-accent hover:text-accent transition-colors"
          >
            + Add Card
          </button>
        </div>
      )}
    </div>
  );
}

function SliderTabsEditor({ items, onChange }: { items: any[]; onChange: (items: any[]) => void }) {
  // Build tab list from flat items once (initialiser only — local state owns tabs after that)
  const buildTabs = (flatItems: any[]): { name: string; cards: any[] }[] => {
    const map = new Map<string, any[]>();
    (flatItems || []).forEach((item) => {
      const tab = item.description?.trim() || 'Untitled Tab';
      if (!map.has(tab)) map.set(tab, []);
      map.get(tab)!.push(item);
    });
    return Array.from(map.entries()).map(([name, cards]) => ({ name, cards }));
  };

  // LOCAL STATE — empty tabs survive here even though they produce 0 flat items
  const [tabs, setTabs] = useState<{ name: string; cards: any[] }[]>(() => buildTabs(items));

  // Flatten tabs → items and bubble up to parent
  const commit = (newTabs: { name: string; cards: any[] }[]) => {
    setTabs(newTabs);
    // Only non-empty tabs contribute flat items (empty tabs are editor-only state)
    const flat = newTabs.flatMap((t) =>
      t.cards.map((c) => ({ ...c, description: t.name }))
    );
    onChange(flat);
  };

  const addTab = () => {
    const nameBase = 'New Tab';
    const existing = tabs.map((t) => t.name);
    let name = nameBase;
    let n = 1;
    while (existing.includes(name)) { name = `${nameBase} ${++n}`; }
    commit([...tabs, { name, cards: [] }]);
  };

  const removeTab = (ti: number) => commit(tabs.filter((_, i) => i !== ti));

  const renameTab = (ti: number, name: string) =>
    commit(tabs.map((t, i) => (i === ti ? { ...t, name } : t)));

  const addCard = (ti: number) =>
    commit(
      tabs.map((t, i) =>
        i === ti
          ? { ...t, cards: [...t.cards, { title: '', image: '', link: '' }] }
          : t
      )
    );

  const updateCard = (ti: number, ci: number, card: any) =>
    commit(
      tabs.map((t, i) => {
        if (i !== ti) return t;
        const cards = [...t.cards];
        cards[ci] = card;
        return { ...t, cards };
      })
    );

  const removeCard = (ti: number, ci: number) =>
    commit(
      tabs.map((t, i) =>
        i === ti ? { ...t, cards: t.cards.filter((_, k) => k !== ci) } : t
      )
    );

  return (
    <div className="space-y-3">
      {tabs.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-lg">
          No tabs yet — click "+ Add Tab" to create the first one.
        </p>
      )}
      {tabs.map((tab, ti) => (
        <TabGroup
          key={ti}
          tab={tab}
          onRename={(name: string) => renameTab(ti, name)}
          onRemove={() => removeTab(ti)}
          onAddCard={() => addCard(ti)}
          onUpdateCard={(ci: number, card: any) => updateCard(ti, ci, card)}
          onRemoveCard={(ci: number) => removeCard(ti, ci)}
        />
      ))}
      <button
        onClick={addTab}
        className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-accent hover:text-accent transition-colors font-medium"
      >
        + Add Tab
      </button>
    </div>
  );
}

// ─── Schema-aware section editor ──────────────────────────────────────────────
function SectionEditor({ section, index, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: any) {
  const [expanded, setExpanded] = useState(false);
  const schema = getSchema(section.sectionId);

  const update = (field: string, value: any) => onChange({ ...section, [field]: value });

  const addItem = () => {
    update('items', [...(section.items || []), { title: '', description: '', image: '', link: '', stats: '', statsLabel: '' }]);
  };
  const updateItem = (idx: number, item: any) => {
    const items = [...(section.items || [])]; items[idx] = item; update('items', items);
  };
  const removeItem = (idx: number) => {
    update('items', (section.items || []).filter((_: any, i: number) => i !== idx));
  };


  return (
    <div className={`border rounded-lg overflow-hidden ${section.isVisible ? 'border-gray-200' : 'border-yellow-300 bg-yellow-50/30'}`}>
      {/* Header row */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-bold text-gray-400 w-6 shrink-0">{index + 1}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{schema.label}</span>
              {section.title && (
                <span className="text-sm text-gray-500 truncate max-w-xs">{section.title}</span>
              )}
              {!section.isVisible && <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full shrink-0">Hidden</span>}
            </div>
            {schema.hint && (
              <p className="text-xs text-gray-400 mt-0.5">{schema.hint}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={isFirst} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={isLast} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:bg-red-100 rounded text-red-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="p-5 space-y-5 border-t border-gray-200">

          {/* Visibility toggle — always shown */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id={`vis-${index}`} checked={section.isVisible !== false}
              onChange={(e) => update('isVisible', e.target.checked)} className="rounded border-gray-300" />
            <label htmlFor={`vis-${index}`} className="text-sm font-medium">Visible on page</label>
          </div>

          {/* Section-level title */}
          {schema.showTitle && !schema.isHeroImages && (
            <div>
              <label className="block text-sm font-medium mb-1">{schema.titleLabel || 'Title'}</label>
              <input type="text" value={section.title || ''} onChange={(e) => update('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
          )}

          {/* Description */}
          {schema.showDescription && !schema.isHeroImages && (
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={section.description || ''} onChange={(e) => update('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
          )}

          {/* Hero per-slide editor — replaces global title/description/links + image grid */}
          {schema.isHeroImages && (
            <HeroPerSlideEditor section={section} onChange={onChange} />
          )}

          {/* Image (single, for non-hero sections) */}
          {schema.showImage && !schema.isHeroImages && (
            <ImageUploader value={section.image || ''} onChange={(url) => update('image', url)} label="Image" hint="1200×600px (2:1 landscape, JPG/WEBP)" />
          )}

          {/* Primary link */}
          {schema.showLink && !schema.isHeroImages && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Button URL</label>
                <input type="text" value={section.link || ''} onChange={(e) => update('link', e.target.value)}
                  placeholder="/contact"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Button Label</label>
                <input type="text" value={section.linkText || ''} onChange={(e) => update('linkText', e.target.value)}
                  placeholder="Learn More"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            </div>
          )}

          {/* Secondary link */}
          {schema.showSecondaryLink && !schema.isHeroImages && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Second Button URL</label>
                <input type="text" value={section.secondaryLink || ''} onChange={(e) => update('secondaryLink', e.target.value)}
                  placeholder="/about"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Second Button Label</label>
                <input type="text" value={section.secondaryLinkText || ''} onChange={(e) => update('secondaryLinkText', e.target.value)}
                  placeholder="Request a Quote"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            </div>
          )}

          {/* Button colours — shown for any section that has at least one link */}
          {(schema.showLink || schema.showSecondaryLink) && !schema.isHeroImages && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 mb-3">🎨 Button Colors</p>
              <div className="grid grid-cols-2 gap-3">
                {schema.showLink && (
                  <>
                    <ColorSwatch label="Primary Button Bg" value={section.primaryButtonBg || ''} onChange={(v) => update('primaryButtonBg', v)} />
                    <ColorSwatch label="Primary Button Text" value={section.primaryButtonTextColor || ''} onChange={(v) => update('primaryButtonTextColor', v)} />
                  </>
                )}
                {schema.showSecondaryLink && (
                  <>
                    <ColorSwatch label="Secondary Button Bg" value={section.secondaryButtonBg || ''} onChange={(v) => update('secondaryButtonBg', v)} />
                    <ColorSwatch label="Secondary Button Text" value={section.secondaryButtonTextColor || ''} onChange={(v) => update('secondaryButtonTextColor', v)} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Items — Slider gets nested Tabs→Cards UI, everything else gets flat list */}
          {!schema.noItems && !schema.isHeroImages && schema.isSlider && (
            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">
                Tabs &amp; Cards ({(section.items || []).length} card{(section.items || []).length !== 1 ? 's' : ''} total)
              </h4>
              <SliderTabsEditor
                items={section.items || []}
                onChange={(items) => update('items', items)}
              />
            </div>
          )}
          {!schema.noItems && !schema.isHeroImages && !schema.isSlider && (
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-sm text-gray-700">
                  {schema.itemLabel || 'Item'}s ({(section.items || []).length})
                </h4>
                <button onClick={addItem}
                  className="px-3 py-1.5 text-sm bg-accent text-white rounded-md hover:bg-secondary transition-colors">
                  + Add {schema.itemLabel || 'Item'}
                </button>
              </div>
              {(section.items || []).length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-lg">
                  No {(schema.itemLabel || 'item').toLowerCase()}s yet — click the button above to add one.
                </p>
              )}
              <div className="space-y-3">
                {(section.items || []).map((item: any, idx: number) => (
                  <SectionItemEditor
                    key={idx}
                    item={item}
                    index={idx}
                    fields={schema.itemFields}
                    itemLabel={schema.itemLabel}
                    onChange={(updated: any) => updateItem(idx, updated)}
                    onRemove={() => removeItem(idx)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPageEditorPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { status, isAdmin } = useAuthState();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/sign-in'); return; }
    if (status === 'authenticated' && !isAdmin) { router.push('/'); return; }
    if (status === 'authenticated' && isAdmin) fetchPage();
  }, [status, isAdmin, router, slug]);

  const fetchPage = async () => {
    try {
      const data = await getPageContentAdmin(slug);
      const pageData = data.data;
      // For the business page, auto-populate any missing sections so the admin
      // always sees all editable sections without manual setup.
      if (slug === 'business' && pageData) {
        const existing: any[] = pageData.sections || [];
        const existingIds = new Set(existing.map((s: any) => s.sectionId));
        const missing = BUSINESS_REQUIRED_SECTIONS.filter((s) => !existingIds.has(s.sectionId));
        if (missing.length > 0) {
          pageData.sections = [
            ...existing,
            ...missing.map((s, i) => ({ ...s, order: existing.length + i })),
          ];
        }
      }
      if (slug === 'shop-fittings' && pageData) {
        const existing: any[] = pageData.sections || [];
        const existingIds = new Set(existing.map((s: any) => s.sectionId));
        const missing = SHOP_FITTINGS_REQUIRED_SECTIONS.filter((s) => !existingIds.has(s.sectionId));
        if (missing.length > 0) {
          pageData.sections = [
            ...existing,
            ...missing.map((s, i) => ({ ...s, order: existing.length + i })),
          ];
        }
      }
      setPage(pageData);
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!page) return;
    setSaving(true);
    try {
      await updatePageContent(slug, {
        title: page.title,
        description: page.description,
        isPublished: page.isPublished,
        sections: page.sections
      });
      setHasChanges(false);
      alert('Page saved successfully!');
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Failed to save page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updatePage = useCallback((field: string, value: any) => {
    setPage((prev: any) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const updateSection = useCallback((index: number, section: any) => {
    setPage((prev: any) => {
      const sections = [...prev.sections];
      sections[index] = section;
      return { ...prev, sections };
    });
    setHasChanges(true);
  }, []);

  const handleDeleteSection = useCallback((index: number) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    setPage((prev: any) => ({
      ...prev,
      sections: prev.sections.filter((_: any, i: number) => i !== index)
    }));
    setHasChanges(true);
  }, []);

  const moveSection = useCallback((index: number, direction: 'up' | 'down') => {
    setPage((prev: any) => {
      const sections = [...prev.sections];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= sections.length) return prev;
      [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
      // Update order values
      sections.forEach((s: any, i: number) => { s.order = i; });
      return { ...prev, sections };
    });
    setHasChanges(true);
  }, []);

  const addNewSection = useCallback(() => {
    setPage((prev: any) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          sectionId: `section-${Date.now()}`,
          type: 'content',
          title: 'New Section',
          subtitle: '',
          description: '',
          image: '',
          imageAlt: '',
          bgColor: 'white',
          items: [],
          content: '',
          link: '',
          linkText: '',
          secondaryLink: '',
          secondaryLinkText: '',
          order: prev.sections.length,
          isVisible: true
        }
      ]
    }));
    setHasChanges(true);
  }, []);

  if (status === 'loading' || (status === 'authenticated' && isAdmin && loading)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === 'unauthenticated' || !isAdmin) return null;

  if (!page) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <p className="text-neutral-dark mb-6">The page &quot;{slug}&quot; was not found. Make sure you&apos;ve run the seed script.</p>
          <Link href="/admin/pages" className="text-accent hover:underline">Back to Manage Pages</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Bar */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/pages" className="text-neutral-dark hover:text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Edit: {page.title}</h1>
              <p className="text-sm text-neutral-dark">/{page.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${page.slug}`} target="_blank" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm transition-colors">
              Preview
            </Link>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${
                hasChanges
                  ? 'btn-primary'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
            </button>
          </div>
        </div>

        {/* Page Settings */}
        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Page Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Page Title</label>
              <input
                type="text"
                value={page.title || ''}
                onChange={(e) => updatePage('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={page.description || ''}
                onChange={(e) => updatePage('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={page.isPublished !== false}
              onChange={(e) => updatePage('isPublished', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="published" className="text-sm font-medium">Published</label>
          </div>
        </div>

        {/* Sections */}
        <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
          <h2 className="text-lg font-bold">Sections ({page.sections?.length || 0})</h2>
          <div className="flex gap-2">
            <button
              onClick={addNewSection}
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary text-sm font-semibold transition-colors"
            >
              + Add Section
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {(page.sections || []).map((section: any, index: number) => (
            <SectionEditor
              key={section._id || section.sectionId || index}
              section={section}
              index={index}
              onChange={(updated: any) => updateSection(index, updated)}
              onDelete={() => handleDeleteSection(index)}
              onMoveUp={() => moveSection(index, 'up')}
              onMoveDown={() => moveSection(index, 'down')}
              isFirst={index === 0}
              isLast={index === (page.sections || []).length - 1}
            />
          ))}
        </div>

        {(page.sections || []).length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Sections</h3>
            <p className="text-gray-500 mb-4">Add sections to build your page content.</p>
            <button
              onClick={addNewSection}
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary text-sm font-semibold transition-colors"
            >
              + Add First Section
            </button>
          </div>
        )}

        {/* Bottom Save */}
        {hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 shadow-lg z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <p className="text-sm text-neutral-dark">You have unsaved changes</p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-accent text-white rounded-md hover:bg-secondary text-sm font-semibold transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

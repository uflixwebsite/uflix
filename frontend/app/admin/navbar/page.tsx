'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthState } from '@/hooks/useAuthState';
import { getNavbarConfig, getNavbarSettingsAdmin, updateNavbarSettings } from '@/services/navbarService';

interface NavLink {
  _id?: string;
  label: string;
  url: string;
  enabled: boolean;
  order: number;
}

interface NavConfig {
  _id?: string;
  path: string;
  enabled: boolean;
  order: number;
  links: NavLink[];
}

interface NavbarSettings {
  configs: NavConfig[];
}

interface PageOption {
  value: string;
  label: string;
}

const pageOptions: PageOption[] = [
  { value: '*', label: 'Default links / all pages' },
  { value: '/', label: 'Home' },
  { value: '/shop', label: 'Shop' },
  { value: '/products', label: 'Products' },
  { value: '/categories', label: 'Categories' },
  { value: '/business', label: 'Main Business Page' },
  { value: '/business/workspace', label: 'Business Workspace Page' },
  { value: '/business/healthcare', label: 'Business Healthcare Page' },
  { value: '/business/education', label: 'Business Education Page' },
  { value: '/steel-fabrication-delhi-ncr', label: 'Steel Fabrication Canonical Page' },
  { value: '/msfabrication-delhi-ncr', label: 'MS Fabrication Page' },
  { value: '/laser-sheet-cutting-delhi-ncr', label: 'Laser Sheet Cutting Page' },
  { value: '/powder-coating-delhi-ncr', label: 'Powder Coating Page' },
  { value: '/laser-pipe-cutting-delhi-ncr', label: 'Laser Pipe Cutting Page' },
  { value: '/shop-fittings/metal-sheet', label: 'Metal Sheet Page' },
  { value: '/contact', label: 'Contact' },
  { value: '/about', label: 'About' },
  { value: '/projects', label: 'Projects' },
];

const defaultLinks: NavLink[] = [
  { label: 'All Products', url: '/shop', enabled: true, order: 0 },
  { label: 'Categories', url: '/categories', enabled: true, order: 1 },
  { label: 'Projects', url: '/projects', enabled: true, order: 2 },
  { label: 'For Business', url: '/business', enabled: true, order: 3 },
  { label: 'Contact', url: '/contact', enabled: true, order: 4 },
];

const defaultSettings: NavbarSettings = {
  configs: [
    {
      path: '*',
      enabled: true,
      order: 0,
      links: defaultLinks,
    },
  ],
};

const getPageLabel = (value: string) => pageOptions.find((option) => option.value === value)?.label || value;

const cloneLinks = (links: any[] = []) =>
  links.map((link, index) => ({
    _id: link?._id,
    label: link?.label || '',
    url: link?.url || '',
    enabled: link?.enabled !== false,
    order: typeof link?.order === 'number' ? link.order : index,
  }));

const buildDraftConfig = (path: string, config: any = null): NavConfig => {
  const sourceLinks = Array.isArray(config?.links) && config.links.length ? config.links : defaultLinks;

  return {
    _id: config?._id,
    path,
    enabled: config?.enabled !== false,
    order: typeof config?.order === 'number' ? config.order : 0,
    links: cloneLinks(sourceLinks),
  };
};

export default function AdminNavbarPage() {
  const router = useRouter();
  const { status, isAdmin } = useAuthState();
  const [loading, setLoading] = useState(true);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NavbarSettings>(defaultSettings);
  const [selectedPath, setSelectedPath] = useState<string>('*');
  const [draftConfig, setDraftConfig] = useState<NavConfig>(defaultSettings.configs[0]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/sign-in');
      return;
    }
    if (status === 'authenticated' && !isAdmin) {
      router.push('/');
      return;
    }
    if (status === 'authenticated' && isAdmin) {
      fetchSettings();
    }
  }, [status, isAdmin, router]);

  const fetchSettings = async () => {
    try {
      const res = await getNavbarSettingsAdmin();
      const nextSettings = res?.data?.configs?.length ? { configs: res.data.configs } : defaultSettings;
      setSettings(nextSettings);
      setDraftConfig(
        buildDraftConfig(
          '*',
          nextSettings.configs.find((config: NavConfig) => config.path === '*') || nextSettings.configs[0]
        )
      );
    } catch (e) {
      setSettings(defaultSettings);
      setDraftConfig(buildDraftConfig('*', defaultSettings.configs[0]));
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = pageOptions.filter((option) => {
    const haystack = `${option.label} ${option.value}`.toLowerCase();
    return haystack.includes(searchTerm.trim().toLowerCase());
  });

  const loadNavbarLinks = async (path: string) => {
    setSelectedPath(path);
    setLoadingLinks(true);

    try {
      const res = await getNavbarConfig(path);
      const config = res?.data?.configs?.[0];
      setDraftConfig(buildDraftConfig(path, config));
    } catch (e) {
      setDraftConfig(buildDraftConfig(path, settings.configs.find((config) => config.path === path) || settings.configs[0] || defaultSettings.configs[0]));
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const nextConfig: NavConfig = {
        ...draftConfig,
        path: selectedPath,
        links: cloneLinks(draftConfig.links).map((link, index) => ({
          ...link,
          order: index,
        })),
      };

      const nextConfigs = settings.configs.some((config) => config.path === selectedPath)
        ? settings.configs.map((config) => (config.path === selectedPath ? nextConfig : config))
        : [...settings.configs, nextConfig];

      const nextSettings = { configs: nextConfigs };
      await updateNavbarSettings(nextSettings);
      setSettings(nextSettings);
      setDraftConfig(nextConfig);
      alert('Navbar saved successfully!');
    } catch (e) {
      alert('Failed to save navbar settings');
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    setDraftConfig((prev) => ({
      ...prev,
      links: [...prev.links, { label: '', url: '', enabled: true, order: prev.links.length }],
    }));
  };

  const removeLink = (linkIndex: number) => {
    setDraftConfig((prev) => ({
      ...prev,
      links: prev.links.filter((_, index) => index !== linkIndex),
    }));
  };

  const updateLink = (linkIndex: number, field: keyof NavLink, value: any) => {
    setDraftConfig((prev) => ({
      ...prev,
      links: prev.links.map((link, index) =>
        index === linkIndex ? { ...link, [field]: value } : link
      ),
    }));
  };

  const updateDraftConfig = (field: keyof NavConfig, value: any) => {
    setDraftConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === 'unauthenticated' || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Navbar Links</h1>
            <p className="text-neutral-dark mt-2">Search a page, load its navbar links, and edit them directly.</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/mega-menu"
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
            >
              Manage Mega Menus
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search page</label>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search a page, like steel, business, /steel-fabrication-delhi-ncr/laser-sheet-cutting"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-xs text-neutral-dark mt-2">
              Pick a page below to load its navbar links. Use the default entry to edit the global fallback.
            </p>

            <div className="mt-4 border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Pages</p>
                <p className="text-xs text-neutral-dark">{filteredPages.length} shown</p>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {filteredPages.length === 0 ? (
                  <div className="p-6 text-sm text-gray-500">No pages match your search.</div>
                ) : (
                  filteredPages.map((page) => {
                    const isSelected = page.value === selectedPath;
                    return (
                      <button
                        key={page.value}
                        type="button"
                        onClick={() => loadNavbarLinks(page.value)}
                        className={`w-full text-left px-4 py-3 transition-colors ${
                          isSelected ? 'bg-accent/10' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-medium text-gray-900">{page.label}</div>
                            <div className="text-xs text-neutral-dark mt-1">{page.value}</div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${isSelected ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'}`}>
                            Load links
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold">Editing: {getPageLabel(selectedPath)}</h2>
                <p className="text-sm text-neutral-dark mt-1">{selectedPath}</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={draftConfig.enabled}
                    onChange={(e) => updateDraftConfig('enabled', e.target.checked)}
                    className="h-4 w-4"
                  />
                  Enabled
                </label>

                <button
                  onClick={handleSave}
                  disabled={saving || loadingLinks}
                  className="px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : loadingLinks ? 'Loading...' : 'Save links'}
                </button>
              </div>
            </div>

            <div className="mb-4 text-sm text-neutral-dark">
              {loadingLinks ? 'Loading navbar links for this page...' : 'Edit the links below and save them for this page.'}
            </div>

            {draftConfig.links.length === 0 ? (
              <div className="text-sm text-gray-500">No links added yet.</div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-xs font-medium text-gray-700 border-b border-gray-200 pb-2 mb-2">
                  <div className="md:col-span-2">Label</div>
                  <div className="md:col-span-2">URL</div>
                  <div className="md:col-span-1 text-right">Actions</div>
                </div>

                {draftConfig.links
                  .slice()
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((link, index) => (
                    <div key={`${selectedPath}-${index}`} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                      <div className="md:col-span-2">
                        <input
                          value={link.label}
                          onChange={(e) => updateLink(index, 'label', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                          placeholder="Label"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          value={link.url}
                          onChange={(e) => updateLink(index, 'url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                          placeholder="/contact"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-center justify-end gap-2">
                        <label className="inline-flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={link.enabled}
                            onChange={(e) => updateLink(index, 'enabled', e.target.checked)}
                            className="h-4 w-4"
                          />
                          Enabled
                        </label>
                        <button
                          onClick={() => removeLink(index)}
                          className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="mt-6 flex justify-start">
              <button
                onClick={addLink}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

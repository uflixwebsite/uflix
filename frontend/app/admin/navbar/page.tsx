'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthState } from '@/hooks/useAuthState';
import { getNavbarSettingsAdmin, updateNavbarSettings } from '@/services/navbarService';

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

const defaultSettings: NavbarSettings = {
  configs: [
    {
      path: '*',
      enabled: true,
      order: 0,
      links: [
        { label: 'All Products', url: '/shop', enabled: true, order: 0 },
        { label: 'Categories', url: '/categories', enabled: true, order: 1 },
        { label: 'Projects', url: '/projects', enabled: true, order: 2 },
        { label: 'For Business', url: '/business', enabled: true, order: 3 },
        { label: 'Contact', url: '/contact', enabled: true, order: 4 },
      ],
    },
  ],
};

export default function AdminNavbarPage() {
  const router = useRouter();
  const { status, isAdmin } = useAuthState();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NavbarSettings>(defaultSettings);
  const [selectedPath, setSelectedPath] = useState<string>('*');

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
      if (res?.data?.configs?.length) {
        setSettings({ configs: res.data.configs });
      }
    } catch (e) {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasSelected = settings.configs.some((c) => c.path === selectedPath);
    if (!hasSelected) {
      const fallback = settings.configs.find((c) => c.path === '*');
      setSelectedPath(fallback?.path || (settings.configs[0]?.path ?? '*'));
    }
  }, [settings.configs, selectedPath]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateNavbarSettings(settings);
      alert('Navbar saved successfully!');
    } catch (e) {
      alert('Failed to save navbar settings');
    } finally {
      setSaving(false);
    }
  };

  const addConfig = () => {
    setSettings((prev) => ({
      configs: [
        ...prev.configs,
        {
          path: '/new-page',
          enabled: true,
          order: prev.configs.length,
          links: [],
        },
      ],
    }));
    setSelectedPath('/new-page');
  };

  const ensureConfigAndSelect = (path: string) => {
    setSettings((prev) => {
      const exists = prev.configs.some((c) => c.path === path);
      if (exists) return prev;
      return {
        configs: [
          ...prev.configs,
          {
            path,
            enabled: true,
            order: prev.configs.length,
            links: [],
          },
        ],
      };
    });
    setSelectedPath(path);
  };

  const removeConfig = (index: number) => {
    setSettings((prev) => ({
      configs: prev.configs.filter((_, i) => i !== index),
    }));
  };

  const selectedIndex = settings.configs.findIndex((c) => c.path === selectedPath);
  const selectedConfig = selectedIndex >= 0 ? settings.configs[selectedIndex] : null;

  const updateConfig = (index: number, field: keyof NavConfig, value: any) => {
    setSettings((prev) => ({
      configs: prev.configs.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    }));
  };

  const addLink = (configIndex: number) => {
    setSettings((prev) => ({
      configs: prev.configs.map((c, i) =>
        i === configIndex
          ? {
              ...c,
              links: [
                ...c.links,
                { label: '', url: '', enabled: true, order: c.links.length },
              ],
            }
          : c
      ),
    }));
  };

  const removeLink = (configIndex: number, linkIndex: number) => {
    setSettings((prev) => ({
      configs: prev.configs.map((c, i) =>
        i === configIndex
          ? { ...c, links: c.links.filter((_, li) => li !== linkIndex) }
          : c
      ),
    }));
  };

  const updateLink = (
    configIndex: number,
    linkIndex: number,
    field: keyof NavLink,
    value: any
  ) => {
    setSettings((prev) => ({
      configs: prev.configs.map((c, i) =>
        i === configIndex
          ? {
              ...c,
              links: c.links.map((l, li) =>
                li === linkIndex ? { ...l, [field]: value } : l
              ),
            }
          : c
      ),
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
            <h1 className="text-3xl font-bold">Navbar Settings</h1>
            <p className="text-neutral-dark mt-2">Manage basic navigation links. For mega menus, use "Manage Mega Menus" button.</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/mega-menu"
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
            >
              Manage Mega Menus
            </Link>
            <button
              onClick={addConfig}
              className="px-4 py-2 border border-accent text-accent rounded-md hover:bg-accent hover:text-white transition-colors"
            >
              Add Page Config
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Choose Page / Type</label>
              <select
                value={selectedPath}
                onChange={(e) => setSelectedPath(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {settings.configs
                  .slice()
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((c, i) => (
                    <option key={`${c.path}-${i}`} value={c.path}>
                      {c.path}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-neutral-dark mt-2">
                Use <span className="font-medium">*</span> for default, or patterns like <span className="font-medium">/category/*</span>.
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('*')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Default (*)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Home (/)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/shop')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Shop (/shop)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/products')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Products (/products)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/category/*')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Category Pages (/category/*)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/product/*')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Product Pages (/product/*)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/business')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Business (/business)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/business/*')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Business Pages (/business/*)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/contact')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Contact (/contact)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/about')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  About (/about)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/projects')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Projects (/projects)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/cart')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cart (/cart)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/checkout')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Checkout (/checkout)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/orders')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Orders (/orders)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/profile')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Profile (/profile)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/quality')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Quality (/quality)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/sustainability')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Sustainability (/sustainability)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/terms')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Terms (/terms)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/privacy')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Privacy (/privacy)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/refund')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Refund (/refund)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/industries')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Industries (/industries)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/shops')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Shops (/shops)
                </button>
                <button
                  type="button"
                  onClick={() => ensureConfigAndSelect('/shop-fittings')}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Shop Fittings (/shop-fittings)
                </button>
              </div>
            </div>

            <div className="flex gap-2 md:justify-end">
              <button
                onClick={addConfig}
                className="px-4 py-2 border border-accent text-accent rounded-md hover:bg-accent hover:text-white transition-colors"
              >
                Add Page Config
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {selectedConfig ? (
            <div className="bg-white rounded-lg border border-border p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Path</label>
                    <input
                      value={selectedConfig.path}
                      onChange={(e) => updateConfig(selectedIndex, 'path', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="* or /business or /category/*"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      value={selectedConfig.order}
                      onChange={(e) => updateConfig(selectedIndex, 'order', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedConfig.enabled}
                        onChange={(e) => updateConfig(selectedIndex, 'enabled', e.target.checked)}
                        className="h-4 w-4"
                      />
                      Enabled
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => addLink(selectedIndex)}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Add Link
                  </button>
                  <button
                    onClick={() => removeConfig(selectedIndex)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    disabled={settings.configs.length === 1}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {selectedConfig.links.length === 0 ? (
                <div className="text-sm text-gray-500">No links added yet.</div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-xs font-medium text-gray-700 border-b border-gray-200 pb-2 mb-2">
                    <div className="md:col-span-2">Label</div>
                    <div className="md:col-span-2">URL</div>
                    <div className="md:col-span-1 text-right">Actions</div>
                  </div>
                  {selectedConfig.links
                    .slice()
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((link) => {
                      const realIndex = selectedConfig.links.indexOf(link);
                      return (
                        <div
                          key={`${selectedIndex}-${realIndex}`}
                          className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center"
                        >
                          <div className="md:col-span-2">
                            <input
                              value={link.label}
                              onChange={(e) => updateLink(selectedIndex, realIndex, 'label', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                              placeholder="Label"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <input
                              value={link.url}
                              onChange={(e) => updateLink(selectedIndex, realIndex, 'url', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                              placeholder="/contact"
                            />
                          </div>
                          <div className="md:col-span-1 flex items-center justify-end gap-2">
                            <label className="inline-flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={link.enabled}
                                onChange={(e) => updateLink(selectedIndex, realIndex, 'enabled', e.target.checked)}
                                className="h-4 w-4"
                              />
                              Enabled
                            </label>
                            <button
                              onClick={() => removeLink(selectedIndex, realIndex)}
                              className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-border p-6 text-sm text-gray-600">
              No config selected.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

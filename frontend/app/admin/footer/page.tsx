'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getFooterSettings, updateFooterSettings } from '@/services/footerService';
import { useAuthState } from '@/hooks/useAuthState';

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
  type: 'address' | 'phone' | 'email' | 'custom';
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

const SOCIAL_PLATFORMS = ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'pinterest', 'tiktok', 'whatsapp'];

export default function AdminFooterPage() {
  const router = useRouter();
  const { status, isAdmin } = useAuthState();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'brand' | 'links' | 'contact' | 'social' | 'bottom'>('brand');
  const [footer, setFooter] = useState<FooterData>({
    brandName: 'UFLIX',
    brandDescription: '',
    socialLinks: [],
    linkColumns: [],
    contactTitle: 'Contact',
    contactItems: [],
    copyrightText: '© 2026 Uflix. All rights reserved.',
    bottomLinks: []
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/sign-in'); return; }
    if (status === 'authenticated' && !isAdmin) { router.push('/'); return; }
    if (status === 'authenticated' && isAdmin) fetchFooter();
  }, [status, isAdmin, router]);

  const fetchFooter = async () => {
    try {
      const res = await getFooterSettings();
      if (res.data) {
        setFooter({
          brandName: res.data.brandName || 'UFLIX',
          brandDescription: res.data.brandDescription || '',
          socialLinks: res.data.socialLinks || [],
          linkColumns: res.data.linkColumns || [],
          contactTitle: res.data.contactTitle || 'Contact',
          contactItems: res.data.contactItems || [],
          copyrightText: res.data.copyrightText || '',
          bottomLinks: res.data.bottomLinks || []
        });
      }
    } catch (error) {
      console.error('Error fetching footer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateFooterSettings(footer);
      alert('Footer settings saved successfully!');
    } catch (error) {
      console.error('Error saving footer:', error);
      alert('Error saving footer settings');
    } finally {
      setSaving(false);
    }
  };

  // Social links helpers
  const addSocialLink = () => {
    setFooter(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: 'instagram', url: '', enabled: true }]
    }));
  };

  const removeSocialLink = (index: number) => {
    setFooter(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const updateSocialLink = (index: number, field: string, value: any) => {
    setFooter(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => i === index ? { ...link, [field]: value } : link)
    }));
  };

  // Link column helpers
  const addLinkColumn = () => {
    setFooter(prev => ({
      ...prev,
      linkColumns: [...prev.linkColumns, { title: 'New Column', links: [], enabled: true, order: prev.linkColumns.length }]
    }));
  };

  const removeLinkColumn = (index: number) => {
    setFooter(prev => ({
      ...prev,
      linkColumns: prev.linkColumns.filter((_, i) => i !== index)
    }));
  };

  const updateLinkColumn = (index: number, field: string, value: any) => {
    setFooter(prev => ({
      ...prev,
      linkColumns: prev.linkColumns.map((col, i) => i === index ? { ...col, [field]: value } : col)
    }));
  };

  const addLinkToColumn = (colIndex: number) => {
    setFooter(prev => ({
      ...prev,
      linkColumns: prev.linkColumns.map((col, i) =>
        i === colIndex ? { ...col, links: [...col.links, { label: '', url: '', enabled: true }] } : col
      )
    }));
  };

  const removeLinkFromColumn = (colIndex: number, linkIndex: number) => {
    setFooter(prev => ({
      ...prev,
      linkColumns: prev.linkColumns.map((col, i) =>
        i === colIndex ? { ...col, links: col.links.filter((_, li) => li !== linkIndex) } : col
      )
    }));
  };

  const updateLinkInColumn = (colIndex: number, linkIndex: number, field: string, value: any) => {
    setFooter(prev => ({
      ...prev,
      linkColumns: prev.linkColumns.map((col, i) =>
        i === colIndex ? {
          ...col,
          links: col.links.map((link, li) => li === linkIndex ? { ...link, [field]: value } : link)
        } : col
      )
    }));
  };

  // Contact items helpers
  const addContactItem = () => {
    setFooter(prev => ({
      ...prev,
      contactItems: [...prev.contactItems, { type: 'custom', label: '', value: '', enabled: true }]
    }));
  };

  const removeContactItem = (index: number) => {
    setFooter(prev => ({
      ...prev,
      contactItems: prev.contactItems.filter((_, i) => i !== index)
    }));
  };

  const updateContactItem = (index: number, field: string, value: any) => {
    setFooter(prev => ({
      ...prev,
      contactItems: prev.contactItems.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  // Bottom links helpers
  const addBottomLink = () => {
    setFooter(prev => ({
      ...prev,
      bottomLinks: [...prev.bottomLinks, { label: '', url: '', enabled: true }]
    }));
  };

  const removeBottomLink = (index: number) => {
    setFooter(prev => ({
      ...prev,
      bottomLinks: prev.bottomLinks.filter((_, i) => i !== index)
    }));
  };

  const updateBottomLink = (index: number, field: string, value: any) => {
    setFooter(prev => ({
      ...prev,
      bottomLinks: prev.bottomLinks.map((link, i) => i === index ? { ...link, [field]: value } : link)
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === 'unauthenticated' || !isAdmin) return null;

  const tabs = [
    { key: 'brand', label: 'Brand & Description' },
    { key: 'social', label: 'Social Media' },
    { key: 'links', label: 'Link Columns' },
    { key: 'contact', label: 'Contact Info' },
    { key: 'bottom', label: 'Bottom Bar' }
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin" className="text-accent hover:text-secondary text-sm mb-2 inline-block">&larr; Back to Dashboard</Link>
            <h1 className="text-3xl font-bold">Footer Settings</h1>
            <p className="text-neutral-dark mt-1">Manage footer content, links, social media, and contact information</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-accent text-white rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-accent shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Brand Tab */}
        {activeTab === 'brand' && (
          <div className="bg-white rounded-lg border border-border p-6 space-y-6">
            <h2 className="text-xl font-bold">Brand Section</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Brand Name</label>
              <input
                type="text"
                value={footer.brandName}
                onChange={e => setFooter(prev => ({ ...prev, brandName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Brand Description</label>
              <textarea
                value={footer.brandDescription}
                onChange={e => setFooter(prev => ({ ...prev, brandDescription: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Copyright Text</label>
              <input
                type="text"
                value={footer.copyrightText}
                onChange={e => setFooter(prev => ({ ...prev, copyrightText: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div className="bg-white rounded-lg border border-border p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Social Media Links</h2>
              <button
                onClick={addSocialLink}
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary transition-colors text-sm"
              >
                + Add Social Link
              </button>
            </div>

            {footer.socialLinks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No social links added yet. Click &quot;Add Social Link&quot; to get started.</p>
            ) : (
              <div className="space-y-4">
                {footer.socialLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <select
                      value={link.platform}
                      onChange={e => updateSocialLink(index, 'platform', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent capitalize"
                    >
                      {SOCIAL_PLATFORMS.map(p => (
                        <option key={p} value={p} className="capitalize">{p}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={link.url}
                      onChange={e => updateSocialLink(index, 'url', e.target.value)}
                      placeholder="URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={link.enabled}
                        onChange={e => updateSocialLink(index, 'enabled', e.target.checked)}
                        className="rounded"
                      />
                      Visible
                    </label>
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Link Columns Tab */}
        {activeTab === 'links' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Navigation Link Columns</h2>
              <button
                onClick={addLinkColumn}
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary transition-colors text-sm"
              >
                + Add Column
              </button>
            </div>

            {footer.linkColumns.length === 0 ? (
              <div className="bg-white rounded-lg border border-border p-8 text-center">
                <p className="text-gray-500">No link columns added yet. Click &quot;Add Column&quot; to get started.</p>
              </div>
            ) : (
              footer.linkColumns.map((column, colIndex) => (
                <div key={colIndex} className="bg-white rounded-lg border border-border p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="text"
                      value={column.title}
                      onChange={e => updateLinkColumn(colIndex, 'title', e.target.value)}
                      className="text-lg font-bold px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Column Title"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={column.enabled}
                        onChange={e => updateLinkColumn(colIndex, 'enabled', e.target.checked)}
                        className="rounded"
                      />
                      Visible
                    </label>
                    <button
                      onClick={() => removeLinkColumn(colIndex)}
                      className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove Column"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {column.links.map((link, linkIndex) => (
                      <div key={linkIndex} className="flex items-center gap-3 pl-4">
                        <input
                          type="text"
                          value={link.label}
                          onChange={e => updateLinkInColumn(colIndex, linkIndex, 'label', e.target.value)}
                          placeholder="Link Label"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={e => updateLinkInColumn(colIndex, linkIndex, 'url', e.target.value)}
                          placeholder="/url-path"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                        />
                        <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={link.enabled}
                            onChange={e => updateLinkInColumn(colIndex, linkIndex, 'enabled', e.target.checked)}
                            className="rounded"
                          />
                          Visible
                        </label>
                        <button
                          onClick={() => removeLinkFromColumn(colIndex, linkIndex)}
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          title="Remove Link"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addLinkToColumn(colIndex)}
                    className="mt-4 ml-4 px-3 py-1 text-sm text-accent border border-accent rounded-md hover:bg-accent hover:text-white transition-colors"
                  >
                    + Add Link
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Contact Info Tab */}
        {activeTab === 'contact' && (
          <div className="bg-white rounded-lg border border-border p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Contact Information</h2>
              <button
                onClick={addContactItem}
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary transition-colors text-sm"
              >
                + Add Contact Item
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Section Title</label>
              <input
                type="text"
                value={footer.contactTitle}
                onChange={e => setFooter(prev => ({ ...prev, contactTitle: e.target.value }))}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {footer.contactItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No contact items added yet.</p>
            ) : (
              <div className="space-y-4">
                {footer.contactItems.map((item, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center gap-4">
                      <select
                        value={item.type}
                        onChange={e => updateContactItem(index, 'type', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="address">Address</option>
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                        <option value="custom">Custom</option>
                      </select>
                      <input
                        type="text"
                        value={item.label}
                        onChange={e => updateContactItem(index, 'label', e.target.value)}
                        placeholder="Label"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={e => updateContactItem(index, 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        Visible
                      </label>
                      <button
                        onClick={() => removeContactItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <textarea
                      value={item.value}
                      onChange={e => updateContactItem(index, 'value', e.target.value)}
                      placeholder="Value (use new lines for multiple entries)"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom Bar Tab */}
        {activeTab === 'bottom' && (
          <div className="bg-white rounded-lg border border-border p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Bottom Bar Links</h2>
              <button
                onClick={addBottomLink}
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary transition-colors text-sm"
              >
                + Add Link
              </button>
            </div>

            {footer.bottomLinks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bottom links added yet.</p>
            ) : (
              <div className="space-y-3">
                {footer.bottomLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <input
                      type="text"
                      value={link.label}
                      onChange={e => updateBottomLink(index, 'label', e.target.value)}
                      placeholder="Link Label"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={e => updateBottomLink(index, 'url', e.target.value)}
                      placeholder="/url-path"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={link.enabled}
                        onChange={e => updateBottomLink(index, 'enabled', e.target.checked)}
                        className="rounded"
                      />
                      Visible
                    </label>
                    <button
                      onClick={() => removeBottomLink(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save button at bottom */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-accent text-white rounded-md hover:bg-secondary transition-colors disabled:opacity-50 font-semibold"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllPages } from '@/services/pageService';
import { useAuthState } from '@/hooks/useAuthState';

export default function AdminPagesPage() {
  const router = useRouter();
  const { status, isAdmin } = useAuthState();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const resolvePreviewPath = (slug: string) =>
    slug === 'business-steel-metal'
      ? '/business/steel-fabrication-delhi-ncr'
      : `/${slug}`;

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/sign-in'); return; }
    if (status === 'authenticated' && !isAdmin) { router.push('/'); return; }
    if (status === 'authenticated' && isAdmin) fetchPages();
  }, [status, isAdmin, router]);

  const fetchPages = async () => {
    try {
      const data = await getAllPages();
      setPages(data.data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && isAdmin && loading)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Pages</h1>
            <p className="text-neutral-dark mt-1">Edit page content, images, and sections</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        <h2 className="text-lg font-semibold mb-4 text-gray-700">CMS Pages (from database)</h2>
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Page</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Slug</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Sections</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Last Updated</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{page.title}</p>
                      {page.description && (
                        <p className="text-sm text-neutral-dark mt-0.5 line-clamp-1">{page.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">/{page.slug}</code>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-accent/10 text-accent rounded-full text-sm font-semibold">
                      {page.sectionCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      page.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-dark">
                    {new Date(page.updatedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={resolvePreviewPath(page.slug)}
                        target="_blank"
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/pages/${page.slug}/edit`}
                        className="px-3 py-1.5 text-sm bg-accent text-white rounded-md hover:bg-secondary transition-colors"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pages.length === 0 && !loading && (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Pages Found</h3>
              <p className="text-gray-500 mb-4">Run the seed script to populate default page content.</p>
              <code className="text-sm bg-gray-100 px-4 py-2 rounded">node scripts/seedPages.js</code>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

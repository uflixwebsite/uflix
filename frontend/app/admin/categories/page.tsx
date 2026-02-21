'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCategoryTree, deleteCategory } from '@/services/categoryService';
import { useAuthState } from '@/hooks/useAuthState';

interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  order: number;
  parent?: string | null;
  children: CategoryNode[];
}

function CategoryRow({
  node,
  depth,
  onDelete,
}: {
  node: CategoryNode;
  depth: number;
  onDelete: (id: string, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="py-3 px-4">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 28}px` }}>
            {node.children.length > 0 ? (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 flex-shrink-0"
              >
                {expanded ? '▼' : '▶'}
              </button>
            ) : (
              <span className="w-5 h-5 flex-shrink-0" />
            )}
            {node.icon && <span className="text-lg">{node.icon}</span>}
            {node.image && (
              <img src={node.image} alt={node.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
            )}
            <span className="font-medium capitalize">{node.name}</span>
            {node.children.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full ml-1">
                {node.children.length} sub
              </span>
            )}
          </div>
        </td>
        <td className="py-3 px-4 text-sm text-gray-500 font-mono">{node.slug}</td>
        <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">
          {node.description || '—'}
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/categories/new?parentId=${node._id}&parentName=${encodeURIComponent(node.name)}`}
              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors whitespace-nowrap"
            >
              + Add Sub
            </Link>
            {depth > 0 && (
              <>
                <Link
                  href={`/admin/categories/${node._id}/edit`}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(node._id, node.name)}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
      {expanded &&
        node.children.map((child) => (
          <CategoryRow key={child._id} node={child} depth={depth + 1} onDelete={onDelete} />
        ))}
    </>
  );
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { status, isAdmin } = useAuthState();
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/sign-in'); return; }
    if (status === 'authenticated' && !isAdmin) { router.push('/'); return; }
    if (status === 'authenticated' && isAdmin) fetchTree();
  }, [status, isAdmin, router]);

  const fetchTree = async () => {
    setDataLoading(true);
    try {
      const res = await getCategoryTree();
      setTree(res.data || []);
    } catch (error) {
      console.error('Error fetching category tree:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Any sub-categories must be deleted first.`)) return;
    try {
      await deleteCategory(id);
      fetchTree();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  if (status === 'loading' || (status === 'authenticated' && isAdmin && dataLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded" />)}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === 'unauthenticated' || !isAdmin) return null;

  const countAll = (nodes: CategoryNode[]): number =>
    nodes.reduce((acc, n) => acc + 1 + countAll(n.children), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-gray-500 mt-1">
              {countAll(tree)} total · Unlimited nesting supported
            </p>
          </div>
          <p className="text-sm text-gray-400 italic">Top-level categories are fixed</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {tree.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-4xl mb-3">🗂️</div>
              <p className="font-medium">No categories yet</p>
              <p className="text-sm mt-2 text-gray-400">Top-level categories are seeded by the system.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Slug</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tree.map((node) => (
                  <CategoryRow key={node._id} node={node} depth={0} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6">
          <Link href="/admin" className="text-accent hover:text-accent/80">
            ← Back to Dashboard
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}


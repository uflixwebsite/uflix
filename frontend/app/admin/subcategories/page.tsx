'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCategoryTree, createCategory, updateCategory, deleteCategory } from '@/services/categoryService';
import { useAuthState } from '@/hooks/useAuthState';

const DEPTH_COLORS = [
  'border-l-accent',
  'border-l-blue-400',
  'border-l-green-400',
  'border-l-purple-400',
  'border-l-orange-400',
  'border-l-pink-400',
];
const DEPTH_BG = [
  'bg-white',
  'bg-blue-50/40',
  'bg-green-50/40',
  'bg-purple-50/40',
  'bg-orange-50/40',
  'bg-pink-50/40',
];
const DEPTH_LABELS = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6+'];

interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  parent?: string | null;
  children: CategoryNode[];
}

const toSlug = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

function TreeNode({
  node, depth, editingId, editName, addingToId, addDraftName, isSaving,
  onStartEdit, onCancelEdit, onSaveEdit, onEditNameChange,
  onStartAdd, onCancelAdd, onConfirmAdd, onAddDraftChange, onDelete,
}: {
  node: CategoryNode; depth: number; editingId: string | null; editName: string;
  addingToId: string | null; addDraftName: string; isSaving: boolean;
  onStartEdit: (node: CategoryNode) => void; onCancelEdit: () => void;
  onSaveEdit: (id: string) => void; onEditNameChange: (v: string) => void;
  onStartAdd: (id: string) => void; onCancelAdd: () => void;
  onConfirmAdd: (parentId: string) => void; onAddDraftChange: (v: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const colorIdx = Math.min(depth, DEPTH_COLORS.length - 1);
  const isEditing = editingId === node._id;
  const isAddingHere = addingToId === node._id;

  return (
    <div className={`border-l-4 ${DEPTH_COLORS[colorIdx]} ${DEPTH_BG[colorIdx]} rounded-r-lg mb-1`}>
      <div className="flex items-center gap-2 px-3 py-2.5 group">
        {node.children.length > 0 ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 shrink-0 text-xs"
            title={expanded ? 'Collapse' : 'Expand children'}
          >
            {expanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-5 h-5 shrink-0" />
        )}
        {isEditing ? (
          <input
            autoFocus
            value={editName}
            onChange={e => onEditNameChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') onSaveEdit(node._id);
              if (e.key === 'Escape') onCancelEdit();
            }}
            className="flex-1 px-2 py-1 border border-accent rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        ) : (
          <span className="flex-1 font-medium text-gray-800 capitalize text-sm">{node.name}</span>
        )}
        <span className="hidden sm:block text-[10px] text-gray-400 font-mono whitespace-nowrap">
          {DEPTH_LABELS[colorIdx]}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {isEditing ? (
            <>
              <button onClick={() => onSaveEdit(node._id)} className="px-2 py-1 bg-accent text-white text-xs rounded hover:bg-accent/90">Save</button>
              <button onClick={onCancelEdit} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200">Cancel</button>
            </>
          ) : (
            <>
              <button
                onClick={() => onStartAdd(node._id)}
                className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded hover:bg-green-100 whitespace-nowrap"
                title="Add a child under this item"
              >
                + Add child
              </button>
              <button onClick={() => onStartEdit(node)} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded hover:bg-blue-100">Rename</button>
              <button onClick={() => onDelete(node._id, node.name)} className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100">Delete</button>
            </>
          )}
        </div>
      </div>
      {isAddingHere && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-t border-gray-100">
          <span className="text-xs text-gray-400 whitespace-nowrap">Child of <strong>{node.name}</strong>:</span>
          <input
            autoFocus
            type="text"
            placeholder="New name…"
            value={addDraftName}
            onChange={e => onAddDraftChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') onConfirmAdd(node._id);
              if (e.key === 'Escape') onCancelAdd();
            }}
            className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
          <button
            onClick={() => onConfirmAdd(node._id)}
            className="px-3 py-1 bg-accent text-white text-xs rounded hover:bg-accent/90 disabled:opacity-50 whitespace-nowrap"
          >
            {isSaving ? 'Adding…' : '+ Add'}
          </button>
          <button onClick={onCancelAdd} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200">✕</button>
        </div>
      )}
      {expanded && node.children.length > 0 && (
        <div className="pl-4 pb-1 pt-0.5">
          {node.children.map(child => (
            <TreeNode
              key={child._id}
              node={child}
              depth={depth + 1}
              editingId={editingId}
              editName={editName}
              addingToId={addingToId}
              addDraftName={addDraftName}
              isSaving={isSaving}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onEditNameChange={onEditNameChange}
              onStartAdd={onStartAdd}
              onCancelAdd={onCancelAdd}
              onConfirmAdd={onConfirmAdd}
              onAddDraftChange={onAddDraftChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSubcategoriesPage() {
  const router = useRouter();
  const { status, isAdmin } = useAuthState();

  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [selectedRoot, setSelectedRoot] = useState<CategoryNode | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const [topAddName, setTopAddName] = useState('');
  const [topAdding, setTopAdding] = useState(false);

  const [addingToId, setAddingToId] = useState<string | null>(null);
  const [addDraftName, setAddDraftName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/sign-in'); return; }
    if (status === 'authenticated' && isAdmin) fetchTree();
  }, [status, isAdmin, router]);

  async function fetchTree() {
    setDataLoading(true);
    try {
      const res = await getCategoryTree();
      const data: CategoryNode[] = Array.isArray(res) ? res : (res?.data ?? []);
      setTree(data);
      setSelectedRoot(prev => {
        if (!prev) return data[0] ?? null;
        return data.find((r: CategoryNode) => r._id === prev._id) ?? data[0] ?? null;
      });
    } catch { /* silent */ }
    setDataLoading(false);
  }

  async function handleTopAdd() {
    const name = topAddName.trim();
    setTopAdding(true);
    try {
      await createCategory({ name, slug: toSlug(name), parent: selectedRoot?._id ?? null });
      setTopAddName('');
      await fetchTree();
    } catch (e: unknown) {
      alert((e as Error).message ?? 'Failed');
    }
    setTopAdding(false);
  }

  function handleStartAdd(id: string) {
    setAddingToId(id);
    setAddDraftName('');
    setEditingId(null);
  }

  function handleCancelAdd() { setAddingToId(null); setAddDraftName(''); }

  async function handleConfirmAdd(parentId: string) {
    const name = addDraftName.trim();
    setIsSaving(true);
    try {
      await createCategory({ name, slug: toSlug(name), parent: parentId });
      setAddingToId(null);
      setAddDraftName('');
      await fetchTree();
    } catch (e: unknown) {
      alert((e as Error).message ?? 'Failed');
    }
    setIsSaving(false);
  }

  function handleStartEdit(node: CategoryNode) {
    setEditingId(node._id);
    setEditName(node.name);
    setAddingToId(null);
  }

  function handleCancelEdit() { setEditingId(null); setEditName(''); }

  async function handleSaveEdit(id: string) {
    const name = editName.trim();
    setIsSaving(true);
    try {
      await updateCategory(id, { name, slug: toSlug(name) });
      setEditingId(null);
      await fetchTree();
    } catch (e: unknown) {
      alert((e as Error).message ?? 'Failed');
    }
    setIsSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    try {
      await deleteCategory(id);
      if (selectedRoot?._id === id) setSelectedRoot(null);
      await fetchTree();
    } catch (e: unknown) {
      alert((e as Error).message ?? 'Failed to delete');
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }


  const rootTabs = tree.filter(n => !n.parent);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-accent transition-colors">← Back to Dashboard</Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subcategories</h1>
            <p className="mt-1 text-sm text-gray-500">Expand any item and click <strong>+ Add child</strong> to nest as deep as you like.</p>
          </div>
        </div>

        {/* Root category tabs */}
        {rootTabs.length === 0 && !dataLoading ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No root categories yet. Create some in the Categories section first.</p>
            <Link href="/admin/categories" className="mt-4 inline-block text-accent hover:underline">Go to Categories →</Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {rootTabs.map(root => (
                <button
                  key={root._id}
                  onClick={() => setSelectedRoot(root)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    selectedRoot?._id === root._id
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent'
                  }`}
                >
                  {root.name}
                </button>
              ))}
            </div>

            {selectedRoot && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {selectedRoot.name}
                  <span className="ml-2 text-xs font-normal text-gray-400">(root category)</span>
                </h2>

                {dataLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
                  </div>
                ) : selectedRoot.children.length === 0 ? (
                  <p className="text-sm text-gray-400 mb-4">No subcategories yet. Add one below.</p>
                ) : (
                  <div className="space-y-1 mb-6">
                    {selectedRoot.children.map(child => (
                      <TreeNode
                        key={child._id}
                        node={child}
                        depth={0}
                        editingId={editingId}
                        editName={editName}
                        addingToId={addingToId}
                        addDraftName={addDraftName}
                        isSaving={isSaving}
                        onStartEdit={handleStartEdit}
                        onCancelEdit={handleCancelEdit}
                        onSaveEdit={handleSaveEdit}
                        onEditNameChange={setEditName}
                        onStartAdd={handleStartAdd}
                        onCancelAdd={handleCancelAdd}
                        onConfirmAdd={handleConfirmAdd}
                        onAddDraftChange={setAddDraftName}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}

                {/* Top-level add row */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <input
                    type="text"
                    placeholder={`Add direct child of ${selectedRoot.name}…`}
                    value={topAddName}
                    onChange={e => setTopAddName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleTopAdd(); }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  />
                  <button
                    onClick={handleTopAdd}
                    disabled={!topAddName.trim() || topAdding}
                    className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/90 disabled:opacity-50 whitespace-nowrap"
                  >
                    {topAdding ? 'Adding…' : '+ Add'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

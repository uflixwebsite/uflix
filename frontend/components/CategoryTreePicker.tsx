'use client';
import { useState } from 'react';

export interface CatNode {
  _id: string;
  name: string;
  slug: string;
  children: CatNode[];
}

/** Returns the path from tree root down to the node with targetId */
export function findPath(tree: CatNode[], targetId: string): CatNode[] {
  for (const node of tree) {
    if (node._id === targetId) return [node];
    const sub = findPath(node.children || [], targetId);
    if (sub.length) return [node, ...sub];
  }
  return [];
}

/** Flatten tree to a single array */
export function flattenTree(nodes: CatNode[]): CatNode[] {
  return nodes.flatMap(n => [n, ...flattenTree(n.children || [])]);
}

function TreeRow({
  node, depth, selectedIds, onToggle,
}: {
  node: CatNode; depth: number; selectedIds: string[]; onToggle: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const isSelected = selectedIds.includes(node._id);
  const hasChildren = (node.children || []).length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-1 py-1 rounded-md hover:bg-gray-50"
        style={{ paddingLeft: `${8 + depth * 18}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="w-4 h-4 text-gray-400 hover:text-gray-700 text-[10px] flex items-center justify-center shrink-0"
          >
            {expanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <button
          type="button"
          onClick={() => onToggle(node._id)}
          className="flex items-center gap-2 flex-1 text-left py-0.5"
        >
          <span
            className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
              isSelected ? 'bg-accent border-accent text-white' : 'border-gray-300 bg-white'
            }`}
          >
            {isSelected && (
              <svg viewBox="0 0 10 8" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4l2.5 2.5L9 1" />
              </svg>
            )}
          </span>
          <span className="text-sm text-gray-700 capitalize leading-snug">{node.name}</span>
        </button>
      </div>
      {expanded && hasChildren && (
        <div>
          {(node.children || []).map(child => (
            <TreeRow key={child._id} node={child} depth={depth + 1} selectedIds={selectedIds} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  tree: CatNode[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading?: boolean;
}

export default function CategoryTreePicker({ tree, selectedIds, onChange, loading }: Props) {
  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
  };

  return (
    <div>
      {/* Selected chips */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedIds.map(id => {
            const path = findPath(tree, id);
            const label = path.length > 0 ? path.map(n => n.name).join(' › ') : id;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent text-xs rounded-full border border-accent/20 capitalize"
              >
                {label}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="ml-0.5 text-accent/70 hover:text-accent font-bold leading-none"
                  aria-label={`Remove ${label}`}
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Tree */}
      <div className="border border-gray-300 rounded-md py-1 max-h-60 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-gray-400 px-3 py-2">Loading categories…</p>
        ) : tree.length === 0 ? (
          <p className="text-sm text-gray-400 px-3 py-2">No categories found.</p>
        ) : (
          tree.map(root => (
            <TreeRow key={root._id} node={root} depth={0} selectedIds={selectedIds} onToggle={toggle} />
          ))
        )}
      </div>

      <p className="text-xs text-gray-400 mt-1">
        Click ▶ to expand, then tick any item — you can select multiple at any depth (e.g. <em>Beds</em> and <em>King Sized Beds</em>).
      </p>
    </div>
  );
}

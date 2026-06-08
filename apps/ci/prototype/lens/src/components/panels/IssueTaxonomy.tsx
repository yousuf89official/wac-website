'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import SentimentBadge from '@/components/shared/SentimentBadge';
import type { IssueTaxonomyNode } from '@/types';

function TreeNode({ node, depth = 0 }: { node: IssueTaxonomyNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-lens-card-hover/30 cursor-pointer transition-colors ${
          depth === 0 ? 'text-sm font-semibold' : 'text-xs'
        }`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown size={12} className="text-lens-text-muted shrink-0" />
          ) : (
            <ChevronRight size={12} className="text-lens-text-muted shrink-0" />
          )
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className="text-lens-text flex-1">{node.label}</span>
        <SentimentBadge sentiment={node.sentiment} size="xs" />
        {node.count && (
          <span className="text-[10px] text-lens-text-muted ml-2">{node.count.toLocaleString()}</span>
        )}
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function IssueTaxonomy({ data }: { data: IssueTaxonomyNode[] }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-4">Issue Taxonomy</h3>
      <div className="max-h-[400px] overflow-y-auto">
        {data.map((node) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}

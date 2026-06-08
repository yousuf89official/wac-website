'use client';

import { useState } from 'react';
import { Check, Minus, X, SkipForward } from 'lucide-react';
import type { Mention } from '@/types';

export default function ReviewQueue({ data }: { data: Mention[] }) {
  const [items, setItems] = useState(
    data.slice(0, 6).map((m) => ({ ...m, reviewed: false, reviewSentiment: null as string | null }))
  );

  const unreviewedCount = items.filter((i) => !i.reviewed).length;

  const handleReview = (id: string, sentiment: string | null) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, reviewed: true, reviewSentiment: sentiment } : item
      )
    );
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-semibold text-lens-text">Human Review Queue</h3>
        <span className="text-xs text-lens-text-muted">{unreviewedCount} pending</span>
      </div>
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {items.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-lg border border-lens-border bg-lens-bg/50 ${
              m.reviewed ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-lens-text">{m.username}</span>
              <span className="text-[10px] text-lens-text-muted">{m.platform} · {m.time}</span>
            </div>
            <p className="text-xs text-lens-text-secondary mb-2 line-clamp-2">{m.content}</p>
            {!m.reviewed ? (
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleReview(m.id, 'positive')}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors"
                >
                  <Check size={10} /> Positive
                </button>
                <button
                  onClick={() => handleReview(m.id, 'neutral')}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-slate-500/15 text-slate-400 hover:bg-slate-500/25 transition-colors"
                >
                  <Minus size={10} /> Neutral
                </button>
                <button
                  onClick={() => handleReview(m.id, 'negative')}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                >
                  <X size={10} /> Negative
                </button>
                <button
                  onClick={() => handleReview(m.id, null)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-slate-800 text-lens-text-muted hover:bg-slate-700 transition-colors"
                >
                  <SkipForward size={10} /> Skip
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-lens-text-muted">
                Reviewed{m.reviewSentiment ? `: ${m.reviewSentiment}` : ' (skipped)'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

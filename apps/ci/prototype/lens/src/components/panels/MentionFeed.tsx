'use client';

import { useState, useMemo } from 'react';
import { MessageCircle, Heart, Share2 } from 'lucide-react';
import SentimentBadge from '@/components/shared/SentimentBadge';
import FilterDropdown from '@/components/shared/FilterDropdown';
import type { Mention } from '@/types';

const platformIcons: Record<string, string> = {
  Twitter: '𝕏',
  Instagram: '📸',
  TikTok: '♪',
  YouTube: '▶',
  Facebook: 'f',
  'Online News': '📰',
};

export default function MentionFeed({ data }: { data: Mention[] }) {
  const [platformFilter, setPlatformFilter] = useState('All');
  const [sentimentFilter, setSentimentFilter] = useState('All');

  const filtered = useMemo(() => {
    return data.filter((m) => {
      if (platformFilter !== 'All' && m.platform !== platformFilter) return false;
      if (sentimentFilter !== 'All' && m.sentiment !== sentimentFilter.toLowerCase()) return false;
      return true;
    });
  }, [data, platformFilter, sentimentFilter]);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-semibold text-lens-text">Mention Feed</h3>
        <div className="flex gap-2">
          <FilterDropdown
            label="Platform"
            options={['All', 'Twitter', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Online News']}
            value={platformFilter}
            onChange={setPlatformFilter}
          />
          <FilterDropdown
            label="Sentiment"
            options={['All', 'Positive', 'Neutral', 'Negative']}
            value={sentimentFilter}
            onChange={setSentimentFilter}
          />
        </div>
      </div>
      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {filtered.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-lg border transition-colors hover:border-lens-border-light ${
              m.sentiment === 'negative'
                ? 'border-red-500/20 bg-red-500/5'
                : 'border-lens-border bg-lens-bg/50'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.avatar}
                alt={m.username}
                className="w-8 h-8 rounded-full bg-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-lens-text">{m.username}</span>
                  <span className="text-xs text-lens-text-muted" title={m.platform}>
                    {platformIcons[m.platform]}
                  </span>
                  <span className="text-xs text-lens-text-muted">{m.time}</span>
                  <SentimentBadge sentiment={m.sentiment} size="xs" />
                </div>
                <p className="text-xs text-lens-text-secondary mt-1 line-clamp-2">{m.content}</p>
                <div className="flex items-center gap-4 mt-2 text-lens-text-muted">
                  <span className="flex items-center gap-1 text-[10px]">
                    <Heart size={11} /> {m.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-[10px]">
                    <Share2 size={11} /> {m.shares.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-[10px]">
                    <MessageCircle size={11} /> {m.comments.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

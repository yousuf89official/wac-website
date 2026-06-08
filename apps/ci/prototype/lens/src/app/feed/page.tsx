'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import MentionFeed from '@/components/panels/MentionFeed';
import SentimentBadge from '@/components/shared/SentimentBadge';
import FilterDropdown from '@/components/shared/FilterDropdown';
import { mentions as mockMentions } from '@/lib/mock/data';
import type { Mention } from '@/types';

function LiveTicker({ mentions }: { mentions: Mention[] }) {
  const negative = mentions.filter((m) => m.sentiment === 'negative').length;
  const positive = mentions.filter((m) => m.sentiment === 'positive').length;
  const total = mentions.length;

  return (
    <div className="card p-3 flex items-center gap-6">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-lens-accent animate-pulse" />
        <span className="text-xs text-lens-text-muted">Live Feed</span>
      </div>
      <div className="flex items-center gap-5 text-xs">
        <span className="text-lens-text-secondary"><span className="text-white font-semibold">{total}</span> mentions today</span>
        <span className="text-green-400"><span className="font-semibold">{positive}</span> positive</span>
        <span className="text-red-400"><span className="font-semibold">{negative}</span> negative</span>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [loading, setLoading] = useState(true);
  const [mentions, setMentions] = useState<Mention[]>(mockMentions);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [sentimentFilter, setSentimentFilter] = useState('All');

  useEffect(() => {
    fetch('/api/mentions')
      .then((r) => r.json())
      .then((res) => setMentions(res.data || mockMentions))
      .catch(() => setMentions(mockMentions))
      .finally(() => setLoading(false));
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetch('/api/mentions')
      .then((r) => r.json())
      .then((res) => setMentions(res.data || mockMentions))
      .catch(() => {})
      .finally(() => setTimeout(() => setRefreshing(false), 800));
  };

  const filteredMentions = useMemo(() => {
    return mentions.filter((m) => {
      if (platformFilter !== 'All' && m.platform !== platformFilter) return false;
      if (sentimentFilter !== 'All' && m.sentiment !== sentimentFilter.toLowerCase()) return false;
      if (search && !m.content.toLowerCase().includes(search.toLowerCase()) && !m.username.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [mentions, platformFilter, sentimentFilter, search]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-lens-card rounded w-1/3" />
        <div className="card h-16" />
        <div className="card h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-bold text-white">Mention Feed</h1>
          <p className="text-xs text-lens-text-muted mt-0.5">Live stream of all brand mentions across platforms</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 btn-secondary text-xs py-1.5"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <LiveTicker mentions={filteredMentions} />

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lens-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search mentions, usernames..."
              className="input-field pl-9 w-full text-xs"
            />
          </div>
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

      {/* Feed */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-display font-semibold text-lens-text">All Mentions</h3>
          <span className="text-xs text-lens-text-muted">{filteredMentions.length} results</span>
        </div>
        <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
          {filteredMentions.length === 0 ? (
            <p className="text-xs text-lens-text-muted text-center py-8">No mentions match your filters.</p>
          ) : (
            filteredMentions.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-lg border transition-colors hover:border-lens-border-light ${
                  m.sentiment === 'negative' ? 'border-red-500/20 bg-red-500/5' : 'border-lens-border bg-lens-bg/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.avatar} alt={m.username} className="w-8 h-8 rounded-full bg-slate-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-lens-text">{m.username}</span>
                      <span className="text-xs text-lens-text-muted">{m.platform}</span>
                      <span className="text-xs text-lens-text-muted">{m.time}</span>
                      <SentimentBadge sentiment={m.sentiment} size="xs" />
                    </div>
                    <p className="text-xs text-lens-text-secondary mt-1">{m.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

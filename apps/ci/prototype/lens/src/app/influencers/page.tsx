'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Star, AlertCircle } from 'lucide-react';
import InfluencerCard from '@/components/panels/InfluencerCard';
import CampaignTable from '@/components/panels/CampaignTable';
import {
  influencers as mockInfluencers,
  campaignRows as mockCampaignRows,
  marketplaceSentiment as mockMarketplace,
} from '@/lib/mock/data';
import type { Influencer, CampaignRow, MarketplaceSentiment } from '@/types';

function InfluencerDiscovery({ influencers }: { influencers: Influencer[] }) {
  const [platform, setPlatform] = useState('All');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [minFollowers, setMinFollowers] = useState('');
  const [minER, setMinER] = useState('');

  const filtered = influencers.filter((inf) => {
    if (platform !== 'All' && inf.platform !== platform) return false;
    if (category !== 'All' && inf.category !== category) return false;
    if (search && !inf.username.toLowerCase().includes(search.toLowerCase())) return false;
    if (minFollowers && inf.followers < Number(minFollowers) * 1000) return false;
    if (minER && inf.engagementRate < Number(minER)) return false;
    return true;
  });

  return (
    <div>
      {/* Search & Filters */}
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lens-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search influencers..."
              className="input-field pl-9 w-full text-xs"
            />
          </div>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="input-field text-xs"
          >
            <option value="All">All Platforms</option>
            <option value="YouTube">YouTube</option>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="Twitter">Twitter</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field text-xs"
          >
            <option value="All">All Categories</option>
            <option value="Finance">Finance</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Investasi">Investasi</option>
          </select>
          <button
            onClick={() => setShowMoreFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              showMoreFilters
                ? 'bg-lens-accent/15 border-lens-accent/30 text-lens-accent'
                : 'bg-lens-card border-lens-border text-lens-text-secondary hover:border-lens-border-light'
            }`}
          >
            <SlidersHorizontal size={12} /> More Filters
          </button>
        </div>

        {showMoreFilters && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-lens-border">
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-lens-text-muted whitespace-nowrap">Min Followers (K)</label>
              <input
                type="number"
                value={minFollowers}
                onChange={(e) => setMinFollowers(e.target.value)}
                className="input-field text-xs w-24"
                placeholder="e.g. 100"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-lens-text-muted whitespace-nowrap">Min ER (%)</label>
              <input
                type="number"
                value={minER}
                onChange={(e) => setMinER(e.target.value)}
                className="input-field text-xs w-20"
                placeholder="e.g. 2"
                step="0.1"
              />
            </div>
            <button
              onClick={() => { setMinFollowers(''); setMinER(''); }}
              className="text-[10px] text-lens-text-muted hover:text-lens-text transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Influencer Grid */}
      <div className="grid grid-cols-4 gap-3">
        {filtered.map((inf) => (
          <InfluencerCard key={inf.id} influencer={inf} />
        ))}
      </div>
    </div>
  );
}

function MarketplaceSentimentPanel({ data }: { data: MarketplaceSentiment }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-4">Marketplace Sentiment</h3>
      <div className="flex items-start gap-4">
        <div className="text-center shrink-0">
          <div className="text-3xl font-display font-bold text-white">{data.rating}</div>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.round(data.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
              />
            ))}
          </div>
          <div className="text-[10px] text-lens-text-muted mt-1">{data.totalReviews.toLocaleString()} reviews</div>
        </div>
        <div className="flex-1">
          <div className="mb-3">
            <div className="flex h-3 rounded-full overflow-hidden bg-slate-800">
              <div className="bg-green-400 h-full transition-all" style={{ width: `${data.positive}%` }} />
              <div className="bg-slate-400 h-full transition-all" style={{ width: `${data.neutral}%` }} />
              <div className="bg-red-400 h-full transition-all" style={{ width: `${data.negative}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-lens-text-muted">
              <span className="text-green-400">{data.positive}% positive</span>
              <span>{data.neutral}% neutral</span>
              <span className="text-red-400">{data.negative}% negative</span>
            </div>
          </div>
          <h4 className="text-xs font-semibold text-lens-text mb-2">Top Complaints</h4>
          <div className="space-y-1">
            {data.topComplaints.map((complaint, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-lens-text-secondary">
                <AlertCircle size={10} className="text-red-400 shrink-0 mt-0.5" />
                {complaint}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-lens-card rounded w-1/3" />
      <div className="card h-16" />
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-48" />
        ))}
      </div>
    </div>
  );
}

export default function InfluencersPage() {
  const [loading, setLoading] = useState(true);
  const [influencers, setInfluencers] = useState<Influencer[]>(mockInfluencers);
  const [campaignRows, setCampaignRows] = useState<CampaignRow[]>(mockCampaignRows);
  const [marketplace, setMarketplace] = useState<MarketplaceSentiment>(mockMarketplace);

  useEffect(() => {
    fetch('/api/influencers')
      .then((r) => r.json())
      .then((res) => {
        setInfluencers(res.data.influencers || mockInfluencers);
        setCampaignRows(res.data.campaignRows || mockCampaignRows);
        setMarketplace(res.data.marketplaceSentiment || mockMarketplace);
      })
      .catch(() => {
        // Keep mock data
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-display font-bold text-white">Influencer Intelligence</h1>
        <p className="text-xs text-lens-text-muted mt-0.5">Layer 4 — Discover, analyze, and track influencer performance</p>
      </div>

      <InfluencerDiscovery influencers={influencers} />
      <CampaignTable data={campaignRows} />
      <MarketplaceSentimentPanel data={marketplace} />
    </div>
  );
}

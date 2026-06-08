'use client';

import { useState } from 'react';
import type { Influencer } from '@/types';
import { Users, TrendingUp, Award } from 'lucide-react';

const scoreColors: Record<string, string> = {
  'A+': 'bg-green-500/20 text-green-400 border-green-500/30',
  A: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'B+': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  B: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  C: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const platformColors: Record<string, string> = {
  Twitter: 'bg-[#1d9bf0]/15 text-[#1d9bf0]',
  Instagram: 'bg-[#e1306c]/15 text-[#e1306c]',
  TikTok: 'bg-[#00f2ea]/15 text-[#00f2ea]',
  YouTube: 'bg-[#ff0000]/15 text-[#ff0000]',
  Facebook: 'bg-[#1877f2]/15 text-[#1877f2]',
};

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export default function InfluencerCard({ influencer }: { influencer: Influencer }) {
  const [viewing, setViewing] = useState(false);

  return (
    <div className="card-hover p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={influencer.avatar}
          alt={influencer.username}
          className="w-10 h-10 rounded-full bg-slate-700"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-lens-text truncate">{influencer.username}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${scoreColors[influencer.creatorScore]}`}>
              {influencer.creatorScore}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${platformColors[influencer.platform] || ''}`}>
              {influencer.platform}
            </span>
            <span className="text-[10px] text-lens-text-muted">{influencer.category}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-lens-bg/50">
          <Users size={12} className="mx-auto text-lens-text-muted mb-1" />
          <div className="text-xs font-semibold text-lens-text">{formatFollowers(influencer.followers)}</div>
          <div className="text-[9px] text-lens-text-muted">Followers</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-lens-bg/50">
          <TrendingUp size={12} className="mx-auto text-lens-text-muted mb-1" />
          <div className="text-xs font-semibold text-lens-text">{influencer.engagementRate}%</div>
          <div className="text-[9px] text-lens-text-muted">ER</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-lens-bg/50">
          <Award size={12} className="mx-auto text-lens-text-muted mb-1" />
          <div className="text-xs font-semibold text-lens-text">{influencer.aqsScore}</div>
          <div className="text-[9px] text-lens-text-muted">AQS</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-lens-text-muted">
        <span>{influencer.region}</span>
        <button
          onClick={() => { setViewing(true); setTimeout(() => setViewing(false), 1200); }}
          disabled={viewing}
          className="px-2 py-1 rounded bg-lens-accent/15 text-lens-accent text-[10px] font-medium hover:bg-lens-accent/25 transition-colors disabled:opacity-70"
        >
          {viewing ? 'Opening...' : 'View Profile'}
        </button>
      </div>
    </div>
  );
}

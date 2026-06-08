'use client';

import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { CampaignRow } from '@/types';

type SortKey = 'influencer' | 'posts' | 'reach' | 'sentimentPercent' | 'engagementRate' | 'roi';

export default function CampaignTable({ data }: { data: CampaignRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('roi');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="text-left pb-2 font-medium cursor-pointer hover:text-lens-text transition-colors group"
      onClick={() => toggleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={10} className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortKey === field ? '!opacity-100 text-lens-accent' : ''}`} />
      </span>
    </th>
  );

  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-4">Campaign Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-lens-text-muted border-b border-lens-border">
              <SortHeader label="Influencer" field="influencer" />
              <SortHeader label="Posts" field="posts" />
              <SortHeader label="Reach" field="reach" />
              <SortHeader label="Sentiment %" field="sentimentPercent" />
              <SortHeader label="ER %" field="engagementRate" />
              <SortHeader label="ROI" field="roi" />
            </tr>
          </thead>
          <tbody className="divide-y divide-lens-border">
            {sorted.map((row) => (
              <tr key={row.influencer} className="hover:bg-lens-card-hover/30 transition-colors">
                <td className="py-2.5 text-lens-text font-medium">{row.influencer}</td>
                <td className="py-2.5 text-lens-text-secondary">{row.posts}</td>
                <td className="py-2.5 text-lens-text-secondary">{(row.reach / 1_000_000).toFixed(1)}M</td>
                <td className="py-2.5">
                  <span className={`font-medium ${row.sentimentPercent >= 80 ? 'text-green-400' : row.sentimentPercent >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {row.sentimentPercent}%
                  </span>
                </td>
                <td className="py-2.5 text-lens-text-secondary">{row.engagementRate}%</td>
                <td className="py-2.5">
                  <span className={`font-semibold ${row.roi >= 4 ? 'text-lens-accent' : 'text-lens-text-secondary'}`}>
                    {row.roi}x
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

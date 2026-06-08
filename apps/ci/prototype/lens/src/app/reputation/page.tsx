'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, FileDown, Award } from 'lucide-react';
import IndexTrend from '@/components/charts/IndexTrend';
import {
  reputationKPIs as mockReputationKPIs,
  leaderboard as mockLeaderboard,
  indexTrend as mockIndexTrend,
} from '@/lib/mock/data';
import type { ReputationKPI, LeaderboardRow, IndexTrendPoint } from '@/types';

function ReputationKPICards({ kpis }: { kpis: ReputationKPI[] }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {kpis.map((kpi) => (
        <div key={kpi.abbr} className="card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-lens-text-muted uppercase tracking-wider">{kpi.label}</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-display font-bold text-white">{kpi.value.toFixed(1)}</span>
            <span className="text-sm font-display font-semibold text-lens-accent">{kpi.abbr}</span>
          </div>
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
            kpi.delta >= 0 ? 'text-lens-positive' : 'text-lens-negative'
          }`}>
            {kpi.delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{kpi.delta >= 0 ? '▲' : '▼'} {Math.abs(kpi.delta).toFixed(1)} pts</span>
            <span className="text-lens-text-muted ml-1">vs last month</span>
          </div>
          <p className="text-[10px] text-lens-text-muted mt-2">{kpi.description}</p>
        </div>
      ))}
    </div>
  );
}

function CategoryLeaderboard({ data }: { data: LeaderboardRow[] }) {
  const [generating, setGenerating] = useState(false);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-semibold text-lens-text">Category Leaderboard — Banking Indonesia</h3>
        <button
          onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2000); }}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-lens-accent/15 text-lens-accent hover:bg-lens-accent/25 transition-colors disabled:opacity-70"
        >
          <FileDown size={12} /> {generating ? 'Generating...' : 'Generate Scorecard PDF'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-lens-text-muted border-b border-lens-border">
              <th className="text-left pb-2 font-medium w-12">Rank</th>
              <th className="text-left pb-2 font-medium">Brand</th>
              <th className="text-left pb-2 font-medium">NSS</th>
              <th className="text-left pb-2 font-medium">SI</th>
              <th className="text-left pb-2 font-medium">EMSS</th>
              <th className="text-left pb-2 font-medium">Mentions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lens-border">
            {data
              .sort((a, b) => a.rank - b.rank)
              .map((row) => (
                <tr
                  key={row.brand}
                  className={`transition-colors ${
                    row.isOwn
                      ? 'bg-teal-500/10 border-l-2 border-l-lens-accent'
                      : 'hover:bg-lens-card-hover/30'
                  }`}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {row.rank <= 3 && <Award size={12} className={row.rank === 1 ? 'text-yellow-400' : row.rank === 2 ? 'text-slate-300' : 'text-amber-600'} />}
                      <span className={`font-semibold ${row.isOwn ? 'text-lens-accent' : 'text-lens-text-secondary'}`}>
                        #{row.rank}
                      </span>
                    </div>
                  </td>
                  <td className={`py-3 font-medium ${row.isOwn ? 'text-lens-accent' : 'text-lens-text'}`}>
                    {row.brand}
                    {row.isOwn && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-lens-accent/15 text-lens-accent">Your Brand</span>}
                  </td>
                  <td className="py-3 text-lens-text-secondary">{row.nss.toFixed(1)}</td>
                  <td className="py-3 text-lens-text-secondary">{row.si.toFixed(1)}</td>
                  <td className="py-3 text-lens-text-secondary">{row.emss.toFixed(1)}</td>
                  <td className="py-3 text-lens-text-secondary">{row.mentions.toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-lens-card rounded w-1/3" />
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-32" />
        ))}
      </div>
      <div className="card h-80" />
    </div>
  );
}

export default function ReputationPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<ReputationKPI[]>(mockReputationKPIs);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>(mockLeaderboard);
  const [trend, setTrend] = useState<IndexTrendPoint[]>(mockIndexTrend);

  useEffect(() => {
    fetch('/api/reputation')
      .then((r) => r.json())
      .then((res) => {
        setKpis(res.data.reputationKPIs || mockReputationKPIs);
        setLeaderboard(res.data.leaderboard || mockLeaderboard);
        setTrend(res.data.indexTrend || mockIndexTrend);
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
        <h1 className="text-lg font-display font-bold text-white">Reputation Benchmarking</h1>
        <p className="text-xs text-lens-text-muted mt-0.5">Layer 5 — Track brand reputation indices against competitors</p>
      </div>

      <ReputationKPICards kpis={kpis} />
      <IndexTrend data={trend} />
      <CategoryLeaderboard data={leaderboard} />
    </div>
  );
}

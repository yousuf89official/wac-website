'use client';

import type { Stakeholder } from '@/types';

function SentimentBar({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) {
  const total = positive + neutral + negative;
  return (
    <div className="flex h-2 rounded-full overflow-hidden bg-slate-800 w-24">
      <div className="bg-green-400 h-full" style={{ width: `${(positive / total) * 100}%` }} />
      <div className="bg-slate-400 h-full" style={{ width: `${(neutral / total) * 100}%` }} />
      <div className="bg-red-400 h-full" style={{ width: `${(negative / total) * 100}%` }} />
    </div>
  );
}

export default function StakeholderTable({ data }: { data: Stakeholder[] }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-4">Stakeholder Sentiment</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-lens-text-muted border-b border-lens-border">
              <th className="text-left pb-2 font-medium">Actor</th>
              <th className="text-left pb-2 font-medium">Mentions</th>
              <th className="text-left pb-2 font-medium">Sentiment</th>
              <th className="text-left pb-2 font-medium">Key Narrative</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lens-border">
            {data.map((s) => (
              <tr key={s.name} className="hover:bg-lens-card-hover/30 transition-colors">
                <td className="py-2.5 text-lens-text font-medium">{s.name}</td>
                <td className="py-2.5 text-lens-text-secondary">{s.mentions.toLocaleString()}</td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <SentimentBar positive={s.positive} neutral={s.neutral} negative={s.negative} />
                    <span className="text-[10px] text-lens-text-muted whitespace-nowrap">
                      {s.positive}% pos
                    </span>
                  </div>
                </td>
                <td className="py-2.5 text-lens-text-secondary max-w-[300px]">
                  <p className="line-clamp-2">{s.keyNarrative}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

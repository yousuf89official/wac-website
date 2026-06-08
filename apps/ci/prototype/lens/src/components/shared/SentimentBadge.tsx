'use client';

import type { Sentiment } from '@/types';

const config: Record<Sentiment, { bg: string; text: string; label: string }> = {
  positive: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'Positive' },
  neutral: { bg: 'bg-slate-500/15', text: 'text-slate-400', label: 'Neutral' },
  negative: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Negative' },
};

export default function SentimentBadge({ sentiment, size = 'sm' }: { sentiment: Sentiment; size?: 'xs' | 'sm' }) {
  const c = config[sentiment];
  return (
    <span className={`inline-flex items-center rounded font-medium ${c.bg} ${c.text} ${
      size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        sentiment === 'positive' ? 'bg-green-400' : sentiment === 'negative' ? 'bg-red-400' : 'bg-slate-400'
      }`} />
      {c.label}
    </span>
  );
}

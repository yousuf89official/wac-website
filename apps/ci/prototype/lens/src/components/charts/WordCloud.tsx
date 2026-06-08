'use client';

import type { WordCloudItem } from '@/types';

const sentimentColor = {
  positive: '#22c55e',
  neutral: '#64748b',
  negative: '#ef4444',
};

export default function WordCloud({ data }: { data: WordCloudItem[] }) {
  const maxValue = Math.max(...data.map((w) => w.value));

  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-4">Word Cloud</h3>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 min-h-[200px] py-4">
        {data.map((item) => {
          const fontSize = 12 + (item.value / maxValue) * 22;
          const opacity = 0.5 + (item.value / maxValue) * 0.5;
          return (
            <span
              key={item.text}
              className="cursor-default transition-opacity hover:opacity-100 font-medium"
              style={{
                fontSize: `${fontSize}px`,
                color: sentimentColor[item.sentiment],
                opacity,
              }}
              title={`${item.text}: ${item.value} mentions`}
            >
              {item.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}

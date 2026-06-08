export const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  accent:  'hsl(var(--accent))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  muted:   'hsl(var(--muted-foreground))',
} as const;

export const CHART_SERIES: string[] = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--muted-foreground))',
];

export function seriesColor(i: number): string {
  return CHART_SERIES[i % CHART_SERIES.length];
}

export const CHART_SENTIMENT = {
  positive: 'hsl(var(--success))',
  neutral:  'hsl(var(--muted-foreground))',
  negative: 'hsl(var(--destructive))',
} as const;

export const CHART_GRID = { stroke: 'hsl(var(--foreground) / 0.08)' } as const;

export const CHART_AXIS_TICK = {
  fill: 'hsl(var(--foreground-soft))',
  fontSize: 11,
  fontFamily: 'var(--font-mono)',
} as const;

export const CHART_TOOLTIP = {
  contentStyle: {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '0.5rem',
    fontFamily: 'var(--font-sans)',
  },
  labelStyle: { color: 'hsl(var(--foreground))' },
  itemStyle: { color: 'hsl(var(--foreground-soft))' },
} as const;

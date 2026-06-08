'use client';

import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: LucideIcon;
    description: string;
    color?: 'indigo' | 'emerald' | 'amber' | 'rose';
    /** Optional category label (e.g. ANALYSIS, BENCHMARK) shown above the title — useful when used as a list row */
    category?: string;
    /** Optional meta line (e.g. date / author) shown beneath the description */
    meta?: string;
}

export const ReportCard = ({
    title,
    value,
    change,
    icon: Icon,
    description,
    category,
    meta,
}: ReportCardProps) => {
    const isPositive = change !== undefined && change > 0;
    const isNegative = change !== undefined && change < 0;

    return (
        <div className="group relative border-t border-foreground/15 pt-6 pb-6 transition-colors hover:border-primary">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="mb-3 flex items-center gap-3">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-foreground-soft transition-colors group-hover:text-primary" />
                        <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            {category ?? title}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                        <h3 className="font-display text-3xl font-medium leading-none tracking-tight text-foreground md:text-4xl">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </h3>
                        {change !== undefined && (
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-widest',
                                    isPositive && 'text-success',
                                    isNegative && 'text-destructive',
                                    !isPositive && !isNegative && 'text-foreground-soft',
                                )}
                            >
                                {isPositive ? (
                                    <ArrowUpRight className="h-3 w-3" />
                                ) : isNegative ? (
                                    <ArrowDownRight className="h-3 w-3" />
                                ) : (
                                    <Minus className="h-3 w-3" />
                                )}
                                {Math.abs(change)}%
                            </span>
                        )}
                    </div>
                    {category && (
                        <p className="mt-3 font-display text-base font-medium leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
                            {title}
                        </p>
                    )}
                    <p className="mt-2 max-w-[28ch] font-serif text-sm leading-relaxed text-foreground-soft">
                        {description}
                    </p>
                    {meta && (
                        <p className="mt-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft/70">
                            {meta}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

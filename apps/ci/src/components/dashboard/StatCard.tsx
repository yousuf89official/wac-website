import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface StatCardProps {
    label: string;
    value: string | number;
    trend?: number;
    icon?: LucideIcon;
    subValue?: string;
    className?: string;
    href?: string;
}

/**
 * Editorial Luxe stat card.
 * Hairline top rule + mono label + Fraunces oversized numeral +
 * optional trend pill and Newsreader caption. No glass, no backdrop blur.
 */
export function StatCard({ label, value, trend, subValue, className, href }: StatCardProps) {
    const isPositive = typeof trend === 'number' && trend > 0;
    const showTrend = typeof trend === 'number';

    const content = (
        <div
            className={cn(
                'group border-t border-foreground/15 pt-5 transition-colors',
                href && 'cursor-pointer hover:border-primary/60',
                className
            )}
        >
            <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                {label}
            </p>

            <div className="mt-4 flex items-baseline gap-3">
                <p className="font-display text-5xl font-medium leading-none tracking-tightest text-foreground">
                    {value}
                </p>
                {showTrend && (
                    <span
                        className={cn(
                            'inline-flex items-center font-mono text-2xs uppercase tracking-widest',
                            isPositive ? 'text-primary' : 'text-foreground-soft'
                        )}
                    >
                        {isPositive ? (
                            <ArrowUpRight size={12} className="mr-1" />
                        ) : (
                            <ArrowDownRight size={12} className="mr-1" />
                        )}
                        {Math.abs(trend!)}%
                    </span>
                )}
            </div>

            {subValue && (
                <p className="mt-3 font-serif text-sm leading-snug text-foreground-soft">
                    {subValue}
                </p>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block">
                {content}
            </Link>
        );
    }

    return content;
}

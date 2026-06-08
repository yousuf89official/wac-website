import { Eye, Users, DollarSign, Zap, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BrandWidgets } from '@/services/api';
import { cn } from '@/lib/utils';

export const DashboardWidgets = ({ data }: { data: BrandWidgets }) => {
    const widgets = [
        {
            label: 'Total Impressions',
            value: data.impressions.value.toLocaleString(),
            trend: `${data.impressions.trend > 0 ? '+' : ''}${data.impressions.trend}% from last period`,
            icon: Eye,
            trendPositive: data.impressions.trend > 0,
        },
        {
            label: 'Total Reach',
            value: data.reach.value.toLocaleString(),
            trend: `${data.reach.trend > 0 ? '+' : ''}${data.reach.trend}% from last period`,
            icon: Users,
            trendPositive: data.reach.trend > 0,
        },
        {
            label: 'Total Spend',
            value: `IDR ${data.spend.value.toLocaleString('id-ID')}`,
            trend: `${data.spend.trend > 0 ? '+' : ''}${data.spend.trend}% from last period`,
            icon: DollarSign,
            trendPositive: data.spend.trend > 0,
        },
        {
            label: 'Engagement Rate',
            value: `${data.engagementRate.value}%`,
            trend: `${data.engagementRate.trend > 0 ? '+' : ''}${data.engagementRate.trend}% from last period`,
            icon: Zap,
            trendPositive: data.engagementRate.trend > 0,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-2">
                        Snapshot
                    </p>
                    <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
                        Dashboard widgets
                    </h3>
                </div>
                <Button variant="outline" size="sm" className="gap-2 h-8 border-border bg-card text-foreground-soft hover:text-foreground">
                    <Edit2 size={14} strokeWidth={1.5} /> Edit
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {widgets.map((item, idx) => (
                    <div key={idx} className="bg-card border border-border p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 border border-border text-foreground-soft">
                                <item.icon size={18} strokeWidth={1.5} />
                            </div>
                            <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">{item.label}</span>
                        </div>
                        <h2 className="font-display text-3xl font-medium tracking-tight text-foreground mb-2 break-all">{item.value}</h2>
                        <p className={cn(
                            'font-mono text-2xs uppercase tracking-widest',
                            item.trendPositive ? 'text-success' : 'text-destructive'
                        )}>
                            {item.trend}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

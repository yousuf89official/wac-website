'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Plus,
    ClipboardCheck,
    ShieldCheck,
    FileText,
    RefreshCcw,
    Briefcase,
    DollarSign,
    Users,
    BarChart2,
} from 'lucide-react';

import { Service, api, type Campaign, type Brand } from '@/services/api';
import { PerformanceWidgets } from '@/components/brands/PerformanceWidgets';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ease = [0.16, 1, 0.3, 1] as const;

function statusTone(status?: string) {
    switch (status?.toLowerCase()) {
        case 'active':
            return 'text-primary';
        case 'paused':
            return 'text-accent';
        case 'completed':
            return 'text-foreground';
        case 'draft':
        default:
            return 'text-foreground-soft';
    }
}

function approvalTone(status?: string) {
    switch (status?.toLowerCase()) {
        case 'approved':
            return 'text-primary';
        case 'pending':
        case 'pending_review':
            return 'text-accent';
        case 'rejected':
            return 'text-destructive';
        case 'draft':
        default:
            return 'text-foreground-soft';
    }
}

function formatBudget(val?: number) {
    if (!val) return '$0';
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k`;
    return `$${val.toFixed(0)}`;
}

function greetingFor(date = new Date()) {
    const h = date.getHours();
    if (h < 5) return 'Still up';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
}

const quickActions = [
    {
        label: 'New campaign',
        href: '/admin/brand-campaign-settings?action=create',
        icon: Plus,
        desc: 'Spin up a fresh brief and budget plan.',
    },
    {
        label: 'Approval board',
        href: '/admin/approval-workflow',
        icon: ClipboardCheck,
        desc: 'Review work waiting for sign-off.',
    },
    {
        label: 'Campaign rules',
        href: '/admin/campaign-rules',
        icon: ShieldCheck,
        desc: 'Guardrails for spend, pacing, and pause.',
    },
    {
        label: 'Templates',
        href: '/admin/campaign-templates',
        icon: FileText,
        desc: 'Reusable blueprints for the studio.',
    },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        activeCampaigns: 0,
        totalSpend: 0,
        impressions: 0,
        avgRoas: 0,
    });
    const [recentCampaigns, setRecentCampaigns] = useState<
        (Campaign & { brandName?: string; approvalStatus?: string })[]
    >([]);
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await Service.getDashboardStats();
            setStats(data);
            toast.success('Dashboard metrics synchronized');
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            toast.error('Failed to sync dashboard metrics');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentCampaigns = async () => {
        try {
            const [campaigns, brands] = await Promise.all([
                api.campaigns.getAll({}),
                api.brands.getAll(),
            ]);
            const brandMap = new Map<string, string>(
                brands.map((b: Brand) => [b.id, b.name])
            );
            const recent = campaigns.slice(0, 5).map((c: any) => ({
                ...c,
                brandName: brandMap.get(c.brandId) || 'Unknown',
            }));
            setRecentCampaigns(recent);
        } catch (error) {
            console.error('Failed to fetch recent campaigns:', error);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchRecentCampaigns();
    }, []);

    const firstName = useMemo(() => {
        if (!user?.name) return null;
        return user.name.split(' ')[0];
    }, [user?.name]);

    const greeting = useMemo(() => greetingFor(), []);

    const kpis = [
        {
            label: 'Active campaigns',
            value: String(stats.activeCampaigns),
            icon: Briefcase,
            trend: 2,
            desc: 'Live across all brands this period.',
            href: '/admin/brand-campaign-settings?status=Active',
        },
        {
            label: 'Total spend',
            value: `$${(stats.totalSpend / 1000).toFixed(1)}k`,
            icon: DollarSign,
            trend: 12,
            desc: 'Tracked against committed budgets.',
            href: '/admin/brand-campaign-settings?sort=spend',
        },
        {
            label: 'Impressions',
            value: `${(stats.impressions / 1_000_000).toFixed(1)}M`,
            icon: Users,
            trend: 5,
            desc: 'Reach delivered month to date.',
            href: '/admin/brand-campaign-settings?sort=impressions',
        },
        {
            label: 'Avg. ROAS',
            value: `${stats.avgRoas}x`,
            icon: BarChart2,
            trend: -0.2,
            desc: 'Return per dollar of media spend.',
            href: '/admin/brand-campaign-settings?sort=roas',
        },
    ];

    return (
        <div className="space-y-24 pb-24">
            {/* Welcome */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease }}
                className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
            >
                <div className="max-w-3xl">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            Agency intelligence
                        </span>
                        <span className="inline-block h-px w-10 bg-foreground-soft" />
                        <span className="font-mono text-2xs uppercase tracking-widest text-primary">
                            Performance
                        </span>
                    </div>
                    <h1 className="font-display text-[clamp(2.5rem,5vw,3.75rem)] font-medium leading-[0.96] tracking-tightest text-foreground">
                        {greeting},{' '}
                        <span className="italic text-primary">
                            {firstName ?? 'friend'}
                        </span>
                        .
                    </h1>
                    <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-foreground-soft">
                        A quiet look at the room — what&apos;s live, what&apos;s
                        spending, and what&apos;s waiting on a decision across
                        every brand on the roster.
                    </p>
                </div>

                <div className="flex items-center gap-3 md:shrink-0">
                    <button
                        onClick={fetchStats}
                        className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                        <RefreshCcw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                        Refresh
                    </button>
                    <Link
                        href="/admin/brand-campaign-settings?action=create"
                        className="inline-flex items-center gap-2 bg-foreground px-5 py-2 font-mono text-2xs uppercase tracking-widest text-background transition-colors hover:bg-primary"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        New campaign
                    </Link>
                </div>
            </motion.section>

            {/* KPI strip */}
            <motion.section
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, ease }}
            >
                <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                    {kpis.map((kpi) => (
                        <StatCard
                            key={kpi.label}
                            label={kpi.label}
                            value={kpi.value}
                            icon={kpi.icon}
                            trend={kpi.trend}
                            subValue={kpi.desc}
                            href={kpi.href}
                        />
                    ))}
                </div>
            </motion.section>

            {/* Performance Overview */}
            <motion.section
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, ease }}
            >
                <div className="mb-10 flex items-end justify-between gap-4">
                    <div>
                        <div className="mb-4 flex items-center gap-3">
                            <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                01
                            </span>
                            <span className="inline-block h-px w-10 bg-foreground-soft" />
                            <span className="eyebrow">Performance</span>
                        </div>
                        <h2 className="font-display text-3xl font-medium leading-tight tracking-tightest text-foreground md:text-4xl">
                            How the work is moving.
                        </h2>
                    </div>
                </div>
                <PerformanceWidgets />
            </motion.section>

            {/* Recent campaigns + Quick actions */}
            <motion.section
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, ease }}
            >
                <div className="mb-10 flex items-end justify-between gap-4">
                    <div>
                        <div className="mb-4 flex items-center gap-3">
                            <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                02
                            </span>
                            <span className="inline-block h-px w-10 bg-foreground-soft" />
                            <span className="eyebrow">Recently in motion</span>
                        </div>
                        <h2 className="font-display text-3xl font-medium leading-tight tracking-tightest text-foreground md:text-4xl">
                            Lately around the studio.
                        </h2>
                    </div>
                    <Link
                        href="/admin/brand-campaign-settings"
                        className="hidden font-mono text-2xs uppercase tracking-widest text-foreground-soft transition-colors hover:text-primary md:inline"
                    >
                        All campaigns →
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Recent campaigns list */}
                    <div className="lg:col-span-8">
                        {recentCampaigns.length === 0 ? (
                            <div className="border-t border-foreground/15 py-12 text-center">
                                <p className="font-serif text-base text-foreground-soft">
                                    No recent campaigns to show.
                                </p>
                                <Link
                                    href="/admin/brand-campaign-settings"
                                    className="mt-4 inline-block font-mono text-2xs uppercase tracking-widest text-primary transition-colors hover:text-foreground"
                                >
                                    Go to campaigns →
                                </Link>
                            </div>
                        ) : (
                            <ul className="divide-y divide-foreground/10 border-y border-foreground/15">
                                {recentCampaigns.map((campaign) => (
                                    <li key={campaign.id}>
                                        <Link
                                            href={`/admin/brand-campaign-settings?campaign=${campaign.id}`}
                                            className="group grid grid-cols-12 items-baseline gap-4 py-6 transition-colors hover:bg-foreground/[0.03]"
                                        >
                                            <div className="col-span-12 md:col-span-6">
                                                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                    {campaign.brandName}
                                                </p>
                                                <p className="mt-2 font-display text-xl font-medium leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
                                                    {campaign.name}
                                                </p>
                                            </div>
                                            <div className="col-span-6 md:col-span-3">
                                                <p
                                                    className={cn(
                                                        'font-mono text-2xs uppercase tracking-widest',
                                                        statusTone(campaign.status)
                                                    )}
                                                >
                                                    {campaign.status}
                                                </p>
                                                <p
                                                    className={cn(
                                                        'mt-1 font-mono text-2xs uppercase tracking-widest',
                                                        approvalTone(campaign.approvalStatus)
                                                    )}
                                                >
                                                    {(campaign.approvalStatus || 'draft').replace('_', ' ')}
                                                </p>
                                            </div>
                                            <div className="col-span-6 text-right font-display text-lg font-medium tracking-tight text-foreground md:col-span-3">
                                                {formatBudget(campaign.budgetPlanned)}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Quick actions */}
                    <div className="lg:col-span-4">
                        <p className="mb-6 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            Quick actions
                        </p>
                        <ul className="divide-y divide-foreground/10 border-y border-foreground/15">
                            {quickActions.map((action) => (
                                <li key={action.label}>
                                    <Link
                                        href={action.href}
                                        className="group flex items-start gap-4 py-5 transition-colors hover:bg-foreground/[0.03]"
                                    >
                                        <action.icon
                                            size={16}
                                            className="mt-1 shrink-0 text-foreground-soft transition-colors group-hover:text-primary"
                                        />
                                        <div className="flex-1">
                                            <p className="font-display text-base font-medium leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
                                                {action.label}
                                            </p>
                                            <p className="mt-1 font-serif text-sm leading-snug text-foreground-soft">
                                                {action.desc}
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}

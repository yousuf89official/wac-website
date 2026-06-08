
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { EnrichedBrand } from '@/lib/brands-data';
import { BrandAvatar } from './BrandAvatar';
import { ArchiveTable } from './ArchiveTable';
import { CreateBrandModal } from './CreateBrandModal';
import { cn } from '@/lib/utils';

const ease = [0.16, 1, 0.3, 1] as const;

interface BrandListGridProps {
    brands: EnrichedBrand[];
    industries: any[];
}

function formatCompactCurrency(value: number, currency: string) {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(value);
    } catch {
        return `${value.toFixed(0)}`;
    }
}

export default function BrandListGrid({ brands, industries }: BrandListGridProps) {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<'Active' | 'Archive'>('Active');
    const [isCreateBrandModalOpen, setIsCreateBrandModalOpen] = useState(false);

    const filteredBrands = useMemo(
        () =>
            brands.filter((b) => {
                const status = (b.status || 'Active').trim();
                return statusFilter === 'Active' ? status === 'Active' : status !== 'Active';
            }),
        [brands, statusFilter]
    );

    const totalActive = useMemo(
        () => brands.filter((b) => (b.status || 'Active').trim() === 'Active').length,
        [brands]
    );
    const totalCampaigns = useMemo(
        () => brands.reduce((acc, b) => acc + (b.campaignCount ?? 0), 0),
        [brands]
    );
    const totalSpend = useMemo(
        () => brands.reduce((acc, b) => acc + (b.financials?.totalMediaSpend ?? 0), 0),
        [brands]
    );
    const sectors = useMemo(
        () => new Set(brands.map((b) => b.industry).filter(Boolean)).size,
        [brands]
    );

    const handleCreateBrand = async (brandData: any) => {
        try {
            const res = await fetch('/api/brands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...brandData,
                    logo: brandData.logo_url,
                }),
            });

            if (res.ok) {
                toast.success('Brand added to portfolio.');
                router.refresh();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to create brand');
            }
        } catch {
            toast.error('Unable to reach brand registry service');
        }
    };

    const handleRestoreBrand = async (id: string, name: string) => {
        try {
            const res = await fetch(`/api/brands/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Active' }),
            });

            if (res.ok) {
                toast.success(`${name} restored to active portfolio.`);
                router.refresh();
            } else {
                toast.error('Criteria for restoration not met');
            }
        } catch {
            toast.error('Unable to reach brand registry service');
        }
    };

    const handleDeleteBrand = async (id: string, name: string, permanent: boolean = false) => {
        if (!confirm(`Are you sure you want to ${permanent ? 'permanently delete' : 'archive'} ${name}?`)) return;

        try {
            const url = `/api/brands/${id}${permanent ? '?permanent=true' : ''}`;
            const res = await fetch(url, { method: 'DELETE' });
            if (res.ok) {
                toast.success(permanent ? 'Brand erased.' : 'Brand archived.');
                router.refresh();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to process brand deletion');
            }
        } catch {
            toast.error('Unable to reach brand registry service.');
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/brands/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                toast.success(`Brand status set to ${status}.`);
                router.refresh();
            } else {
                toast.error('Registry rejected status change');
            }
        } catch {
            toast.error('Unable to reach brand registry service');
        }
    };

    const kpis = [
        { label: 'Active brands', value: String(totalActive) },
        { label: 'Sectors covered', value: String(sectors) },
        { label: 'Campaigns running', value: String(totalCampaigns) },
        { label: 'Total spend', value: formatCompactCurrency(totalSpend, 'USD') },
    ];

    return (
        <div className="space-y-24 pb-24">
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease }}
                className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
            >
                <div className="max-w-3xl">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            Intelligence
                        </span>
                        <span className="inline-block h-px w-10 bg-foreground-soft" />
                        <span className="font-mono text-2xs uppercase tracking-widest text-primary">
                            Brands
                        </span>
                    </div>
                    <h1 className="font-display text-[clamp(2.5rem,5vw,3.75rem)] font-medium leading-[0.96] tracking-tightest text-foreground">
                        Your <span className="italic text-primary">brands</span>.
                    </h1>
                    <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-foreground-soft">
                        {statusFilter === 'Active'
                            ? 'A quiet look at every client on the roster — what they make, what is running, and how the spend is moving.'
                            : 'A record of brands that have left the active roster. Restore or remove as needed.'}
                    </p>
                </div>

                <div className="flex items-center gap-3 md:shrink-0">
                    <div className="flex border border-border bg-card">
                        <button
                            onClick={() => setStatusFilter('Active')}
                            className={cn(
                                'px-4 py-2 font-mono text-2xs uppercase tracking-widest transition-colors',
                                statusFilter === 'Active'
                                    ? 'bg-foreground/[0.04] text-primary'
                                    : 'text-foreground-soft hover:text-foreground'
                            )}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setStatusFilter('Archive')}
                            className={cn(
                                'px-4 py-2 font-mono text-2xs uppercase tracking-widest transition-colors border-l border-border',
                                statusFilter === 'Archive'
                                    ? 'bg-foreground/[0.04] text-destructive'
                                    : 'text-foreground-soft hover:text-foreground'
                            )}
                        >
                            Archive
                        </button>
                    </div>
                    <button
                        onClick={() => setIsCreateBrandModalOpen(true)}
                        className="inline-flex items-center gap-2 bg-foreground px-5 py-2 font-mono text-2xs uppercase tracking-widest text-background transition-colors hover:bg-primary"
                    >
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Add brand
                    </button>
                </div>
            </motion.section>

            {/* KPI strip */}
            <motion.section
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, ease }}
            >
                <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
                    {kpis.map((kpi) => (
                        <div key={kpi.label}>
                            <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                                {kpi.label}
                            </p>
                            <p className="font-display text-3xl md:text-4xl font-medium tracking-tightest text-foreground">
                                {kpi.value}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Roster */}
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
                            <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                {statusFilter === 'Active' ? 'Roster' : 'Archive'}
                            </span>
                        </div>
                        <h2 className="font-display text-3xl font-medium leading-tight tracking-tightest text-foreground md:text-4xl">
                            {statusFilter === 'Active' ? 'Every active brand.' : 'Out of rotation.'}
                        </h2>
                    </div>
                    <span className="hidden font-mono text-2xs uppercase tracking-widest text-foreground-soft md:inline">
                        {filteredBrands.length} {filteredBrands.length === 1 ? 'brand' : 'brands'}
                    </span>
                </div>

                {filteredBrands.length === 0 && (
                    <div className="border-y border-border py-16 text-center">
                        <p className="font-serif text-base text-foreground-soft">
                            No {statusFilter === 'Active' ? 'active' : 'archived'} brands to show.
                        </p>
                    </div>
                )}

                {filteredBrands.length > 0 && statusFilter === 'Archive' && (
                    <ArchiveTable
                        brands={filteredBrands}
                        onRestore={handleRestoreBrand}
                        onDelete={handleDeleteBrand}
                        onUpdateStatus={handleUpdateStatus}
                    />
                )}

                {filteredBrands.length > 0 && statusFilter === 'Active' && (
                    <ul className="divide-y divide-border border-y border-border">
                        {filteredBrands.map((brand, idx) => {
                            const websiteDisplay = brand.website ? brand.website.replace(/^https?:\/\//, '') : '—';
                            return (
                                <li key={brand.id}>
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/brands/${brand.slug}`)}
                                        className="group grid w-full grid-cols-12 items-center gap-4 py-6 text-left transition-colors hover:bg-foreground/[0.03]"
                                    >
                                        <div className="col-span-12 md:col-span-1">
                                            <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </div>

                                        <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                                            <BrandAvatar
                                                logo_url={brand.logo}
                                                name={brand.name}
                                                brand_color={brand.brandColor || undefined}
                                                size="sm"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                    {brand.industry}
                                                    {brand.sub_category ? ` · ${brand.sub_category}` : ''}
                                                </p>
                                                <p className="mt-1 font-display text-xl font-medium leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
                                                    {brand.name}
                                                </p>
                                                {brand.description && (
                                                    <p className="mt-1 font-serif text-sm text-foreground-soft line-clamp-1 max-w-md">
                                                        {brand.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-span-4 md:col-span-2">
                                            <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                Campaigns
                                            </p>
                                            <p className="mt-1 font-display text-xl font-medium tracking-tight text-foreground">
                                                {brand.campaignCount}
                                            </p>
                                        </div>

                                        <div className="col-span-4 md:col-span-2">
                                            <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                Location
                                            </p>
                                            <p className="mt-1 font-sans text-sm text-foreground truncate">
                                                {brand.location || '—'}
                                            </p>
                                            <p className="font-mono text-2xs text-foreground-soft truncate">
                                                {websiteDisplay}
                                            </p>
                                        </div>

                                        <div className="col-span-4 text-right md:col-span-2">
                                            <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                Spend
                                            </p>
                                            <p className="mt-1 font-display text-xl font-medium tracking-tight text-foreground">
                                                {formatCompactCurrency(
                                                    brand.financials.totalMediaSpend,
                                                    brand.defaultCurrency
                                                )}
                                            </p>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </motion.section>

            <CreateBrandModal
                isOpen={isCreateBrandModalOpen}
                industries={industries}
                onClose={() => setIsCreateBrandModalOpen(false)}
                onCreate={handleCreateBrand}
            />
        </div>
    );
}

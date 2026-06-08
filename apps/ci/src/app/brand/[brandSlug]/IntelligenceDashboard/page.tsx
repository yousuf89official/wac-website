'use client';

import React, { useEffect, useState } from 'react';
import { DashboardAnalyticsView } from '@/components/brands/DashboardAnalyticsView';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function BrandedPublicPage({ params }: { params: Promise<{ brandSlug: string }> }) {
    const { brandSlug } = React.use(params);
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // We need a way to fetch by brandSlug instead of token
                // We'll create a new API or update the share API to handle this
                const res = await fetch(`/api/share/branded?slug=${brandSlug}`);
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Failed to fetch dashboard data');
                }
                const result = await res.json();
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        if (brandSlug) {
            fetchData();
        }
    }, [brandSlug]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgba(22,32,50,0.8)]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                    <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Loading Collaborative Intelligence...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgba(22,32,50,0.8)] p-6">
                <Card className="max-w-md w-full p-8 text-center space-y-4">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 text-red-400">
                        <AlertCircle className="h-8 w-8" />
                    </div>
                    <h1 className="text-xl font-black text-white uppercase tracking-tight">Access Restricted</h1>
                    <p className="text-sm text-white/50 font-medium">
                        {error || 'This dashboard has not been authorized for public access.'}
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[rgba(22,32,50,0.8)]">
            {/* Branded Header */}
            <header className="bg-[rgba(22,32,50,0.6)] border-b border-white/[0.06] py-6 px-4 md:px-8 mb-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {data.brand.logo_url && (
                            <img src={data.brand.logo_url} alt={data.brand.name} className="h-10 w-auto" />
                        )}
                        <h1 className="text-lg font-black text-white uppercase tracking-tight">
                            {data.brand.name} <span className="text-white/40 ml-2">// INTELLIGENCE DASHBOARD</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live Performance Data</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
                <DashboardAnalyticsView
                    brand={data.brand}
                    campaigns={data.campaigns}
                    metrics={data.metrics}
                    creatives={data.creatives}
                    isPublic={true}
                />
            </main>

            <footer className="max-w-7xl mx-auto px-4 md:px-8 py-8 border-t border-white/[0.06] text-center">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Powered by Collaborative Intelligence
                </p>
            </footer>
        </div>
    );
}

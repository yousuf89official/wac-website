'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface PlatformHealthWidgetProps {
    brandId?: string;
}

interface PlatformStatus {
    connected: boolean;
    hasPending?: boolean;
    accounts?: { accountName?: string }[];
}

interface PlatformEntry {
    key: string;
    name: string;
    color: string;
    endpoint: string;
    status: 'connected' | 'pending' | 'disconnected';
    accountName: string;
}

const PLATFORMS = [
    { key: 'google-ads', name: 'Google Ads', color: '#4285F4' },
    { key: 'meta-ads', name: 'Meta Ads', color: '#1877F2' },
    { key: 'tiktok-ads', name: 'TikTok Ads', color: '#FF0050' },
] as const;

function getStatusFromResponse(data: PlatformStatus | null): { status: 'connected' | 'pending' | 'disconnected'; accountName: string } {
    if (!data) return { status: 'disconnected', accountName: 'Not connected' };
    if (data.connected && data.accounts && data.accounts.length > 0) {
        return { status: 'connected', accountName: data.accounts[0].accountName || 'Connected' };
    }
    if (data.hasPending) {
        return { status: 'pending', accountName: 'Pending setup' };
    }
    return { status: 'disconnected', accountName: 'Not connected' };
}

const STATUS_DOT: Record<string, string> = {
    connected: 'bg-green-500',
    pending: 'bg-yellow-500',
    disconnected: 'bg-white/20',
};

export function PlatformHealthWidget({ brandId }: PlatformHealthWidgetProps) {
    const [platforms, setPlatforms] = useState<PlatformEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStatuses = useCallback(async () => {
        if (!brandId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const results = await Promise.allSettled(
                PLATFORMS.map(p =>
                    fetch(`/api/integrations/${p.key}/status?brandId=${brandId}`)
                        .then(r => (r.ok ? r.json() : null))
                )
            );

            const entries: PlatformEntry[] = PLATFORMS.map((p, i) => {
                const result = results[i];
                const data = result.status === 'fulfilled' ? result.value : null;
                const { status, accountName } = getStatusFromResponse(data);
                return {
                    key: p.key,
                    name: p.name,
                    color: p.color,
                    endpoint: '',
                    status,
                    accountName,
                };
            });

            setPlatforms(entries);
        } catch {
            // Keep empty state on total failure
        } finally {
            setLoading(false);
        }
    }, [brandId]);

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);

    if (!brandId) {
        return (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 h-full flex items-center justify-center">
                <p className="text-sm text-white/40">Select a brand</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 h-full flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-white/30" />
            </div>
        );
    }

    return (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                Platform Health
            </h3>
            <div className="space-y-2.5">
                {platforms.map(p => (
                    <div
                        key={p.key}
                        className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                    >
                        {/* Platform icon circle */}
                        <div
                            className="h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: `${p.color}20`, color: p.color }}
                        >
                            {p.name.charAt(0)}
                        </div>

                        {/* Name + account */}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white/90 leading-none">
                                {p.name}
                            </p>
                            <p className="text-[10px] text-white/40 truncate mt-0.5">
                                {p.accountName}
                            </p>
                        </div>

                        {/* Status dot */}
                        <div
                            className={`h-2 w-2 rounded-full shrink-0 ${STATUS_DOT[p.status]}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

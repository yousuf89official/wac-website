'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';

function MetaCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [error, setError] = useState('');

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
            setStatus('error');
            setError('No code provided');
            return;
        }

        const handleExchange = async () => {
            try {
                let brandId = '';
                if (state) {
                    try {
                        const parsedState = JSON.parse(decodeURIComponent(state));
                        brandId = parsedState.brandId;
                    } catch (e) {
                        console.error('Failed to parse state', e);
                    }
                }

                if (!brandId) throw new Error('Brand ID missing in state');

                await api.integrations.metaAds.exchangeCode(code, brandId);
                setStatus('success');
                setTimeout(() => { router.push(`/brands/${brandId}`); }, 2000);
            } catch (err: any) {
                console.error(err);
                setStatus('error');
                setError(err.message || 'Failed to exchange token');
            }
        };

        handleExchange();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[rgba(22,32,50,0.8)]">
            <div className="bg-[rgba(22,32,50,0.6)] p-8 rounded-lg shadow-lg border border-white/[0.06] max-w-md w-full text-center">
                {status === 'processing' && (
                    <div className="space-y-4">
                        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-white/50 font-medium">Connecting to Meta Ads...</p>
                    </div>
                )}
                {status === 'success' && (
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl">{'\u2713'}</div>
                        <p className="text-white font-bold text-lg">Connected Successfully!</p>
                        <p className="text-white/50">Redirecting to dashboard...</p>
                    </div>
                )}
                {status === 'error' && (
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl">{'\u2715'}</div>
                        <p className="text-red-600 font-bold text-lg">Connection Failed</p>
                        <p className="text-white/50 text-sm">{error}</p>
                        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-[rgba(22,32,50,0.8)] text-white rounded hover:bg-white/[0.06]">Go Back</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MetaAdsCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MetaCallbackContent />
        </Suspense>
    );
}

"use client";

import React from 'react';
import NeonButton from '@/components/ui/NeonButton';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white px-4 text-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-6">
                Something went wrong!
            </h2>
            <p className="text-gray-400 mb-2 font-mono text-sm max-w-lg bg-black/50 p-4 rounded border border-white/10">
                {error.message || "An unexpected error occurred."}
            </p>
            {error.digest && (
                <p className="text-xs text-gray-600 mb-8">Error Digest: {error.digest}</p>
            )}
            <div className="flex gap-4">
                <NeonButton variant="primary" onClick={() => reset()}>
                    Try Again
                </NeonButton>
                <NeonButton variant="outline" onClick={() => window.location.reload()}>
                    Hard Reload
                </NeonButton>
            </div>
        </div>
    );
}

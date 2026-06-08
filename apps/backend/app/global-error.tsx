"use client";

import React from 'react';
import NeonButton from '@/components/ui/NeonButton';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body className="bg-[#0a0a0a] text-white font-sans antialiased min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center px-4 max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-8">
                        Critical System Failure
                    </h2>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 w-full text-left font-mono text-sm overflow-x-auto">
                        <p className="text-red-400 font-bold mb-2">Error Details:</p>
                        <p className="text-gray-300 break-words">{error.message}</p>
                        {error.digest && (
                            <p className="text-gray-500 mt-4 text-xs">Digest ID: {error.digest}</p>
                        )}
                    </div>
                    <p className="text-gray-400 mb-8 max-w-md">
                        The application encountered a critical error at the root level. Access to the main interface is currently blocked.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => reset()}
                            className="px-6 py-3 bg-primary text-black font-bold uppercase tracking-wider rounded border border-primary hover:bg-transparent hover:text-primary transition-all"
                        >
                            Attempt Recovery
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-transparent text-white font-bold uppercase tracking-wider rounded border border-white/20 hover:bg-white/10 transition-all"
                        >
                            Force Reload
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}

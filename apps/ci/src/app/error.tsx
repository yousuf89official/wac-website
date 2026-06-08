'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCcw, Copy, Check } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        console.error('CRITICAL APP ERROR:', error);
    }, [error]);

    const copyError = () => {
        const text = `${error.name}: ${error.message}\n\nStack Trace:\n${error.stack}\n\nDigest: ${error.digest || 'N/A'}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background p-4 animate-in fade-in duration-500">
            <div className="bg-card border border-border rounded-lg shadow-sm max-w-2xl w-full overflow-hidden">
                {/* Header Section */}
                <div className="px-10 pt-12 pb-6">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground-soft mb-4">
                        Intelligence · Error
                    </p>
                    <h2 className="font-fraunces text-4xl md:text-5xl text-foreground leading-[1.05] tracking-tight mb-4">
                        Something went wrong.
                    </h2>
                    <p className="font-newsreader text-base text-foreground-soft max-w-md leading-relaxed">
                        The system encountered an unhandled exception. Your work has been preserved — please try again, or return to the start.
                    </p>
                </div>

                {/* Error Details Section */}
                <div className="px-10 space-y-4">
                    <div className="relative">
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft mb-2">
                            Technical Exception
                        </p>
                        <div className="bg-background-2 border border-border rounded p-5 relative">
                            <pre className="text-destructive font-mono text-xs overflow-x-auto max-h-48 leading-relaxed">
                                {error.stack || `${error.name}: ${error.message}`}
                            </pre>
                            <button
                                onClick={copyError}
                                className="absolute top-3 right-3 px-3 py-1.5 bg-card hover:bg-card border border-border rounded text-foreground-soft hover:text-foreground transition-all flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em]"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3 w-3 text-success" />
                                        <span>Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3" />
                                        <span>Copy Stack</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <p className="font-newsreader text-sm text-foreground-soft leading-relaxed">
                        Sharing this log with our engineering team will significantly speed up resolution.
                    </p>
                </div>

                {/* Action Section */}
                <div className="px-10 py-10">
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => reset()}
                            className="px-6 h-12 bg-primary text-primary-foreground rounded font-mono text-[11px] uppercase tracking-[0.22em] hover:opacity-90 transition-all flex items-center gap-2"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            Try again
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-6 h-12 bg-card text-foreground border border-border rounded font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-background-2 transition-all"
                        >
                            Back to start
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

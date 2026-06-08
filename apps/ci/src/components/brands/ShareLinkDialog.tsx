'use client';

import React, { useState, useEffect } from 'react';
import {
    Share2,
    Link,
    Copy,
    Check,
    X,
    ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const ShareLinkDialog = ({
    isOpen,
    onClose,
    brandId,
    brandName
}: {
    isOpen: boolean,
    onClose: () => void,
    brandId: string,
    brandName: string
}) => {
    const [isLoading, setIsLoading] = useState(false);

    // Custom pretty URL logic
    const brandedUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/brand/${brandName.replace(/\s+/g, '')}/IntelligenceDashboard`
        : '';

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brandId })
            });
            const data = await res.json();

            if (res.ok) {
                // Custom link success behavior
                navigator.clipboard.writeText(brandedUrl);
                toast.success("Public Access Generated & Link Copied!");
                onClose(); // Dismiss dialog immediately as requested
            } else {
                toast.error(data.error || "Failed to generate share link");
            }
        } catch (error) {
            console.error("Error generating share link:", error);
            toast.error("Error generating share link");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white/[0.04] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
                <div className="p-8 space-y-6">
                    <div className="space-y-2 text-center text-white">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-emerald-500/10 text-emerald-400 mb-4 animate-in zoom-in-50 duration-500">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight">Configure Public Access</DialogTitle>
                        <DialogDescription className="text-white/50 font-medium">
                            Grant secure visibility for <span className="font-black text-white">{brandName}</span> via a branded dashboard.
                        </DialogDescription>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.06] space-y-2">
                            <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Branded URL Preview</Label>
                            <div className="flex items-center gap-2 text-xs font-black text-white/60">
                                <Link className="h-3.5 w-3.5 text-[#0D9488]" />
                                <span className="truncate opacity-60">.../brand/</span>
                                <span className="text-white">{brandName.replace(/\s+/g, '')}</span>
                                <span className="opacity-60">/IntelligenceDashboard/</span>
                            </div>
                        </div>

                        <p className="text-[10px] text-white/40 font-medium text-center italic leading-relaxed px-4">
                            Clicking generate will activate this URL and automatically copy it to your clipboard for instant sharing.
                        </p>
                    </div>
                </div>
                <DialogFooter className="px-8 py-6 bg-white/[0.03] border-t border-white/[0.06] sm:justify-center gap-3">
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        className="h-12 flex-1 rounded-2xl font-black text-[10px] tracking-widest border-white/10"
                    >
                        CANCEL
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="h-12 flex-[1.5] bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-2xl font-black text-[10px] tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95"
                    >
                        {isLoading ? 'GENERATING...' : 'GENERATE PUBLIC ACCESS'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Internal label component wrapper
const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={className}>{children}</div>
);

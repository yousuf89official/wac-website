'use client';

import React, { useEffect, useState } from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import { cn } from '@/lib/utils';

export const ProgressBar = () => {
    const { isLoading } = useLoading();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isLoading) {
            setVisible(true);
            setProgress(0);

            // Artificial progress steps for smooth UX
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev < 30) return prev + Math.random() * 10;
                    if (prev < 70) return prev + Math.random() * 5;
                    if (prev < 90) return prev + Math.random() * 1;
                    return prev;
                });
            }, 200);
        } else {
            setProgress(100);
            const timeout = setTimeout(() => {
                setVisible(false);
                setTimeout(() => setProgress(0), 300);
            }, 400);
            return () => {
                clearTimeout(timeout);
                if (interval) clearInterval(interval);
            };
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLoading]);

    if (!visible && progress === 0) return null;

    return (
        <div
            className={cn(
                "fixed top-0 left-0 right-0 z-[10000] h-[3px] w-full transition-opacity duration-300",
                visible ? "opacity-100" : "opacity-0"
            )}
        >
            <div
                style={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-brand-primary via-primary to-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.5)]"
            />
            {/* Glossy overlay */}
            <div
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent animate-shimmer"
                style={{ backgroundSize: '200% 100%' }}
            />
        </div>
    );
};

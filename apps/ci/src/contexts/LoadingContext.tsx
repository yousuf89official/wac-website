'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface LoadingContextType {
    isLoading: boolean;
    activeTasks: number;
    startLoading: () => void;
    stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Static holder for non-component access (e.g. from services/api.ts)
let staticStartLoading: (() => void) | null = null;
let staticStopLoading: (() => void) | null = null;

export const triggerLoading = (active: boolean) => {
    if (active && staticStartLoading) {
        staticStartLoading();
    } else if (!active && staticStopLoading) {
        staticStopLoading();
    }
};

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [activeTasks, setActiveTasks] = useState(0);

    const startLoading = useCallback(() => {
        setActiveTasks(prev => prev + 1);
    }, []);

    const stopLoading = useCallback(() => {
        setActiveTasks(prev => Math.max(0, prev - 1));
    }, []);

    // Connect static holder
    useEffect(() => {
        staticStartLoading = startLoading;
        staticStopLoading = stopLoading;
        return () => {
            staticStartLoading = null;
            staticStopLoading = null;
        };
    }, [startLoading, stopLoading]);

    const isLoading = activeTasks > 0;

    return (
        <LoadingContext.Provider value={{ isLoading, activeTasks, startLoading, stopLoading }}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
}

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LayoutContextType {
    headerContent: ReactNode | null;
    setHeaderContent: (content: ReactNode | null) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
    const [headerContent, setHeaderContentState] = useState<ReactNode | null>(null);

    const setHeaderContent = useCallback((content: ReactNode | null) => {
        setHeaderContentState(content);
    }, []);

    return (
        <LayoutContext.Provider value={{ headerContent, setHeaderContent }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};

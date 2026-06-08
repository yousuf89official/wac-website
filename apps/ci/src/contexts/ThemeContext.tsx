'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeColors {
    [key: string]: string;
}

interface ThemeContextType {
    colors: ThemeColors | null;
    isLoading: boolean;
    refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
    colors: null,
    isLoading: true,
    refreshTheme: async () => { },
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [colors, setColors] = useState<ThemeColors | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTheme = async () => {
        try {
            const res = await fetch('/api/theme', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setColors(data);
                if (data && typeof data === 'object') {
                    applyTheme(data);
                }
            }
        } catch (error) {
            console.warn('Failed to fetch theme (backend might be down):', error);
        } finally {
            setIsLoading(false);
        }
    };

    const applyTheme = (themeColors: ThemeColors) => {
        const root = document.documentElement;
        Object.entries(themeColors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    };

    useEffect(() => {
        fetchTheme();
    }, []);

    return (
        <ThemeContext.Provider value={{ colors, isLoading, refreshTheme: fetchTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

import React, { useEffect } from 'react';
import { useGlobalContent } from '@/hooks/useContent';

interface DynamicThemeProviderProps {
    children: React.ReactNode;
}

const hexToHsl = (hex: string): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const DynamicThemeProvider: React.FC<DynamicThemeProviderProps> = ({ children }) => {
    const { data } = useGlobalContent();

    useEffect(() => {
        if (data?.theme) {
            const { theme } = data;
            const root = document.documentElement;

            root.style.setProperty('--primary', hexToHsl(theme.primaryColor));
            root.style.setProperty('--accent', hexToHsl(theme.secondaryColor)); // mapping secondary to accent
            root.style.setProperty('--destructive', hexToHsl(theme.accentColor)); // mapping accent to destructive

            // Additional variables if needed
            if (theme.backgroundColor) {
                root.style.setProperty('--background', hexToHsl(theme.backgroundColor));
            }
            if (theme.cardBackground) {
                root.style.setProperty('--card', hexToHsl(theme.cardBackground));
            }
            if (theme.sectionPadding) {
                root.style.setProperty('--section-padding', theme.sectionPadding);
            }
        }
    }, [data]);

    return <>{children}</>;
};

export default DynamicThemeProvider;

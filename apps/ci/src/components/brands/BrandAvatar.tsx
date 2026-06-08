
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export const BrandAvatar = ({ logo_url, name, brand_color, size = 'md', containerClassName, imageClassName }: {
    logo_url?: string | null,
    name: string,
    brand_color?: string,
    size?: 'sm' | 'md' | 'lg' | 'custom',
    containerClassName?: string,
    imageClassName?: string
}) => {
    const [error, setError] = useState(false);

    // Reset error state if logo_url changes
    useEffect(() => {
        setError(false);
    }, [logo_url]);

    const containerClasses = cn(
        // Editorial: hairline border, no shadow. Brand color kept as identity marker via inline style.
        "flex items-center justify-center font-display text-foreground shrink-0 border border-border",
        size === 'sm' ? "h-10 w-10 text-lg" : size === 'md' ? "h-14 w-14 text-2xl" : size === 'lg' ? "h-20 w-20 text-4xl" : "",
        containerClassName
    );

    if (logo_url && !error) {
        return (
            <div className={containerClasses} style={{ backgroundColor: brand_color || 'hsl(var(--card))' }}>
                <img
                    src={logo_url}
                    alt={name}
                    className={cn(
                        "object-contain",
                        size === 'sm' ? "h-6 w-6" : size === 'md' ? "h-10 w-10" : size === 'lg' ? "h-14 w-14" : "",
                        imageClassName
                    )}
                    onError={() => setError(true)}
                />
            </div>
        );
    }

    return (
        <div className={containerClasses} style={{ backgroundColor: brand_color || 'hsl(var(--card))' }}>
            <div className="h-full w-full flex items-center justify-center bg-foreground/[0.06]">
                <span className="font-display">{name[0]}</span>
            </div>
        </div>
    );
};

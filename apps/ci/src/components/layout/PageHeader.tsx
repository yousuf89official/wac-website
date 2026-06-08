'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
    icon: LucideIcon;
    category: string;
    title: string;
    description: string;
    actions?: React.ReactNode;
    tabs?: React.ReactNode;
}

export const PageHeader = ({
    icon: Icon,
    category,
    title,
    description,
    actions,
    tabs
}: PageHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
            <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#0D9488]">
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{category}</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">{title}</h1>
                <p className="text-sm text-white/40 font-medium">{description}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
                {tabs && (
                    <div className="flex p-1 glass rounded-xl">
                        {tabs}
                    </div>
                )}
                {actions}
            </div>
        </div>
    );
};

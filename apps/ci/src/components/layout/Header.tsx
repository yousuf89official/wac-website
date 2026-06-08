'use client';

import { usePathname } from 'next/navigation';
import { useLayout } from '@/contexts/LayoutContext';
import { NotificationCenter } from './NotificationCenter';
import { CommandPaletteTrigger } from './CommandPalette';
import { getActiveSectionLabel } from './Sidebar';

interface HeaderProps {
    onAddWidget?: () => void;
}

export const Header = ({ onAddWidget: _onAddWidget }: HeaderProps) => {
    const { headerContent } = useLayout();
    const pathname = usePathname();
    const sectionLabel = getActiveSectionLabel(pathname);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background-2 px-4 lg:h-[72px] lg:px-6">
            {/* Spacer for mobile hamburger (positioned by Sidebar component) */}
            <div className="w-12 lg:hidden" />

            {headerContent ? (
                <div className="flex w-full animate-in fade-in slide-in-from-top-2 items-center gap-3 duration-500">
                    <div className="min-w-0 flex-1">{headerContent}</div>
                    <CommandPaletteTrigger />
                    <NotificationCenter />
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            Intelligence
                        </span>
                        <span className="inline-block h-px w-6 bg-foreground/20" />
                        <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
                            {sectionLabel}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CommandPaletteTrigger />
                        <NotificationCenter />
                    </div>
                </div>
            )}
        </header>
    );
};

'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { WidgetDrawer } from '../dashboard/WidgetDrawer';

interface AppShellProps {
    children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <Header onAddWidget={() => setDrawerOpen(true)} />
                <main className="scrollbar-thin flex-1 overflow-y-auto">
                    <div className="px-6 py-12 md:px-12 lg:px-16">
                        {children}
                    </div>
                </main>
            </div>
            <WidgetDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
            <CommandPalette />
        </div>
    );
};

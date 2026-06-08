'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { ThemeSwitcher } from '@wac/ui/theme-switcher';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ALL_FEATURES, hasFeatureAccess } from '@/lib/features';

interface NavItem {
    label: string;
    href: string;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
    {
        title: 'Social Listening',
        items: [
            { label: 'Overview', href: '/lens/dashboard' },
            { label: 'Live Feed', href: '/lens/feed' },
            { label: 'Media Monitoring', href: '/lens/media-monitoring' },
            { label: 'Crisis Intelligence', href: '/lens/crisis' },
            { label: 'Influencer Intelligence', href: '/lens/influencers' },
            { label: 'Reputation Benchmarking', href: '/lens/reputation' },
            { label: 'Public Opinion', href: '/lens/public-opinion' },
        ],
    },
    {
        title: 'Overview',
        items: [
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Widgets & Cards', href: '/dashboard/widgets' },
        ],
    },
    {
        title: 'Operations',
        items: [
            { label: 'Brands', href: '/brands' },
            { label: 'Media Analyzer', href: '/ave-calculator' },
            { label: 'Campaigns', href: '/admin/brand-campaign-settings' },
            { label: 'Reports', href: '/reports' },
        ],
    },
    {
        title: 'Public Site',
        items: [
            { label: 'CMS Manager', href: '/admin/cms' },
            { label: 'SEO / AEO Manager', href: '/admin/seo-manager' },
            { label: 'Brand Identity', href: '/admin/brand-identity' },
            { label: 'AI Chatbot', href: '/admin/chatbot' },
        ],
    },
    {
        title: 'Growth & Revenue',
        items: [
            { label: 'Analytics & Tracking', href: '/admin/analytics' },
            { label: 'Whitelabel System', href: '/admin/whitelabel' },
            { label: 'Billing & Referrals', href: '/admin/billing' },
        ],
    },
    {
        title: 'Platform',
        items: [
            { label: 'Integrations', href: '/admin/integrations' },
            { label: 'API Keys', href: '/admin/api-keys' },
            { label: 'Users & Roles', href: '/admin/users' },
            { label: 'Security', href: '/admin/security' },
            { label: 'Activity Logs', href: '/admin/activity-logs' },
        ],
    },
    {
        title: 'Tools',
        items: [
            { label: 'Database', href: '/admin/database' },
            { label: 'Create Invoice', href: '/tools/invoice' },
            { label: 'Post ID Extractors', href: '/tools/extractors' },
            { label: 'Settings', href: '/admin/settings' },
        ],
    },
];

/** Flat list of all nav items — used to derive the active section label
 *  for breadcrumbs in the main content frame. */
export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export function getActiveSectionLabel(pathname: string | null): string {
    if (!pathname) return 'Dashboard';
    // Prefer exact match, then longest startsWith.
    const exact = ALL_NAV_ITEMS.find((n) => n.href === pathname);
    if (exact) return exact.label;
    const startsWith = ALL_NAV_ITEMS
        .filter((n) => pathname.startsWith(n.href))
        .sort((a, b) => b.href.length - a.href.length);
    return startsWith[0]?.label ?? 'Dashboard';
}

interface SidebarChromeProps {
    isMobile: boolean;
    onSelect?: () => void;
    onClose?: () => void;
}

function SidebarChrome({ isMobile, onSelect, onClose }: SidebarChromeProps) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    const toggleSection = (title: string) => {
        setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
    };

    const initials = (user?.name || 'G')
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <>
            {/* Wordmark */}
            <div className="flex items-start justify-between px-6 pt-10 pb-8">
                <Link
                    href="/dashboard"
                    onClick={onSelect}
                    className="text-left"
                >
                    <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-2">
                        Intelligence
                    </p>
                    <h2 className="font-display text-2xl font-medium leading-none tracking-tightest text-foreground">
                        WAC
                    </h2>
                </Link>
                {isMobile && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close menu"
                        className="text-foreground-soft transition-colors hover:text-foreground"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                )}
            </div>

            <div className="border-t border-foreground/10" />

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
                <ul className="space-y-6">
                    {NAV_SECTIONS.map((section) => {
                        const visibleItems = section.items.filter((item) => {
                            const feature = ALL_FEATURES.find((f) => f.href === item.href);
                            if (!feature) return true;
                            return hasFeatureAccess(
                                user?.role || '',
                                (user as any)?.permissions,
                                feature.key
                            );
                        });
                        if (visibleItems.length === 0) return null;

                        const sectionCollapsed = !!collapsedSections[section.title];

                        return (
                            <li key={section.title}>
                                <button
                                    type="button"
                                    onClick={() => toggleSection(section.title)}
                                    className="group mb-3 flex w-full items-center justify-between"
                                    aria-expanded={!sectionCollapsed}
                                >
                                    <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft transition-colors group-hover:text-foreground">
                                        {section.title}
                                    </span>
                                    <ChevronDown
                                        size={12}
                                        strokeWidth={1.5}
                                        className={cn(
                                            'text-foreground-soft/60 transition-transform group-hover:text-foreground-soft',
                                            sectionCollapsed && '-rotate-90'
                                        )}
                                    />
                                </button>

                                {!sectionCollapsed && (
                                    <ul className="space-y-2.5">
                                        {visibleItems.map((item) => {
                                            const isExactMatch =
                                                item.href === '/dashboard'
                                                    ? pathname === '/dashboard'
                                                    : (pathname || '').startsWith(item.href);

                                            return (
                                                <li key={item.href}>
                                                    <Link
                                                        href={item.href}
                                                        onClick={onSelect}
                                                        className={cn(
                                                            'group flex w-full items-center justify-between font-sans text-sm tracking-wide transition-colors',
                                                            isExactMatch
                                                                ? 'text-primary'
                                                                : 'text-foreground-soft hover:text-foreground'
                                                        )}
                                                    >
                                                        <span>{item.label}</span>
                                                        {isExactMatch && (
                                                            <span className="font-mono text-2xs text-primary">
                                                                →
                                                            </span>
                                                        )}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="border-t border-foreground/10" />

            {/* Footer / User */}
            <div className="px-6 py-6">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-foreground/15 bg-background font-mono text-2xs text-foreground">
                        {user?.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={user.avatar}
                                alt={user.name || 'User'}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span>{initials || 'G'}</span>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-sm leading-tight text-foreground">
                            {user?.name || 'Guest'}
                        </p>
                        <p className="truncate font-mono text-2xs text-foreground-soft">
                            {user?.email || 'Not signed in'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={logout}
                        className="font-sans text-xs tracking-wide text-foreground-soft transition-colors hover:text-foreground"
                    >
                        Sign out
                    </button>
                    <ThemeSwitcher />
                </div>
            </div>
        </>
    );
}

export const Sidebar = () => {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile drawer on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Lock body scroll when mobile drawer is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    return (
        <>
            {/* Mobile hamburger */}
            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-background-2 text-foreground transition-colors hover:bg-foreground/[0.04] lg:hidden"
                aria-label="Open menu"
            >
                <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>

            {/* Mobile drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <div className="fixed inset-0 z-[60] lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setMobileOpen(false)}
                            className="absolute inset-0 bg-foreground/30"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-foreground/10 bg-background-2"
                        >
                            <SidebarChrome
                                isMobile
                                onSelect={() => setMobileOpen(false)}
                                onClose={() => setMobileOpen(false)}
                            />
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-foreground/10 bg-background-2 lg:flex">
                <SidebarChrome isMobile={false} />
            </aside>
        </>
    );
};

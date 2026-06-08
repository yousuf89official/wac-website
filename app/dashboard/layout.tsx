"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ThemeSwitcher } from '@wac/ui/theme-switcher';

interface CustomerData {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    company?: string;
    country?: string;
    createdAt?: string;
    _count?: {
        enrollments: number;
        orders: number;
        savedResources: number;
    };
}

const CustomerContext = createContext<CustomerData | null>(null);
export const useCustomer = () => useContext(CustomerContext);

const navItems = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/courses', label: 'My Courses' },
    { href: '/dashboard/orders', label: 'Orders' },
    { href: '/dashboard/subscriptions', label: 'Subscriptions' },
    { href: '/dashboard/resources', label: 'Saved Resources' },
    { href: '/dashboard/community', label: 'Community' },
    { href: '/dashboard/settings', label: 'Settings' },
];

function sectionLabel(pathname: string) {
    const match = navItems.find(
        (n) => n.href === pathname || (n.href !== '/dashboard' && pathname.startsWith(n.href))
    );
    return match?.label ?? 'Overview';
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [customer, setCustomer] = useState<CustomerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        fetch('/api/customer/me')
            .then((res) => {
                if (!res.ok) throw new Error('Unauthorized');
                return res.json();
            })
            .then((data) => {
                setCustomer(data.customer);
                setLoading(false);
            })
            .catch(() => {
                router.push('/login');
            });
    }, [router]);

    const handleLogout = async () => {
        await fetch('/api/customer/logout', { method: 'POST' });
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-primary" />
            </div>
        );
    }

    const initials = `${customer?.firstName?.[0] ?? ''}${customer?.lastName?.[0] ?? ''}`.toUpperCase();
    const currentLabel = sectionLabel(pathname);

    const NavList = ({ onSelect }: { onSelect?: () => void }) => (
        <ul className="space-y-3">
            {navItems.map(({ href, label }) => {
                const isActive =
                    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                return (
                    <li key={href}>
                        <button
                            type="button"
                            onClick={() => {
                                router.push(href);
                                onSelect?.();
                            }}
                            className={`group flex w-full items-center justify-between font-sans text-sm tracking-wide transition-colors ${
                                isActive
                                    ? 'text-primary'
                                    : 'text-foreground-soft hover:text-foreground'
                            }`}
                        >
                            <span>{label}</span>
                            {isActive && (
                                <span className="font-mono text-2xs text-primary">→</span>
                            )}
                        </button>
                    </li>
                );
            })}
        </ul>
    );

    return (
        <CustomerContext.Provider value={customer}>
            <div className="flex min-h-screen bg-background text-foreground">
                {/* Desktop Sidebar */}
                <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-foreground/10 bg-background-2 lg:flex">
                    <div className="px-6 pt-10 pb-8">
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="text-left"
                        >
                            <p className="eyebrow mb-2">Member Portal</p>
                            <h2 className="font-display text-2xl font-medium leading-none tracking-tightest">
                                WAC
                            </h2>
                        </button>
                    </div>

                    <div className="border-t border-foreground/10" />

                    <nav className="flex-1 px-6 py-8">
                        <NavList />
                    </nav>

                    <div className="border-t border-foreground/10" />

                    <div className="px-6 py-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 bg-background font-mono text-2xs text-foreground">
                                {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-display text-sm leading-tight">
                                    {customer?.firstName} {customer?.lastName}
                                </p>
                                <p className="truncate font-mono text-2xs text-foreground-soft">
                                    {customer?.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="font-sans text-xs tracking-wide text-foreground-soft transition-colors hover:text-foreground"
                            >
                                Sign out
                            </button>
                            <ThemeSwitcher />
                        </div>
                    </div>
                </aside>

                {/* Mobile Top Bar */}
                <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-foreground/10 bg-background-2/95 px-5 py-4 backdrop-blur lg:hidden">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                        className="text-foreground"
                    >
                        <Menu className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                    <div className="text-center">
                        <p className="eyebrow text-2xs">Portal</p>
                        <p className="font-display text-sm leading-none">{currentLabel}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 font-mono text-2xs">
                        {initials}
                    </div>
                </div>

                {/* Mobile Drawer */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <div className="fixed inset-0 z-[60] lg:hidden">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSidebarOpen(false)}
                                className="absolute inset-0 bg-foreground/30"
                            />
                            <motion.aside
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-foreground/10 bg-background-2"
                            >
                                <div className="flex items-start justify-between px-6 pt-10 pb-8">
                                    <div>
                                        <p className="eyebrow mb-2">Member Portal</p>
                                        <h2 className="font-display text-2xl font-medium leading-none tracking-tightest">
                                            WAC
                                        </h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSidebarOpen(false)}
                                        aria-label="Close menu"
                                        className="text-foreground-soft"
                                    >
                                        <X className="h-5 w-5" strokeWidth={1.5} />
                                    </button>
                                </div>
                                <div className="border-t border-foreground/10" />
                                <nav className="flex-1 px-6 py-8">
                                    <NavList onSelect={() => setSidebarOpen(false)} />
                                </nav>
                                <div className="border-t border-foreground/10" />
                                <div className="px-6 py-6">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 bg-background font-mono text-2xs">
                                            {initials}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-display text-sm leading-tight">
                                                {customer?.firstName} {customer?.lastName}
                                            </p>
                                            <p className="truncate font-mono text-2xs text-foreground-soft">
                                                {customer?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="font-sans text-xs tracking-wide text-foreground-soft transition-colors hover:text-foreground"
                                        >
                                            Sign out
                                        </button>
                                        <ThemeSwitcher />
                                    </div>
                                </div>
                            </motion.aside>
                        </div>
                    )}
                </AnimatePresence>

                <main className="flex-1 pt-16 lg:ml-64 lg:pt-0">
                    <div className="px-6 py-12 md:px-12 lg:px-20">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                Portal
                            </span>
                            <span className="inline-block h-px w-6 bg-foreground/20" />
                            <span className="font-mono text-2xs uppercase tracking-widest text-foreground">
                                {currentLabel}
                            </span>
                        </div>
                        <hr className="rule-hairline mt-8 mb-12" />
                        {children}
                    </div>
                </main>
            </div>
        </CustomerContext.Provider>
    );
}

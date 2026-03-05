"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { BookOpen, ShoppingBag, CreditCard, Bookmark, MessageSquare, Settings, LogOut, Menu, X, ChevronRight, Home } from 'lucide-react';

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
    { href: '/dashboard', icon: Home, labelKey: 'overview' as const },
    { href: '/dashboard/courses', icon: BookOpen, labelKey: 'myCourses' as const },
    { href: '/dashboard/orders', icon: ShoppingBag, labelKey: 'orders' as const },
    { href: '/dashboard/subscriptions', icon: CreditCard, labelKey: 'subscriptions' as const },
    { href: '/dashboard/resources', icon: Bookmark, labelKey: 'savedResources' as const },
    { href: '/dashboard/community', icon: MessageSquare, labelKey: 'community' as const },
    { href: '/dashboard/settings', icon: Settings, labelKey: 'settings' as const },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('dashboard');
    const [customer, setCustomer] = useState<CustomerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        fetch('/api/customer/me')
            .then(res => {
                if (!res.ok) throw new Error('Unauthorized');
                return res.json();
            })
            .then(data => {
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
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <CustomerContext.Provider value={customer}>
            <div className="min-h-screen bg-[#0a0a0a] flex">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-white/[0.02] border-r border-white/5">
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-accent to-destructive p-[2px]">
                                <div className="w-full h-full bg-[#0a0a0a] rounded-[6px] flex items-center justify-center font-black text-white text-sm">
                                    W
                                </div>
                            </div>
                            <span className="text-white font-black text-lg tracking-tighter">WAC</span>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map(({ href, icon: Icon, labelKey }) => {
                            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                            return (
                                <button
                                    key={href}
                                    onClick={() => router.push(href)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        isActive ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {t(labelKey)}
                                    {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-black font-bold text-sm">
                                {customer?.firstName?.[0]}{customer?.lastName?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-semibold truncate">{customer?.firstName} {customer?.lastName}</p>
                                <p className="text-gray-500 text-xs truncate">{customer?.email}</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Mobile Header */}
                <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="text-white"><Menu className="w-5 h-5" /></button>
                        <span className="text-white font-bold text-sm">{t('title')}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-black font-bold text-xs">
                        {customer?.firstName?.[0]}{customer?.lastName?.[0]}
                    </div>
                </div>

                {/* Mobile Sidebar */}
                {sidebarOpen && (
                    <div className="lg:hidden fixed inset-0 z-[60]">
                        <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
                        <aside className="absolute inset-y-0 left-0 w-72 bg-[#0a0a0a] border-r border-white/5 p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-white font-black text-lg tracking-tighter">WAC</span>
                                <button onClick={() => setSidebarOpen(false)} className="text-gray-500"><X className="w-5 h-5" /></button>
                            </div>
                            <nav className="flex-1 space-y-1">
                                {navItems.map(({ href, icon: Icon, labelKey }) => {
                                    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                                    return (
                                        <button key={href} onClick={() => { router.push(href); setSidebarOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            <Icon className="w-4 h-4" />{t(labelKey)}
                                        </button>
                                    );
                                })}
                            </nav>
                            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-red-400 transition-all">
                                <LogOut className="w-4 h-4" />Logout
                            </button>
                        </aside>
                    </div>
                )}

                <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
                    <div className="p-6 lg:p-10 max-w-6xl">{children}</div>
                </main>
            </div>
        </CustomerContext.Provider>
    );
}

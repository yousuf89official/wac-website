"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { useCustomer } from './layout';
import { BookOpen, ShoppingBag, Bookmark, ChevronRight, GraduationCap } from 'lucide-react';

interface Enrollment {
    id: number;
    progress: number;
    enrolledAt: string;
    lastAccessedAt: string | null;
    course: {
        id: number;
        slug: string;
        title: string;
        image: string | null;
        category: string;
    };
}

export default function DashboardOverview() {
    const t = useTranslations('dashboard');
    const customer = useCustomer();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/portal/enrollments')
            .then(res => res.json())
            .then(data => setEnrollments(data.enrollments || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const stats = [
        { label: t('enrolledCourses'), value: customer?._count?.enrollments ?? 0, icon: BookOpen, color: 'from-primary to-cyan-400' },
        { label: t('totalOrders'), value: customer?._count?.orders ?? 0, icon: ShoppingBag, color: 'from-accent to-purple-400' },
        { label: t('savedItems'), value: customer?._count?.savedResources ?? 0, icon: Bookmark, color: 'from-destructive to-pink-400' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-black text-white tracking-tighter">
                    {t('welcome')}, {customer?.firstName} 👋
                </h1>
                <p className="text-gray-500 text-sm mt-1">{t('memberSince')} {customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString() : ''}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                                <Icon className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-2xl font-black text-white">{value}</span>
                        </div>
                        <p className="text-gray-500 text-sm">{label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">{t('quickActions')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { href: '/academy', label: t('browseCourses'), icon: GraduationCap },
                        { href: '/dashboard/orders', label: t('viewOrders'), icon: ShoppingBag },
                        { href: '/dashboard/resources', label: t('viewResources'), icon: Bookmark },
                    ].map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/5 p-4 hover:bg-white/[0.06] transition-colors group">
                            <Icon className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{label}</span>
                            <ChevronRight className="w-3 h-3 ml-auto text-gray-600 group-hover:text-gray-400 transition-colors" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Enrollments */}
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">{t('recentEnrollments')}</h2>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-8 text-center">
                        <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm mb-4">{t('noEnrollments')}</p>
                        <Link href="/academy" className="inline-flex items-center gap-2 text-primary text-sm hover:underline">
                            {t('startLearning')} <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {enrollments.slice(0, 3).map((enrollment) => (
                            <Link key={enrollment.id} href={`/academy/${enrollment.course.slug}`}
                                className="flex items-center gap-4 rounded-2xl bg-white/[0.03] border border-white/5 p-4 hover:bg-white/[0.06] transition-colors group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                                    {enrollment.course.image ? (
                                        <img src={enrollment.course.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-5 h-5 text-gray-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                        {enrollment.course.title}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-0.5">{enrollment.course.category}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-white text-sm font-bold">{enrollment.progress}%</p>
                                        <p className="text-gray-600 text-xs">{t('progress')}</p>
                                    </div>
                                    <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${enrollment.progress}%` }} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

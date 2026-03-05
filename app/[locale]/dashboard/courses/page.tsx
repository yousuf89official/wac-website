"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { BookOpen, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

interface Enrollment {
    id: number;
    progress: number;
    enrolledAt: string;
    completedAt: string | null;
    lastAccessedAt: string | null;
    course: {
        id: number;
        slug: string;
        title: string;
        image: string | null;
        category: string;
        duration: string | null;
        level: string | null;
        modules: string | null;
    };
}

export default function MyCoursesPage() {
    const t = useTranslations('dashboard');
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'inProgress' | 'completed'>('all');

    useEffect(() => {
        fetch('/api/portal/enrollments')
            .then(res => res.json())
            .then(data => setEnrollments(data.enrollments || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = enrollments.filter(e => {
        if (filter === 'completed') return e.progress === 100;
        if (filter === 'inProgress') return e.progress > 0 && e.progress < 100;
        return true;
    });

    const filters = [
        { key: 'all' as const, label: t('allCourses') },
        { key: 'inProgress' as const, label: t('inProgress') },
        { key: 'completed' as const, label: t('completed') },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-black text-white tracking-tighter">{t('myCourses')}</h1>
                <div className="flex gap-2">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                                filter === f.key
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm mb-4">{t('noCourses')}</p>
                    <Link href="/academy" className="inline-flex items-center gap-2 text-primary text-sm hover:underline">
                        {t('browseCourses')} <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map((enrollment) => {
                        const modules = enrollment.course.modules ? JSON.parse(enrollment.course.modules) : [];
                        const isCompleted = enrollment.progress === 100;

                        return (
                            <Link key={enrollment.id} href={`/academy/${enrollment.course.slug}`}
                                className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 hover:bg-white/[0.06] transition-colors group"
                            >
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="w-full sm:w-32 h-24 sm:h-20 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                                        {enrollment.course.image ? (
                                            <img src={enrollment.course.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen className="w-8 h-8 text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-white font-semibold group-hover:text-primary transition-colors truncate">
                                                    {enrollment.course.title}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-gray-500">{enrollment.course.category}</span>
                                                    {enrollment.course.level && (
                                                        <span className="text-xs text-gray-600">{enrollment.course.level}</span>
                                                    )}
                                                    {modules.length > 0 && (
                                                        <span className="text-xs text-gray-600">{modules.length} modules</span>
                                                    )}
                                                </div>
                                            </div>
                                            {isCompleted ? (
                                                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full flex-shrink-0">
                                                    <CheckCircle2 className="w-3 h-3" /> {t('completed')}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full flex-shrink-0">
                                                    <Clock className="w-3 h-3" /> {t('inProgress')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-3 flex items-center gap-3">
                                            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${isCompleted ? 'bg-green-400' : 'bg-primary'}`}
                                                    style={{ width: `${enrollment.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium w-10 text-right">{enrollment.progress}%</span>
                                        </div>

                                        {enrollment.lastAccessedAt && (
                                            <p className="text-gray-600 text-xs mt-2">
                                                {t('lastAccessed')} {new Date(enrollment.lastAccessedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

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

const ease = [0.16, 1, 0.3, 1] as const;

export default function MyCoursesPage() {
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
        { key: 'all' as const, label: "All courses" },
        { key: 'inProgress' as const, label: "In progress" },
        { key: 'completed' as const, label: "Completed" },
    ];

    return (
        <div className="space-y-12">
            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease }}
            >
                <p className="eyebrow mb-3">PORTAL / COURSES</p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">Your courses</h1>
                <p className="font-serif text-foreground-soft mt-3 text-lg max-w-2xl">
                    Pick up where you left off, or revisit a chapter you loved. Progress saves automatically.
                </p>
            </motion.header>

            <div className="flex flex-wrap items-center gap-2 border-b border-foreground/10 pb-4">
                {filters.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-full font-mono text-2xs uppercase tracking-widest transition-colors ${
                            filter === f.key
                                ? 'bg-foreground text-background'
                                : 'text-foreground-soft hover:text-foreground hover:bg-foreground/[0.04]'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="border border-foreground/10 p-12 text-center">
                    <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-4">No enrollments</p>
                    <p className="font-serif text-foreground-soft mb-6">Nothing in your library yet. The academy is a good place to start.</p>
                    <Link href="/academy" className="inline-flex items-center gap-2 text-primary font-mono text-2xs uppercase tracking-widest hover:underline">
                        Browse the academy <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                    </Link>
                </div>
            ) : (
                <motion.ul
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.7, ease }}
                    className="divide-y divide-foreground/10 border-y border-foreground/10"
                >
                    {filtered.map((enrollment, i) => {
                        const modules = enrollment.course.modules ? JSON.parse(enrollment.course.modules) : [];
                        const isCompleted = enrollment.progress === 100;
                        return (
                            <motion.li
                                key={enrollment.id}
                                initial={{ opacity: 0, x: -8 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.6, ease, delay: i * 0.04 }}
                            >
                                <Link
                                    href={`/academy/${enrollment.course.slug}`}
                                    className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-3 py-6 transition-colors hover:bg-foreground/[0.03] md:py-8"
                                >
                                    <span className="col-span-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft md:col-span-1">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <div className="col-span-10 md:col-span-7">
                                        <h3 className="font-display text-2xl font-medium tracking-tight transition-colors group-hover:text-primary md:text-3xl">
                                            {enrollment.course.title}
                                        </h3>
                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                            <span>{enrollment.course.category}</span>
                                            {enrollment.course.level && <span>{enrollment.course.level}</span>}
                                            {modules.length > 0 && <span>{modules.length} modules</span>}
                                        </div>
                                        <div className="mt-4 flex items-center gap-3 max-w-md">
                                            <div className="flex-1 h-px bg-foreground/10 relative">
                                                <div
                                                    className="absolute inset-y-0 left-0 bg-primary"
                                                    style={{ width: `${enrollment.progress}%`, height: '2px', top: '-0.5px' }}
                                                />
                                            </div>
                                            <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft w-10 text-right">
                                                {enrollment.progress}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-3 md:text-right">
                                        <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-2xs uppercase tracking-widest ${
                                            isCompleted
                                                ? 'border-primary/30 text-primary'
                                                : 'border-foreground/15 text-foreground-soft'
                                        }`}>
                                            {isCompleted ? <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} /> : <Clock className="w-3 h-3" strokeWidth={1.5} />}
                                            {isCompleted ? 'Completed' : 'In progress'}
                                        </span>
                                        {enrollment.lastAccessedAt && (
                                            <p className="mt-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                Last: {new Date(enrollment.lastAccessedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <ArrowUpRight
                                        className="col-span-12 hidden h-5 w-5 -translate-x-1 text-foreground-soft transition-all duration-500 ease-editorial group-hover:translate-x-0 group-hover:text-primary md:col-span-1 md:inline md:justify-self-end"
                                        strokeWidth={1.25}
                                    />
                                    {enrollment.course.image && (
                                        <div className="hidden md:col-span-1 md:block">
                                            <BookOpen className="w-4 h-4 text-foreground-soft" strokeWidth={1.25} />
                                        </div>
                                    )}
                                </Link>
                            </motion.li>
                        );
                    })}
                </motion.ul>
            )}
        </div>
    );
}

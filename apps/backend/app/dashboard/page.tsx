"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCustomer } from './layout';

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

interface Order {
    id: number;
    orderId?: string;
    status: string;
    amount?: number;
    currency?: string;
    createdAt: string;
    course?: { title: string; slug: string } | null;
}

interface CommunityPost {
    id: number;
    title: string;
    createdAt: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

function fmtDate(d?: string | null) {
    if (!d) return '';
    return new Date(d).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function DashboardOverview() {
    const customer = useCustomer();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [posts, setPosts] = useState<CommunityPost[]>([]);

    useEffect(() => {
        fetch('/api/portal/enrollments')
            .then((r) => r.json())
            .then((d) => setEnrollments(d.enrollments || []))
            .catch(() => {});
        fetch('/api/portal/orders')
            .then((r) => r.json())
            .then((d) => setOrders(d.orders || []))
            .catch(() => {});
        fetch('/api/portal/community')
            .then((r) => (r.ok ? r.json() : { posts: [] }))
            .then((d) => setPosts(d.posts || []))
            .catch(() => {});
    }, []);

    const stats = [
        { label: 'Active Enrollments', value: customer?._count?.enrollments ?? 0, desc: 'Courses in progress.' },
        { label: 'Total Orders', value: customer?._count?.orders ?? 0, desc: 'Transactions to date.' },
        { label: 'Saved Resources', value: customer?._count?.savedResources ?? 0, desc: 'Pieces bookmarked for later.' },
        { label: 'Member Since', value: customer?.createdAt ? new Date(customer.createdAt).getFullYear() : '—', desc: 'Year you joined the studio.' },
    ];

    type Activity = { kind: 'order' | 'post'; id: string; date: string; title: string; category: string };
    const activity: Activity[] = [
        ...orders.slice(0, 4).map((o): Activity => ({
            kind: 'order',
            id: `o-${o.id}`,
            date: o.createdAt,
            title: o.course?.title ?? o.orderId ?? `Order #${o.id}`,
            category: o.status?.toUpperCase() ?? 'ORDER',
        })),
        ...posts.slice(0, 4).map((p): Activity => ({
            kind: 'post',
            id: `p-${p.id}`,
            date: p.createdAt,
            title: p.title,
            category: 'POST',
        })),
    ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6);

    return (
        <div className="space-y-24">
            {/* Welcome */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease }}
            >
                <h1 className="font-display text-[clamp(2.5rem,5vw,3.75rem)] font-medium leading-[0.96] tracking-tightest">
                    Hello,{' '}
                    <span className="italic text-primary">{customer?.firstName ?? 'there'}</span>.
                </h1>
                <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-foreground-soft">
                    A quiet look at where you are with the studio — what you&apos;re learning,
                    what you&apos;ve commissioned, and what the room has been talking about.
                </p>
            </motion.section>

            {/* Stat strip */}
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, ease }}
            >
                <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map(({ label, value, desc }) => (
                        <div key={label} className="border-t border-foreground/15 pt-5">
                            <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                {label}
                            </p>
                            <p className="mt-4 font-display text-5xl font-medium leading-none tracking-tightest">
                                {value}
                            </p>
                            <p className="mt-3 font-serif text-sm leading-snug text-foreground-soft">
                                {desc}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Continue learning */}
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, ease }}
            >
                <div className="mb-10 flex items-end justify-between gap-4">
                    <div>
                        <div className="mb-4 flex items-center gap-3">
                            <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                01
                            </span>
                            <span className="inline-block h-px w-10 bg-foreground-soft" />
                            <span className="eyebrow">Continue learning</span>
                        </div>
                        <h2 className="font-display text-3xl font-medium leading-tight tracking-tightest md:text-4xl">
                            Where you left off.
                        </h2>
                    </div>
                    <Link
                        href="/dashboard/courses"
                        className="hidden font-mono text-2xs uppercase tracking-widest text-foreground-soft transition-colors hover:text-primary md:inline"
                    >
                        All courses →
                    </Link>
                </div>

                {enrollments.length === 0 ? (
                    <div className="border-t border-foreground/15 py-12 text-center">
                        <p className="font-serif text-base text-foreground-soft">
                            You haven&apos;t enrolled in any courses yet.
                        </p>
                        <Link
                            href="/academy"
                            className="mt-4 inline-block font-mono text-2xs uppercase tracking-widest text-primary transition-colors hover:text-foreground"
                        >
                            Browse the academy →
                        </Link>
                    </div>
                ) : (
                    <ul className="divide-y divide-foreground/10 border-y border-foreground/15">
                        {enrollments.slice(0, 4).map((e) => (
                            <li key={e.id}>
                                <Link
                                    href={`/academy/${e.course.slug}`}
                                    className="group grid grid-cols-12 items-center gap-4 py-6 transition-colors hover:bg-foreground/[0.03]"
                                >
                                    <div className="col-span-12 md:col-span-6">
                                        <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                            {e.course.category}
                                        </p>
                                        <p className="mt-2 font-display text-xl font-medium leading-tight tracking-tight transition-colors group-hover:text-primary">
                                            {e.course.title}
                                        </p>
                                    </div>
                                    <div className="col-span-9 md:col-span-5">
                                        <div className="h-px w-full bg-foreground/10">
                                            <div
                                                className="h-px bg-primary"
                                                style={{ width: `${e.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-3 text-right font-mono text-2xs uppercase tracking-widest text-foreground-soft md:col-span-1">
                                        {e.progress}%
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </motion.section>

            {/* Recent activity */}
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, ease }}
            >
                <div className="mb-10">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            02
                        </span>
                        <span className="inline-block h-px w-10 bg-foreground-soft" />
                        <span className="eyebrow">Recent activity</span>
                    </div>
                    <h2 className="font-display text-3xl font-medium leading-tight tracking-tightest md:text-4xl">
                        Lately around the studio.
                    </h2>
                </div>

                {activity.length === 0 ? (
                    <p className="border-t border-foreground/15 py-12 text-center font-serif text-base text-foreground-soft">
                        Nothing to report yet.
                    </p>
                ) : (
                    <ul className="divide-y divide-foreground/10 border-y border-foreground/15">
                        {activity.map((item) => (
                            <li key={item.id} className="py-6">
                                <div className="grid grid-cols-12 items-baseline gap-4">
                                    <div className="col-span-4 font-mono text-2xs uppercase tracking-widest text-foreground-soft md:col-span-2">
                                        {fmtDate(item.date)}
                                    </div>
                                    <div className="col-span-8 md:col-span-7">
                                        <p className="font-display text-lg font-medium leading-snug tracking-tight">
                                            {item.title}
                                        </p>
                                    </div>
                                    <div className="col-span-12 font-mono text-2xs uppercase tracking-widest text-foreground-soft md:col-span-3 md:text-right">
                                        {item.kind === 'order' ? 'Order' : 'Community'} · {item.category}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </motion.section>
        </div>
    );
}

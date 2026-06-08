"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useAffinity } from "@/hooks/use-affinity";
import { rerankByAffinity, type Category } from "@/lib/personalization";

interface FeedItem {
    slug: string;
    title: string;
    subtitle?: string;
    category: Category;
    href: string;
}

/**
 * "For you" feed — reranks suggested reading by visitor affinity.
 * Server renders a neutral default; on hydration we reorder + label.
 */
export function PersonalizedFeed({ items }: { items: FeedItem[] }) {
    const { scores, top } = useAffinity();
    const [ordered, setOrdered] = useState<FeedItem[]>(items);

    useEffect(() => {
        if (!scores) return;
        const ranked = rerankByAffinity(items, scores, items);
        setOrdered(ranked);
    }, [scores, items]);

    const hint = top ? CATEGORY_HINTS[top] : "Hand-picked";

    return (
        <section className="relative border-t border-foreground/10 py-30 md:py-40">
            <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-12 flex items-end justify-between gap-6"
                >
                    <div>
                        <p className="eyebrow mb-4 flex items-center gap-3">
                            <span className="inline-block h-px w-10 bg-foreground-soft" />
                            <span>{hint}</span>
                        </p>
                        <h2 className="font-display text-[clamp(2rem,4.5vw,4rem)] font-medium leading-[1] tracking-tight">
                            Worth your read.
                        </h2>
                    </div>
                    <Link
                        href="/resources"
                        className="hidden text-2xs font-semibold uppercase tracking-widest text-foreground-soft transition-colors hover:text-primary md:inline-flex"
                    >
                        Browse all →
                    </Link>
                </motion.div>

                <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
                    {ordered.slice(0, 6).map((item, i) => (
                        <motion.li
                            key={item.slug}
                            initial={{ opacity: 0, x: -12 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
                        >
                            <Link
                                href={item.href}
                                className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-2 py-6 transition-colors hover:bg-foreground/[0.03] md:py-8"
                            >
                                <span className="col-span-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft md:col-span-1">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="col-span-10 font-display text-2xl font-medium tracking-tight transition-colors group-hover:text-primary md:col-span-7 md:text-4xl">
                                    {item.title}
                                </span>
                                <span className="col-span-12 font-mono text-2xs uppercase tracking-widest text-foreground-soft md:col-span-3 md:text-right">
                                    {item.category}
                                </span>
                                <ArrowUpRight
                                    className="col-span-12 hidden h-5 w-5 -translate-x-1 text-foreground-soft transition-all duration-500 ease-editorial group-hover:translate-x-0 group-hover:text-primary md:col-span-1 md:inline md:justify-self-end"
                                    strokeWidth={1.25}
                                />
                            </Link>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

const CATEGORY_HINTS: Record<Category, string> = {
    services: "Because you've been reading about services",
    academy: "Because you're exploring the academy",
    resources: "More from the editorial",
    work: "More of our recent work",
    about: "More about how we work",
};

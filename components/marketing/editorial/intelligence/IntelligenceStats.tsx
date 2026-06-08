"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface Stat {
    value: number;
    suffix?: string;
    label: string;
}

const STATS: Stat[] = [
    { value: 500, suffix: "+", label: "Campaigns Managed" },
    { value: 98, suffix: "%", label: "Client Satisfaction" },
    { value: 2, suffix: "B+", label: "Impressions Tracked" },
    { value: 45, suffix: "%", label: "Avg ROI Increase" },
];

export function IntelligenceStats() {
    return (
        <section className="border-b border-foreground/10 py-20 md:py-28">
            <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="eyebrow mb-10 flex items-center gap-3"
                >
                    <span className="inline-block h-px w-10 bg-foreground-soft" />
                    <span>By the Numbers</span>
                </motion.p>

                <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-y-0">
                    {STATS.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{
                                duration: 0.9,
                                ease: [0.16, 1, 0.3, 1],
                                delay: i * 0.08,
                            }}
                            className="border-t border-foreground/15 pt-6"
                        >
                            <p className="font-display text-5xl text-foreground md:text-7xl">
                                <AnimatedCounter target={stat.value} />
                                <span className="text-primary">{stat.suffix}</span>
                            </p>
                            <p className="mt-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function AnimatedCounter({ target }: { target: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!inView) return;
        const duration = 1400;
        const start = performance.now();
        let raf = 0;
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setCount(Math.round(target * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, target]);

    return <span ref={ref}>{count.toLocaleString()}</span>;
}

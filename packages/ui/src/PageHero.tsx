"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
    eyebrow: string;
    /** Headline. Use <span className="italic"> for emphasized phrase. */
    headline: ReactNode;
    /** Optional sub-headline / lede in editorial serif. */
    lede?: ReactNode;
    /** Optional kicker beneath the lede — usually CTAs. */
    children?: ReactNode;
}

/**
 * Inner-page hero. Same DNA as HeroEditorial but shorter, no spotlight,
 * no scroll cue. Use at the top of every inner marketing page.
 */
export function PageHero({ eyebrow, headline, lede, children }: Props) {
    const ease = [0.16, 1, 0.3, 1] as const;
    return (
        <section className="relative isolate overflow-hidden border-b border-foreground/10">
            <div
                aria-hidden
                className="absolute inset-0 -z-10 opacity-[0.06]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
                    backgroundSize: "120px 120px",
                }}
            />
            <div className="mx-auto max-w-[1440px] px-6 pt-32 pb-20 md:px-12 md:pt-40 md:pb-28 lg:px-20">
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease, delay: 0.05 }}
                    className="eyebrow mb-10 flex items-center gap-3"
                >
                    <span className="inline-block h-px w-10 bg-foreground-soft" />
                    <span>{eyebrow}</span>
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease, delay: 0.15 }}
                    className="max-w-5xl font-display text-[clamp(3rem,8vw,7.5rem)] font-medium leading-[0.92] tracking-tightest"
                >
                    {headline}
                </motion.h1>

                {lede && (
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease, delay: 0.35 }}
                        className="mt-10 max-w-2xl font-serif text-lg leading-relaxed text-foreground-soft md:text-xl"
                    >
                        {lede}
                    </motion.p>
                )}

                {children && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease, delay: 0.5 }}
                        className="mt-14"
                    >
                        {children}
                    </motion.div>
                )}
            </div>
        </section>
    );
}

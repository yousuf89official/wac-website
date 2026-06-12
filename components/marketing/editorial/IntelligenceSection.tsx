"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { CI_URL } from "@/lib/urls";

const CAPABILITIES = [
    {
        n: "01",
        title: "Full-funnel analytics",
        body: "Every campaign, channel, and conversion measured against revenue — not vanity metrics.",
    },
    {
        n: "02",
        title: "AI-powered insights",
        body: "Anomalies, pacing, and opportunities surfaced automatically, with plain-language reports.",
    },
    {
        n: "03",
        title: "Unified media data",
        body: "Google, Meta, TikTok, and 20+ channels normalized into one source of truth.",
    },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function IntelligenceSection() {
    return (
        <section className="relative border-t border-foreground/10 py-30 md:py-40">
            <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease }}
                    className="mb-16 grid grid-cols-12 items-end gap-x-6 gap-y-6 md:mb-24"
                >
                    <div className="col-span-12 md:col-span-8">
                        <p className="eyebrow mb-6 flex items-center gap-3">
                            <span className="inline-block h-px w-10 bg-foreground-soft" />
                            <span>The Product · Now Live</span>
                        </p>
                        <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[0.95] tracking-tight">
                            Collaborative{" "}
                            <span
                                className="italic text-primary"
                                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                            >
                                Intelligence
                            </span>
                        </h2>
                    </div>
                    <div className="col-span-12 md:col-span-4">
                        <p className="font-serif text-base leading-relaxed text-foreground-soft md:text-lg">
                            Our enterprise campaign-intelligence platform. Connect your media accounts and
                            watch performance compound across every channel.
                        </p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-y-0">
                    {CAPABILITIES.map((c, i) => (
                        <motion.div
                            key={c.n}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.9, ease, delay: i * 0.1 }}
                            className="border-t border-foreground/15 pt-6"
                        >
                            <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                {c.n}
                            </p>
                            <h3 className="mt-6 font-display text-2xl font-medium tracking-tight md:text-3xl">
                                {c.title}
                            </h3>
                            <p className="mt-4 font-serif text-base leading-relaxed text-foreground-soft">
                                {c.body}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease, delay: 0.2 }}
                    className="mt-16 flex flex-col items-start gap-6 sm:flex-row sm:items-center md:mt-24"
                >
                    <a
                        href={CI_URL}
                        className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-primary px-8 text-2xs font-semibold uppercase tracking-widest text-background transition-all hover:gap-5"
                    >
                        Explore the platform
                        <ArrowUpRight
                            className="h-4 w-4 transition-transform group-hover:rotate-45"
                            strokeWidth={1.5}
                        />
                    </a>
                    <Link
                        href="/intelligence"
                        className="group inline-flex h-12 items-center gap-3 border-b border-foreground/30 pb-1 text-2xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                        Learn more
                        <ArrowUpRight
                            className="h-3.5 w-3.5 transition-transform duration-500 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            strokeWidth={1.5}
                        />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

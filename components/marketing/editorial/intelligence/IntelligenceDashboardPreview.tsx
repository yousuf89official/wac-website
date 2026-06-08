"use client";

import { motion } from "framer-motion";

/**
 * Placeholder for the dashboard mockup. Renders an Editorial-Luxe
 * "browser window" with a 16:9 surface inside, hairline-bordered.
 * Replace the inner placeholder with a static asset once design ships:
 *   <Image src="/intelligence/hero-dashboard.svg" alt="WAC Intelligence dashboard" fill className="object-cover" />
 */
export function IntelligenceDashboardPreview() {
    return (
        <section className="border-b border-foreground/10 py-12 md:py-20">
            <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                >
                    {/* Browser chrome */}
                    <div className="rounded-2xl border border-foreground/10 bg-background-2 p-2 shadow-2xl shadow-foreground/[0.04]">
                        <div className="flex items-center gap-2 px-3 py-2">
                            <span className="block h-2.5 w-2.5 rounded-full bg-foreground/10" />
                            <span className="block h-2.5 w-2.5 rounded-full bg-foreground/10" />
                            <span className="block h-2.5 w-2.5 rounded-full bg-foreground/10" />
                            <div className="mx-8 flex-1">
                                <div className="flex h-5 items-center rounded-md border border-foreground/5 bg-background px-3">
                                    <span className="font-mono text-[10px] text-foreground-soft">
                                        wearecollaborative.net/intelligence/dashboard
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Surface */}
                        <div
                            className="relative overflow-hidden rounded-xl border border-foreground/10 bg-background"
                            style={{ aspectRatio: "16/9" }}
                        >
                            <DashboardMock />
                        </div>
                    </div>

                    {/* Sienna glow */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -inset-12 -z-10 opacity-30"
                        style={{
                            background:
                                "radial-gradient(50% 50% at 50% 50%, hsl(var(--primary) / 0.25), transparent 70%)",
                        }}
                    />
                </motion.div>
            </div>
        </section>
    );
}

/* Editorial-Luxe-themed static dashboard mock. Pure SVG + tokens, no recharts. */
function DashboardMock() {
    return (
        <div className="grid h-full grid-cols-12 grid-rows-6 gap-3 p-4 md:p-6">
            {/* Sidebar */}
            <aside className="col-span-2 row-span-6 hidden flex-col gap-2 border-r border-foreground/10 pr-3 md:flex">
                <p className="eyebrow mb-3 text-2xs">Workspace</p>
                {["Overview", "Campaigns", "Channels", "Reports", "Lens", "AVE"].map(
                    (item, i) => (
                        <div
                            key={item}
                            className={`flex items-center justify-between rounded px-2 py-1.5 text-xs ${
                                i === 0
                                    ? "bg-primary/10 text-primary"
                                    : "text-foreground-soft"
                            }`}
                        >
                            <span>{item}</span>
                            {i === 0 && <span className="font-mono text-2xs">→</span>}
                        </div>
                    )
                )}
            </aside>

            {/* Header strip */}
            <div className="col-span-12 row-span-1 flex items-baseline justify-between border-b border-foreground/10 pb-3 md:col-span-10 md:col-start-3">
                <div>
                    <p className="eyebrow text-2xs">Campaign Performance</p>
                    <p className="font-display text-base md:text-xl">
                        Q2 2026 · Multi-channel
                    </p>
                </div>
                <div className="hidden items-center gap-2 md:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    <span className="font-mono text-2xs text-foreground-soft">
                        Live · synced 2m ago
                    </span>
                </div>
            </div>

            {/* Big metric */}
            <div className="col-span-12 row-span-2 flex flex-col justify-center border-b border-foreground/10 pb-3 md:col-span-5 md:col-start-3 md:row-span-2">
                <p className="eyebrow text-2xs">Reach (M)</p>
                <p className="font-display text-3xl text-primary md:text-5xl">
                    2.4B<span className="text-foreground-soft">+</span>
                </p>
                <p className="mt-1 font-mono text-2xs text-foreground-soft">
                    ↑ 18.4% vs prior quarter
                </p>

                {/* Sparkline */}
                <svg
                    viewBox="0 0 200 40"
                    className="mt-3 h-10 w-full"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0,32 C20,28 30,18 50,20 C70,22 80,12 100,14 C120,16 130,8 150,10 C170,12 185,4 200,6"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="1.5"
                    />
                </svg>
            </div>

            {/* Channel breakdown bars */}
            <div className="col-span-12 row-span-2 flex flex-col gap-1.5 border-b border-foreground/10 pb-3 md:col-span-5 md:col-start-8 md:row-span-2">
                <p className="eyebrow mb-1 text-2xs">By Channel</p>
                {[
                    { label: "Google", pct: 86 },
                    { label: "Meta", pct: 71 },
                    { label: "TikTok", pct: 58 },
                    { label: "LinkedIn", pct: 42 },
                ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                        <span className="w-16 font-mono text-2xs text-foreground-soft">
                            {row.label}
                        </span>
                        <div className="relative h-1 flex-1 bg-foreground/10">
                            <div
                                className="absolute inset-y-0 left-0 bg-primary"
                                style={{ width: `${row.pct}%` }}
                            />
                        </div>
                        <span className="w-10 text-right font-mono text-2xs text-foreground-soft">
                            {row.pct}%
                        </span>
                    </div>
                ))}
            </div>

            {/* Stat trio */}
            <div className="col-span-12 row-span-3 grid grid-cols-3 gap-3 md:col-span-10 md:col-start-3 md:row-span-3">
                {[
                    { label: "AVE", value: "$1.2M", trend: "+24%" },
                    { label: "SOV", value: "34.7%", trend: "+8.1%" },
                    { label: "Engagement", value: "4.8%", trend: "+0.6pt" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="flex flex-col justify-between border-t border-foreground/15 pt-3"
                    >
                        <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            {stat.label}
                        </p>
                        <p className="font-display text-xl text-foreground md:text-3xl">
                            {stat.value}
                        </p>
                        <p className="font-mono text-2xs text-success">{stat.trend}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

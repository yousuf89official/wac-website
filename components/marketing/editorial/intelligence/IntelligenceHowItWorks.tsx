"use client";

import { motion } from "framer-motion";

const STEPS = [
    {
        n: "01",
        title: "Connect Your Channels",
        desc: "Integrate ad platforms, social media accounts, and media-buying tools in minutes — Google, Meta, TikTok, LinkedIn, and 20+ others.",
    },
    {
        n: "02",
        title: "Unified Intelligence",
        desc: "All your data flows into a single dashboard with real-time cross-channel analytics. No more spreadsheet stitching.",
    },
    {
        n: "03",
        title: "Actionable Insights",
        desc: "AI surfaces opportunities, flags anomalies, and generates optimization recommendations your team can act on the same day.",
    },
];

export function IntelligenceHowItWorks() {
    return (
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-0">
            {STEPS.map((step, i) => (
                <motion.div
                    key={step.n}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                        duration: 0.9,
                        ease: [0.16, 1, 0.3, 1],
                        delay: i * 0.1,
                    }}
                    className="relative md:border-l md:border-foreground/10 md:pl-8 md:first:border-l-0 md:first:pl-0"
                >
                    <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        Step {step.n}
                    </p>
                    <h3 className="mt-6 font-display text-3xl font-medium tracking-tight md:text-4xl">
                        {step.title}
                    </h3>
                    <p className="mt-4 font-serif text-base leading-relaxed text-foreground-soft md:text-lg">
                        {step.desc}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}

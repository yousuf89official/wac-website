"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface Pillar {
    n: string;
    title: string;
    description: string;
    bullets: string[];
}

const PILLARS: Pillar[] = [
    {
        n: "01",
        title: "Collaborative Workflows",
        description:
            "Brands, agencies, and stakeholders on one platform — with role-based access and real-time collaboration across every campaign.",
        bullets: ["RBAC permissions", "Brand workspaces", "Approval flows", "Audit log"],
    },
    {
        n: "02",
        title: "Full-Funnel Analytics",
        description:
            "Track ATL, BTL, and digital from awareness to conversion to retention — in real time, across every channel you run.",
        bullets: ["Cross-channel attribution", "AVE + SOV", "Cohort tracking", "Live dashboards"],
    },
    {
        n: "03",
        title: "AI-Powered Insights",
        description:
            "Machine-learning models surface hidden patterns, predict campaign outcomes, and recommend budget reallocation.",
        bullets: ["Anomaly detection", "Forecasting", "Budget recommendations", "Auto-narrative"],
    },
];

export function IntelligencePillars() {
    return (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-y-0">
            {PILLARS.map((pillar, i) => (
                <PillarCard key={pillar.n} pillar={pillar} index={i} />
            ))}
        </div>
    );
}

function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
    const offsetClass =
        index === 0 ? "md:mt-0" : index === 1 ? "md:mt-12" : "md:mt-24";
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
                delay: index * 0.1,
            }}
            className={`group border-t border-foreground/15 pt-6 transition-colors hover:border-primary ${offsetClass}`}
        >
            <div className="flex items-baseline justify-between">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                    {pillar.n}
                </p>
                <ArrowUpRight
                    className="h-4 w-4 -translate-x-1 translate-y-1 text-foreground-soft transition-all duration-500 ease-editorial group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-primary"
                    strokeWidth={1.25}
                />
            </div>
            <h3 className="mt-8 font-display text-4xl font-medium tracking-tight transition-colors group-hover:text-primary md:text-5xl">
                {pillar.title}
            </h3>
            <p className="mt-6 font-serif text-base leading-relaxed text-foreground-soft md:text-lg">
                {pillar.description}
            </p>
            <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                {pillar.bullets.map((b) => (
                    <li
                        key={b}
                        className="border-l border-foreground/15 pl-3 transition-colors group-hover:border-primary/50"
                    >
                        {b}
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}

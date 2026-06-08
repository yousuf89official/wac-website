"use client";

import { motion } from "framer-motion";
import {
    BarChart3,
    Calculator,
    Cable,
    LayoutGrid,
    TrendingUp,
    Lock,
} from "lucide-react";

const FEATURES = [
    {
        Icon: BarChart3,
        title: "Real-Time Dashboards",
        desc: "Live KPI tracking with auto-refreshing data pipelines and instant notifications.",
    },
    {
        Icon: Calculator,
        title: "AVE & SOV Calculator",
        desc: "Industry-standard Advertising Value Equivalency and Share of Voice metrics at your fingertips.",
    },
    {
        Icon: Cable,
        title: "Platform Integrations",
        desc: "Connect Google Ads, Meta, TikTok, LinkedIn, and 20+ other platforms seamlessly.",
    },
    {
        Icon: LayoutGrid,
        title: "Campaign Manager",
        desc: "Plan, execute, and optimize multi-channel campaigns from a single unified interface.",
    },
    {
        Icon: TrendingUp,
        title: "Predictive Analytics",
        desc: "AI models that forecast performance trends and recommend budget allocations.",
    },
    {
        Icon: Lock,
        title: "Role-Based Access",
        desc: "Granular permissions from brand-level to sub-campaign, with team collaboration built in.",
    },
];

export function IntelligenceFeatures() {
    return (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 border-y border-foreground/10 py-12 md:grid-cols-2 lg:grid-cols-3 md:gap-y-14">
            {FEATURES.map((f, i) => (
                <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1],
                        delay: (i % 3) * 0.08,
                    }}
                    className="group"
                >
                    <f.Icon
                        className="h-6 w-6 text-primary transition-transform duration-500 ease-editorial group-hover:scale-110"
                        strokeWidth={1.25}
                    />
                    <h3 className="mt-6 font-display text-2xl font-medium tracking-tight md:text-3xl">
                        {f.title}
                    </h3>
                    <p className="mt-3 font-serif text-base leading-relaxed text-foreground-soft">
                        {f.desc}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}

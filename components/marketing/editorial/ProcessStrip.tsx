"use client";

import { motion } from "framer-motion";

interface ProcessStep {
    n: string;
    title: string;
    description: string;
}

const STEPS: ProcessStep[] = [
    {
        n: "01",
        title: "Diagnose",
        description:
            "We audit positioning, channels, and growth model — separating signal from noise before a single recommendation.",
    },
    {
        n: "02",
        title: "Compose",
        description:
            "We assemble the specific specialists your problem needs — never a fixed pod, always the right hand for the work.",
    },
    {
        n: "03",
        title: "Execute",
        description:
            "Weekly sprints, transparent dashboards, ruthless prioritization. We ship what compounds, kill what doesn't.",
    },
    {
        n: "04",
        title: "Compound",
        description:
            "Each channel reinforces the next. Quarterly we re-baseline, redeploy, and double down on what's working.",
    },
];

/**
 * Horizontal 4-step process strip. Hairline rules between each step,
 * mono number on top, Fraunces step name, Newsreader description.
 */
export function ProcessStrip() {
    const ease = [0.16, 1, 0.3, 1] as const;

    return (
        <div className="grid grid-cols-1 gap-y-10 md:grid-cols-4 md:gap-y-0">
            {STEPS.map((step, i) => (
                <motion.div
                    key={step.n}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease, delay: i * 0.08 }}
                    className={`relative pt-6 md:pt-8 md:pr-8 ${
                        i > 0 ? "md:border-l md:border-foreground/10 md:pl-8" : ""
                    }`}
                >
                    <div className="border-t border-foreground/15 md:hidden" />
                    <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        {step.n}
                    </p>
                    <h3 className="mt-6 font-display text-3xl font-medium leading-[1] tracking-tight md:text-4xl">
                        {step.title}
                    </h3>
                    <p className="mt-5 font-serif text-sm leading-relaxed text-foreground-soft md:text-base">
                        {step.description}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}

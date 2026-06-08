"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface ServiceCard {
    n: string;
    title: string;
    description: string;
    href: string;
    skills: string[];
}

const SERVICES: ServiceCard[] = [
    {
        n: "01",
        title: "Strategy",
        description:
            "Positioning, audience research, growth modeling. We define the shape of what you're building before we touch a single channel.",
        href: "/services#strategy",
        skills: ["Brand strategy", "Audience research", "Growth modeling", "Competitive analysis"],
    },
    {
        n: "02",
        title: "Performance",
        description:
            "SEO, paid media, lifecycle. The compounding engine — every channel measured against revenue, not vanity.",
        href: "/services#performance",
        skills: ["SEO", "Paid media", "Email & lifecycle", "Analytics"],
    },
    {
        n: "03",
        title: "Creative",
        description:
            "Brand identity, content, web. The surface area people actually feel — designed to be memorable, not merely correct.",
        href: "/services#creative",
        skills: ["Identity design", "Content production", "Web development", "Editorial"],
    },
];

export function ServicesTriptych() {
    return (
        <section className="relative border-t border-foreground/10 py-30 md:py-40">
            <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-16 grid grid-cols-12 items-end gap-x-6 gap-y-6 md:mb-24"
                >
                    <div className="col-span-12 md:col-span-7">
                        <p className="eyebrow mb-6 flex items-center gap-3">
                            <span className="inline-block h-px w-10 bg-foreground-soft" />
                            <span>What We Do</span>
                        </p>
                        <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[0.95] tracking-tight">
                            Three disciplines.{" "}
                            <span className="italic text-foreground-soft" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}>
                                Composed.
                            </span>
                        </h2>
                    </div>
                    <div className="col-span-12 md:col-span-4 md:col-start-9">
                        <p className="font-serif text-base leading-relaxed text-foreground-soft md:text-lg">
                            We don&apos;t sell discrete services. We sell composition — the right specialists, sequenced to compound on each other.
                        </p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-y-0">
                    {SERVICES.map((s, i) => (
                        <ServiceCardView key={s.n} card={s} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ServiceCardView({ card, index }: { card: ServiceCard; index: number }) {
    // Asymmetric vertical offsets — first card sits high, middle middle, last low
    const offsetClass = index === 0 ? "md:mt-0" : index === 1 ? "md:mt-12" : "md:mt-24";

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
            className={offsetClass}
        >
            <Link
                href={card.href}
                className="group relative block border-t border-foreground/15 pt-6 transition-colors hover:border-primary"
            >
                <div className="flex items-baseline justify-between">
                    <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        {card.n}
                    </p>
                    <ArrowUpRight
                        className="h-4 w-4 -translate-x-1 translate-y-1 text-foreground-soft transition-all duration-500 ease-editorial group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-primary"
                        strokeWidth={1.25}
                    />
                </div>

                <h3 className="mt-8 font-display text-5xl font-medium tracking-tight transition-colors group-hover:text-primary md:text-6xl">
                    {card.title}
                </h3>

                <p className="mt-6 font-serif text-base leading-relaxed text-foreground-soft md:text-lg">
                    {card.description}
                </p>

                <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-2 text-2xs uppercase tracking-widest text-foreground-soft">
                    {card.skills.map((skill) => (
                        <li
                            key={skill}
                            className="border-l border-foreground/15 pl-3 transition-colors group-hover:border-primary/50"
                        >
                            {skill}
                        </li>
                    ))}
                </ul>
            </Link>
        </motion.div>
    );
}

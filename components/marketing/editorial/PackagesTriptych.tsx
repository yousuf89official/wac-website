"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";

export interface PackageCard {
    id: number | string;
    tier: string;
    price: string;
    description?: string;
    features: string[];
    isPopular?: boolean;
}

interface Props {
    packages: PackageCard[];
}

/**
 * Asymmetric 3-card pricing layout — same staggered offsets as ServicesTriptych.
 * Middle card gets a sienna "Most Popular" eyebrow when marked.
 */
export function PackagesTriptych({ packages }: Props) {
    // Pad / slice to a triptych of three.
    const cards = packages.slice(0, 3);

    return (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-y-0">
            {cards.map((card, i) => (
                <PackageCardView key={card.id} card={card} index={i} />
            ))}
        </div>
    );
}

function PackageCardView({ card, index }: { card: PackageCard; index: number }) {
    const offsetClass =
        index === 0 ? "md:mt-0" : index === 1 ? "md:mt-12" : "md:mt-24";

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
            className={offsetClass}
        >
            <div className="group relative flex h-full flex-col border-t border-foreground/15 pt-6 transition-colors hover:border-primary">
                {card.isPopular && (
                    <p className="eyebrow mb-4 text-primary">Most Popular</p>
                )}

                <div className="flex items-baseline justify-between">
                    <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        {String(index + 1).padStart(2, "0")}
                    </p>
                    <ArrowUpRight
                        className="h-4 w-4 -translate-x-1 translate-y-1 text-foreground-soft transition-all duration-500 ease-editorial group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-primary"
                        strokeWidth={1.25}
                    />
                </div>

                <h3 className="mt-8 font-display text-4xl font-medium tracking-tight transition-colors group-hover:text-primary md:text-5xl">
                    {card.tier}
                </h3>

                <p className="mt-4 font-mono text-sm uppercase tracking-widest text-foreground">
                    {card.price}
                </p>

                {card.description && (
                    <p className="mt-6 font-serif text-base leading-relaxed text-foreground-soft md:text-lg">
                        {card.description}
                    </p>
                )}

                {card.features.length > 0 && (
                    <ul className="mt-8 space-y-3 border-t border-foreground/10 pt-6">
                        {card.features.map((feature) => (
                            <li
                                key={feature}
                                className="flex items-start gap-3 font-serif text-sm leading-relaxed text-foreground-soft md:text-base"
                            >
                                <Check
                                    className="mt-1 h-3.5 w-3.5 shrink-0 text-primary"
                                    strokeWidth={2}
                                />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-auto pt-10">
                    <Link
                        href="/#contact"
                        className="group/cta inline-flex h-12 items-center gap-3 border-b border-primary pb-1 text-2xs font-semibold uppercase tracking-widest text-primary transition-colors hover:border-primary/60"
                    >
                        Get Started
                        <ArrowUpRight
                            className="h-3.5 w-3.5 transition-transform duration-500 ease-editorial group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                            strokeWidth={1.5}
                        />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

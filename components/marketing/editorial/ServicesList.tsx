"use client";

import { motion } from "framer-motion";

interface ServiceRow {
    id: number;
    title: string;
    description: string;
}

interface Props {
    services: ServiceRow[];
}

/**
 * Editorial list of core services. Large mono number on the left,
 * Fraunces display title in the middle, Newsreader serif description
 * on the right. Hairline dividers between rows. Hover shifts the row's
 * left border to sienna and the title to primary.
 */
export function ServicesList({ services }: Props) {
    const ease = [0.16, 1, 0.3, 1] as const;

    return (
        <div className="border-t border-foreground/10">
            {services.map((service, i) => (
                <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease, delay: i * 0.05 }}
                    className="group relative border-b border-foreground/10"
                >
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-transparent transition-colors duration-500 group-hover:bg-primary" />
                    <div className="grid grid-cols-12 items-baseline gap-x-6 gap-y-4 py-10 pl-6 transition-colors duration-500 md:py-14 md:pl-10">
                        <div className="col-span-12 md:col-span-1">
                            <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <h3 className="font-display text-4xl font-medium leading-[0.98] tracking-tight transition-colors duration-500 group-hover:text-primary md:text-5xl">
                                {service.title}
                            </h3>
                        </div>
                        <div className="col-span-12 md:col-span-5">
                            <p className="font-serif text-base leading-relaxed text-foreground-soft md:text-lg">
                                {service.description}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

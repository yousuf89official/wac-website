"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { registerUrl } from "@/lib/urls";

export interface AcademyCourse {
    id: number;
    slug: string;
    title: string;
    description: string;
    level: string;
    duration: string;
    category: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function AcademySection({ courses }: { courses: AcademyCourse[] }) {
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
                    <div className="col-span-12 md:col-span-7">
                        <p className="eyebrow mb-6 flex items-center gap-3">
                            <span className="inline-block h-px w-10 bg-foreground-soft" />
                            <span>The Academy</span>
                        </p>
                        <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[0.95] tracking-tight">
                            Learn the{" "}
                            <span
                                className="italic text-foreground-soft"
                                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                            >
                                playbook.
                            </span>
                        </h2>
                    </div>
                    <div className="col-span-12 md:col-span-4 md:col-start-9">
                        <p className="font-serif text-base leading-relaxed text-foreground-soft md:text-lg">
                            Courses, resources, and a community — the same methods we run for clients,
                            taught for you to apply. Become a member to subscribe and track your progress.
                        </p>
                    </div>
                </motion.div>

                {courses.length > 0 && (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-y-0">
                        {courses.map((c, i) => (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.9, ease, delay: i * 0.1 }}
                            >
                                <Link
                                    href={`/academy/${c.slug}`}
                                    className="group block border-t border-foreground/15 pt-6 transition-colors hover:border-primary"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                            {c.level || c.category}
                                            {c.duration ? ` · ${c.duration}` : ""}
                                        </p>
                                        <ArrowUpRight
                                            className="h-4 w-4 -translate-x-1 translate-y-1 text-foreground-soft transition-all duration-500 ease-editorial group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-primary"
                                            strokeWidth={1.25}
                                        />
                                    </div>
                                    <h3 className="mt-8 font-display text-3xl font-medium leading-tight tracking-tight transition-colors group-hover:text-primary md:text-4xl">
                                        {c.title}
                                    </h3>
                                    <p className="mt-5 line-clamp-3 font-serif text-base leading-relaxed text-foreground-soft">
                                        {c.description}
                                    </p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease, delay: 0.2 }}
                    className="mt-16 flex flex-col items-start gap-6 sm:flex-row sm:items-center md:mt-24"
                >
                    <a
                        href={registerUrl()}
                        className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-foreground px-8 text-2xs font-semibold uppercase tracking-widest text-background transition-all hover:gap-5 hover:bg-primary"
                    >
                        Become a Member
                        <ArrowUpRight
                            className="h-4 w-4 transition-transform group-hover:rotate-45"
                            strokeWidth={1.5}
                        />
                    </a>
                    <Link
                        href="/academy"
                        className="group inline-flex h-12 items-center gap-3 border-b border-foreground/30 pb-1 text-2xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                        Browse the Academy
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

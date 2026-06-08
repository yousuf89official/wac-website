"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";

/**
 * Hero — Editorial Luxe.
 *
 * • Massive Fraunces headline that breathes (subtle SOFT/WONK axis modulation)
 * • Mouse-tracked sienna spotlight in the background — feels alive on hover
 * • Stagger-revealed eyebrow → display → subhead → CTAs on mount
 * • Scroll cue at bottom with a quiet bounce
 * • Parallax depth on the type as you scroll past
 */
export function HeroEditorial() {
    const heroRef = useRef<HTMLElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

    // Mouse-tracked spotlight using CSS custom props on the section element.
    useEffect(() => {
        const node = heroRef.current;
        if (!node) return;
        let raf = 0;
        const onMove = (e: MouseEvent) => {
            const rect = node.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                node.style.setProperty("--mx", `${x}%`);
                node.style.setProperty("--my", `${y}%`);
            });
        };
        node.addEventListener("mousemove", onMove);
        return () => {
            node.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(raf);
        };
    }, []);

    const ease = [0.16, 1, 0.3, 1] as const;

    return (
        <section
            ref={heroRef}
            className="relative isolate min-h-screen overflow-hidden"
            style={
                {
                    ["--mx" as string]: "50%",
                    ["--my" as string]: "40%",
                } as React.CSSProperties
            }
        >
            {/* Spotlight */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10 transition-opacity duration-700"
                style={{
                    background:
                        "radial-gradient(circle 600px at var(--mx) var(--my), hsl(var(--primary) / 0.22), transparent 70%)",
                }}
            />
            {/* Hairline grid */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10 opacity-[0.08]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
                    backgroundSize: "120px 120px",
                }}
            />

            <motion.div
                style={{ y, opacity }}
                className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col justify-between px-6 pt-32 pb-12 md:px-12 md:pt-40 lg:px-20"
            >
                {/* Eyebrow */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease, delay: 0.1 }}
                    className="eyebrow flex items-center gap-3"
                >
                    <span className="inline-block h-px w-10 bg-foreground-soft" />
                    <span>We Are Collaborative</span>
                    <span className="text-foreground-soft/50">·</span>
                    <span>Est. 2022</span>
                    <span className="text-foreground-soft/50">·</span>
                    <span>Jakarta → Global</span>
                </motion.div>

                {/* Headline + subline */}
                <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-8 md:mt-16">
                    <h1 className="col-span-12 font-display text-[clamp(3.5rem,11vw,11rem)] font-medium leading-[0.88] tracking-tightest">
                        <RevealLine delay={0.25}>
                            <span className="block">A network of</span>
                        </RevealLine>
                        <RevealLine delay={0.4}>
                            <span className="block italic" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}>
                                marketing
                            </span>
                        </RevealLine>
                        <RevealLine delay={0.55}>
                            <span className="block">obsessives.</span>
                        </RevealLine>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease, delay: 0.85 }}
                        className="col-span-12 max-w-2xl font-serif text-lg leading-relaxed text-foreground-soft md:col-span-7 md:col-start-6 md:text-xl"
                    >
                        We build growth systems for brands that refuse to blend in. Strategy, story, and execution — composed by a hand-picked collective of specialists, not a generalist agency.
                    </motion.p>
                </div>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease, delay: 1.05 }}
                    className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center"
                >
                    <Link
                        href="/services"
                        className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-primary px-8 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-all hover:gap-5 hover:bg-primary/90"
                    >
                        See the work
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
                    </Link>
                    <Link
                        href="#manifesto"
                        className="group inline-flex h-14 items-center justify-center gap-3 rounded-full border border-foreground/15 px-8 text-sm font-semibold uppercase tracking-widest text-foreground transition-colors hover:bg-foreground/[0.04]"
                    >
                        Read the manifesto
                    </Link>
                </motion.div>

                {/* Scroll cue */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, ease, delay: 1.4 }}
                    className="mt-16 flex items-center justify-between border-t border-foreground/10 pt-6 text-foreground-soft md:mt-24"
                >
                    <div className="eyebrow flex items-center gap-2">
                        <span className="block h-1.5 w-1.5 rounded-full bg-success" />
                        <span>Booking Q3 partnerships now</span>
                    </div>
                    <div className="eyebrow flex items-center gap-2">
                        <span>Scroll</span>
                        <ArrowDown className="h-3.5 w-3.5 animate-bounce" strokeWidth={1.5} />
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}

function RevealLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <span className="inline-block overflow-hidden align-baseline">
            <motion.span
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}
                className="inline-block"
            >
                {children}
            </motion.span>
        </span>
    );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { SectionFrame } from '@wac/ui/SectionFrame';
import { CTAFinale } from '@wac/ui/CTAFinale';
import { FadeUp } from '@wac/ui/FadeUp';
import { generateBreadcrumbSchema } from '@/utils/structured-data';
import { SITE_URL, checkoutUrl } from '@/lib/urls';

export function generateStaticParams() {
    return [];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const course = await prisma.course.findUnique({ where: { slug } });

    if (!course) {
        return { title: "Course Not Found" };
    }

    const title = `${course.title} | WAC Academy`;
    const description = course.description;
    const image = course.image;
    const canonical = `${SITE_URL}/academy/${course.slug}`;

    return {
        title,
        description,
        openGraph: {
            type: "website",
            title,
            description,
            url: canonical,
            images: image ? [{ url: image, width: 1200, height: 630 }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: image ? [image] : [],
        },
        alternates: {
            canonical,
        },
    };
}

interface ModuleEntry {
    title: string;
    description?: string;
    lessons?: string[] | number;
    duration?: string;
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(price);
}

export default async function CoursePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const course = await prisma.course.findUnique({ where: { slug } });

    if (!course) {
        notFound();
    }

    let modules: ModuleEntry[] = [];
    let features: string[] = [];
    try {
        const parsed = JSON.parse(course.modules);
        if (Array.isArray(parsed)) modules = parsed;
    } catch {
        /* noop */
    }
    try {
        const parsed = JSON.parse(course.features);
        if (Array.isArray(parsed)) features = parsed;
    } catch {
        /* noop */
    }

    const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'Academy', href: '/academy' },
        { name: course.title, href: `/academy/${course.slug}` },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Course",
                        name: course.title,
                        description: course.description,
                        inLanguage: "en",
                        provider: {
                            "@type": "Organization",
                            name: "We Are Collaborative",
                            url: SITE_URL,
                        },
                        offers: {
                            "@type": "Offer",
                            price: course.price,
                            priceCurrency: "IDR",
                            availability: "https://schema.org/InStock",
                        },
                        timeRequired: course.duration,
                        educationalLevel: course.level,
                        image: course.image,
                        url: `${SITE_URL}/academy/${course.slug}`,
                    }),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
            />

            {/* Hero */}
            <section className="relative isolate overflow-hidden border-b border-foreground/10">
                <div
                    aria-hidden
                    className="absolute inset-0 -z-10 opacity-[0.06]"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
                        backgroundSize: "120px 120px",
                    }}
                />
                <div className="mx-auto max-w-[1440px] px-6 pt-32 pb-20 md:px-12 md:pt-40 md:pb-28 lg:px-20">
                    <div className="grid grid-cols-12 gap-x-6 gap-y-12">
                        <div className="col-span-12 lg:col-span-8">
                            <FadeUp>
                                <nav className="mb-10 flex items-center gap-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                    <Link href="/academy" className="transition-colors hover:text-primary">
                                        Academy
                                    </Link>
                                    <span className="inline-block h-px w-6 bg-foreground/30" />
                                    <span>{course.category}</span>
                                </nav>
                            </FadeUp>

                            <FadeUp delay={0.05}>
                                <h1 className="font-display text-[clamp(2.75rem,7vw,6.5rem)] font-medium leading-[0.94] tracking-tightest">
                                    {course.title}
                                </h1>
                            </FadeUp>

                            <FadeUp delay={0.15}>
                                <p className="mt-10 max-w-2xl font-serif text-lg leading-relaxed text-foreground-soft md:text-xl">
                                    {course.description}
                                </p>
                            </FadeUp>
                        </div>

                        <div className="col-span-12 lg:col-span-4">
                            <FadeUp delay={0.2}>
                                <aside className="border border-foreground/15 bg-background-2 p-8 lg:sticky lg:top-32">
                                    <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                        Investment
                                    </p>
                                    <p className="mt-3 font-display text-5xl font-medium leading-none tracking-tightest">
                                        {formatPrice(course.price)}
                                    </p>
                                    <p className="mt-2 font-serif text-sm text-foreground-soft">
                                        One-time. Lifetime access.
                                    </p>

                                    <dl className="mt-10 space-y-5 border-t border-foreground/15 pt-8 font-mono text-2xs uppercase tracking-widest">
                                        <div className="flex items-baseline justify-between gap-4">
                                            <dt className="text-foreground-soft">Duration</dt>
                                            <dd>{course.duration}</dd>
                                        </div>
                                        <div className="flex items-baseline justify-between gap-4">
                                            <dt className="text-foreground-soft">Level</dt>
                                            <dd>{course.level}</dd>
                                        </div>
                                        <div className="flex items-baseline justify-between gap-4">
                                            <dt className="text-foreground-soft">Category</dt>
                                            <dd>{course.category}</dd>
                                        </div>
                                        {modules.length > 0 && (
                                            <div className="flex items-baseline justify-between gap-4">
                                                <dt className="text-foreground-soft">Modules</dt>
                                                <dd>{String(modules.length).padStart(2, "0")}</dd>
                                            </div>
                                        )}
                                    </dl>

                                    <Link
                                        href={checkoutUrl(`?courseId=${course.id}`)}
                                        className="group mt-10 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-foreground px-8 text-2xs font-semibold uppercase tracking-widest text-background transition-all hover:gap-5 hover:bg-primary"
                                    >
                                        Enroll Now
                                        <ArrowUpRight
                                            className="h-4 w-4 transition-transform group-hover:rotate-45"
                                            strokeWidth={1.5}
                                        />
                                    </Link>
                                </aside>
                            </FadeUp>
                        </div>
                    </div>
                </div>
            </section>

            {/* Curriculum */}
            {modules.length > 0 && (
                <SectionFrame
                    n="01"
                    eyebrow="The Curriculum"
                    headline={
                        <>
                            What you&apos;ll{" "}
                            <span
                                className="italic text-foreground-soft"
                                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                            >
                                learn
                            </span>
                            .
                        </>
                    }
                    lede="A sequenced path from foundations to deployment. Each module builds on the last — no filler, no detours."
                >
                    <div className="border-t border-foreground/15">
                        {modules.map((mod, i) => {
                            const n = String(i + 1).padStart(2, "0");
                            return (
                                <FadeUp key={i} delay={i * 0.04}>
                                    <div className="grid grid-cols-12 gap-x-6 gap-y-4 border-b border-foreground/15 py-10 md:py-14">
                                        <div className="col-span-12 md:col-span-2">
                                            <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                {n}
                                            </p>
                                        </div>
                                        <div className="col-span-12 md:col-span-6">
                                            <h3 className="font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl">
                                                {mod.title}
                                            </h3>
                                            {mod.description && (
                                                <p className="mt-5 font-serif text-base leading-relaxed text-foreground-soft md:text-lg">
                                                    {mod.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="col-span-12 md:col-span-4 md:text-right">
                                            <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                {mod.duration ||
                                                    (Array.isArray(mod.lessons)
                                                        ? `${mod.lessons.length} Lessons`
                                                        : typeof mod.lessons === "number"
                                                          ? `${mod.lessons} Lessons`
                                                          : "")}
                                            </p>
                                        </div>
                                    </div>
                                </FadeUp>
                            );
                        })}
                    </div>
                </SectionFrame>
            )}

            {/* Outcomes */}
            <SectionFrame
                n="02"
                eyebrow="The Outcome"
                headline={
                    <>
                        Who this is{" "}
                        <span
                            className="italic text-foreground-soft"
                            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                        >
                            for
                        </span>
                        .
                    </>
                }
            >
                <div className="grid grid-cols-12 gap-x-6 gap-y-10">
                    <div className="col-span-12 md:col-span-7">
                        <FadeUp>
                            <div className="space-y-6 font-serif text-lg leading-relaxed text-foreground-soft md:text-xl">
                                <p>
                                    This course is built for marketers, founders, and operators who have outgrown
                                    surface-level tactics and want to understand how growth systems actually fit
                                    together. If you&apos;ve already tried the YouTube playbooks and read the
                                    bestsellers — and you&apos;re still missing the connective tissue — this is the
                                    course you&apos;ve been looking for.
                                </p>
                                <p>
                                    By the end, you&apos;ll have working frameworks for {course.category.toLowerCase()},
                                    a portfolio-grade artefact you built during the course, and a clear point of view
                                    you can defend in any room. You don&apos;t leave with notes. You leave with
                                    capability.
                                </p>
                            </div>
                        </FadeUp>
                    </div>

                    {features.length > 0 && (
                        <div className="col-span-12 md:col-span-4 md:col-start-9">
                            <FadeUp delay={0.1}>
                                <div className="border-t border-foreground/15 pt-6">
                                    <p className="eyebrow text-primary">What&apos;s Included</p>
                                    <ul className="mt-8 space-y-5 font-serif text-base leading-relaxed text-foreground md:text-lg">
                                        {features.map((f, i) => (
                                            <li
                                                key={i}
                                                className="flex gap-4 border-b border-foreground/10 pb-5 last:border-0"
                                            >
                                                <span className="mt-1 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                    {String(i + 1).padStart(2, "0")}
                                                </span>
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </FadeUp>
                        </div>
                    )}
                </div>
            </SectionFrame>

            <CTAFinale />
        </>
    );
}

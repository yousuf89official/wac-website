import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import { PageHero } from '@wac/ui/PageHero';
import { SectionFrame } from '@wac/ui/SectionFrame';
import { CTAFinale } from '@wac/ui/CTAFinale';
import { FadeUp } from '@wac/ui/FadeUp';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/utils/structured-data';
import { SITE_URL } from '@/lib/urls';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Academy | We Are Collaborative",
        description: "Master digital marketing with WAC Academy. Expert-led courses in SEO, content strategy, affiliate marketing, and more.",
        openGraph: {
            type: "website",
            title: "Academy | We Are Collaborative",
            description: "Master digital marketing with WAC Academy. Expert-led courses in SEO, content strategy, affiliate marketing, and more.",
            url: `${SITE_URL}/academy`,
        },
        twitter: {
            card: "summary_large_image",
            title: "Academy | We Are Collaborative",
            description: "Master digital marketing with WAC Academy.",
        },
        alternates: {
            canonical: `${SITE_URL}/academy`,
        },
    };
}

const WHY = [
    {
        eyebrow: "Expert-Led",
        title: "Taught by practitioners",
        description:
            "Every course is built by operators currently running the playbooks they teach. No theory-only instructors, no recycled slides.",
    },
    {
        eyebrow: "Practical",
        title: "Built for execution",
        description:
            "Frameworks, templates, and live teardowns you can deploy the same week. Outcomes over information.",
    },
    {
        eyebrow: "Community",
        title: "A real cohort",
        description:
            "Private forum, monthly office hours, and a network of marketers who actually answer when you post a question.",
    },
];

function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(price);
}

export default async function AcademyPage() {
    const [courses, faqs] = await Promise.all([
        prisma.course.findMany({
            where: { isPublished: true },
            orderBy: { order: 'asc' },
        }),
        prisma.fAQ.findMany({
            where: { page: 'academy', locale: 'en' },
            orderBy: { order: 'asc' },
        }),
    ]);

    const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'Academy', href: '/academy' },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ItemList",
                        name: "WAC Academy Courses",
                        inLanguage: "en",
                        itemListElement: courses.map((c, i) => ({
                            "@type": "ListItem",
                            position: i + 1,
                            item: {
                                "@type": "Course",
                                name: c.title,
                                description: c.description,
                                provider: {
                                    "@type": "Organization",
                                    name: "We Are Collaborative",
                                    url: SITE_URL,
                                },
                                url: `${SITE_URL}/academy/${c.slug}`,
                            },
                        })),
                    }),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
            />
            {faqs.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(faqs)) }}
                />
            )}

            <PageHero
                eyebrow="Academy"
                headline={
                    <>
                        Learn how growth actually{" "}
                        <span
                            className="italic text-foreground-soft"
                            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                        >
                            compounds
                        </span>
                        .
                    </>
                }
                lede="Expert-led courses for marketers who want to ship real work — not collect another certificate. Built by operators, sequenced for compounding."
            />

            <SectionFrame n="01" eyebrow="All Courses">
                {courses.length === 0 ? (
                    <p className="font-serif text-lg text-foreground-soft">
                        New courses are launching soon. Check back shortly.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 md:gap-y-24">
                        {courses.map((course, i) => {
                            // Asymmetric vertical rhythm — odd cards drop down
                            const offset = i % 2 === 1 ? "md:mt-24" : "";
                            const n = String(i + 1).padStart(2, "0");
                            return (
                                <FadeUp key={course.id} delay={(i % 2) * 0.08} className={offset}>
                                    <Link
                                        href={`/academy/${course.slug}`}
                                        className="group relative block border-t border-foreground/15 pt-6 transition-colors hover:border-primary"
                                    >
                                        <div className="flex items-baseline justify-between">
                                            <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                {n}
                                            </p>
                                            <ArrowUpRight
                                                className="h-4 w-4 -translate-x-1 translate-y-1 text-foreground-soft transition-all duration-500 ease-editorial group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-primary"
                                                strokeWidth={1.25}
                                            />
                                        </div>

                                        <h3 className="mt-8 font-display text-3xl font-medium leading-tight tracking-tight transition-colors group-hover:text-primary md:text-4xl">
                                            {course.title}
                                        </h3>

                                        <p className="mt-6 max-w-xl font-serif text-base leading-relaxed text-foreground-soft md:text-lg">
                                            {course.description}
                                        </p>

                                        <ul className="mt-10 flex flex-wrap gap-x-3 gap-y-2 text-2xs uppercase tracking-widest text-foreground-soft">
                                            <li className="border-l border-foreground/15 pl-3 transition-colors group-hover:border-primary/50">
                                                {course.category}
                                            </li>
                                            <li className="border-l border-foreground/15 pl-3 transition-colors group-hover:border-primary/50">
                                                {course.duration}
                                            </li>
                                            <li className="border-l border-foreground/15 pl-3 transition-colors group-hover:border-primary/50">
                                                {course.level}
                                            </li>
                                            <li className="border-l border-foreground/15 pl-3 transition-colors group-hover:border-primary/50">
                                                {formatPrice(course.price)}
                                            </li>
                                        </ul>
                                    </Link>
                                </FadeUp>
                            );
                        })}
                    </div>
                )}
            </SectionFrame>

            <SectionFrame n="02" eyebrow="Why WAC Academy" tight>
                <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-3 md:gap-y-0">
                    {WHY.map((item, i) => (
                        <FadeUp key={item.eyebrow} delay={i * 0.08}>
                            <div className="border-t border-foreground/15 pt-6">
                                <p className="eyebrow text-primary">{item.eyebrow}</p>
                                <h3 className="mt-8 font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl">
                                    {item.title}
                                </h3>
                                <p className="mt-6 font-serif text-base leading-relaxed text-foreground-soft md:text-lg">
                                    {item.description}
                                </p>
                            </div>
                        </FadeUp>
                    ))}
                </div>
            </SectionFrame>

            <CTAFinale />
        </>
    );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import { PageHero } from '@wac/ui/PageHero';
import { SectionFrame } from '@wac/ui/SectionFrame';
import { CTAFinale } from '@wac/ui/CTAFinale';
import { generateBreadcrumbSchema } from '@/utils/structured-data';
import { SITE_URL } from '@/lib/urls';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Resources & Insights | We Are Collaborative",
        description: "Expert insights on digital marketing, SEO, content strategy, and growth. Read our latest articles and stay ahead of the curve.",
        openGraph: {
            type: "website",
            title: "Resources & Insights | We Are Collaborative",
            description: "Expert insights on digital marketing, SEO, content strategy, and growth.",
            url: `${SITE_URL}/resources`,
        },
        twitter: {
            card: "summary_large_image",
            title: "Resources & Insights | We Are Collaborative",
            description: "Expert insights on digital marketing, SEO, content strategy, and growth.",
        },
        alternates: {
            canonical: `${SITE_URL}/resources`,
        },
    };
}

function formatDate(date: Date | string) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export default async function ResourcesPage() {
    const posts = await prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { date: 'desc' },
    });

    const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'Resources', href: '/resources' },
    ]);

    const featured = posts[0];
    const rest = posts.slice(1);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        name: "Insights & Resources",
                        inLanguage: "en",
                        url: `${SITE_URL}/resources`,
                        mainEntity: {
                            "@type": "ItemList",
                            numberOfItems: posts.length,
                        },
                    }),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
            />

            <PageHero
                eyebrow="The Editorial"
                headline={
                    <>
                        Field notes from the <span className="italic">front lines</span> of growth
                    </>
                }
                lede="Hands-on insights from the practitioners building, breaking, and rebuilding modern brands. No fluff — only what compounds."
            />

            {featured && (
                <section className="relative border-t border-foreground/10 py-24 md:py-32">
                    <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
                        <div className="mb-12 flex items-center gap-4">
                            <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                Featured
                            </span>
                            <span className="inline-block h-px w-10 bg-foreground-soft" />
                            <span className="eyebrow">Latest dispatch</span>
                        </div>

                        <Link
                            href={`/resources/${featured.slug}`}
                            className="group block"
                        >
                            <div className="grid grid-cols-12 items-end gap-x-6 gap-y-10">
                                <h2 className="col-span-12 font-display text-[clamp(2.5rem,7vw,6rem)] font-medium leading-[0.92] tracking-tight transition-colors group-hover:text-primary md:col-span-8">
                                    {featured.title}
                                </h2>
                                <div className="col-span-12 md:col-span-4">
                                    <p className="mb-8 font-serif text-lg leading-relaxed text-foreground-soft">
                                        {featured.excerpt}
                                    </p>
                                    <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                        <span>{featured.category}</span>
                                        <span>·</span>
                                        <span>{formatDate(featured.date)}</span>
                                        <span>·</span>
                                        <span>{featured.author}</span>
                                    </div>
                                    <span className="inline-flex items-center gap-3 font-mono text-2xs uppercase tracking-widest text-primary transition-all group-hover:gap-5">
                                        Read the piece
                                        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>
            )}

            <SectionFrame
                n="01"
                eyebrow="All Articles"
                headline={
                    <>
                        The full <span className="italic">archive</span>.
                    </>
                }
                lede="Every piece we've published — from tactical breakdowns to long-form essays on building brands worth caring about."
            >
                {rest.length === 0 ? (
                    <p className="font-serif text-lg text-foreground-soft">
                        More dispatches in the works. Check back soon.
                    </p>
                ) : (
                    <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
                        {rest.map((post, i) => (
                            <li key={post.id}>
                                <Link
                                    href={`/resources/${post.slug}`}
                                    className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-2 py-6 transition-colors hover:bg-foreground/[0.03] md:py-8"
                                >
                                    <span className="col-span-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft md:col-span-1">
                                        {String(i + 2).padStart(2, "0")}
                                    </span>
                                    <span className="col-span-10 font-display text-2xl font-medium tracking-tight transition-colors group-hover:text-primary md:col-span-7 md:text-4xl">
                                        {post.title}
                                    </span>
                                    <span className="col-span-12 font-mono text-2xs uppercase tracking-widest text-foreground-soft md:col-span-3 md:text-right">
                                        {post.category}
                                        <span className="mx-2 text-foreground-soft/50">·</span>
                                        {formatDate(post.date)}
                                    </span>
                                    <ArrowUpRight
                                        className="col-span-12 hidden h-5 w-5 -translate-x-1 text-foreground-soft transition-all duration-500 ease-editorial group-hover:translate-x-0 group-hover:text-primary md:col-span-1 md:inline md:justify-self-end"
                                        strokeWidth={1.25}
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </SectionFrame>

            <CTAFinale />
        </>
    );
}

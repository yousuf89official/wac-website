import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import prisma from '@/lib/prisma';
import { CTAFinale } from '@wac/ui/CTAFinale';
import { generateBreadcrumbSchema } from '@/utils/structured-data';
import { SITE_URL } from '@/lib/urls';

export function generateStaticParams() {
    return [];
}

function formatDate(date: Date | string) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug } });

    if (!post) {
        return { title: "Post Not Found" };
    }

    const title = post.metaTitle || post.title;
    const description = post.metaDescription || post.excerpt;
    const image = post.image;
    const canonical = post.canonicalUrl || `${SITE_URL}/resources/${post.slug}`;

    return {
        title,
        description,
        openGraph: {
            type: "article",
            title,
            description,
            url: canonical,
            images: image ? [{ url: image, width: 1200, height: 630 }] : [],
            publishedTime: post.date.toISOString(),
            authors: [post.author],
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

/**
 * Render post.content as HTML if it looks like HTML, otherwise split on
 * blank lines and render as serif paragraphs. The first paragraph gets the
 * editorial drop cap.
 */
function ArticleBody({ content }: { content: string }) {
    const looksLikeHtml = /<\/?(p|h[1-6]|ul|ol|li|blockquote|figure|img|a|strong|em|br|hr|pre|code)\b/i.test(content);

    if (looksLikeHtml) {
        return (
            <div
                className="prose-editorial font-serif text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    }

    const paragraphs = content
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

    return (
        <div className="prose-editorial font-serif text-lg leading-relaxed">
            {paragraphs.map((para, i) => (
                <p
                    key={i}
                    className={i === 0 ? 'drop-cap' : 'mt-6'}
                >
                    {para}
                </p>
            ))}
        </div>
    );
}

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const post = await prisma.blogPost.findUnique({ where: { slug } });

    if (!post) {
        notFound();
    }

    const related = await prisma.blogPost.findMany({
        where: {
            isPublished: true,
            slug: { not: slug },
        },
        orderBy: { date: 'desc' },
        take: 3,
    });

    const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'Resources', href: '/resources' },
        { name: post.title, href: `/resources/${post.slug}` },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        headline: post.title,
                        description: post.metaDescription || post.excerpt,
                        image: post.image,
                        inLanguage: "en",
                        datePublished: post.date.toISOString(),
                        author: {
                            "@type": "Person",
                            name: post.author,
                        },
                        publisher: {
                            "@type": "Organization",
                            name: "We Are Collaborative",
                            url: SITE_URL,
                        },
                        mainEntityOfPage: {
                            "@type": "WebPage",
                            "@id": `${SITE_URL}/resources/${post.slug}`,
                        },
                    }),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
            />

            {/* Article header */}
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
                    <nav className="mb-12 flex items-center gap-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        <Link href="/resources" className="transition-colors hover:text-primary">
                            Resources
                        </Link>
                        <span className="text-foreground-soft/50">/</span>
                        <span>{post.category}</span>
                    </nav>

                    <h1 className="max-w-5xl font-display text-[clamp(2.75rem,8vw,7.5rem)] font-medium leading-[0.92] tracking-tightest">
                        {post.title}
                    </h1>

                    <p className="mt-10 max-w-2xl font-serif text-lg leading-relaxed text-foreground-soft md:text-xl">
                        {post.excerpt}
                    </p>

                    <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-foreground/10 pt-8 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        <span>By {post.author}</span>
                        <span className="text-foreground-soft/50">·</span>
                        <span>{formatDate(post.date)}</span>
                        <span className="text-foreground-soft/50">·</span>
                        <span>{post.category}</span>
                    </div>
                </div>
            </section>

            {/* Article body */}
            <section className="relative py-24 md:py-32">
                <div className="mx-auto max-w-2xl px-6 md:px-0">
                    <ArticleBody content={post.content} />

                    <div className="mt-20 border-t border-foreground/10 pt-10">
                        <Link
                            href="/resources"
                            className="group inline-flex items-center gap-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={1.5} />
                            Back to the editorial
                        </Link>
                    </div>
                </div>
            </section>

            {/* Continue reading */}
            {related.length > 0 && (
                <section className="relative border-t border-foreground/10 py-30 md:py-40">
                    <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
                        <div className="mb-12 flex items-center gap-4 md:mb-16">
                            <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                02
                            </span>
                            <span className="inline-block h-px w-10 bg-foreground-soft" />
                            <span className="eyebrow">Continue reading</span>
                        </div>

                        <h2 className="mb-16 max-w-3xl font-display text-[clamp(2.25rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-tight md:mb-24">
                            More from the <span className="italic">archive</span>.
                        </h2>

                        <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
                            {related.map((item, i) => (
                                <li key={item.id}>
                                    <Link
                                        href={`/resources/${item.slug}`}
                                        className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-2 py-6 transition-colors hover:bg-foreground/[0.03] md:py-8"
                                    >
                                        <span className="col-span-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft md:col-span-1">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span className="col-span-10 font-display text-2xl font-medium tracking-tight transition-colors group-hover:text-primary md:col-span-7 md:text-4xl">
                                            {item.title}
                                        </span>
                                        <span className="col-span-12 font-mono text-2xs uppercase tracking-widest text-foreground-soft md:col-span-3 md:text-right">
                                            {item.category}
                                            <span className="mx-2 text-foreground-soft/50">·</span>
                                            {formatDate(item.date)}
                                        </span>
                                        <ArrowUpRight
                                            className="col-span-12 hidden h-5 w-5 -translate-x-1 text-foreground-soft transition-all duration-500 ease-editorial group-hover:translate-x-0 group-hover:text-primary md:col-span-1 md:inline md:justify-self-end"
                                            strokeWidth={1.25}
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <CTAFinale />
        </>
    );
}

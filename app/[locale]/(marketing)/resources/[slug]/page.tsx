import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import prisma from '@/lib/prisma';
import BlogPost from '@/components/pages/BlogPost';
import { generateBreadcrumbSchema } from '@/utils/structured-data';

const SITE_URL = "https://wearecollaborative.net";

export function generateStaticParams() {
    return [];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
    const { slug, locale } = await params;
    const altLocale = locale === "en" ? "id" : "en";
    const post = await prisma.blogPost.findUnique({ where: { slug } });

    if (!post) {
        return { title: "Post Not Found" };
    }

    const title = post.metaTitle || post.title;
    const description = post.metaDescription || post.excerpt;
    const image = post.image;
    const canonical = post.canonicalUrl || `${SITE_URL}/${locale}/resources/${post.slug}`;

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
            languages: {
                [locale]: `${SITE_URL}/${locale}/resources/${post.slug}`,
                [altLocale]: `${SITE_URL}/${altLocale}/resources/${post.slug}`,
            },
        },
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string; locale: string }>;
}) {
    const { slug, locale } = await params;
    setRequestLocale(locale);

    const post = await prisma.blogPost.findUnique({ where: { slug } });

    const breadcrumbs = post ? generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'Resources', href: '/resources' },
        { name: post.title, href: `/resources/${post.slug}` },
    ], locale) : null;

    return (
        <>
            {post && (
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
                                inLanguage: locale,
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
                                    "@id": `${SITE_URL}/${locale}/resources/${post.slug}`,
                                },
                            }),
                        }}
                    />
                    {breadcrumbs && (
                        <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
                        />
                    )}
                </>
            )}
            <BlogPost />
        </>
    );
}

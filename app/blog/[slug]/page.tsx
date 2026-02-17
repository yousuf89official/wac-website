import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import BlogPost from '@/components/pages/BlogPost';

const SITE_URL = "https://wearecollaborative.net";

export function generateStaticParams() {
    return [];
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
    const canonical = post.canonicalUrl || `${SITE_URL}/blog/${post.slug}`;

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

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug } });

    return (
        <>
            {post && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "BlogPosting",
                            headline: post.title,
                            description: post.metaDescription || post.excerpt,
                            image: post.image,
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
                                "@id": `${SITE_URL}/blog/${post.slug}`,
                            },
                        }),
                    }}
                />
            )}
            <BlogPost />
        </>
    );
}

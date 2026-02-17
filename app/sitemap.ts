import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const SITE_URL = "https://wearecollaborative.net";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [posts, studies] = await Promise.all([
        prisma.blogPost.findMany({
            where: { isPublished: true },
            select: { slug: true, date: true },
        }),
        prisma.caseStudy.findMany({
            select: { slug: true },
        }),
    ]);

    const blogEntries = posts.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.date,
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    const workEntries = studies.map((study) => ({
        url: `${SITE_URL}/work/${study.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    return [
        {
            url: SITE_URL,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        ...blogEntries,
        ...workEntries,
    ];
}

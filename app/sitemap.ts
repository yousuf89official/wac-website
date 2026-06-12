import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { SITE_URL } from '@/lib/urls';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [posts, studies, courses] = await Promise.all([
        prisma.blogPost.findMany({
            where: { isPublished: true },
            select: { slug: true, date: true },
        }),
        prisma.caseStudy.findMany({
            select: { slug: true },
        }),
        prisma.course.findMany({
            where: { isPublished: true },
            select: { slug: true, updatedAt: true },
        }),
    ]);

    const staticEntries: MetadataRoute.Sitemap = [
        { url: SITE_URL, changeFrequency: 'weekly', priority: 1.0 },
        { url: `${SITE_URL}/intelligence`, changeFrequency: 'weekly', priority: 0.95 },
        { url: `${SITE_URL}/services`, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${SITE_URL}/academy`, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${SITE_URL}/resources`, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    ];

    const resourceEntries = posts.map((post) => ({
        url: `${SITE_URL}/resources/${post.slug}`,
        lastModified: post.date,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    const workEntries = studies.map((study) => ({
        url: `${SITE_URL}/work/${study.slug}`,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    const courseEntries = courses.map((course) => ({
        url: `${SITE_URL}/academy/${course.slug}`,
        lastModified: course.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    return [...staticEntries, ...resourceEntries, ...workEntries, ...courseEntries];
}

import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { routing } from '@/lib/i18n/routing';

const SITE_URL = "https://wearecollaborative.net";

// Helper: generate alternates for all locales
function localeAlternates(path: string): Record<string, string> {
    const alternates: Record<string, string> = {};
    for (const locale of routing.locales) {
        alternates[locale] = `${SITE_URL}/${locale}${path}`;
    }
    return alternates;
}

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

    // Static pages with both locale variants
    const staticPages = [
        { path: '', changeFrequency: 'weekly' as const, priority: 1.0 },
        { path: '/services', changeFrequency: 'monthly' as const, priority: 0.9 },
        { path: '/about', changeFrequency: 'monthly' as const, priority: 0.8 },
        { path: '/academy', changeFrequency: 'weekly' as const, priority: 0.9 },
        { path: '/resources', changeFrequency: 'weekly' as const, priority: 0.9 },
    ];

    const staticEntries = staticPages.flatMap((page) =>
        routing.locales.map((locale) => ({
            url: `${SITE_URL}/${locale}${page.path}`,
            changeFrequency: page.changeFrequency,
            priority: page.priority,
            alternates: {
                languages: localeAlternates(page.path),
            },
        }))
    );

    // Dynamic content entries
    const resourceEntries = posts.flatMap((post) =>
        routing.locales.map((locale) => ({
            url: `${SITE_URL}/${locale}/resources/${post.slug}`,
            lastModified: post.date,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
            alternates: {
                languages: localeAlternates(`/resources/${post.slug}`),
            },
        }))
    );

    const workEntries = studies.flatMap((study) =>
        routing.locales.map((locale) => ({
            url: `${SITE_URL}/${locale}/work/${study.slug}`,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
            alternates: {
                languages: localeAlternates(`/work/${study.slug}`),
            },
        }))
    );

    const courseEntries = courses.flatMap((course) =>
        routing.locales.map((locale) => ({
            url: `${SITE_URL}/${locale}/academy/${course.slug}`,
            lastModified: course.updatedAt,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
            alternates: {
                languages: localeAlternates(`/academy/${course.slug}`),
            },
        }))
    );

    return [
        ...staticEntries,
        ...resourceEntries,
        ...workEntries,
        ...courseEntries,
    ];
}

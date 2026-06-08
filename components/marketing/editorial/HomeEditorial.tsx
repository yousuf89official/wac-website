import prisma from "@/lib/prisma";
import { HeroEditorial } from "./HeroEditorial";
import { ManifestoSection } from "./ManifestoSection";
import { ServicesTriptych } from "./ServicesTriptych";
import { PersonalizedFeed } from "./PersonalizedFeed";
import { CTAFinale } from '@wac/ui/CTAFinale';
import type { Category } from "@/lib/personalization";

interface FeedItem {
    slug: string;
    title: string;
    category: Category;
    href: string;
}

export const revalidate = 300;

async function loadFeed(): Promise<FeedItem[]> {
    const [posts, studies, courses] = await Promise.all([
        prisma.blogPost
            .findMany({
                where: { isPublished: true },
                orderBy: { date: "desc" },
                take: 4,
                select: { slug: true, title: true },
            })
            .catch(() => []),
        prisma.caseStudy
            .findMany({
                orderBy: { id: "desc" },
                take: 4,
                select: { slug: true, title: true },
            })
            .catch(() => []),
        prisma.course
            .findMany({
                where: { isPublished: true },
                orderBy: { updatedAt: "desc" },
                take: 4,
                select: { slug: true, title: true },
            })
            .catch(() => []),
    ]);

    const items: FeedItem[] = [
        ...posts.map((p) => ({
            slug: `post-${p.slug}`,
            title: p.title,
            category: "resources" as Category,
            href: `/resources/${p.slug}`,
        })),
        ...studies.map((s) => ({
            slug: `work-${s.slug}`,
            title: s.title,
            category: "work" as Category,
            href: `/work/${s.slug}`,
        })),
        ...courses.map((c) => ({
            slug: `course-${c.slug}`,
            title: c.title,
            category: "academy" as Category,
            href: `/academy/${c.slug}`,
        })),
    ];

    return items;
}

export async function HomeEditorial() {
    const feed = await loadFeed();
    return (
        <>
            <HeroEditorial />
            <ManifestoSection />
            <ServicesTriptych />
            {feed.length > 0 && <PersonalizedFeed items={feed} />}
            <CTAFinale />
        </>
    );
}

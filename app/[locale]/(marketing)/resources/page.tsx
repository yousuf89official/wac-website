import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import prisma from '@/lib/prisma';
import ResourcesContent from '@/components/marketing/ResourcesContent';
import { generateBreadcrumbSchema } from '@/utils/structured-data';

const SITE_URL = "https://wearecollaborative.net";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const altLocale = locale === "en" ? "id" : "en";

    return {
        title: "Resources & Insights | We Are Collaborative",
        description: "Expert insights on digital marketing, SEO, content strategy, and growth. Read our latest articles and stay ahead of the curve.",
        openGraph: {
            type: "website",
            title: "Resources & Insights | We Are Collaborative",
            description: "Expert insights on digital marketing, SEO, content strategy, and growth.",
            url: `${SITE_URL}/${locale}/resources`,
        },
        twitter: {
            card: "summary_large_image",
            title: "Resources & Insights | We Are Collaborative",
            description: "Expert insights on digital marketing, SEO, content strategy, and growth.",
        },
        alternates: {
            canonical: `${SITE_URL}/${locale}/resources`,
            languages: {
                [locale]: `${SITE_URL}/${locale}/resources`,
                [altLocale]: `${SITE_URL}/${altLocale}/resources`,
            },
        },
    };
}

export default async function ResourcesPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const posts = await prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { date: 'desc' },
    });

    const categories = Array.from(new Set(posts.map((p) => p.category)));

    const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'Resources', href: '/resources' },
    ], locale);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        name: "Insights & Resources",
                        inLanguage: locale,
                        url: `${SITE_URL}/${locale}/resources`,
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
            <ResourcesContent
                posts={JSON.parse(JSON.stringify(posts))}
                categories={categories}
            />
        </>
    );
}

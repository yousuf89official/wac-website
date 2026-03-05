import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import prisma from '@/lib/prisma';
import AboutContent from '@/components/marketing/AboutContent';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/utils/structured-data';

const SITE_URL = "https://wearecollaborative.net";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const altLocale = locale === "en" ? "id" : "en";

    return {
        title: "About | We Are Collaborative",
        description: "We Are Collaborative is a results-driven digital marketing agency. Learn about our mission, values, and the process behind our work.",
        openGraph: {
            type: "website",
            title: "About | We Are Collaborative",
            description: "We Are Collaborative is a results-driven digital marketing agency. Learn about our mission, values, and the process behind our work.",
            url: `${SITE_URL}/${locale}/about`,
        },
        twitter: {
            card: "summary_large_image",
            title: "About | We Are Collaborative",
            description: "We Are Collaborative is a results-driven digital marketing agency.",
        },
        alternates: {
            canonical: `${SITE_URL}/${locale}/about`,
            languages: {
                [locale]: `${SITE_URL}/${locale}/about`,
                [altLocale]: `${SITE_URL}/${altLocale}/about`,
            },
        },
    };
}

export default async function AboutPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [brand, values, processSteps, stats, faqs] = await Promise.all([
        prisma.brandConfig.findFirst(),
        prisma.value.findMany({ orderBy: { order: 'asc' } }),
        prisma.processStep.findMany({ orderBy: { order: 'asc' } }),
        prisma.stat.findMany({ orderBy: { order: 'asc' } }),
        prisma.fAQ.findMany({
            where: { page: 'about', locale },
            orderBy: { order: 'asc' },
        }),
    ]);

    const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'About', href: '/about' },
    ], locale);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "AboutPage",
                        inLanguage: locale,
                        mainEntity: {
                            "@type": "Organization",
                            name: brand?.name || "We Are Collaborative",
                            description: brand?.tagline || "Results-driven digital marketing agency",
                            url: SITE_URL,
                        },
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
            <AboutContent
                brand={brand ? JSON.parse(JSON.stringify(brand)) : null}
                values={JSON.parse(JSON.stringify(values))}
                processSteps={JSON.parse(JSON.stringify(processSteps))}
                stats={JSON.parse(JSON.stringify(stats))}
            />
        </>
    );
}

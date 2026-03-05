import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import prisma from '@/lib/prisma';
import ServicesContent from '@/components/marketing/ServicesContent';
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
        title: "Services | We Are Collaborative",
        description: "Full-spectrum digital marketing services — strategy, performance marketing, SEO, content, and more. Explore our packages and find the right fit for your business.",
        openGraph: {
            type: "website",
            title: "Services | We Are Collaborative",
            description: "Full-spectrum digital marketing services — strategy, performance marketing, SEO, content, and more.",
            url: `${SITE_URL}/${locale}/services`,
        },
        twitter: {
            card: "summary_large_image",
            title: "Services | We Are Collaborative",
            description: "Full-spectrum digital marketing services — strategy, performance marketing, SEO, content, and more.",
        },
        alternates: {
            canonical: `${SITE_URL}/${locale}/services`,
            languages: {
                [locale]: `${SITE_URL}/${locale}/services`,
                [altLocale]: `${SITE_URL}/${altLocale}/services`,
            },
        },
    };
}

export default async function ServicesPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [services, caseStudies, faqs] = await Promise.all([
        prisma.service.findMany({
            include: { packages: { orderBy: { order: 'asc' } } },
            orderBy: { order: 'asc' },
        }),
        prisma.caseStudy.findMany({
            take: 3,
            orderBy: { order: 'asc' },
        }),
        prisma.fAQ.findMany({
            where: { page: 'services', locale },
            orderBy: { order: 'asc' },
        }),
    ]);

    const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'Services', href: '/services' },
    ], locale);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        provider: {
                            "@type": "Organization",
                            name: "We Are Collaborative",
                            url: SITE_URL,
                        },
                        serviceType: "Digital Marketing",
                        areaServed: "Worldwide",
                        inLanguage: locale,
                        hasOfferCatalog: {
                            "@type": "OfferCatalog",
                            name: "Marketing Services",
                            itemListElement: services.map((s) => ({
                                "@type": "Offer",
                                itemOffered: {
                                    "@type": "Service",
                                    name: s.title,
                                    description: s.description,
                                },
                            })),
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
            <ServicesContent
                services={JSON.parse(JSON.stringify(services))}
                caseStudies={JSON.parse(JSON.stringify(caseStudies))}
            />
        </>
    );
}

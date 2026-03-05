import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import prisma from '@/lib/prisma';
import AcademyContent from '@/components/marketing/AcademyContent';
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
        title: "Academy | We Are Collaborative",
        description: "Master digital marketing with WAC Academy. Expert-led courses in SEO, content strategy, affiliate marketing, and more.",
        openGraph: {
            type: "website",
            title: "Academy | We Are Collaborative",
            description: "Master digital marketing with WAC Academy. Expert-led courses in SEO, content strategy, affiliate marketing, and more.",
            url: `${SITE_URL}/${locale}/academy`,
        },
        twitter: {
            card: "summary_large_image",
            title: "Academy | We Are Collaborative",
            description: "Master digital marketing with WAC Academy.",
        },
        alternates: {
            canonical: `${SITE_URL}/${locale}/academy`,
            languages: {
                [locale]: `${SITE_URL}/${locale}/academy`,
                [altLocale]: `${SITE_URL}/${altLocale}/academy`,
            },
        },
    };
}

export default async function AcademyPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [courses, faqs] = await Promise.all([
        prisma.course.findMany({
            where: { isPublished: true },
            orderBy: { order: 'asc' },
        }),
        prisma.fAQ.findMany({
            where: { page: 'academy', locale },
            orderBy: { order: 'asc' },
        }),
    ]);

    const categories = Array.from(new Set(courses.map((c) => c.category)));
    const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'Academy', href: '/academy' },
    ], locale);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ItemList",
                        name: "WAC Academy Courses",
                        inLanguage: locale,
                        itemListElement: courses.map((c, i) => ({
                            "@type": "ListItem",
                            position: i + 1,
                            item: {
                                "@type": "Course",
                                name: c.title,
                                description: c.description,
                                provider: {
                                    "@type": "Organization",
                                    name: "We Are Collaborative",
                                    url: SITE_URL,
                                },
                                url: `${SITE_URL}/${locale}/academy/${c.slug}`,
                            },
                        })),
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
            <AcademyContent
                courses={JSON.parse(JSON.stringify(courses))}
                categories={categories}
            />
        </>
    );
}

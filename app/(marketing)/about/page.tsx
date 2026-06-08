import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { AboutEditorial } from '@/components/marketing/editorial/AboutEditorial';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/utils/structured-data';
import { SITE_URL } from '@/lib/urls';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "About | We Are Collaborative",
        description: "We Are Collaborative is a results-driven digital marketing agency. Learn about our mission, values, and the process behind our work.",
        openGraph: {
            type: "website",
            title: "About | We Are Collaborative",
            description: "We Are Collaborative is a results-driven digital marketing agency. Learn about our mission, values, and the process behind our work.",
            url: `${SITE_URL}/about`,
        },
        twitter: {
            card: "summary_large_image",
            title: "About | We Are Collaborative",
            description: "We Are Collaborative is a results-driven digital marketing agency.",
        },
        alternates: {
            canonical: `${SITE_URL}/about`,
        },
    };
}

export default async function AboutPage() {
    const [brand, values, processSteps, testimonials, faqs] = await Promise.all([
        prisma.brandConfig.findFirst(),
        prisma.value.findMany({ orderBy: { order: 'asc' } }),
        prisma.processStep.findMany({ orderBy: { order: 'asc' } }),
        prisma.testimonial.findMany({ orderBy: { order: 'asc' } }),
        prisma.fAQ.findMany({
            where: { page: 'about', locale: 'en' },
            orderBy: { order: 'asc' },
        }),
    ]);

    const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'About', href: '/about' },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "AboutPage",
                        inLanguage: "en",
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
            <AboutEditorial
                values={values.map((v) => ({
                    id: v.id,
                    title: v.title,
                    description: v.description,
                }))}
                processSteps={processSteps.map((p) => ({
                    id: p.id,
                    number: p.number,
                    title: p.title,
                    description: p.description,
                }))}
                testimonials={testimonials.map((t) => ({
                    id: t.id,
                    quote: t.quote,
                    author: t.author,
                    role: t.role,
                    company: t.company,
                }))}
            />
        </>
    );
}

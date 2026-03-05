import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import prisma from '@/lib/prisma';
import CourseContent from '@/components/marketing/CourseContent';
import { notFound } from 'next/navigation';
import { generateBreadcrumbSchema } from '@/utils/structured-data';

const SITE_URL = "https://wearecollaborative.net";

export function generateStaticParams() {
    return [];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
    const { slug, locale } = await params;
    const altLocale = locale === "en" ? "id" : "en";
    const course = await prisma.course.findUnique({ where: { slug } });

    if (!course) {
        return { title: "Course Not Found" };
    }

    const title = `${course.title} | WAC Academy`;
    const description = course.description;
    const image = course.image;
    const canonical = `${SITE_URL}/${locale}/academy/${course.slug}`;

    return {
        title,
        description,
        openGraph: {
            type: "website",
            title,
            description,
            url: canonical,
            images: image ? [{ url: image, width: 1200, height: 630 }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: image ? [image] : [],
        },
        alternates: {
            canonical,
            languages: {
                [locale]: canonical,
                [altLocale]: `${SITE_URL}/${altLocale}/academy/${course.slug}`,
            },
        },
    };
}

export default async function CoursePage({
    params,
}: {
    params: Promise<{ slug: string; locale: string }>;
}) {
    const { slug, locale } = await params;
    setRequestLocale(locale);

    const course = await prisma.course.findUnique({ where: { slug } });

    if (!course) {
        notFound();
    }

    const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'Academy', href: '/academy' },
        { name: course.title, href: `/academy/${course.slug}` },
    ], locale);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Course",
                        name: course.title,
                        description: course.description,
                        inLanguage: locale,
                        provider: {
                            "@type": "Organization",
                            name: "We Are Collaborative",
                            url: SITE_URL,
                        },
                        offers: {
                            "@type": "Offer",
                            price: course.price,
                            priceCurrency: "IDR",
                            availability: "https://schema.org/InStock",
                        },
                        timeRequired: course.duration,
                        educationalLevel: course.level,
                        image: course.image,
                        url: `${SITE_URL}/${locale}/academy/${course.slug}`,
                    }),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
            />
            <CourseContent course={JSON.parse(JSON.stringify(course))} />
        </>
    );
}

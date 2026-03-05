import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import prisma from '@/lib/prisma';
import CaseStudy from '@/components/pages/CaseStudy';
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
    const study = await prisma.caseStudy.findUnique({ where: { slug } });

    if (!study) {
        return { title: "Case Study Not Found" };
    }

    const title = study.metaTitle || study.title;
    const description = study.metaDescription || study.description;
    const image = study.image;
    const canonical = study.canonicalUrl || `${SITE_URL}/${locale}/work/${study.slug}`;

    return {
        title,
        description,
        openGraph: {
            type: "article",
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
                [locale]: `${SITE_URL}/${locale}/work/${study.slug}`,
                [altLocale]: `${SITE_URL}/${altLocale}/work/${study.slug}`,
            },
        },
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string; locale: string }>;
}) {
    const { slug, locale } = await params;
    setRequestLocale(locale);

    const study = await prisma.caseStudy.findUnique({ where: { slug } });

    const breadcrumbs = study ? generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'Work', href: '/services' },
        { name: study.title, href: `/work/${study.slug}` },
    ], locale) : null;

    return (
        <>
            {study && (
                <>
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "CreativeWork",
                                name: study.title,
                                description: study.metaDescription || study.description,
                                image: study.image,
                                inLanguage: locale,
                                author: {
                                    "@type": "Organization",
                                    name: "We Are Collaborative",
                                    url: SITE_URL,
                                },
                                mainEntityOfPage: {
                                    "@type": "WebPage",
                                    "@id": `${SITE_URL}/${locale}/work/${study.slug}`,
                                },
                            }),
                        }}
                    />
                    {breadcrumbs && (
                        <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
                        />
                    )}
                </>
            )}
            <CaseStudy />
        </>
    );
}

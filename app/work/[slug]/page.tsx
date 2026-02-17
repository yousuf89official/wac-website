import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import CaseStudy from '@/components/pages/CaseStudy';

const SITE_URL = "https://wearecollaborative.net";

export function generateStaticParams() {
    return [];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const study = await prisma.caseStudy.findUnique({ where: { slug } });

    if (!study) {
        return { title: "Case Study Not Found" };
    }

    const title = study.metaTitle || study.title;
    const description = study.metaDescription || study.description;
    const image = study.image;
    const canonical = study.canonicalUrl || `${SITE_URL}/work/${study.slug}`;

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
        },
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const study = await prisma.caseStudy.findUnique({ where: { slug } });

    return (
        <>
            {study && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "CreativeWork",
                            name: study.title,
                            description: study.metaDescription || study.description,
                            image: study.image,
                            author: {
                                "@type": "Organization",
                                name: "We Are Collaborative",
                                url: SITE_URL,
                            },
                            mainEntityOfPage: {
                                "@type": "WebPage",
                                "@id": `${SITE_URL}/work/${study.slug}`,
                            },
                        }),
                    }}
                />
            )}
            <CaseStudy />
        </>
    );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { CaseStudyEditorial, type CaseStudyResult } from '@/components/marketing/editorial/CaseStudyEditorial';
import { CTAFinale } from '@wac/ui/CTAFinale';
import { generateBreadcrumbSchema } from '@/utils/structured-data';
import { SITE_URL } from '@/lib/urls';

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

/**
 * Normalize the `results` JSON string on the CaseStudy model into a stable
 * array of { value, label, description? } that the editorial component
 * can render. Accepts:
 *   - ["+300% revenue", "2x ROAS", ...]            (string[])
 *   - [{ value, label, description }, ...]         (rich)
 *   - "freeform string"                            (fallback: ignored)
 */
function parseResults(raw: string | null | undefined): CaseStudyResult[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map((entry): CaseStudyResult | null => {
                if (typeof entry === 'string') {
                    // Split "+300% revenue" → value: "+300%", label: "revenue"
                    const match = entry.match(/^([^A-Za-z]*[\d.,]+[^A-Za-z\s]*)\s*(.*)$/);
                    if (match && match[1]) {
                        return {
                            value: match[1].trim(),
                            label: (match[2] || '').trim() || 'Result',
                        };
                    }
                    return { value: entry, label: 'Result' };
                }
                if (entry && typeof entry === 'object' && 'value' in entry) {
                    const e = entry as { value: unknown; label?: unknown; description?: unknown };
                    return {
                        value: String(e.value ?? ''),
                        label: String(e.label ?? 'Result'),
                        description:
                            typeof e.description === 'string' ? e.description : undefined,
                    };
                }
                return null;
            })
            .filter((r): r is CaseStudyResult => r !== null);
    } catch {
        return [];
    }
}

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const study = await prisma.caseStudy.findUnique({ where: { slug } });

    if (!study) {
        notFound();
    }

    const results = parseResults(study.results);

    const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'Work', href: '/services' },
        { name: study.title, href: `/work/${study.slug}` },
    ]);

    return (
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
                        inLanguage: "en",
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
            {breadcrumbs && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
                />
            )}

            <CaseStudyEditorial
                title={study.title}
                description={study.description}
                client={study.client}
                category={study.category}
                image={study.image}
                results={results}
            />

            <CTAFinale />
        </>
    );
}

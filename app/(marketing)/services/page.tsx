import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { PageHero } from '@wac/ui/PageHero';
import { SectionFrame } from '@wac/ui/SectionFrame';
import { ServicesList } from '@/components/marketing/editorial/ServicesList';
import { PackagesTriptych, type PackageCard } from '@/components/marketing/editorial/PackagesTriptych';
import { ProcessStrip } from '@/components/marketing/editorial/ProcessStrip';
import { CTAFinale } from '@wac/ui/CTAFinale';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/utils/structured-data';
import { SITE_URL } from '@/lib/urls';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Services | We Are Collaborative',
        description:
            'Full-spectrum digital marketing services — strategy, performance marketing, SEO, content, and more. Explore our packages and find the right fit for your business.',
        openGraph: {
            type: 'website',
            title: 'Services | We Are Collaborative',
            description:
                'Full-spectrum digital marketing services — strategy, performance marketing, SEO, content, and more.',
            url: `${SITE_URL}/services`,
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Services | We Are Collaborative',
            description:
                'Full-spectrum digital marketing services — strategy, performance marketing, SEO, content, and more.',
        },
        alternates: {
            canonical: `${SITE_URL}/services`,
        },
    };
}

function parseFeatures(raw: string): string[] {
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.filter((f): f is string => typeof f === 'string');
        }
    } catch {
        // fall through
    }
    return raw
        .split(/\n|,/)
        .map((f) => f.trim())
        .filter(Boolean);
}

export default async function ServicesPage() {
    const [services, faqs] = await Promise.all([
        prisma.service.findMany({
            include: { packages: { orderBy: { order: 'asc' } } },
            orderBy: { order: 'asc' },
        }),
        prisma.fAQ.findMany({
            where: { page: 'services', locale: 'en' },
            orderBy: { order: 'asc' },
        }),
    ]);

    // Flatten and pick three packages for the engagement-models triptych.
    // Prefer a "Most Popular" in the middle when one exists.
    const allPackages = services.flatMap((s) =>
        s.packages.map((p) => ({
            id: p.id,
            tier: p.tier,
            price: p.price,
            description: s.title,
            features: parseFeatures(p.features),
            isPopular: p.isPopular,
            order: p.order,
        }))
    );

    let triptychPackages: PackageCard[] = [];
    if (allPackages.length >= 3) {
        const popular = allPackages.find((p) => p.isPopular) ?? allPackages[1];
        const others = allPackages.filter((p) => p.id !== popular.id);
        triptychPackages = [others[0], { ...popular, isPopular: true }, others[1]];
    } else {
        triptychPackages = allPackages;
    }

    const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'Services', href: '/services' },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Service',
                        provider: {
                            '@type': 'Organization',
                            name: 'We Are Collaborative',
                            url: SITE_URL,
                        },
                        serviceType: 'Digital Marketing',
                        areaServed: 'Worldwide',
                        inLanguage: 'en',
                        hasOfferCatalog: {
                            '@type': 'OfferCatalog',
                            name: 'Marketing Services',
                            itemListElement: services.map((s) => ({
                                '@type': 'Offer',
                                itemOffered: {
                                    '@type': 'Service',
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

            <PageHero
                eyebrow="What We Do"
                headline={
                    <>
                        Three disciplines,{' '}
                        <span
                            className="italic"
                            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                        >
                            composed
                        </span>{' '}
                        for compounding growth.
                    </>
                }
                lede={
                    <>
                        We don&apos;t sell channels. We compose the specific blend of strategy, performance, and creative your brand needs — and sequence them so each one makes the next work harder.
                    </>
                }
            />

            <SectionFrame
                n="01"
                eyebrow="Core Services"
                headline={
                    <>
                        Specialists,{' '}
                        <span
                            className="italic"
                            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                        >
                            not
                        </span>{' '}
                        generalists.
                    </>
                }
                lede={
                    <>
                        Every discipline below is led by an operator who has done it at scale — never a generic account manager pretending to know all of it.
                    </>
                }
            >
                <ServicesList
                    services={services.map((s) => ({
                        id: s.id,
                        title: s.title,
                        description: s.description,
                    }))}
                />
            </SectionFrame>

            {triptychPackages.length > 0 && (
                <SectionFrame
                    n="02"
                    eyebrow="Engagement Models"
                    headline={
                        <>
                            Built around{' '}
                            <span
                                className="italic"
                                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                            >
                                your
                            </span>{' '}
                            stage.
                        </>
                    }
                    lede={
                        <>
                            Three ways to work with us — pick the one that matches where the business actually is, not where the pitch deck says it should be.
                        </>
                    }
                >
                    <PackagesTriptych packages={triptychPackages} />
                </SectionFrame>
            )}

            <SectionFrame
                n="03"
                eyebrow="How It Works"
                headline={
                    <>
                        A method, not a{' '}
                        <span
                            className="italic"
                            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                        >
                            template
                        </span>
                        .
                    </>
                }
                lede={
                    <>
                        The same four-beat rhythm runs under every engagement — the inputs change, the discipline doesn&apos;t.
                    </>
                }
                tight
            >
                <ProcessStrip />
            </SectionFrame>

            <CTAFinale />
        </>
    );
}

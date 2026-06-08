import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from '@wac/ui/PageHero';
import { SectionFrame } from '@wac/ui/SectionFrame';
import { CTAFinale } from '@wac/ui/CTAFinale';
import { IntelligenceStats } from "@/components/marketing/editorial/intelligence/IntelligenceStats";
import { IntelligencePillars } from "@/components/marketing/editorial/intelligence/IntelligencePillars";
import { IntelligenceFeatures } from "@/components/marketing/editorial/intelligence/IntelligenceFeatures";
import { IntelligenceHowItWorks } from "@/components/marketing/editorial/intelligence/IntelligenceHowItWorks";
import { IntelligenceTestimonial } from "@/components/marketing/editorial/intelligence/IntelligenceTestimonial";
import { IntelligenceDashboardPreview } from "@/components/marketing/editorial/intelligence/IntelligenceDashboardPreview";
import { ArrowRight } from "lucide-react";
import { SITE_URL, CI_URL } from '@/lib/urls';

export const revalidate = 300;

export const metadata: Metadata = {
    title: "Intelligence · Unified Campaign Analytics for Data-Driven Brands",
    description:
        "Collaborative Intelligence is WAC's enterprise campaign analytics platform — full-funnel performance tracking, AI-powered insights, and unified media data across Google, Meta, TikTok, and 20+ other channels.",
    keywords: [
        "campaign analytics platform",
        "media intelligence software",
        "advertising value equivalency",
        "share of voice analytics",
        "cross-channel analytics",
        "AI media optimization",
        "unified campaign intelligence",
        "collaborative intelligence",
        "WAC Intelligence",
    ],
    alternates: { canonical: `${SITE_URL}/intelligence` },
    openGraph: {
        type: "website",
        url: `${SITE_URL}/intelligence`,
        title: "Intelligence · Unified Campaign Analytics — We Are Collaborative",
        description:
            "Enterprise-grade campaign analytics and AI-powered insights. Built by We Are Collaborative for the brands that refuse to blend in.",
        siteName: "We Are Collaborative",
        locale: "en_US",
        images: [
            {
                url: `${SITE_URL}/og?title=Intelligence&subtitle=Unified+Campaign+Analytics`,
                width: 1200,
                height: 630,
                alt: "WAC Intelligence — campaign analytics dashboard",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Intelligence · Unified Campaign Analytics",
        description:
            "Enterprise-grade campaign analytics and AI-powered insights from We Are Collaborative.",
        images: [`${SITE_URL}/og?title=Intelligence`],
    },
    robots: { index: true, follow: true },
};

const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "WAC Intelligence",
    alternateName: "Collaborative Intelligence",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
        "Enterprise campaign analytics platform with full-funnel performance tracking, AI-powered insights, and cross-channel media intelligence — built by We Are Collaborative.",
    url: `${SITE_URL}/intelligence`,
    publisher: {
        "@type": "Organization",
        name: "We Are Collaborative",
        url: SITE_URL,
    },
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description: "Free demo · enterprise plans available",
    },
    featureList: [
        "Real-time cross-channel dashboards",
        "AVE & SOV calculator",
        "Google / Meta / TikTok / LinkedIn integrations",
        "Multi-channel campaign manager",
        "AI-powered predictive analytics",
        "Role-based access for brands + agencies",
        "White-labeled, shareable reports",
    ],
};

const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Intelligence", item: `${SITE_URL}/intelligence` },
    ],
};

export default function IntelligencePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <PageHero
                eyebrow="The Product · Now Live"
                headline={
                    <>
                        Unified campaign intelligence for{" "}
                        <span
                            className="italic"
                            style={{
                                fontVariationSettings:
                                    '"opsz" 144, "SOFT" 100, "WONK" 1',
                            }}
                        >
                            data-driven
                        </span>{" "}
                        brands.
                    </>
                }
                lede="Enterprise-grade analytics, full-funnel performance tracking, and AI-powered insights — unifying brands, agencies, and channels on one platform. Built by the WAC collective for the brands we partner with."
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                        href="#contact"
                        className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-primary px-8 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-all hover:gap-5 hover:bg-primary/90"
                    >
                        Book a demo
                        <ArrowRight
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            strokeWidth={1.5}
                        />
                    </Link>
                    <a
                        href={CI_URL}
                        className="inline-flex h-14 items-center justify-center rounded-full border border-foreground/15 px-8 text-sm font-semibold uppercase tracking-widest text-foreground transition-colors hover:bg-foreground/[0.04]"
                    >
                        Sign in to dashboard
                    </a>
                </div>
            </PageHero>

            <IntelligenceDashboardPreview />

            <IntelligenceStats />

            <SectionFrame
                n="01"
                eyebrow="What's Inside"
                headline={
                    <>
                        Three pillars,{" "}
                        <span
                            className="italic"
                            style={{
                                fontVariationSettings:
                                    '"opsz" 144, "SOFT" 100, "WONK" 1',
                            }}
                        >
                            one
                        </span>{" "}
                        intelligence layer.
                    </>
                }
                lede="Built for enterprise media teams who need precision, speed, and collaboration in the same surface."
            >
                <IntelligencePillars />
            </SectionFrame>

            <SectionFrame
                n="02"
                eyebrow="Platform Features"
                headline={
                    <>
                        Everything you need to{" "}
                        <span
                            className="italic"
                            style={{
                                fontVariationSettings:
                                    '"opsz" 144, "SOFT" 100, "WONK" 1',
                            }}
                        >
                            win
                        </span>{" "}
                        in media.
                    </>
                }
            >
                <IntelligenceFeatures />
            </SectionFrame>

            <SectionFrame
                n="03"
                eyebrow="How It Works"
                headline="Three steps from connected to compounding."
                tight
            >
                <IntelligenceHowItWorks />
            </SectionFrame>

            <IntelligenceTestimonial />

            <CTAFinale />
        </>
    );
}

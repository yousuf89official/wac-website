import type { Metadata } from 'next';
import { HomeEditorial } from '@/components/marketing/editorial/HomeEditorial';
import {
    generateWebSiteSchema,
    generateLocalBusinessSchema,
    generateOrganizationSchema,
    generateProfessionalServiceSchema,
    generateHomepageFAQSchema,
} from '@/utils/structured-data';
import { SITE_URL } from '@/lib/urls';

export async function generateMetadata(): Promise<Metadata> {
    const title = 'We Are Collaborative | Elite Digital Marketing Agency';
    const description =
        'We Are Collaborative is a network of elite marketing specialists delivering SEO, content strategy, paid media, branding, and web development. Serving businesses across Indonesia, Southeast Asia, Australia, and the US.';
    const keywords = [
        'digital marketing agency',
        'SEO agency Indonesia',
        'content marketing agency',
        'paid media advertising',
        'brand strategy',
        'web development agency',
        'marketing specialists',
        'social media marketing',
        'performance marketing',
        'email marketing',
        'marketing analytics',
        'We Are Collaborative',
        'WAC',
        'marketing agency Jakarta',
        'digital marketing Southeast Asia',
    ];
    const ogImageUrl = `${SITE_URL}/og?title=We+Are+Collaborative&subtitle=Elite+Marketing+Collective`;

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: SITE_URL,
        },
        openGraph: {
            type: 'website',
            url: SITE_URL,
            title,
            description,
            siteName: 'We Are Collaborative',
            locale: 'en_US',
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: 'We Are Collaborative — Elite Digital Marketing Agency',
                    type: 'image/png',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImageUrl],
            creator: '@wecollaborate',
            site: '@wecollaborate',
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-snippet': -1,
                'max-image-preview': 'large',
                'max-video-preview': -1,
            },
        },
        other: {
            'geo.region': 'ID',
            'geo.placename': 'Jakarta, Indonesia',
            'geo.position': '-6.2088;106.8456',
            ICBM: '-6.2088, 106.8456',
        },
    };
}

export default function Home() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebSiteSchema()) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateLocalBusinessSchema()) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateProfessionalServiceSchema()) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateHomepageFAQSchema()) }}
            />
            <HomeEditorial />
        </>
    );
}

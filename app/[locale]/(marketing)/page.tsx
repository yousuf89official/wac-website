import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import HomeSections from '@/components/marketing/HomeSections';
import {
    generateWebSiteSchema,
    generateLocalBusinessSchema,
    generateOrganizationSchema,
    generateProfessionalServiceSchema,
    generateHomepageFAQSchema,
} from '@/utils/structured-data';

const SITE_URL = 'https://wearecollaborative.net';

const META = {
    en: {
        title: 'We Are Collaborative | Elite Digital Marketing Agency',
        description:
            'We Are Collaborative is a network of elite marketing specialists delivering SEO, content strategy, paid media, branding, and web development. Serving businesses across Indonesia, Southeast Asia, Australia, and the US.',
        keywords: [
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
        ],
    },
    id: {
        title: 'We Are Collaborative | Agensi Pemasaran Digital',
        description:
            'We Are Collaborative adalah jaringan spesialis pemasaran digital kelas dunia. Layanan SEO, strategi konten, paid media, branding, dan pengembangan web untuk bisnis di Indonesia dan Asia Tenggara.',
        keywords: [
            'agensi pemasaran digital',
            'agensi SEO Indonesia',
            'pemasaran konten',
            'iklan digital',
            'strategi merek',
            'pengembangan web',
            'spesialis pemasaran',
            'media sosial marketing',
            'performance marketing',
            'We Are Collaborative',
            'agensi marketing Jakarta',
            'digital marketing Indonesia',
        ],
    },
} as const;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const lang = locale === 'id' ? 'id' : 'en';
    const meta = META[lang];
    const ogImageUrl = `${SITE_URL}/og?title=We+Are+Collaborative&subtitle=Elite+Marketing+Collective`;

    return {
        title: meta.title,
        description: meta.description,
        keywords: [...meta.keywords],
        alternates: {
            canonical: `${SITE_URL}/${locale}`,
            languages: {
                en: `${SITE_URL}/en`,
                id: `${SITE_URL}/id`,
                'x-default': `${SITE_URL}/en`,
            },
        },
        openGraph: {
            type: 'website',
            url: `${SITE_URL}/${locale}`,
            title: meta.title,
            description: meta.description,
            siteName: 'We Are Collaborative',
            locale: locale === 'id' ? 'id_ID' : 'en_US',
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
            title: meta.title,
            description: meta.description,
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

export default async function Home({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema(locale)) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebSiteSchema(locale)) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateLocalBusinessSchema(locale)) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateProfessionalServiceSchema(locale)) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateHomepageFAQSchema(locale)) }}
            />
            <HomeSections />
        </>
    );
}

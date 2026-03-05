const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearecollaborative.net';

export interface BreadcrumbItem {
    name: string;
    href: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[], locale: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${SITE_URL}/${locale}${item.href}`,
        })),
    };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

export function generateLocalBusinessSchema(locale: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${SITE_URL}/#business`,
        name: 'We Are Collaborative',
        description: locale === 'id'
            ? 'Agensi pemasaran digital yang berfokus pada hasil. SEO, strategi konten, pemasaran performa, dan lainnya.'
            : 'Results-driven digital marketing agency. SEO, content strategy, performance marketing, and more.',
        url: `${SITE_URL}/${locale}`,
        image: `${SITE_URL}/og-image.png`,
        telephone: '+62-812-0000-0000',
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'ID',
            addressRegion: 'Indonesia',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: '-6.2088',
            longitude: '106.8456',
        },
        areaServed: [
            { '@type': 'Country', name: 'Indonesia' },
            { '@type': 'Country', name: 'Singapore' },
            { '@type': 'Country', name: 'Malaysia' },
            { '@type': 'Country', name: 'Australia' },
            { '@type': 'Country', name: 'United States' },
        ],
        priceRange: '$$',
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '18:00',
        },
        sameAs: [
            'https://www.instagram.com/wearecollaborative',
            'https://www.linkedin.com/company/wearecollaborative',
        ],
    };
}

export function generateWebSiteSchema(locale: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'We Are Collaborative',
        url: `${SITE_URL}/${locale}`,
        inLanguage: locale,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/${locale}/resources?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

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
        image: `${SITE_URL}/og?title=We+Are+Collaborative`,
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

export function generateOrganizationSchema(locale: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'We Are Collaborative',
        alternateName: 'WAC',
        url: SITE_URL,
        logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/logo.png`,
            width: 400,
            height: 100,
        },
        image: `${SITE_URL}/og?title=We+Are+Collaborative`,
        description: locale === 'id'
            ? 'Jaringan spesialis pemasaran, ahli strategi, dan kreator kelas dunia yang berdedikasi untuk pertumbuhan bisnis Anda.'
            : 'A network of elite marketing specialists, strategists, and creative minds dedicated to your business growth.',
        foundingDate: '2022',
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'ID',
            addressRegion: 'Indonesia',
        },
        contactPoint: [
            {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: ['English', 'Indonesian'],
            },
        ],
        sameAs: [
            'https://www.instagram.com/wearecollaborative',
            'https://www.linkedin.com/company/wearecollaborative',
        ],
        areaServed: [
            { '@type': 'Country', name: 'Indonesia' },
            { '@type': 'Country', name: 'Singapore' },
            { '@type': 'Country', name: 'Malaysia' },
            { '@type': 'Country', name: 'Australia' },
            { '@type': 'Country', name: 'United States' },
        ],
    };
}

export function generateProfessionalServiceSchema(locale: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        '@id': `${SITE_URL}/#service`,
        name: 'We Are Collaborative',
        url: `${SITE_URL}/${locale}`,
        image: `${SITE_URL}/og?title=We+Are+Collaborative`,
        description: locale === 'id'
            ? 'Layanan pemasaran digital premium: SEO, strategi konten, paid media, branding, dan pengembangan web.'
            : 'Premium digital marketing services: SEO, content strategy, paid media, branding, and web development.',
        serviceType: [
            'SEO Services',
            'Content Marketing',
            'Paid Media Advertising',
            'Brand Strategy',
            'Web Development',
            'Social Media Marketing',
            'Email Marketing',
            'Marketing Analytics',
        ],
        provider: {
            '@type': 'Organization',
            '@id': `${SITE_URL}/#organization`,
        },
        areaServed: [
            { '@type': 'Country', name: 'Indonesia' },
            { '@type': 'Country', name: 'Singapore' },
            { '@type': 'Country', name: 'Malaysia' },
            { '@type': 'Country', name: 'Australia' },
            { '@type': 'Country', name: 'United States' },
        ],
    };
}

export function generateHomepageFAQSchema(locale: string) {
    const faqs = locale === 'id' ? [
        {
            question: 'Apa itu We Are Collaborative?',
            answer: 'We Are Collaborative (WAC) adalah jaringan spesialis pemasaran digital kelas dunia yang menyediakan layanan SEO, strategi konten, paid media, branding, dan pengembangan web untuk bisnis di Indonesia, Asia Tenggara, dan global.',
        },
        {
            question: 'Layanan apa yang ditawarkan We Are Collaborative?',
            answer: 'Kami menawarkan SEO & SEM, pemasaran konten, paid media (Google Ads, Meta Ads), strategi merek, pengembangan web, pemasaran media sosial, email marketing, dan analitik pemasaran.',
        },
        {
            question: 'Berapa biaya layanan We Are Collaborative?',
            answer: 'Biaya layanan kami bervariasi tergantung pada kebutuhan bisnis Anda. Silakan hubungi kami untuk mendapatkan penawaran yang disesuaikan dengan tujuan dan anggaran Anda.',
        },
        {
            question: 'Di mana We Are Collaborative beroperasi?',
            answer: 'Kami berbasis di Indonesia dan melayani klien di Indonesia, Singapura, Malaysia, Australia, dan Amerika Serikat.',
        },
    ] : [
        {
            question: 'What is We Are Collaborative?',
            answer: 'We Are Collaborative (WAC) is a network of elite digital marketing specialists providing SEO, content strategy, paid media, branding, and web development services for businesses across Indonesia, Southeast Asia, and globally.',
        },
        {
            question: 'What services does We Are Collaborative offer?',
            answer: 'We offer SEO & SEM, content marketing, paid media (Google Ads, Meta Ads), brand strategy, web development, social media marketing, email marketing, and marketing analytics.',
        },
        {
            question: 'How much do We Are Collaborative\'s services cost?',
            answer: 'Our service pricing varies depending on your business needs. Contact us for a custom quote tailored to your goals and budget.',
        },
        {
            question: 'Where does We Are Collaborative operate?',
            answer: 'We are based in Indonesia and serve clients across Indonesia, Singapore, Malaysia, Australia, and the United States.',
        },
        {
            question: 'How is We Are Collaborative different from other agencies?',
            answer: 'Unlike traditional agencies, WAC is a collaborative network of specialists — meaning you get a dedicated expert for each discipline rather than generalists. We combine boutique quality with enterprise scale.',
        },
    ];

    return generateFAQSchema(faqs);
}

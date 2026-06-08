import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/urls';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                // App surfaces (auth + portal + admin + checkout) are not public
                // content — they move to app.wearecollaborative.net in Phase 2.
                disallow: [
                    '/admin',
                    '/dashboard',
                    '/login',
                    '/register',
                    '/forgot-password',
                    '/reset-password',
                    '/checkout',
                    '/api',
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}

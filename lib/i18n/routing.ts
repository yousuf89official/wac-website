import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'id'],
    defaultLocale: 'en',
    localePrefix: 'always',
    localeDetection: true, // Detect from Accept-Language header + NEXT_LOCALE cookie
});

// Map country codes to locales (for geo-based detection)
export const countryLocaleMap: Record<string, string> = {
    ID: 'id', // Indonesia → Bahasa Indonesia
    // All other countries default to English
};

export type Locale = (typeof routing.locales)[number];
export const locales = routing.locales;

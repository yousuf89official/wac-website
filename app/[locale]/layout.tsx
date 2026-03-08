import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/lib/i18n/routing";
import { Providers } from "../providers";
import prisma from "@/lib/prisma";

const SITE_URL = "https://wearecollaborative.net";

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;

    const [seo, brand] = await Promise.all([
        prisma.globalSeo.findFirst(),
        prisma.brandConfig.findFirst(),
    ]);

    const siteName = seo?.siteName || brand?.name || "We Are Collaborative";
    const description =
        seo?.siteDescription ||
        brand?.tagline ||
        "A network of elite marketing specialists, strategists, and creative minds.";
    const separator = seo?.separator || "|";
    const ogImage = seo?.defaultImage || "/og?title=We+Are+Collaborative";

    const altLocale = locale === "en" ? "id" : "en";
    const ogLocale = locale === "en" ? "en_US" : "id_ID";

    return {
        metadataBase: new URL(SITE_URL),
        title: {
            default: siteName,
            template: `%s ${separator} ${siteName}`,
        },
        description,
        openGraph: {
            type: "website",
            siteName,
            locale: ogLocale,
            url: `${SITE_URL}/${locale}`,
            title: siteName,
            description,
            images: [{ url: ogImage, width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary_large_image",
            title: siteName,
            description,
            images: [ogImage],
            ...(seo?.twitterHandle ? { creator: seo.twitterHandle } : {}),
        },
        robots: {
            index: true,
            follow: true,
        },
        alternates: {
            canonical: `${SITE_URL}/${locale}`,
            languages: {
                en: `${SITE_URL}/en`,
                id: `${SITE_URL}/id`,
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

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Validate locale
    if (!routing.locales.includes(locale as Locale)) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);

    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className="bg-[#0a0a0a] text-white font-sans antialiased">
                <NextIntlClientProvider messages={messages}>
                    <Providers>
                        {children}
                    </Providers>
                </NextIntlClientProvider>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            name: "We Are Collaborative",
                            url: SITE_URL,
                            logo: `${SITE_URL}/logo.png`,
                            description:
                                "A network of elite marketing specialists, strategists, and creative minds.",
                        }),
                    }}
                />
            </body>
        </html>
    );
}

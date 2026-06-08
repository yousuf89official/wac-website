import type { Metadata } from "next";
import { Fraunces, Newsreader, Manrope, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import { themeBootScript } from '@wac/ui/theme-provider';
import prisma from "@/lib/prisma";
import { SITE_URL } from '@/lib/urls';
import "./globals.css";

const fontDisplay = Fraunces({
    subsets: ["latin"],
    variable: "--font-display",
    axes: ["SOFT", "WONK", "opsz"],
    display: "swap",
});

const fontSerif = Newsreader({
    subsets: ["latin"],
    variable: "--font-serif",
    style: ["normal", "italic"],
    display: "swap",
});

const fontUi = Manrope({
    subsets: ["latin"],
    variable: "--font-ui",
    display: "swap",
});

const fontMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
    const [seo, brand] = await Promise.all([
        prisma.globalSeo.findFirst(),
        prisma.brandConfig.findFirst(),
    ]);

    const siteName = seo?.siteName || brand?.name || "We Are Collaborative";
    const description =
        seo?.siteDescription ||
        brand?.tagline ||
        "A network of elite marketing specialists, strategists, and creative minds.";
    const separator = seo?.separator || "·";
    const ogImage = seo?.defaultImage || "/og?title=We+Are+Collaborative";

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
            locale: "en_US",
            url: SITE_URL,
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
            canonical: SITE_URL,
        },
    };
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const fontVars = `${fontDisplay.variable} ${fontSerif.variable} ${fontUi.variable} ${fontMono.variable}`;

    return (
        <html lang="en" suppressHydrationWarning className={fontVars}>
            <head>
                <script
                    dangerouslySetInnerHTML={{ __html: themeBootScript }}
                />
            </head>
            <body className="bg-background text-foreground font-sans antialiased">
                <Providers>{children}</Providers>
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

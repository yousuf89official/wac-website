import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import prisma from "@/lib/prisma";

const SITE_URL = "https://wearecollaborative.net";

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
    const separator = seo?.separator || "|";
    const ogImage = seo?.defaultImage || "/og-default.jpg";

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
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-[#0a0a0a] text-white font-sans antialiased">
                <Providers>
                    {children}
                </Providers>
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

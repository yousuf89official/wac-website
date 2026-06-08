import type { Metadata } from 'next';
import { Fraunces, Newsreader, Manrope, JetBrains_Mono } from 'next/font/google';
import '../index.css';
import Providers from './providers';
import { themeBootScript } from '@wac/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';

const fontDisplay = Fraunces({
    subsets: ['latin'],
    variable: '--font-display',
    axes: ['SOFT', 'WONK', 'opsz'],
    display: 'swap',
});

const fontSerif = Newsreader({
    subsets: ['latin'],
    variable: '--font-serif',
    style: ['normal', 'italic'],
    display: 'swap',
});

const fontUi = Manrope({
    subsets: ['latin'],
    variable: '--font-ui',
    display: 'swap',
});

const fontMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'WAC Intelligence · Unified Campaign Analytics',
        template: '%s · WAC Intelligence',
    },
    description:
        'Enterprise-grade campaign analytics, full-funnel performance tracking, and AI-powered media intelligence — by We Are Collaborative.',
    metadataBase: new URL('https://intelligence.wearecollaborative.net'),
    robots: {
        // The product subdomain is NEVER indexed; marketing lives at
        // wearecollaborative.net/intelligence. See BACKLOG L-6.
        index: false,
        follow: false,
    },
    alternates: {
        canonical: 'https://wearecollaborative.net/intelligence',
    },
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const fontVars = `${fontDisplay.variable} ${fontSerif.variable} ${fontUi.variable} ${fontMono.variable}`;

    return (
        <html lang="en" dir="ltr" suppressHydrationWarning className={fontVars}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <script
                    dangerouslySetInnerHTML={{ __html: themeBootScript }}
                />
            </head>
            <body className="bg-background text-foreground font-sans antialiased selection:bg-primary/30">
                <Providers>
                    {children}
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}

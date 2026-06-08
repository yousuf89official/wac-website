import type { Metadata } from "next";
import { Fraunces, Newsreader, Manrope, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import { themeBootScript } from '@wac/ui/theme-provider';
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

// The backend app is never indexed (it's the authenticated application surface).
export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: "We Are Collaborative",
    robots: { index: false, follow: false },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const fontVars = `${fontDisplay.variable} ${fontSerif.variable} ${fontUi.variable} ${fontMono.variable}`;

    return (
        <html lang="en" suppressHydrationWarning className={fontVars}>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
            </head>
            <body className="bg-background text-foreground font-sans antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}

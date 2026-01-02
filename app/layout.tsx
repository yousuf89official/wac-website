import type { Metadata } from "next";
// import { Inter } from "next/font/google"; // We are using imported CSS for fonts to match exact legacy.
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "We Are Collaborative",
    description: "A Collaborative Marketing Agency",
};

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
            </body>
        </html>
    );
}

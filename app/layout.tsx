import "./globals.css";

// Root layout is a pass-through — all rendering happens in [locale]/layout.tsx
// This file exists only to satisfy Next.js requirement and import global CSS
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

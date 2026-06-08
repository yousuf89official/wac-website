import type { Metadata } from 'next';

// Auth pages (login/register/forgot-password) are part of the app, not the
// public marketing surface — never index them. Mirrored by robots.ts disallow
// and the X-Robots-Tag middleware header.
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
            {/* Hairline editorial grid */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10 opacity-[0.06]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
                    backgroundSize: "120px 120px",
                }}
            />
            {children}
        </div>
    );
}

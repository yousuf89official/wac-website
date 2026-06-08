import type { Metadata } from 'next';

// Checkout is a transactional app surface, not public marketing content. It moves
// to app.wearecollaborative.net in Phase 2; until then it stays noindex. The
// pages here are client components, so the robots directive lives on this
// server layout (alongside robots.ts disallow + the X-Robots-Tag middleware).
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default function CheckoutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

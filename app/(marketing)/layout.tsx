import Script from 'next/script';
import MarketingShell from '@/components/marketing/MarketingShell';
import { MarketingLenis } from './_lenis';
import { AffinityTracker } from '@/components/marketing/editorial/AffinityTracker';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MarketingLenis>
            <Script
                src={process.env.MIDTRANS_IS_PRODUCTION === 'true'
                    ? 'https://app.midtrans.com/snap/snap.js'
                    : 'https://app.sandbox.midtrans.com/snap/snap.js'
                }
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''}
                strategy="lazyOnload"
            />
            <AffinityTracker />
            <MarketingShell>{children}</MarketingShell>
        </MarketingLenis>
    );
}

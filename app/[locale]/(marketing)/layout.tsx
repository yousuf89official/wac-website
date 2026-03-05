import Script from 'next/script';
import MarketingShell from '@/components/marketing/MarketingShell';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Script
                src={process.env.MIDTRANS_IS_PRODUCTION === 'true'
                    ? 'https://app.midtrans.com/snap/snap.js'
                    : 'https://app.sandbox.midtrans.com/snap/snap.js'
                }
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''}
                strategy="lazyOnload"
            />
            <MarketingShell>{children}</MarketingShell>
        </>
    );
}

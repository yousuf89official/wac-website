/**
 * WAC backend app — app.wearecollaborative.net (non-indexed).
 * Auth + customer portal + admin CMS + checkout/payments. Identity provider
 * issuing the shared wac-customer-token cookie (.wearecollaborative.net).
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@wac/ui', '@wac/agents'],
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            { protocol: 'https', hostname: 'd64gsuwffb70l.cloudfront.net' },
            { protocol: 'https', hostname: '*.supabase.co' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    // Backend is never indexed.
                    { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
                ],
            },
        ];
    },
};

export default nextConfig;

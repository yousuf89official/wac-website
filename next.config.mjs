/**
 * The CI product (Collaborative Intelligence) lives on its own subdomain:
 * intelligence.wearecollaborative.net. WAC hosts ONLY the marketing landing
 * at /intelligence (see app/(marketing)/intelligence/page.tsx) which links
 * out to the CI subdomain for sign-in. No reverse-proxy here.
 *
 * NEXT_PUBLIC_CI_URL is read by the marketing landing's CTAs. In dev it
 * defaults to the local CI port; in prod it points at the subdomain.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    allowedDevOrigins: ['jakmac0003.local'],
    reactStrictMode: true,
    transpilePackages: ['@wac/ui', '@wac/agents'],
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
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
                ],
            },
        ];
    },
};

export default nextConfig;

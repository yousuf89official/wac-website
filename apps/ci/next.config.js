/**
 * CI is deployed to its own subdomain: intelligence.wearecollaborative.net.
 * The WAC marketing landing at wearecollaborative.net/intelligence (a
 * separate page in the WAC app) links here for sign-in. No basePath /
 * reverse-proxy — CI serves at the root of its subdomain.
 *
 * The subdomain is NOT indexed; SEO surface for the product lives on the WAC
 * apex landing. See L-6 in BACKLOG.md.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    typescript: {
        ignoreBuildErrors: false,
    },
    transpilePackages: [
        '@wac/ui',
        '@wac/agents',
        '@react-pdf/renderer',
        '@react-pdf/reconciler',
        '@react-pdf/primitives',
        '@react-pdf/layout',
        '@react-pdf/textkit',
        '@react-pdf/font',
        '@react-pdf/pdfkit',
        '@react-pdf/png-js',
        '@react-pdf/types',
    ],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            }
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
                    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
                ],
            },
        ];
    },
};

export default nextConfig;

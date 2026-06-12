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
    // The app surfaces (auth/portal/checkout/admin) moved to the backend at
    // app.wearecollaborative.net in the Phase-2 extraction. Redirect the old
    // apex URLs so bookmarks and indexed links keep working.
    async redirects() {
        const APP = process.env.NEXT_PUBLIC_APP_URL || 'https://app.wearecollaborative.net';
        return [
            { source: '/login', destination: `${APP}/login`, permanent: true },
            { source: '/register', destination: `${APP}/register`, permanent: true },
            { source: '/forgot-password', destination: `${APP}/forgot-password`, permanent: true },
            { source: '/reset-password/:path*', destination: `${APP}/reset-password/:path*`, permanent: true },
            { source: '/dashboard', destination: `${APP}/dashboard`, permanent: true },
            { source: '/dashboard/:path*', destination: `${APP}/dashboard/:path*`, permanent: true },
            { source: '/checkout', destination: `${APP}/checkout`, permanent: true },
            { source: '/checkout/:path*', destination: `${APP}/checkout/:path*`, permanent: true },
            { source: '/admin', destination: `${APP}/admin`, permanent: true },
        ];
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

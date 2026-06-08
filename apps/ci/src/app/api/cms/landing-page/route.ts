import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// GET /api/cms/landing-page
export async function GET() {
    try {
        const result = await prisma.appConfig.findUnique({
            where: { key: 'cms:landing-page' },
        });

        if (!result) {
            return NextResponse.json({
                badge: "Collaborative Intelligence — Now Live",
                heroTitle: "Unified Campaign Intelligence",
                heroHighlight: "for Data-Driven Brands",
                heroSubtitle: "Enterprise-grade campaign analytics, full-funnel performance tracking, and AI-powered insights that unify brands, agencies, and channels on one intelligent platform.",
                trustTitle: "Trusted by Leading Brands & Agencies Worldwide",
                trustLogos: ["Unilever", "L'Oréal", "Samsung", "Nestlé", "P&G", "Toyota"],
                features: [
                    { icon: "hub", title: "Collaborative Workflows", desc: "Unite brands, agencies, and stakeholders on a single platform with role-based access and real-time collaboration across campaigns." },
                    { icon: "query_stats", title: "Full-Funnel Analytics", desc: "Track performance across ATL, BTL, and Digital channels from awareness through conversion and retention in real-time." },
                    { icon: "shield", title: "Enterprise Security", desc: "Row-level security, AES-256 encryption, bcrypt authentication, and RBAC built for enterprise governance and compliance." },
                    { icon: "dashboard_customize", title: "Unified Command View", desc: "Consolidate paid, owned, earned, and social channels into a single intelligence dashboard with live data." },
                    { icon: "psychology", title: "AI-Powered Insights", desc: "Leverage machine learning to surface hidden patterns, predict campaign outcomes, and generate actionable recommendations." },
                    { icon: "share", title: "Branded Reporting", desc: "Generate white-labeled, shareable reports with your brand identity — perfect for client presentations and stakeholder updates." }
                ],
                stats: [
                    { value: 500, suffix: "+", label: "Campaigns Managed" },
                    { value: 98, suffix: "%", label: "Client Satisfaction" },
                    { value: 2, suffix: "B+", label: "Impressions Tracked" },
                    { value: 45, suffix: "%", label: "Avg. ROI Increase" }
                ],
                platformFeatures: [
                    { icon: "auto_graph", title: "Real-Time Dashboards", desc: "Live KPI tracking with auto-refreshing data pipelines and instant notifications." },
                    { icon: "calculate", title: "AVE & SOV Calculator", desc: "Industry-standard Advertising Value Equivalency and Share of Voice metrics at your fingertips." },
                    { icon: "cloud_sync", title: "Platform Integrations", desc: "Connect Google Ads, Meta, TikTok, LinkedIn, and 20+ other platforms seamlessly." },
                    { icon: "inventory", title: "Campaign Manager", desc: "Plan, execute, and optimize multi-channel campaigns from a single unified interface." },
                    { icon: "trending_up", title: "Predictive Analytics", desc: "AI models that forecast performance trends and recommend budget allocations." },
                    { icon: "lock", title: "Role-Based Access", desc: "Granular permissions from brand-level to sub-campaign, with team collaboration built in." }
                ],
                howItWorks: [
                    { step: "01", title: "Connect Your Channels", desc: "Integrate your ad platforms, social media accounts, and media buying tools in minutes." },
                    { step: "02", title: "Unified Intelligence", desc: "All your data flows into a single dashboard with real-time cross-channel analytics." },
                    { step: "03", title: "Actionable Insights", desc: "AI surfaces opportunities, flags anomalies, and generates optimization recommendations." }
                ],
                testimonials: [
                    { name: "Sarah Chen", role: "VP of Marketing", company: "Global Brands Inc.", quote: "Collaborative Intelligence transformed how we track campaign performance. We went from spreadsheets to real-time intelligence in weeks." },
                    { name: "James Wilson", role: "Media Director", company: "Pinnacle Agency", quote: "The unified dashboard alone saved our team 20 hours per week. The AI recommendations are a game-changer for optimization." },
                    { name: "Maria Rodriguez", role: "CMO", company: "FreshWave Consumer", quote: "Finally, a platform that speaks both the brand and agency language. Collaboration has never been smoother." }
                ],
                blogPosts: [
                    { title: "The Future of Media Intelligence: AI-Driven Campaign Optimization", category: "Industry Insights", excerpt: "How artificial intelligence is reshaping the way brands and agencies approach multi-channel campaign management.", date: "2026-03-05", readTime: "5 min" },
                    { title: "Understanding Share of Voice in the Digital Age", category: "Analytics", excerpt: "A comprehensive guide to measuring and improving your brand share of voice across digital, social, and traditional media.", date: "2026-02-28", readTime: "7 min" },
                    { title: "Enterprise Media Buying: Integration Best Practices", category: "Best Practices", excerpt: "Learn how leading enterprises are consolidating their media buying operations for better efficiency and ROI.", date: "2026-02-20", readTime: "6 min" }
                ],
                footerDescription: "Collaborative Intelligence is the enterprise campaign intelligence platform powering data-driven decisions for global brands and agencies.",
                contactEmail: "hello@collaborativeintelligence.com",
                footerLinks: {
                    platform: ["Dashboard", "Analytics", "Media Analyzer", "Reports", "Integrations"],
                    company: ["About Us", "Pricing", "Careers", "Contact", "Blog"],
                    resources: ["Help Center", "API Docs", "Status", "Privacy Policy", "Terms of Service"]
                }
            });
        }

        let content: any = result.value;
        try { content = JSON.parse(content); } catch (e: any) { }

        return NextResponse.json(content);
    } catch (error: any) {
        console.error('CMS API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
}

// PUT /api/cms/landing-page
export async function PUT(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const content = await request.json();
        const value = JSON.stringify(content);

        await prisma.appConfig.upsert({
            where: { key: 'cms:landing-page' },
            update: { value },
            create: { key: 'cms:landing-page', value },
        });

        return NextResponse.json(content);
    } catch (error: any) {
        console.error('CMS API PUT Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
}

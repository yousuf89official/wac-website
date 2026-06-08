/**
 * Mock Seed Data — Realistic enterprise campaign intelligence data.
 * Used by mock-db.ts when USE_MOCK_DB=true.
 */

import bcrypt from 'bcryptjs';

// ─── Password Hashes ─────────────────────────────────────────────────────────

const ADMIN_HASH = bcrypt.hashSync('admin123', 4);
const USER_HASH = bcrypt.hashSync('password123', 4);

// ─── Helper: Generate weekly metrics ─────────────────────────────────────────

function generateMetrics(
    idPrefix: string,
    brandId: string,
    campaignId: string | null,
    subCampaignId: string | null,
    channelId: string | null,
    baseDate: string,
    weeks: number,
    scale: number = 1,
): any[] {
    const metrics: any[] = [];
    for (let i = 0; i < weeks; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i * 7);
        const growth = 1 + i * 0.08;
        metrics.push({
            id: `${idPrefix}_w${i}`,
            date,
            impressions: Math.round(15000 * scale * growth),
            clicks: Math.round(750 * scale * growth),
            reach: Math.round(12000 * scale * growth),
            engagement: Math.round(450 * scale * growth),
            spend: Math.round(1200 * scale * growth * 100) / 100,
            currency: 'USD',
            region: null,
            country: null,
            brandId,
            campaignId,
            subCampaignId,
            channelId,
            createdAt: date,
            updatedAt: date,
        });
    }
    return metrics;
}

// ─── Date Helpers ────────────────────────────────────────────────────────────

const d = (s: string) => new Date(s);
const now = new Date();

// ─── Users ───────────────────────────────────────────────────────────────────

const users = [
    {
        id: 'usr_master_000',
        email: 'yousuf@wearecollaborative.net',
        password: ADMIN_HASH,
        name: 'Yousuf Noor',
        role: 'masteradmin',
        status: 'Active',
        protected: true,
        createdAt: d('2025-01-01T00:00:00Z'),
        updatedAt: d('2025-01-01T00:00:00Z'),
    },
    {
        id: 'usr_admin_001',
        email: 'admin@collaborativeintelligence.io',
        password: ADMIN_HASH,
        name: 'System Admin',
        role: 'admin',
        status: 'Active',
        createdAt: d('2025-01-01T00:00:00Z'),
        updatedAt: d('2025-01-01T00:00:00Z'),
    },
    {
        id: 'usr_sarah_002',
        email: 'sarah.chen@acmecorp.com',
        password: USER_HASH,
        name: 'Sarah Chen',
        role: 'user',
        status: 'Active',
        createdAt: d('2025-02-15T00:00:00Z'),
        updatedAt: d('2025-02-15T00:00:00Z'),
    },
    {
        id: 'usr_james_003',
        email: 'james.wilson@globalbrands.com',
        password: USER_HASH,
        name: 'James Wilson',
        role: 'user',
        status: 'Active',
        createdAt: d('2025-03-01T00:00:00Z'),
        updatedAt: d('2025-03-01T00:00:00Z'),
    },
];

// ─── Industries ──────────────────────────────────────────────────────────────

const industries = [
    { id: 'ind_tech', name: 'Technology', slug: 'technology', createdAt: d('2025-01-01T00:00:00Z') },
    { id: 'ind_fmcg', name: 'Consumer Goods', slug: 'consumer-goods', createdAt: d('2025-01-01T00:00:00Z') },
    { id: 'ind_auto', name: 'Automotive', slug: 'automotive', createdAt: d('2025-01-01T00:00:00Z') },
    { id: 'ind_fin', name: 'Financial Services', slug: 'financial-services', createdAt: d('2025-01-01T00:00:00Z') },
    { id: 'ind_ent', name: 'Entertainment', slug: 'entertainment', createdAt: d('2025-01-01T00:00:00Z') },
];

const industrySubTypes = [
    { id: 'ist_saas', name: 'SaaS', slug: 'saas', industryId: 'ind_tech', createdAt: d('2025-01-01T00:00:00Z') },
    { id: 'ist_cyber', name: 'Cybersecurity', slug: 'cybersecurity', industryId: 'ind_tech', createdAt: d('2025-01-01T00:00:00Z') },
    { id: 'ist_aiml', name: 'AI & Machine Learning', slug: 'ai-ml', industryId: 'ind_tech', createdAt: d('2025-01-01T00:00:00Z') },
    { id: 'ist_bev', name: 'Beverages', slug: 'beverages', industryId: 'ind_fmcg', createdAt: d('2025-01-01T00:00:00Z') },
    { id: 'ist_pc', name: 'Personal Care', slug: 'personal-care', industryId: 'ind_fmcg', createdAt: d('2025-01-01T00:00:00Z') },
    { id: 'ist_ev', name: 'Electric Vehicles', slug: 'electric-vehicles', industryId: 'ind_auto', createdAt: d('2025-01-01T00:00:00Z') },
    { id: 'ist_lux', name: 'Luxury', slug: 'luxury', industryId: 'ind_auto', createdAt: d('2025-01-01T00:00:00Z') },
    { id: 'ist_bank', name: 'Banking', slug: 'banking', industryId: 'ind_fin', createdAt: d('2025-01-01T00:00:00Z') },
    { id: 'ist_ins', name: 'Insurance', slug: 'insurance', industryId: 'ind_fin', createdAt: d('2025-01-01T00:00:00Z') },
    { id: 'ist_stream', name: 'Streaming', slug: 'streaming', industryId: 'ind_ent', createdAt: d('2025-01-01T00:00:00Z') },
    { id: 'ist_game', name: 'Gaming', slug: 'gaming', industryId: 'ind_ent', createdAt: d('2025-01-01T00:00:00Z') },
];

// ─── Brands ──────────────────────────────────────────────────────────────────

const brands = [
    {
        id: 'brd_nexus',
        name: 'Nexus Technologies',
        slug: 'nexus-technologies',
        industryId: 'ind_tech',
        industrySubTypeId: 'ist_saas',
        website: 'https://nexustech.io',
        logo: null,
        status: 'Active',
        defaultCurrency: 'USD',
        brandColor: '#6366F1',
        brandFontColor: '#FFFFFF',
        description: 'Enterprise SaaS platform for cloud infrastructure management and DevOps automation.',
        wallpapers: null,
        productImages: null,
        pricingModel: null,
        socialLinks: JSON.stringify({ linkedin: 'https://linkedin.com/company/nexustech', twitter: 'https://x.com/nexustech' }),
        createdAt: d('2025-01-15T00:00:00Z'),
        updatedAt: d('2025-06-01T00:00:00Z'),
    },
    {
        id: 'brd_fresh',
        name: 'FreshWave',
        slug: 'freshwave',
        industryId: 'ind_fmcg',
        industrySubTypeId: 'ist_bev',
        website: 'https://freshwave.com',
        logo: null,
        status: 'Active',
        defaultCurrency: 'USD',
        brandColor: '#10B981',
        brandFontColor: '#FFFFFF',
        description: 'Premium organic beverages — cold-pressed juices, sparkling water, and wellness drinks.',
        wallpapers: null,
        productImages: null,
        pricingModel: null,
        socialLinks: JSON.stringify({ instagram: 'https://instagram.com/freshwave', tiktok: 'https://tiktok.com/@freshwave' }),
        createdAt: d('2025-02-01T00:00:00Z'),
        updatedAt: d('2025-06-01T00:00:00Z'),
    },
    {
        id: 'brd_velocity',
        name: 'Velocity Motors',
        slug: 'velocity-motors',
        industryId: 'ind_auto',
        industrySubTypeId: 'ist_ev',
        website: 'https://velocitymotors.com',
        logo: null,
        status: 'Active',
        defaultCurrency: 'USD',
        brandColor: '#EF4444',
        brandFontColor: '#FFFFFF',
        description: 'Next-generation electric vehicles with autonomous driving and sustainable energy integration.',
        wallpapers: null,
        productImages: null,
        pricingModel: null,
        socialLinks: JSON.stringify({ youtube: 'https://youtube.com/velocitymotors', linkedin: 'https://linkedin.com/company/velocitymotors' }),
        createdAt: d('2025-03-01T00:00:00Z'),
        updatedAt: d('2025-06-01T00:00:00Z'),
    },
    {
        id: 'brd_pinnacle',
        name: 'Pinnacle Bank',
        slug: 'pinnacle-bank',
        industryId: 'ind_fin',
        industrySubTypeId: 'ist_bank',
        website: 'https://pinnaclebank.com',
        logo: null,
        status: 'Active',
        defaultCurrency: 'USD',
        brandColor: '#0D9488',
        brandFontColor: '#FFFFFF',
        description: 'Digital-first banking with AI-powered financial advisory and wealth management.',
        wallpapers: null,
        productImages: null,
        pricingModel: null,
        socialLinks: JSON.stringify({ linkedin: 'https://linkedin.com/company/pinnaclebank' }),
        createdAt: d('2025-03-15T00:00:00Z'),
        updatedAt: d('2025-06-01T00:00:00Z'),
    },
];

// ─── UserBrand (Ownership) ───────────────────────────────────────────────────

const userBrands = [
    // Admin owns all
    { id: 'ub_001', userId: 'usr_admin_001', brandId: 'brd_nexus', role: 'owner', createdAt: d('2025-01-15T00:00:00Z') },
    { id: 'ub_002', userId: 'usr_admin_001', brandId: 'brd_fresh', role: 'owner', createdAt: d('2025-02-01T00:00:00Z') },
    { id: 'ub_003', userId: 'usr_admin_001', brandId: 'brd_velocity', role: 'owner', createdAt: d('2025-03-01T00:00:00Z') },
    { id: 'ub_004', userId: 'usr_admin_001', brandId: 'brd_pinnacle', role: 'owner', createdAt: d('2025-03-15T00:00:00Z') },
    // Sarah manages Nexus + FreshWave
    { id: 'ub_005', userId: 'usr_sarah_002', brandId: 'brd_nexus', role: 'admin', createdAt: d('2025-02-15T00:00:00Z') },
    { id: 'ub_006', userId: 'usr_sarah_002', brandId: 'brd_fresh', role: 'member', createdAt: d('2025-02-15T00:00:00Z') },
    // James manages Velocity + Pinnacle
    { id: 'ub_007', userId: 'usr_james_003', brandId: 'brd_velocity', role: 'admin', createdAt: d('2025-03-01T00:00:00Z') },
    { id: 'ub_008', userId: 'usr_james_003', brandId: 'brd_pinnacle', role: 'member', createdAt: d('2025-03-15T00:00:00Z') },
];

// ─── Platforms & Channels ────────────────────────────────────────────────────

const platforms = [
    { id: 'plt_meta', name: 'Meta', slug: 'meta', status: 'Active' },
    { id: 'plt_google', name: 'Google', slug: 'google', status: 'Active' },
    { id: 'plt_tiktok', name: 'TikTok', slug: 'tiktok', status: 'Active' },
    { id: 'plt_linkedin', name: 'LinkedIn', slug: 'linkedin', status: 'Active' },
    { id: 'plt_x', name: 'X (Twitter)', slug: 'x-twitter', status: 'Active' },
];

const channels = [
    { id: 'ch_fb', name: 'Facebook Ads', slug: 'facebook-ads', status: 'Active', platformId: 'plt_meta' },
    { id: 'ch_ig', name: 'Instagram Ads', slug: 'instagram-ads', status: 'Active', platformId: 'plt_meta' },
    { id: 'ch_search', name: 'Google Search Ads', slug: 'google-search-ads', status: 'Active', platformId: 'plt_google' },
    { id: 'ch_display', name: 'Google Display', slug: 'google-display', status: 'Active', platformId: 'plt_google' },
    { id: 'ch_yt', name: 'YouTube Ads', slug: 'youtube-ads', status: 'Active', platformId: 'plt_google' },
    { id: 'ch_tt', name: 'TikTok Ads', slug: 'tiktok-ads', status: 'Active', platformId: 'plt_tiktok' },
    { id: 'ch_li', name: 'LinkedIn Ads', slug: 'linkedin-ads', status: 'Active', platformId: 'plt_linkedin' },
    { id: 'ch_x', name: 'X Ads', slug: 'x-ads', status: 'Active', platformId: 'plt_x' },
];

// ─── Campaigns ───────────────────────────────────────────────────────────────

const campaigns = [
    // Nexus Technologies
    {
        id: 'cmp_nexus_q1',
        name: 'Q1 Cloud Launch',
        slug: 'q1-cloud-launch',
        description: 'Enterprise cloud infrastructure launch campaign targeting CTO/DevOps personas across APAC and NA.',
        startDate: d('2025-01-15T00:00:00Z'),
        endDate: d('2025-03-31T00:00:00Z'),
        budgetPlanned: 125000,
        currency: 'USD',
        timezone: 'UTC',
        status: 'Active',
        brandId: 'brd_nexus',
        createdAt: d('2025-01-10T00:00:00Z'),
        updatedAt: d('2025-01-10T00:00:00Z'),
    },
    {
        id: 'cmp_nexus_summer',
        name: 'Summer DevOps Summit',
        slug: 'summer-devops-summit',
        description: 'Thought leadership and lead generation around annual developer conference sponsorship.',
        startDate: d('2025-06-01T00:00:00Z'),
        endDate: d('2025-08-31T00:00:00Z'),
        budgetPlanned: 85000,
        currency: 'USD',
        timezone: 'UTC',
        status: 'Active',
        brandId: 'brd_nexus',
        createdAt: d('2025-05-15T00:00:00Z'),
        updatedAt: d('2025-05-15T00:00:00Z'),
    },
    // FreshWave
    {
        id: 'cmp_fresh_q1',
        name: 'New Year Wellness',
        slug: 'new-year-wellness',
        description: 'Health-conscious consumer targeting for Q1 wellness trend with influencer partnerships.',
        startDate: d('2025-01-01T00:00:00Z'),
        endDate: d('2025-03-15T00:00:00Z'),
        budgetPlanned: 75000,
        currency: 'USD',
        timezone: 'UTC',
        status: 'Active',
        brandId: 'brd_fresh',
        createdAt: d('2024-12-15T00:00:00Z'),
        updatedAt: d('2024-12-15T00:00:00Z'),
    },
    {
        id: 'cmp_fresh_launch',
        name: 'Summer Sparkling Launch',
        slug: 'summer-sparkling-launch',
        description: 'New sparkling water line product launch across retail and D2C channels.',
        startDate: d('2025-05-01T00:00:00Z'),
        endDate: d('2025-07-31T00:00:00Z'),
        budgetPlanned: 110000,
        currency: 'USD',
        timezone: 'UTC',
        status: 'Active',
        brandId: 'brd_fresh',
        createdAt: d('2025-04-15T00:00:00Z'),
        updatedAt: d('2025-04-15T00:00:00Z'),
    },
    // Velocity Motors
    {
        id: 'cmp_velocity_ev',
        name: 'EV Revolution',
        slug: 'ev-revolution',
        description: 'Full-funnel campaign for new EV model launch — awareness through test drive conversion.',
        startDate: d('2025-03-01T00:00:00Z'),
        endDate: d('2025-06-30T00:00:00Z'),
        budgetPlanned: 250000,
        currency: 'USD',
        timezone: 'UTC',
        status: 'Active',
        brandId: 'brd_velocity',
        createdAt: d('2025-02-15T00:00:00Z'),
        updatedAt: d('2025-02-15T00:00:00Z'),
    },
    {
        id: 'cmp_velocity_brand',
        name: 'Brand Heritage 2025',
        slug: 'brand-heritage-2025',
        description: 'ATL brand equity campaign — TV, OOH, and premium digital placements.',
        startDate: d('2025-01-01T00:00:00Z'),
        endDate: d('2025-12-31T00:00:00Z'),
        budgetPlanned: 500000,
        currency: 'USD',
        timezone: 'UTC',
        status: 'Active',
        brandId: 'brd_velocity',
        createdAt: d('2024-12-01T00:00:00Z'),
        updatedAt: d('2024-12-01T00:00:00Z'),
    },
    // Pinnacle Bank
    {
        id: 'cmp_pinnacle_digital',
        name: 'Digital Banking Launch',
        slug: 'digital-banking-launch',
        description: 'App download and account opening campaign targeting millennials and Gen Z.',
        startDate: d('2025-04-01T00:00:00Z'),
        endDate: d('2025-06-30T00:00:00Z'),
        budgetPlanned: 180000,
        currency: 'USD',
        timezone: 'UTC',
        status: 'Active',
        brandId: 'brd_pinnacle',
        createdAt: d('2025-03-20T00:00:00Z'),
        updatedAt: d('2025-03-20T00:00:00Z'),
    },
    {
        id: 'cmp_pinnacle_trust',
        name: 'Trust & Security',
        slug: 'trust-and-security',
        description: 'Brand trust campaign emphasizing security features and regulatory compliance.',
        startDate: d('2025-02-01T00:00:00Z'),
        endDate: d('2025-05-31T00:00:00Z'),
        budgetPlanned: 95000,
        currency: 'USD',
        timezone: 'UTC',
        status: 'Active',
        brandId: 'brd_pinnacle',
        createdAt: d('2025-01-25T00:00:00Z'),
        updatedAt: d('2025-01-25T00:00:00Z'),
    },
];

// ─── Sub-Campaigns ───────────────────────────────────────────────────────────

const subCampaigns = [
    {
        id: 'sub_nexus_social',
        name: 'Social Media Push',
        slug: 'social-media-push',
        status: 'Active',
        description: 'LinkedIn and X thought leadership content series.',
        startDate: d('2025-01-20T00:00:00Z'),
        endDate: d('2025-03-15T00:00:00Z'),
        budgetPlanned: 35000,
        region: 'APAC',
        country: null,
        targetAudience: 'CTO, VP Engineering, DevOps leads',
        configuration: null,
        campaignId: 'cmp_nexus_q1',
        createdAt: d('2025-01-15T00:00:00Z'),
        updatedAt: d('2025-01-15T00:00:00Z'),
    },
    {
        id: 'sub_fresh_influencer',
        name: 'Influencer Collabs',
        slug: 'influencer-collabs',
        status: 'Active',
        description: 'Micro and macro influencer partnerships for organic reach.',
        startDate: d('2025-01-10T00:00:00Z'),
        endDate: d('2025-02-28T00:00:00Z'),
        budgetPlanned: 25000,
        region: 'North America',
        country: 'US',
        targetAudience: 'Health-conscious millennials, fitness enthusiasts',
        configuration: null,
        campaignId: 'cmp_fresh_q1',
        createdAt: d('2025-01-05T00:00:00Z'),
        updatedAt: d('2025-01-05T00:00:00Z'),
    },
    {
        id: 'sub_velocity_launch',
        name: 'Pre-Order Drive',
        slug: 'pre-order-drive',
        status: 'Active',
        description: 'Performance marketing for pre-order registrations.',
        startDate: d('2025-03-15T00:00:00Z'),
        endDate: d('2025-05-31T00:00:00Z'),
        budgetPlanned: 80000,
        region: 'Global',
        country: null,
        targetAudience: 'Early adopters, EV enthusiasts, luxury car owners',
        configuration: null,
        campaignId: 'cmp_velocity_ev',
        createdAt: d('2025-03-10T00:00:00Z'),
        updatedAt: d('2025-03-10T00:00:00Z'),
    },
    {
        id: 'sub_pinnacle_sem',
        name: 'SEM & App Install',
        slug: 'sem-app-install',
        status: 'Active',
        description: 'Google and Apple search ads for app installs.',
        startDate: d('2025-04-05T00:00:00Z'),
        endDate: d('2025-06-15T00:00:00Z'),
        budgetPlanned: 55000,
        region: 'Southeast Asia',
        country: 'SG',
        targetAudience: 'Gen Z, young professionals, first-time investors',
        configuration: null,
        campaignId: 'cmp_pinnacle_digital',
        createdAt: d('2025-04-01T00:00:00Z'),
        updatedAt: d('2025-04-01T00:00:00Z'),
    },
];

// ─── Campaign Channels ───────────────────────────────────────────────────────

const campaignChannels = [
    { id: 'cc_001', campaignId: 'cmp_nexus_q1', channelId: 'ch_li' },
    { id: 'cc_002', campaignId: 'cmp_nexus_q1', channelId: 'ch_search' },
    { id: 'cc_003', campaignId: 'cmp_nexus_summer', channelId: 'ch_li' },
    { id: 'cc_004', campaignId: 'cmp_nexus_summer', channelId: 'ch_yt' },
    { id: 'cc_005', campaignId: 'cmp_fresh_q1', channelId: 'ch_ig' },
    { id: 'cc_006', campaignId: 'cmp_fresh_q1', channelId: 'ch_tt' },
    { id: 'cc_007', campaignId: 'cmp_fresh_launch', channelId: 'ch_fb' },
    { id: 'cc_008', campaignId: 'cmp_fresh_launch', channelId: 'ch_ig' },
    { id: 'cc_009', campaignId: 'cmp_fresh_launch', channelId: 'ch_tt' },
    { id: 'cc_010', campaignId: 'cmp_velocity_ev', channelId: 'ch_yt' },
    { id: 'cc_011', campaignId: 'cmp_velocity_ev', channelId: 'ch_search' },
    { id: 'cc_012', campaignId: 'cmp_velocity_ev', channelId: 'ch_display' },
    { id: 'cc_013', campaignId: 'cmp_velocity_brand', channelId: 'ch_yt' },
    { id: 'cc_014', campaignId: 'cmp_velocity_brand', channelId: 'ch_fb' },
    { id: 'cc_015', campaignId: 'cmp_pinnacle_digital', channelId: 'ch_search' },
    { id: 'cc_016', campaignId: 'cmp_pinnacle_digital', channelId: 'ch_fb' },
    { id: 'cc_017', campaignId: 'cmp_pinnacle_digital', channelId: 'ch_ig' },
    { id: 'cc_018', campaignId: 'cmp_pinnacle_trust', channelId: 'ch_li' },
    { id: 'cc_019', campaignId: 'cmp_pinnacle_trust', channelId: 'ch_display' },
];

const subCampaignChannels = [
    { id: 'scc_001', subCampaignId: 'sub_nexus_social', channelId: 'ch_li' },
    { id: 'scc_002', subCampaignId: 'sub_nexus_social', channelId: 'ch_x' },
    { id: 'scc_003', subCampaignId: 'sub_fresh_influencer', channelId: 'ch_ig' },
    { id: 'scc_004', subCampaignId: 'sub_fresh_influencer', channelId: 'ch_tt' },
    { id: 'scc_005', subCampaignId: 'sub_velocity_launch', channelId: 'ch_search' },
    { id: 'scc_006', subCampaignId: 'sub_velocity_launch', channelId: 'ch_display' },
    { id: 'scc_007', subCampaignId: 'sub_pinnacle_sem', channelId: 'ch_search' },
];

// ─── Metrics (12 weeks of data per brand/campaign combo) ─────────────────────

const metrics = [
    // Nexus — Q1 Cloud Launch via LinkedIn
    ...generateMetrics('met_nq1_li', 'brd_nexus', 'cmp_nexus_q1', null, 'ch_li', '2025-01-20', 10, 0.8),
    // Nexus — Q1 Cloud Launch via Google Search
    ...generateMetrics('met_nq1_gs', 'brd_nexus', 'cmp_nexus_q1', null, 'ch_search', '2025-01-20', 10, 1.2),
    // Nexus — Summer DevOps via YouTube
    ...generateMetrics('met_nsum_yt', 'brd_nexus', 'cmp_nexus_summer', null, 'ch_yt', '2025-06-01', 8, 1.0),
    // FreshWave — New Year Wellness via Instagram
    ...generateMetrics('met_fq1_ig', 'brd_fresh', 'cmp_fresh_q1', null, 'ch_ig', '2025-01-05', 10, 1.5),
    // FreshWave — New Year Wellness via TikTok
    ...generateMetrics('met_fq1_tt', 'brd_fresh', 'cmp_fresh_q1', null, 'ch_tt', '2025-01-05', 10, 2.0),
    // FreshWave — Summer Sparkling via Facebook
    ...generateMetrics('met_fsl_fb', 'brd_fresh', 'cmp_fresh_launch', null, 'ch_fb', '2025-05-05', 8, 1.3),
    // Velocity — EV Revolution via YouTube
    ...generateMetrics('met_vev_yt', 'brd_velocity', 'cmp_velocity_ev', null, 'ch_yt', '2025-03-05', 12, 2.5),
    // Velocity — EV Revolution via Google Search
    ...generateMetrics('met_vev_gs', 'brd_velocity', 'cmp_velocity_ev', null, 'ch_search', '2025-03-05', 12, 1.8),
    // Velocity — Brand Heritage via YouTube
    ...generateMetrics('met_vbh_yt', 'brd_velocity', 'cmp_velocity_brand', null, 'ch_yt', '2025-01-06', 12, 3.0),
    // Pinnacle — Digital Banking via Google Search
    ...generateMetrics('met_pdb_gs', 'brd_pinnacle', 'cmp_pinnacle_digital', null, 'ch_search', '2025-04-07', 10, 1.4),
    // Pinnacle — Digital Banking via Instagram
    ...generateMetrics('met_pdb_ig', 'brd_pinnacle', 'cmp_pinnacle_digital', null, 'ch_ig', '2025-04-07', 10, 1.1),
    // Pinnacle — Trust & Security via LinkedIn
    ...generateMetrics('met_pts_li', 'brd_pinnacle', 'cmp_pinnacle_trust', null, 'ch_li', '2025-02-03', 12, 0.7),
];

// ─── Integrations ────────────────────────────────────────────────────────────

const integrations = [
    {
        id: 'int_001',
        provider: 'google_ads',
        accessToken: null,
        refreshToken: null,
        customerId: '123-456-7890',
        accountName: 'Nexus Technologies - Google Ads',
        status: 'Active',
        brandId: 'brd_nexus',
        createdAt: d('2025-02-01T00:00:00Z'),
        updatedAt: d('2025-02-01T00:00:00Z'),
    },
    {
        id: 'int_002',
        provider: 'meta_business',
        accessToken: null,
        refreshToken: null,
        customerId: 'act_987654321',
        accountName: 'FreshWave - Meta Business',
        status: 'Active',
        brandId: 'brd_fresh',
        createdAt: d('2025-02-15T00:00:00Z'),
        updatedAt: d('2025-02-15T00:00:00Z'),
    },
];

// ─── Share Links ─────────────────────────────────────────────────────────────

const shareLinks = [
    {
        id: 'sl_001',
        token: 'share_nexus_abc123def456',
        brandId: 'brd_nexus',
        isActive: true,
        expiresAt: d('2026-12-31T23:59:59Z'),
        createdAt: d('2025-03-01T00:00:00Z'),
        updatedAt: d('2025-03-01T00:00:00Z'),
    },
    {
        id: 'sl_002',
        token: 'share_velocity_xyz789ghi012',
        brandId: 'brd_velocity',
        isActive: true,
        expiresAt: null,
        createdAt: d('2025-04-01T00:00:00Z'),
        updatedAt: d('2025-04-01T00:00:00Z'),
    },
];

// ─── Invoices ────────────────────────────────────────────────────────────────

const invoices = [
    {
        id: 'inv_001',
        invoiceNumber: 'CI-2025-001',
        date: d('2025-03-01T00:00:00Z'),
        dueDate: d('2025-03-31T00:00:00Z'),
        sellerName: 'Collaborative Intelligence Pte. Ltd.',
        sellerEmail: 'billing@collaborativeintelligence.io',
        sellerAddress: '1 Raffles Place, #20-01, Singapore 048616',
        sellerPhone: '+65 6123 4567',
        buyerName: 'Nexus Technologies Inc.',
        buyerEmail: 'accounts@nexustech.io',
        buyerAddress: '100 Market Street, San Francisco, CA 94105',
        buyerPhone: '+1 415 555 0100',
        items: JSON.stringify([
            { description: 'Enterprise Platform License — Q1 2025', quantity: 1, unitPrice: 4999, amount: 4999 },
            { description: 'Custom Dashboard Development', quantity: 20, unitPrice: 150, amount: 3000 },
            { description: 'Data Integration Setup', quantity: 3, unitPrice: 500, amount: 1500 },
        ]),
        taxRate: 8,
        currencySymbol: '$',
        paymentDetails: JSON.stringify({
            bankName: 'DBS Bank',
            accountNumber: '012-345678-9',
            swiftCode: 'DBSSSGSG',
            accountName: 'Collaborative Intelligence Pte. Ltd.',
        }),
        terms: 'Net 30. Late payments subject to 1.5% monthly interest.',
        signatureImage: null,
        signerName: 'System Admin',
        signatureMeta: null,
        userId: 'usr_admin_001',
        status: 'Sent',
        createdAt: d('2025-03-01T00:00:00Z'),
        updatedAt: d('2025-03-05T00:00:00Z'),
    },
    {
        id: 'inv_002',
        invoiceNumber: 'CI-2025-002',
        date: d('2025-04-01T00:00:00Z'),
        dueDate: d('2025-04-30T00:00:00Z'),
        sellerName: 'Collaborative Intelligence Pte. Ltd.',
        sellerEmail: 'billing@collaborativeintelligence.io',
        sellerAddress: '1 Raffles Place, #20-01, Singapore 048616',
        sellerPhone: '+65 6123 4567',
        buyerName: 'FreshWave LLC',
        buyerEmail: 'finance@freshwave.com',
        buyerAddress: '200 Park Avenue, New York, NY 10166',
        buyerPhone: '+1 212 555 0200',
        items: JSON.stringify([
            { description: 'Growth Platform License — April 2025', quantity: 1, unitPrice: 1999, amount: 1999 },
            { description: 'Influencer Analytics Module', quantity: 1, unitPrice: 799, amount: 799 },
        ]),
        taxRate: 0,
        currencySymbol: '$',
        paymentDetails: JSON.stringify({
            bankName: 'DBS Bank',
            accountNumber: '012-345678-9',
            swiftCode: 'DBSSSGSG',
            accountName: 'Collaborative Intelligence Pte. Ltd.',
        }),
        terms: 'Net 30.',
        signatureImage: null,
        signerName: 'System Admin',
        signatureMeta: null,
        userId: 'usr_admin_001',
        status: 'Draft',
        createdAt: d('2025-04-01T00:00:00Z'),
        updatedAt: d('2025-04-01T00:00:00Z'),
    },
];

// ─── Extractions ─────────────────────────────────────────────────────────────

const igExtractions = [
    {
        id: 'ige_001',
        shortcode: 'CxY123abc',
        mediaId: '3210987654321',
        postType: 'reel',
        originalUrl: 'https://www.instagram.com/reel/CxY123abc/',
        rawInput: 'https://www.instagram.com/reel/CxY123abc/',
        userId: 'usr_admin_001',
        createdAt: d('2025-05-15T10:30:00Z'),
    },
    {
        id: 'ige_002',
        shortcode: 'DaB456def',
        mediaId: '3210987654322',
        postType: 'post',
        originalUrl: 'https://www.instagram.com/p/DaB456def/',
        rawInput: 'https://www.instagram.com/p/DaB456def/',
        userId: 'usr_sarah_002',
        createdAt: d('2025-05-20T14:00:00Z'),
    },
];

const ttExtractions = [
    {
        id: 'tte_001',
        videoId: '7345678901234567890',
        shortCode: null,
        username: 'freshwave',
        postType: 'video',
        originalUrl: 'https://www.tiktok.com/@freshwave/video/7345678901234567890',
        rawInput: 'https://www.tiktok.com/@freshwave/video/7345678901234567890',
        isShortUrl: false,
        userId: 'usr_admin_001',
        createdAt: d('2025-05-18T09:00:00Z'),
    },
];

// ─── App Config ──────────────────────────────────────────────────────────────

const appConfig = [
    {
        key: 'theme:default-theme',
        value: 'dark',
        createdAt: d('2025-01-01T00:00:00Z'),
        updatedAt: d('2025-01-01T00:00:00Z'),
    },
    {
        key: 'cms:landing-page',
        value: JSON.stringify({
            badge: 'Collaborative Intelligence — Now Live',
            heroTitle: 'Unified Campaign Intelligence',
            heroHighlight: 'for Data-Driven Brands',
            heroSubtitle: 'Enterprise-grade campaign analytics, full-funnel performance tracking, and AI-powered insights that unify brands, agencies, and channels on one intelligent platform.',
            trustTitle: 'Trusted by Leading Brands & Agencies Worldwide',
            trustLogos: ['Unilever', "L'Oréal", 'Samsung', 'Nestlé', 'P&G', 'Toyota'],
            features: [
                { icon: 'hub', title: 'Collaborative Workflows', desc: 'Unite brands, agencies, and stakeholders on a single platform with role-based access and real-time collaboration across campaigns.' },
                { icon: 'query_stats', title: 'Full-Funnel Analytics', desc: 'Track performance across ATL, BTL, and Digital channels from awareness through conversion and retention in real-time.' },
                { icon: 'shield', title: 'Enterprise Security', desc: 'Row-level security, AES-256 encryption, bcrypt authentication, and RBAC built for enterprise governance and compliance.' },
                { icon: 'dashboard_customize', title: 'Unified Command View', desc: 'Consolidate paid, owned, earned, and social channels into a single intelligence dashboard with live data.' },
                { icon: 'psychology', title: 'AI-Powered Insights', desc: 'Leverage machine learning to surface hidden patterns, predict campaign outcomes, and generate actionable recommendations.' },
                { icon: 'share', title: 'Branded Reporting', desc: 'Generate white-labeled, shareable reports with your brand identity — perfect for client presentations and stakeholder updates.' },
            ],
            stats: [
                { value: 500, suffix: '+', label: 'Campaigns Managed' },
                { value: 98, suffix: '%', label: 'Client Satisfaction' },
                { value: 2, suffix: 'B+', label: 'Impressions Tracked' },
                { value: 45, suffix: '%', label: 'Avg. ROI Increase' },
            ],
            platformFeatures: [
                { icon: 'auto_graph', title: 'Real-Time Dashboards', desc: 'Live KPI tracking with auto-refreshing data pipelines and instant notifications.' },
                { icon: 'calculate', title: 'AVE & SOV Calculator', desc: 'Industry-standard Advertising Value Equivalency and Share of Voice metrics at your fingertips.' },
                { icon: 'cloud_sync', title: 'Platform Integrations', desc: 'Connect Google Ads, Meta, TikTok, LinkedIn, and 20+ other platforms seamlessly.' },
                { icon: 'inventory', title: 'Campaign Manager', desc: 'Plan, execute, and optimize multi-channel campaigns from a single unified interface.' },
                { icon: 'trending_up', title: 'Predictive Analytics', desc: 'AI models that forecast performance trends and recommend budget allocations.' },
                { icon: 'lock', title: 'Role-Based Access', desc: 'Granular permissions from brand-level to sub-campaign, with team collaboration built in.' },
            ],
            howItWorks: [
                { step: '01', title: 'Connect Your Channels', desc: 'Integrate your ad platforms, social media accounts, and media buying tools in minutes.' },
                { step: '02', title: 'Unified Intelligence', desc: 'All your data flows into a single dashboard with real-time cross-channel analytics.' },
                { step: '03', title: 'Actionable Insights', desc: 'AI surfaces opportunities, flags anomalies, and generates optimization recommendations.' },
            ],
            testimonials: [
                { name: 'Sarah Chen', role: 'VP of Marketing', company: 'Global Brands Inc.', quote: 'Collaborative Intelligence transformed how we track campaign performance. We went from spreadsheets to real-time intelligence in weeks.' },
                { name: 'James Wilson', role: 'Media Director', company: 'Pinnacle Agency', quote: 'The unified dashboard alone saved our team 20 hours per week. The AI recommendations are a game-changer for optimization.' },
                { name: 'Maria Rodriguez', role: 'CMO', company: 'FreshWave Consumer', quote: 'Finally, a platform that speaks both the brand and agency language. Collaboration has never been smoother.' },
            ],
            blogPosts: [
                { title: 'The Future of Media Intelligence: AI-Driven Campaign Optimization', category: 'Industry Insights', excerpt: 'How artificial intelligence is reshaping the way brands and agencies approach multi-channel campaign management.', date: '2026-03-05', readTime: '5 min' },
                { title: 'Understanding Share of Voice in the Digital Age', category: 'Analytics', excerpt: 'A comprehensive guide to measuring and improving your brand share of voice across digital, social, and traditional media.', date: '2026-02-28', readTime: '7 min' },
                { title: 'Enterprise Media Buying: Integration Best Practices', category: 'Best Practices', excerpt: 'Learn how leading enterprises are consolidating their media buying operations for better efficiency and ROI.', date: '2026-02-20', readTime: '6 min' },
            ],
            footerDescription: 'Collaborative Intelligence is the enterprise campaign intelligence platform powering data-driven decisions for global brands and agencies.',
            contactEmail: 'hello@collaborativeintelligence.com',
            footerLinks: {
                platform: ['Dashboard', 'Analytics', 'Media Analyzer', 'Reports', 'Integrations'],
                company: ['About Us', 'Pricing', 'Careers', 'Contact', 'Blog'],
                resources: ['Help Center', 'API Docs', 'Status', 'Privacy Policy', 'Terms of Service'],
            },
        }),
        createdAt: d('2025-01-01T00:00:00Z'),
        updatedAt: d('2025-06-01T00:00:00Z'),
    },
];

// ─── Table Name Mapping (camelCase → PascalCase for raw SQL) ─────────────────

export const TABLE_NAME_MAP: Record<string, string> = {
    user: 'User',
    userBrand: 'UserBrand',
    brand: 'Brand',
    industry: 'Industry',
    industrySubType: 'IndustrySubType',
    campaign: 'Campaign',
    subCampaign: 'SubCampaign',
    platform: 'Platform',
    channel: 'Channel',
    campaignChannel: 'CampaignChannel',
    subCampaignChannel: 'SubCampaignChannel',
    integration: 'Integration',
    metric: 'Metric',
    shareLink: 'ShareLink',
    invoice: 'Invoice',
    igExtraction: 'IgExtraction',
    ttExtraction: 'TtExtraction',
    appConfig: 'AppConfig',
};

// ─── Column Schemas (for admin database browser introspection) ───────────────

export const COLUMN_SCHEMAS: Record<string, any[]> = {
    User: [
        { name: 'id', type: 'text', nullable: false, pk: true },
        { name: 'email', type: 'text', nullable: false },
        { name: 'password', type: 'text', nullable: false },
        { name: 'name', type: 'text', nullable: true },
        { name: 'role', type: 'text', nullable: false, default: "'user'" },
        { name: 'status', type: 'text', nullable: false, default: "'Active'" },
        { name: 'createdAt', type: 'timestamp with time zone', nullable: false },
        { name: 'updatedAt', type: 'timestamp with time zone', nullable: false },
    ],
    Brand: [
        { name: 'id', type: 'text', nullable: false, pk: true },
        { name: 'name', type: 'text', nullable: false },
        { name: 'slug', type: 'text', nullable: false },
        { name: 'industryId', type: 'text', nullable: true },
        { name: 'industrySubTypeId', type: 'text', nullable: true },
        { name: 'website', type: 'text', nullable: true },
        { name: 'logo', type: 'text', nullable: true },
        { name: 'status', type: 'text', nullable: false, default: "'Active'" },
        { name: 'defaultCurrency', type: 'text', nullable: false, default: "'USD'" },
        { name: 'brandColor', type: 'text', nullable: true },
        { name: 'brandFontColor', type: 'text', nullable: false, default: "'#000000'" },
        { name: 'description', type: 'text', nullable: true },
        { name: 'createdAt', type: 'timestamp with time zone', nullable: false },
        { name: 'updatedAt', type: 'timestamp with time zone', nullable: false },
    ],
    Campaign: [
        { name: 'id', type: 'text', nullable: false, pk: true },
        { name: 'name', type: 'text', nullable: false },
        { name: 'slug', type: 'text', nullable: false },
        { name: 'description', type: 'text', nullable: true },
        { name: 'startDate', type: 'timestamp with time zone', nullable: true },
        { name: 'endDate', type: 'timestamp with time zone', nullable: true },
        { name: 'budgetPlanned', type: 'double precision', nullable: false, default: '0' },
        { name: 'status', type: 'text', nullable: false, default: "'Active'" },
        { name: 'brandId', type: 'text', nullable: false },
        { name: 'createdAt', type: 'timestamp with time zone', nullable: false },
        { name: 'updatedAt', type: 'timestamp with time zone', nullable: false },
    ],
    Metric: [
        { name: 'id', type: 'text', nullable: false, pk: true },
        { name: 'date', type: 'timestamp with time zone', nullable: false },
        { name: 'impressions', type: 'integer', nullable: false, default: '0' },
        { name: 'spend', type: 'double precision', nullable: false, default: '0' },
        { name: 'clicks', type: 'integer', nullable: false, default: '0' },
        { name: 'reach', type: 'integer', nullable: false, default: '0' },
        { name: 'engagement', type: 'integer', nullable: false, default: '0' },
        { name: 'currency', type: 'text', nullable: false, default: "'USD'" },
        { name: 'brandId', type: 'text', nullable: false },
        { name: 'campaignId', type: 'text', nullable: true },
        { name: 'channelId', type: 'text', nullable: true },
        { name: 'createdAt', type: 'timestamp with time zone', nullable: false },
        { name: 'updatedAt', type: 'timestamp with time zone', nullable: false },
    ],
    Invoice: [
        { name: 'id', type: 'text', nullable: false, pk: true },
        { name: 'invoiceNumber', type: 'text', nullable: false },
        { name: 'date', type: 'timestamp with time zone', nullable: false },
        { name: 'dueDate', type: 'timestamp with time zone', nullable: false },
        { name: 'sellerName', type: 'text', nullable: false },
        { name: 'buyerName', type: 'text', nullable: false },
        { name: 'items', type: 'text', nullable: false },
        { name: 'taxRate', type: 'double precision', nullable: false },
        { name: 'status', type: 'text', nullable: false, default: "'Draft'" },
        { name: 'userId', type: 'text', nullable: true },
        { name: 'createdAt', type: 'timestamp with time zone', nullable: false },
        { name: 'updatedAt', type: 'timestamp with time zone', nullable: false },
    ],
    ShareLink: [
        { name: 'id', type: 'text', nullable: false, pk: true },
        { name: 'token', type: 'text', nullable: false },
        { name: 'brandId', type: 'text', nullable: false },
        { name: 'isActive', type: 'boolean', nullable: false, default: 'true' },
        { name: 'expiresAt', type: 'timestamp with time zone', nullable: true },
        { name: 'createdAt', type: 'timestamp with time zone', nullable: false },
        { name: 'updatedAt', type: 'timestamp with time zone', nullable: false },
    ],
    AppConfig: [
        { name: 'key', type: 'text', nullable: false, pk: true },
        { name: 'value', type: 'text', nullable: false },
        { name: 'createdAt', type: 'timestamp with time zone', nullable: false },
        { name: 'updatedAt', type: 'timestamp with time zone', nullable: false },
    ],
};

// Add generic column schemas for tables not explicitly defined above
for (const [modelKey, tableName] of Object.entries(TABLE_NAME_MAP)) {
    if (!COLUMN_SCHEMAS[tableName]) {
        COLUMN_SCHEMAS[tableName] = [
            { name: 'id', type: 'text', nullable: false, pk: true },
            { name: 'createdAt', type: 'timestamp with time zone', nullable: false },
        ];
    }
}

// ─── Export Seed Data ────────────────────────────────────────────────────────

export const SEED_DATA: Record<string, any[]> = {
    user: users,
    userBrand: userBrands,
    brand: brands,
    industry: industries,
    industrySubType: industrySubTypes,
    campaign: campaigns,
    subCampaign: subCampaigns,
    platform: platforms,
    channel: channels,
    campaignChannel: campaignChannels,
    subCampaignChannel: subCampaignChannels,
    integration: integrations,
    metric: metrics,
    shareLink: shareLinks,
    invoice: invoices,
    igExtraction: igExtractions,
    ttExtraction: ttExtractions,
    appConfig: appConfig,
};

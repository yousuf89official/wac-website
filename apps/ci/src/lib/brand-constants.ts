
// =============================================================================
// TYPES
// =============================================================================

export type Brand = {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    website: string;
    markets: string[];
    categories: string[];
    hero_products: string[];
    campaign_count?: number;
    product_count?: number;
    created_at: string;
    updated_at?: string;
    brandColor?: string;
    sub_category?: string;
    default_currency?: string;
    status: 'Active' | 'Archive' | 'Inactive' | string;
    shareLinks?: { id: string, token: string, isActive: boolean, expiresAt: string | null }[];
};

export type MetricConfig = {
    metricId: string;
    targetValue: number;
};

export type CampaignTypeConfig = {
    campaignTypeId: string;
    selectedChannelIds: string[];
    metrics: MetricConfig[];
    customFields?: {
        contentCount?: number;
        contentTypes?: string[];
        calendarUrl?: string;
    };
};

export type Campaign = {
    id: string;
    brand_id: string;
    name: string;
    types: string[];
    configurations: CampaignTypeConfig[];
    status: 'draft' | 'running' | 'finished';
    is_active: boolean;
    funnel_type: 'TOP' | 'MID' | 'BOTTOM';
    start_date: string;
    end_date: string;
    cost_idr: number;
    markup_percent: number;
    channel_ids: string[];
    primary_kpi?: string;
};

export type Metric = {
    campaign_id: string;
    date: string;
    impressions: number;
    clicks: number;
    reach: number;
    engagements: number;
    spend: number;
};

export type Creative = {
    id: string;
    campaign_id: string;
    name: string;
    image_url: string;
    source: 'organic' | 'paid' | 'kol';
    metrics: { impressions?: number; reach?: number };
    platform?: 'instagram' | 'tiktok' | 'youtube' | 'google';
};

// =============================================================================
// INITIAL DATA (fallback/seed data)
// =============================================================================

const generateCampaignMetrics = (campaignId: string, days: number): Metric[] => {
    const data: Metric[] = [];
    const now = new Date();
    const multiplier = campaignId === 'cp1' ? 1.5 : campaignId === 'cp2' ? 0.8 : 1.2;
    for (let i = days; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        data.push({
            campaign_id: campaignId,
            date: d.toISOString().split('T')[0],
            impressions: Math.floor((Math.random() * 5000 + 1000) * multiplier),
            clicks: Math.floor((Math.random() * 200 + 20) * multiplier),
            reach: Math.floor((Math.random() * 4000 + 900) * multiplier),
            engagements: Math.floor((Math.random() * 100 + 10) * multiplier),
            spend: Math.floor((Math.random() * 1000000 + 500000) * multiplier),
        });
    }
    return data;
};

export const INITIAL_DATA = {
    master_channels: [
        { id: 'ch_ig', name: 'Instagram', icon: 'instagram', color: '#E1306C' },
        { id: 'ch_fb', name: 'Facebook', icon: 'facebook', color: '#1877F2' },
        { id: 'ch_tt', name: 'TikTok', icon: 'tiktok', color: '#000000' },
        { id: 'ch_yt', name: 'YouTube', icon: 'youtube', color: '#FF0000' },
        { id: 'ch_gg', name: 'Google Ads', icon: 'google', color: '#4285F4' },
    ],
    master_metrics: [
        { id: 'm_reach', name: 'Reach', type: 'cross-platform' },
        { id: 'm_imp', name: 'Impressions', type: 'cross-platform' },
        { id: 'm_view', name: 'Views', type: 'cross-platform' },
        { id: 'm_click', name: 'Clicks', type: 'cross-platform' },
        { id: 'm_watch', name: 'Avg. Watch Time', type: 'cross-platform' },
        { id: 'm_ig_follow', name: 'New Follows', type: 'instagram' },
        { id: 'm_ig_like', name: 'Likes', type: 'instagram' },
        { id: 'm_ig_save', name: 'Saves', type: 'instagram' },
        { id: 'm_fb_react', name: 'Reactions', type: 'facebook' },
        { id: 'm_fb_share', name: 'Shares', type: 'facebook' },
        { id: 'm_yt_sub', name: 'Subscribers', type: 'youtube' },
    ],
    master_types: [
        { id: 'ct_social', name: 'Social Media Content' },
        { id: 'ct_kol', name: 'KOL Management' },
        { id: 'ct_paid', name: 'Paid Media' },
    ],
    master_mockups: [
        { id: 'mock_ig_feed', channelId: 'ch_ig', name: 'Feed Post', aspectRatio: 'aspect-[4/5]', type: 'feed' },
        { id: 'mock_ig_story', channelId: 'ch_ig', name: 'Story', aspectRatio: 'aspect-[9/16]', type: 'story' },
        { id: 'mock_fb_feed', channelId: 'ch_fb', name: 'News Feed', aspectRatio: 'aspect-[1.91/1]', type: 'feed' },
        { id: 'mock_tt_feed', channelId: 'ch_tt', name: 'In-Feed', aspectRatio: 'aspect-[9/16]', type: 'video' },
        { id: 'mock_yt_vid', channelId: 'ch_yt', name: 'Video', aspectRatio: 'aspect-video', type: 'video' },
    ],
    brands: [
        {
            id: 'b1',
            name: 'SharkNinja',
            logo_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/SharkNinja_Logo.svg',
            website: 'https://sharkninja.com',
            markets: ['Indonesia', 'Malaysia', 'Singapore'],
            categories: ['Home Appliances', 'Kitchen'],
            hero_products: ['CREAMi', 'SLUSHi', 'FLEXBREEZE'],
            created_at: '2024-01-01',
            brandColor: '#E1306C',
            campaign_count: 4,
            product_count: 4
        }
    ] as Brand[],
    campaigns: [
        {
            id: 'cp1', brand_id: 'b1', name: 'CREAMi', types: ['Paid Media', 'Social Media Content'],
            configurations: [
                { campaignTypeId: 'ct_paid', selectedChannelIds: ['ch_ig', 'ch_fb'], metrics: [{ metricId: 'm_imp', targetValue: 100000 }] },
                { campaignTypeId: 'ct_social', selectedChannelIds: ['ch_ig'], metrics: [], customFields: { contentCount: 12, contentTypes: ['Reels', 'Static'] } }
            ],
            status: 'running', is_active: true, funnel_type: 'TOP', start_date: '2024-10-01', end_date: '2024-12-31',
            cost_idr: 50000000, markup_percent: 20, channel_ids: ['ch_ig', 'ch_fb'], primary_kpi: 'Reach'
        },
        {
            id: 'cp2', brand_id: 'b1', name: 'SLUSHi', types: ['KOL Management'],
            configurations: [
                { campaignTypeId: 'ct_kol', selectedChannelIds: ['ch_tt'], metrics: [{ metricId: 'm_view', targetValue: 500000 }] }
            ],
            status: 'running', is_active: true, funnel_type: 'MID', start_date: '2024-11-01', end_date: '2024-12-15',
            cost_idr: 30000000, markup_percent: 15, channel_ids: ['ch_tt'], primary_kpi: 'Views'
        },
        {
            id: 'cp3', brand_id: 'b1', name: 'FLEXBREEZE', types: ['Social Media Content'],
            configurations: [],
            status: 'running', is_active: true, funnel_type: 'TOP', start_date: '2024-12-01', end_date: '2025-01-31',
            cost_idr: 25000000, markup_percent: 20, channel_ids: ['ch_ig', 'ch_fb'], primary_kpi: 'Engagement'
        },
        {
            id: 'cp4', brand_id: 'b1', name: 'Cleansense IQ++', types: ['Paid Media'],
            configurations: [],
            status: 'draft', is_active: false, funnel_type: 'BOTTOM', start_date: '2025-01-01', end_date: '2025-03-31',
            cost_idr: 45000000, markup_percent: 20, channel_ids: ['ch_gg'], primary_kpi: 'Conversion'
        }
    ] as Campaign[],
    metrics: [
        ...generateCampaignMetrics('cp1', 365),
        ...generateCampaignMetrics('cp2', 365),
        ...generateCampaignMetrics('cp3', 365),
        ...generateCampaignMetrics('cp4', 365),
    ] as Metric[],
    creatives: [
        { id: 'cr1', campaign_id: 'cp1', name: 'Reel 1', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop', source: 'organic', metrics: { impressions: 1200, reach: 900 } },
        { id: 'cr2', campaign_id: 'cp1', name: 'Banner', image_url: 'https://images.unsplash.com/photo-1556906781-9a412961d289?w=400&h=500&fit=crop', source: 'paid', metrics: { impressions: 5000, reach: 4500 } },
        { id: 'cr3', campaign_id: 'cp2', name: 'KOL Post', image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=500&fit=crop', source: 'kol', metrics: { impressions: 10000, reach: 9000 } }
    ] as Creative[]
};

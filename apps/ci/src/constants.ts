// Imports removed as they were unused
// import type { Channel, Metric, CampaignTypeConfig, CampaignObjective, BuyingModel, CssMockup } from "./services/api";

export const CHANNELS: any[] = [ // Temporarily any until types are fully settled in api.ts
    { id: 'instagram', platformId: 'p1', channelName: 'Instagram', name: 'Instagram', color: 'bg-pink-600', type: 'social', logo: 'instagram-logo', isPaid: true, isOrganic: true },
    { id: 'tiktok', platformId: 'p1', channelName: 'TikTok', name: 'TikTok', color: 'bg-black', type: 'social', logo: 'tiktok-logo', isPaid: true, isOrganic: true },
    { id: 'youtube', platformId: 'p1', channelName: 'YouTube', name: 'YouTube', color: 'bg-red-600', type: 'social', logo: 'youtube-logo', isPaid: true, isOrganic: true },
    { id: 'google', platformId: 'p2', channelName: 'Google', name: 'Google', color: 'bg-blue-600', type: 'web', logo: 'google-logo', isPaid: true, isOrganic: false },
    { id: 'facebook', platformId: 'p2', channelName: 'Facebook', name: 'Facebook', color: 'bg-blue-700', type: 'social', logo: 'facebook-logo', isPaid: true, isOrganic: false },
    { id: 'linkedin', platformId: 'p3', channelName: 'LinkedIn', name: 'LinkedIn', color: 'bg-blue-800', type: 'social', logo: 'linkedin-logo', isPaid: true, isOrganic: true },
];

export const METRICS: any[] = [
    { id: 'reach', label: 'Reach', channelId: 'cross-platform' },
    { id: 'views', label: 'Views', channelId: 'cross-platform' },
    { id: 'clicks', label: 'Clicks', channelId: 'cross-platform' },
    { id: 'conversions', label: 'Conversions', channelId: 'cross-platform' },
    { id: 'ctr', label: 'CTR', channelId: 'cross-platform' },
    { id: 'followers', label: 'Follower Growth', channelId: 'instagram' },
    { id: 'engagement', label: 'Engagement Rate', channelId: 'instagram' },
];

export const CAMPAIGN_TYPES_CONFIG: any[] = [
    {
        id: 'branding', name: 'Branding & Awareness', description: 'Focus on reach.',
        scopes: [{ id: 's1', label: 'Reach Optimization' }], allowedChannels: ['instagram', 'tiktok', 'youtube', 'facebook']
    },
    {
        id: 'performance', name: 'Performance & Conversions', description: 'Focus on conversions.',
        scopes: [{ id: 's3', label: 'CPA Optimization' }], allowedChannels: ['google', 'facebook', 'instagram']
    },
];

export const CAMPAIGN_OBJECTIVES: any[] = [
    { id: 'awareness', name: 'Brand Awareness', label: 'Brand Awareness', description: 'Maximize reach.', channels: ['instagram', 'tiktok'] },
    { id: 'traffic', name: 'Traffic', label: 'Traffic', description: 'Drive clicks.', channels: ['google', 'facebook'] },
    { id: 'sales', name: 'Sales', label: 'Sales', description: 'Generate sales.', channels: ['google', 'tiktok'] },
];

export const BUYING_MODELS: any[] = [
    { id: 'cpm', name: 'CPM', label: 'CPM', description: 'Cost per 1k.', channels: ['social'] },
    { id: 'cpc', name: 'CPC', label: 'CPC', description: 'Cost per click.', channels: ['search'] },
];


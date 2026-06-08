
import { triggerGlobalError } from '../contexts/ErrorContext';
import { triggerDevLog } from '../contexts/DevConsoleContext';
import { triggerLoading } from '../contexts/LoadingContext';

const API_BASE = '/api';

// Helper for consistent fetch handling
async function fetchClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || `Request failed with status ${response.status}`;

            if (response.status !== 401) {
                triggerGlobalError('API Error', errorMessage);
            }

            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    } catch (error: any) {
        if (error.message !== 'Failed to fetch' && !error.message.includes('Request failed')) {
            triggerGlobalError('Network Error', error.message || 'Unknown network error');
        } else if (error.message === 'Failed to fetch') {
            triggerGlobalError('Connection Failed', 'Could not connect to the server. Please check your internet connection or try again later.');
        }
        throw error;
    }
}

type ID = string;

// Generic CRUD helper generator
function createCrudApi<T>(resource: string) {
    return {
        getAll: (query?: Record<string, any>) => {
            const queryString = query
                ? '?' + new URLSearchParams(query).toString()
                : '';
            return fetchClient<T[]>(`/${resource}${queryString}`);
        },
        getById: (id: ID) => fetchClient<T>(`/${resource}/${id}`),
        create: (data: Omit<T, 'id'>) => fetchClient<T>(`/${resource}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: ID, data: Partial<T>) => fetchClient<T>(`/${resource}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id: ID) => fetchClient<{ message: string }>(`/${resource}/${id}`, {
            method: 'DELETE',
        }),
    };
}

// --- Type Definitions ---

export interface User {
    id: string;
    name: string;
    slug?: string;
    email: string;
    role: string;
    workRole?: string;
    status: string;
    permissions?: string | null;
    password?: string;
    avatar?: string;
    lastActive?: string;
}

export interface CampaignType {
    id: string;
    typeName: string;
    name?: string; // Alias for UI
    slug?: string;
    description: string;
    allowedChannels?: string[]; // For UI filtering
    scopes?: { id: string; label: string }[]; // For UI display
}

// Legacy type alias for compatibility
export type CampaignTypeConfig = CampaignType;

export interface Metric {
    id: string;
    name: string;
    key: string;
    type?: string;
    unit?: string;
    label?: string; // For UI components
    channelId?: string; // For filtering
    inputType?: 'input' | 'readonly'; // For UI logic
}

export interface CampaignObjective {
    id: string;
    name: string;
    slug: string;
    description?: string;
    label?: string; // For UI
}

export interface BuyingModel {
    id: string;
    name: string;
    slug: string;
    description?: string;
    label?: string; // For UI
}

export interface Platform {
    id: string;
    name: string;
    slug: string;
}

export interface Channel {
    id: string;
    name: string;
    slug: string;
    platformId: string;
    color?: string; // Visual ID
    logo?: string; // Visual icon class
}

// New Hierarchy Types
export interface CampaignMarket {
    id: string;
    name: string;
    code: string;
    currency?: string;
    region?: string;
}

export interface DashboardStats {
    activeCampaigns: number;
    totalSpend: number;
    impressions: number;
    avgRoas: number;
    // Extended fields
    totalRevenue?: number;
    revenueTrend?: number;
}

export interface RevenueDataPoint {
    date: string;
    revenue: number;
    spend: number;
}

export interface LogEntry {
    id: string;
    type: 'error' | 'success' | 'info';
    action: string;
    userName: string;
    description: string;
    timestamp: string;
    details?: string;
}

export interface ServiceType {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export interface SubCampaignType {
    id: string;
    serviceTypeId: string;
    name: string;
    slug: string;
}

export interface Objective {
    id: string;
    name: string;
    slug: string;
}

export interface IndustryType {
    id: string;
    name: string;
    slug: string;
}

export interface IndustrySubType {
    id: string;
    industryTypeId: string;
    name: string;
    slug: string;
}

export interface BrandWidgets {
    impressions: { value: number; trend: number };
    reach: { value: number; trend: number };
    spend: { value: number; trend: number };
    engagementRate: { value: number; trend: number };
}

export interface BrandFinancials {
    totalMediaSpend: number;
    channelSpend: number;
    kolSpend: number;
    contentSpend: number;
    baseCost: number;
    margin: number;
}

export interface Brand {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    website?: string;
    industry?: string; // Legacy field used in forms

    // New Hierarchy Fields
    industryTypeId?: string;
    industrySubTypeId?: string;
    industryType?: string; // Enriched name
    industrySubType?: string; // Enriched name

    address?: string;
    status?: string;

    // Enriched fields
    campaignCount?: number;
    financials?: BrandFinancials;
    widgets?: BrandWidgets;
    creatives?: any[];
    totalSpend?: number; // Added for AnalyticsTab
    progress?: {
        current: number;
        target: number;
    };
}

export interface Deliverable {
    channelId: string;
    thumbnailUrl?: string;
    postUrl?: string;
    metrics?: any;
    campaignName?: string;
}

export interface Campaign {
    id: string;
    // Hierarchy
    parentId?: string | null;
    parentCampaign?: string; // Enriched name

    name: string;
    slug: string;
    brandId: string;

    // Selection Fields
    marketId?: string;
    marketName?: string; // Enriched
    marketCode?: string; // Enriched

    serviceTypeId?: string;
    serviceType?: string; // Enriched
    subCampaignTypeId?: string;
    subCampaignType?: string; // Enriched

    objectiveId?: string;
    objective?: string; // Enriched

    description?: string;
    startDate?: string;
    endDate?: string;
    budgetPlanned?: number;
    budgetActual?: number;
    status: string;
    spend?: number; // Enriched
    configuration?: any; // JSON column for flexible configuration

    // Legacy mapping (optional, for compatibility if needed)
    platform?: string;
    type?: string;
    primaryKPI?: string; // Compatibility with legacy UI
}

export interface Creative {
    id: string;
    name: string;
    url: string;
    type: 'video' | 'image';
    campaignId: string;
    channelId: string;

    // Enriched Names
    campaignName?: string;
    channelName?: string;
    platformName?: string;

    // Engagement
    views?: number;
    shares?: number;
    isPaid?: boolean;
}

export interface CssMockup {
    id: string;
    name: string;
    channelId: string;
    description?: string;
    componentType: string;
}

// CMS Types
export interface LandingPageContent {
    heroTitle: string;
    heroSubtitle: string;
    aboutTitle: string;
    aboutText: string;
    contactEmail: string;
    services: {
        title: string;
        desc: string;
    }[];
}

// --- API Service ---

export const api = {
    users: createCrudApi<User>('users'),
    brands: createCrudApi<Brand>('brands'),
    campaigns: {
        ...createCrudApi<Campaign>('campaigns'),
        getChannels: (id: string) => fetchClient<Channel[]>(`/campaigns/${id}/channels`),
        saveChannels: (id: string, channelIds: string[]) => fetchClient(`/campaigns/${id}/channels`, {
            method: 'POST',
            body: JSON.stringify({ channelIds })
        }),
        createSubCampaign: (data: any) => fetchClient<Campaign>('/campaigns/sub', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        clone: (id: string) => fetchClient<Campaign>(`/campaigns/${id}/clone`, { method: 'POST' }),
        getComments: (id: string) => fetchClient<any[]>(`/campaigns/${id}/comments`),
        addComment: (id: string, content: string) => fetchClient<any>(`/campaigns/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
        updateStatus: (id: string, status: string) => fetchClient<Campaign>(`/campaigns/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
        bulkAction: (action: string, campaignIds: string[]) => fetchClient<any>(`/campaigns/bulk`, { method: 'POST', body: JSON.stringify({ action, campaignIds }) }),
        // Budget Intelligence
        getPacing: (id: string) => fetchClient<any>(`/campaigns/${id}/pacing`),
        getBudget: (id: string) => fetchClient<any[]>(`/campaigns/${id}/budget`),
        addBudgetAllocation: (id: string, data: any) => fetchClient<any>(`/campaigns/${id}/budget`, { method: 'POST', body: JSON.stringify(data) }),
        getAlerts: (id: string) => fetchClient<any[]>(`/campaigns/${id}/alerts`),
        addAlert: (id: string, data: any) => fetchClient<any>(`/campaigns/${id}/alerts`, { method: 'POST', body: JSON.stringify(data) }),
        toggleAlert: (id: string, alertId: string, isActive: boolean) => fetchClient<any>(`/campaigns/${id}/alerts`, { method: 'PUT', body: JSON.stringify({ alertId, isActive }) }),
        deleteAlert: (id: string, alertId: string) => fetchClient<any>(`/campaigns/${id}/alerts`, { method: 'DELETE', body: JSON.stringify({ alertId }) }),
    },

    campaignTemplates: {
        ...createCrudApi<any>('campaign-templates'),
        createFromTemplate: (data: { templateId: string; brandId: string; name: string }) => fetchClient<Campaign>('/campaigns/from-template', { method: 'POST', body: JSON.stringify(data) }),
    },

    campaignRules: {
        getAll: (campaignId?: string) => {
            const qs = campaignId ? `?campaignId=${campaignId}` : '';
            return fetchClient<any[]>(`/campaign-rules${qs}`);
        },
        getById: (id: string) => fetchClient<any>(`/campaign-rules/${id}`),
        create: (data: any) => fetchClient<any>('/campaign-rules', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => fetchClient<any>(`/campaign-rules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetchClient<any>(`/campaign-rules/${id}`, { method: 'DELETE' }),
        evaluate: () => fetchClient<any>('/campaign-rules/evaluate', { method: 'POST' }),
    },

    platforms: createCrudApi<Platform>('platforms'),
    channels: createCrudApi<Channel>('channels'),

    campaignMarkets: {
        getAll: () => fetchClient<CampaignMarket[]>('/campaign-markets')
    },
    serviceTypes: {
        getAll: () => fetchClient<ServiceType[]>('/service-types')
    },
    subCampaignTypes: {
        getAll: (serviceTypeId: string) => fetchClient<SubCampaignType[]>(`/sub-campaign-types?serviceTypeId=${serviceTypeId}`)
    },
    objectives: {
        getAll: () => fetchClient<Objective[]>('/objectives')
    },
    analytics: {
        get: (brandId?: string, campaignId?: string) => {
            const params = new URLSearchParams();
            if (brandId) params.append('brandId', brandId);
            if (campaignId) params.append('campaignId', campaignId);
            return fetchClient<{ trend: any[], demographics: any[] }>(`/analytics?${params.toString()}`);
        }
    },
    industryTypes: {
        getAll: () => fetchClient<IndustryType[]>('/industry-types')
    },
    industrySubTypes: {
        getAll: (industryTypeId: string) => fetchClient<IndustrySubType[]>(`/industry-subtypes?industryTypeId=${industryTypeId}`)
    },
    // Config Alias for easier access
    config: {
        getIndustryTypes: () => fetchClient<IndustryType[]>('/industry-types'),
        getIndustrySubTypes: (industryTypeId: string) => fetchClient<IndustrySubType[]>(`/industry-subtypes?industryTypeId=${industryTypeId}`),
    },
    subCampaigns: {
        getByParent: (parentId: string) => fetchClient<Campaign[]>(`/campaigns/sub/${parentId}`)
    },
    landingPage: {
        get: () => fetchClient<LandingPageContent>('/cms/landing-page'),
        update: (data: LandingPageContent) => fetchClient<LandingPageContent>('/cms/landing-page', {
            method: 'PUT',
            body: JSON.stringify(data)
        })
    },

    auth: {
        login: (credentials: any) => fetchClient<User>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),
    },
    mediaAnalysis: {
        getAll: (query?: { brandId?: string; campaignId?: string }) => {
            const qs = query ? '?' + new URLSearchParams(query as Record<string, string>).toString() : '';
            return fetchClient<any[]>(`/media-analysis${qs}`);
        },
        save: (data: any) => fetchClient<any>('/media-analysis', { method: 'POST', body: JSON.stringify(data) }),
        delete: (id: string) => fetchClient<any>(`/media-analysis?id=${id}`, { method: 'DELETE' }),
    },

    integrations: {
        googleAds: {
            getAuthUrl: (brandId: string) => fetchClient<{ url: string }>(`/integrations/google-ads/auth?brandId=${brandId}`),
            getStatus: (brandId: string) => fetchClient<{ connected: boolean, hasPending?: boolean, accounts?: any[] }>(`/integrations/google-ads/status?brandId=${brandId}`),
            exchangeCode: (code: string, brandId: string) => fetchClient('/integrations/google-ads/exchange', {
                method: 'POST',
                body: JSON.stringify({ code, brandId })
            }),
            listCustomers: (brandId: string) => fetchClient<{ customers: string[] }>(`/integrations/google-ads/customers?brandId=${brandId}`),
            selectCustomer: (brandId: string, customerId: string, accountName?: string) => fetchClient('/integrations/google-ads/select-customer', {
                method: 'POST',
                body: JSON.stringify({ brandId, customerId, accountName })
            }),
        },
        metaAds: {
            getAuthUrl: (brandId: string) => fetchClient<{ url: string }>(`/integrations/meta-ads/auth?brandId=${brandId}`),
            getStatus: (brandId: string) => fetchClient<{ connected: boolean, hasPending?: boolean, accounts?: any[] }>(`/integrations/meta-ads/status?brandId=${brandId}`),
            exchangeCode: (code: string, brandId: string) => fetchClient('/integrations/meta-ads/exchange', {
                method: 'POST',
                body: JSON.stringify({ code, brandId })
            }),
            listAccounts: (brandId: string) => fetchClient<{ accounts: any[] }>(`/integrations/meta-ads/accounts?brandId=${brandId}`),
            selectAccount: (brandId: string, customerId: string, accountName?: string) => fetchClient('/integrations/meta-ads/select-account', {
                method: 'POST',
                body: JSON.stringify({ brandId, customerId, accountName })
            }),
        },
        tiktokAds: {
            getAuthUrl: (brandId: string) => fetchClient<{ url: string }>(`/integrations/tiktok-ads/auth?brandId=${brandId}`),
            getStatus: (brandId: string) => fetchClient<{ connected: boolean, hasPending?: boolean, accounts?: any[] }>(`/integrations/tiktok-ads/status?brandId=${brandId}`),
            exchangeCode: (code: string, brandId: string) => fetchClient('/integrations/tiktok-ads/exchange', {
                method: 'POST',
                body: JSON.stringify({ code, brandId })
            }),
            listAccounts: (brandId: string) => fetchClient<{ accounts: any[] }>(`/integrations/tiktok-ads/accounts?brandId=${brandId}`),
            selectAccount: (brandId: string, customerId: string, accountName?: string) => fetchClient('/integrations/tiktok-ads/select-account', {
                method: 'POST',
                body: JSON.stringify({ brandId, customerId, accountName })
            }),
        },
        disconnect: (id: string) => fetchClient('/integrations/disconnect', {
            method: 'POST',
            body: JSON.stringify({ id })
        }),
    },
};

// --- Legacy Compatibility Layer ---
export const Service = {
    getDashboardStats: () => fetchClient<DashboardStats>('/dashboard'),
    analytics: api.analytics,
};



import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Define the return type based on the enrichment logic
export type EnrichedBrand = Prisma.BrandGetPayload<{
    include: {
        campaigns: true;
        industryRelation: true;
        subTypeRelation: true;
        shareLinks: true;
    };
}> & {
    industry: string;
    sub_category: string;
    location: string;
    brandFontColor?: string;
    description?: string | null;
    wallpapers?: string | null; // JSON
    productImages?: string | null; // JSON
    campaignCount: number;
    financials: {
        totalMediaSpend: number;
        channelSpend: number;
        kolSpend: number;
        contentSpend: number;
        baseCost: number;
        margin: number;
    };
    widgets: {
        impressions: { value: number; trend: number; };
        reach: { value: number; trend: number; };
        spend: { value: number; trend: number; };
        engagementRate: { value: number; trend: number; };
    };
    progress: { current: number; target: number; };
};

/**
 * Standard enrichment logic for Brand entities.
 * Adds mock financials and flattened fields for UI consumption.
 */
export const enrichBrandData = (brand: Prisma.BrandGetPayload<{
    include: {
        campaigns: true;
        industryRelation: true;
        subTypeRelation: true;
        shareLinks: true;
    };
}>): EnrichedBrand => {
    // Calculate Total Spend from Campaign Budgets
    const totalMediaSpend = brand.campaigns.reduce((acc, campaign) => acc + (campaign.budgetPlanned || 0), 0);
    const activeCampaigns = brand.campaigns.filter(c => c.status === 'Active').length;

    return {
        ...brand,
        industry: brand.industryRelation?.name || 'Unknown',
        sub_category: brand.subTypeRelation?.name || '',
        location: (brand as any).location || 'Global',
        campaignCount: activeCampaigns, // Only count ACTIVE campaigns
        financials: {
            totalMediaSpend: totalMediaSpend,
            channelSpend: 0,
            kolSpend: 0,
            contentSpend: 0,
            baseCost: 0,
            margin: 0
        },
        widgets: {
            impressions: { value: 0, trend: 0 },
            reach: { value: 0, trend: 0 },
            spend: { value: totalMediaSpend, trend: 0 },
            engagementRate: { value: 0, trend: 0 }
        },
        progress: { current: 0, target: 100 }
    };
};

/**
 * Fetches all brands with enrichment.
 */
export const getEnrichedBrands = async (): Promise<EnrichedBrand[]> => {
    const brands = await prisma.brand.findMany({
        include: {
            campaigns: true,
            industryRelation: true,
            subTypeRelation: true,
            shareLinks: true
        }
    });

    return brands.map(enrichBrandData);
};

/**
 * Fetches a single brand by slug with enrichment.
 */
export const getEnrichedBrand = async (slug: string): Promise<EnrichedBrand | null> => {
    const brand = await prisma.brand.findUnique({
        where: { slug },
        include: {
            campaigns: true,
            industryRelation: true,
            subTypeRelation: true,
            shareLinks: true
        }
    });

    if (!brand) return null;

    return enrichBrandData(brand);
};

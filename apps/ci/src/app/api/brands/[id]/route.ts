import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// GET /api/brands/:id
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const params = await props.params;
        const { id } = params;

        // Try finding by ID first, then Slug
        let brand = await prisma.brand.findUnique({
            where: { id },
            include: { campaigns: true }
        });

        if (!brand) {
            brand = await prisma.brand.findUnique({
                where: { slug: id },
                include: { campaigns: true }
            });
        }

        if (!brand) {
            return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
        }

        const enriched = {
            ...brand,
            campaignCount: brand.campaigns.length,
            financials: {
                totalMediaSpend: 0,
                channelSpend: 0,
                kolSpend: 0,
                contentSpend: 0,
                baseCost: 0,
                margin: 0
            },
            widgets: {
                impressions: { value: 0, trend: 0 },
                reach: { value: 0, trend: 0 },
                spend: { value: 0, trend: 0 },
                engagementRate: { value: 0, trend: 0 }
            },
            progress: { current: 0, target: 100 }
        };

        return NextResponse.json(enriched);

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT /api/brands/:id
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const params = await props.params;
        const { id } = params;
        const body = await request.json();
        const { name, industry, industrySubTypeId, website, logo, status, brandColor,
                brandFontColor, defaultCurrency, location, description } = body;

        // Determine if we are updating by ID or Slug
        const where = await prisma.brand.findUnique({ where: { id } })
            ? { id }
            : { slug: id };

        const updateData: any = {};
        if (name) {
            updateData.name = name;
            updateData.slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }
        if (industry) updateData.industryId = industry;
        if (industrySubTypeId) updateData.industrySubTypeId = industrySubTypeId;
        if (website !== undefined) updateData.website = website;
        if (logo) updateData.logo = logo;
        if (status) updateData.status = status;
        if (brandColor) updateData.brandColor = brandColor;
        if (brandFontColor) updateData.brandFontColor = brandFontColor;
        if (defaultCurrency) updateData.defaultCurrency = defaultCurrency;
        if (location !== undefined) updateData.location = location;
        if (description !== undefined) updateData.description = description;

        const updated = await prisma.brand.update({
            where,
            data: updateData
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('PUT /api/brands/:id error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

// DELETE /api/brands/:id
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const { searchParams } = new URL(request.url);
        const permanent = searchParams.get('permanent') === 'true';

        const params = await props.params;
        const { id } = params;

        // Find brand and check active campaigns
        const brand = await prisma.brand.findFirst({
            where: {
                OR: [
                    { id },
                    { slug: id }
                ]
            },
            include: {
                campaigns: {
                    where: {
                        status: 'Active'
                    }
                }
            }
        });

        if (!brand) {
            return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
        }

        if (brand.campaigns.length > 0) {
            return NextResponse.json({
                error: 'Deletion Blocked',
                details: 'This brand has active running campaigns. All campaigns must be finished or In Active before archiving.'
            }, { status: 400 });
        }

        if (permanent) {
            // Hard Delete with manual cascade cleanup
            await prisma.$transaction([
                prisma.metric.deleteMany({ where: { brandId: brand.id } }),
                prisma.integration.deleteMany({ where: { brandId: brand.id } }),
                prisma.subCampaignChannel.deleteMany({
                    where: { subCampaign: { campaign: { brandId: brand.id } } }
                }),
                prisma.campaignChannel.deleteMany({
                    where: { campaign: { brandId: brand.id } }
                }),
                prisma.subCampaign.deleteMany({
                    where: { campaign: { brandId: brand.id } }
                }),
                prisma.campaign.deleteMany({
                    where: { brandId: brand.id }
                }),
                prisma.brand.delete({
                    where: { id: brand.id }
                })
            ]);
            return NextResponse.json({ message: 'Brand permanently deleted' });
        } else {
            // Soft Delete: Update status to "Archive"
            const archived = await prisma.brand.update({
                where: { id: brand.id },
                data: {
                    status: 'Archive'
                }
            });
            return NextResponse.json({ message: 'Brand archived successfully', brand: archived });
        }
    } catch (error: any) {
        console.error('CRITICAL: DELETE /api/brands Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { getEnrichedBrands } from '@/lib/brands-data';
import { requireAuth } from '@/lib/api-auth';

// GET /api/brands
import { enrichBrandFromWeb } from '@/lib/brand-enrichment';

export async function GET(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const enriched = await getEnrichedBrands();
        return NextResponse.json(enriched);
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/brands
export async function POST(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const body = await request.json();
        const { name, website, brandFontColor, brandColor, logo, industryId, industrySubTypeId, defaultCurrency, ...rest } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Generate Slug
        let slug = name.toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

        // Uniqueness Check
        let count = 0;
        let uniqueSlug = slug;
        while (await prisma.brand.findUnique({ where: { slug: uniqueSlug } })) {
            count++;
            uniqueSlug = `${slug}-${count}`;
        }
        slug = uniqueSlug;

        // --- Brand Intelligence Enrichment ---
        let enrichmentData: any = {};
        if (website) {
            try {
                const enriched = await enrichBrandFromWeb(website);
                enrichmentData = {
                    description: enriched.description,
                    // If we found an image, store it as the first wallpaper
                    wallpapers: enriched.image ? JSON.stringify([enriched.image]) : undefined,
                };
            } catch (e) {
                console.warn("Enrichment failed gracefully", e);
            }
        }
        // -------------------------------------

        const brand = await prisma.brand.create({
            data: {
                name: name.trim(),
                slug,
                website: website || null,
                brandFontColor: brandFontColor || '#000000',
                brandColor: brandColor || '#4F46E5',
                logo: logo || null,
                industryId: industryId || null,
                industrySubTypeId: industrySubTypeId || null,
                defaultCurrency: defaultCurrency || 'USD',
                status: 'Active',
                ...rest,
                ...enrichmentData
            }
        });

        return NextResponse.json(brand, { status: 201 });
    } catch (error: any) {
        console.error('CRITICAL: POST /api/brands Error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'A brand with this name or slug already exists' }, { status: 409 });
        }
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}

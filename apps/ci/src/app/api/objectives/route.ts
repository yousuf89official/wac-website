import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

const DEFAULT_OBJECTIVES = [
    { id: 'obj_reach', name: 'Reach', slug: 'reach' },
    { id: 'obj_traffic', name: 'Traffic', slug: 'traffic' },
    { id: 'obj_conversions', name: 'Conversions', slug: 'conversions' },
    { id: 'obj_engagement', name: 'Engagement', slug: 'engagement' },
    { id: 'obj_awareness', name: 'Brand Awareness', slug: 'awareness' },
    { id: 'obj_leads', name: 'Lead Generation', slug: 'leads' },
    { id: 'obj_sales', name: 'Sales / Revenue', slug: 'sales' },
    { id: 'obj_app_installs', name: 'App Installs', slug: 'app_installs' },
    { id: 'obj_video_views', name: 'Video Views', slug: 'video_views' },
    { id: 'obj_retention', name: 'Retention / Loyalty', slug: 'retention' },
];

export async function GET() {
    const { error } = await requireAuth();
    if (error) return error;

    try {
        // Try database first (AppConfig key: 'config:objectives')
        const config = await prisma.appConfig.findUnique({ where: { key: 'config:objectives' } });
        if (config) {
            return NextResponse.json(JSON.parse(config.value));
        }

        // Seed defaults to database and return
        await prisma.appConfig.create({
            data: { key: 'config:objectives', value: JSON.stringify(DEFAULT_OBJECTIVES) },
        }).catch(() => {}); // Ignore if already exists

        return NextResponse.json(DEFAULT_OBJECTIVES);
    } catch {
        return NextResponse.json(DEFAULT_OBJECTIVES);
    }
}

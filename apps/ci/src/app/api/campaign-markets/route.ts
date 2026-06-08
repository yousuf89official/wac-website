import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

const DEFAULT_MARKETS = [
    { id: 'mkt_id', name: 'Indonesia', code: 'ID', currency: 'IDR', region: 'SEA' },
    { id: 'mkt_my', name: 'Malaysia', code: 'MY', currency: 'MYR', region: 'SEA' },
    { id: 'mkt_sg', name: 'Singapore', code: 'SG', currency: 'SGD', region: 'SEA' },
    { id: 'mkt_th', name: 'Thailand', code: 'TH', currency: 'THB', region: 'SEA' },
    { id: 'mkt_ph', name: 'Philippines', code: 'PH', currency: 'PHP', region: 'SEA' },
    { id: 'mkt_vn', name: 'Vietnam', code: 'VN', currency: 'VND', region: 'SEA' },
    { id: 'mkt_in', name: 'India', code: 'IN', currency: 'INR', region: 'South Asia' },
    { id: 'mkt_ae', name: 'United Arab Emirates', code: 'AE', currency: 'AED', region: 'GCC' },
    { id: 'mkt_sa', name: 'Saudi Arabia', code: 'SA', currency: 'SAR', region: 'GCC' },
    { id: 'mkt_bh', name: 'Bahrain', code: 'BH', currency: 'BHD', region: 'GCC' },
    { id: 'mkt_qa', name: 'Qatar', code: 'QA', currency: 'QAR', region: 'GCC' },
    { id: 'mkt_kw', name: 'Kuwait', code: 'KW', currency: 'KWD', region: 'GCC' },
    { id: 'mkt_om', name: 'Oman', code: 'OM', currency: 'OMR', region: 'GCC' },
    { id: 'mkt_us', name: 'United States', code: 'US', currency: 'USD', region: 'NA' },
    { id: 'mkt_uk', name: 'United Kingdom', code: 'GB', currency: 'GBP', region: 'EU' },
    { id: 'mkt_au', name: 'Australia', code: 'AU', currency: 'AUD', region: 'APAC' },
    { id: 'mkt_jp', name: 'Japan', code: 'JP', currency: 'JPY', region: 'APAC' },
    { id: 'mkt_kr', name: 'South Korea', code: 'KR', currency: 'KRW', region: 'APAC' },
    { id: 'mkt_de', name: 'Germany', code: 'DE', currency: 'EUR', region: 'EU' },
    { id: 'mkt_fr', name: 'France', code: 'FR', currency: 'EUR', region: 'EU' },
];

export async function GET() {
    const { error } = await requireAuth();
    if (error) return error;

    try {
        const config = await prisma.appConfig.findUnique({ where: { key: 'config:markets' } });
        if (config) {
            return NextResponse.json(JSON.parse(config.value));
        }

        // Seed defaults to database and return
        await prisma.appConfig.create({
            data: { key: 'config:markets', value: JSON.stringify(DEFAULT_MARKETS) },
        }).catch(() => {});

        return NextResponse.json(DEFAULT_MARKETS);
    } catch {
        return NextResponse.json(DEFAULT_MARKETS);
    }
}


import { notFound } from 'next/navigation';
import { getEnrichedBrand } from '@/lib/brands-data';
import { prisma } from '@/lib/prisma';
import BrandDashboard from '@/components/brands/BrandDashboard';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function BrandPage({ params }: PageProps) {
    const { slug } = await params;
    const brand = await getEnrichedBrand(slug);

    if (!brand) {
        notFound();
    }

    const industries = await prisma.industry.findMany({
        include: {
            subTypes: true
        }
    });

    return (
        <BrandDashboard brand={brand} industries={industries} />
    );
}

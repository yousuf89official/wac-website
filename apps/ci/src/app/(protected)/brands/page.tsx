
import { getEnrichedBrands } from '@/lib/brands-data';
import { prisma } from '@/lib/prisma';
import BrandListGrid from '@/components/brands/BrandListGrid';

export const dynamic = 'force-dynamic';

export default async function BrandsPage() {
    const brands = await getEnrichedBrands();
    const industries = await prisma.industry.findMany({
        include: {
            subTypes: true
        }
    });

    return (
        <BrandListGrid brands={brands} industries={industries} />
    );
}

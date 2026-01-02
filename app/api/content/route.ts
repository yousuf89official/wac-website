import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const [
            brand,
            theme,
            sections,
            navLinks,
            socialLinks,
            stats,
            services,
            steps,
            values,
            testimonials,
            seo
        ] = await Promise.all([
            prisma.brandConfig.findFirst(),
            prisma.themeConfig.findFirst(),
            prisma.sectionContent.findMany(),
            prisma.navLink.findMany({ orderBy: { order: 'asc' } }),
            prisma.socialLink.findMany(),
            prisma.stat.findMany({ orderBy: { order: 'asc' } }),
            prisma.service.findMany({ orderBy: { order: 'asc' } }),
            prisma.processStep.findMany({ orderBy: { order: 'asc' } }),
            prisma.value.findMany({ orderBy: { order: 'asc' } }),
            prisma.testimonial.findMany({ orderBy: { order: 'asc' } }),
            prisma.globalSeo.findFirst()
        ]);

        return NextResponse.json({
            brand,
            theme,
            seo,
            sections: (sections || []).reduce((acc: any, section) => {
                acc[section.sectionId] = section;
                return acc;
            }, {}),
            navLinks,
            socialLinks,
            stats,
            services,
            processSteps: steps,
            values,
            testimonials
        });
    } catch (error) {
        console.error('Error fetching global content:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Check if data already exists
        const existingBrand = await prisma.brandConfig.findFirst();
        if (existingBrand) {
            return NextResponse.json({
                success: false,
                message: 'Database already seeded. Delete existing data first if you want to re-seed.'
            });
        }

        // Seed Brand Config
        await prisma.brandConfig.create({
            data: {
                name: 'We Are Collaborative',
                tagline: 'Empowering Brands Through Strategic Collaboration',
                description: 'We Are Collaborative is a premier marketing agency specializing in integrated digital strategies, creative campaigns, and data-driven solutions.',
                email: 'hello@wearecollaborative.net',
                phone: '+1 (555) 123-4567',
                address: '123 Innovation Street, Creative District, NY 10001',
                socialLinks: JSON.stringify({
                    facebook: 'https://facebook.com/wearecollaborative',
                    twitter: 'https://twitter.com/wearecollaborative',
                    instagram: 'https://instagram.com/wearecollaborative',
                    linkedin: 'https://linkedin.com/company/wearecollaborative'
                })
            }
        });

        // Seed Theme Config
        await prisma.themeConfig.create({
            data: {
                primaryColor: '#6366f1',
                secondaryColor: '#8b5cf6',
                accentColor: '#ec4899',
                fontFamily: 'Inter, system-ui, sans-serif',
                customCSS: ''
            }
        });

        // Seed Hero Section
        await prisma.heroSection.create({
            data: {
                headline: 'Transform Your Brand with Strategic Collaboration',
                subheadline: 'We partner with forward-thinking brands to create impactful marketing campaigns that drive real results.',
                ctaText: 'Start Your Journey',
                ctaLink: '#contact',
                backgroundImage: '/hero-bg.jpg'
            }
        });

        // Seed Services
        const services = [
            {
                title: 'Digital Strategy',
                description: 'Comprehensive digital marketing strategies tailored to your business goals.',
                icon: 'strategy',
                order: 1
            },
            {
                title: 'Creative Campaigns',
                description: 'Award-winning creative campaigns that capture attention and drive engagement.',
                icon: 'creative',
                order: 2
            },
            {
                title: 'Data Analytics',
                description: 'Data-driven insights to optimize your marketing performance and ROI.',
                icon: 'analytics',
                order: 3
            }
        ];

        for (const service of services) {
            await prisma.service.create({ data: service });
        }

        // Seed Clients
        const clients = [
            { name: 'TechCorp', logo: '/clients/techcorp.png', order: 1 },
            { name: 'InnovateCo', logo: '/clients/innovateco.png', order: 2 },
            { name: 'GlobalBrand', logo: '/clients/globalbrand.png', order: 3 }
        ];

        for (const client of clients) {
            await prisma.client.create({ data: client });
        }

        // Seed Case Studies
        const caseStudy = await prisma.caseStudy.create({
            data: {
                title: 'Digital Transformation for TechCorp',
                slug: 'techcorp-digital-transformation',
                excerpt: 'How we helped TechCorp achieve 300% growth in digital engagement.',
                content: 'Full case study content here...',
                featuredImage: '/case-studies/techcorp.jpg',
                clientName: 'TechCorp',
                industry: 'Technology',
                services: 'Digital Strategy, Creative Campaigns',
                results: '300% increase in engagement, 150% ROI',
                published: true,
                order: 1
            }
        });

        // Seed Blog Posts
        await prisma.blogPost.create({
            data: {
                title: 'The Future of Digital Marketing in 2024',
                slug: 'future-digital-marketing-2024',
                excerpt: 'Exploring the trends that will shape digital marketing in the coming year.',
                content: 'Full blog post content here...',
                featuredImage: '/blog/future-marketing.jpg',
                author: 'Marketing Team',
                published: true,
                publishedAt: new Date()
            }
        });

        // Seed User (admin)
        await prisma.user.create({
            data: {
                email: 'admin@wearecollaborative.net',
                password: 'admin123', // In production, this should be hashed
                name: 'Admin User',
                role: 'admin'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully!'
        });

    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

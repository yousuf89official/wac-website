require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // Clear existing data (in reverse order of dependencies if needed)
    await prisma.lead.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.caseStudy.deleteMany();
    await prisma.client.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.stat.deleteMany();
    await prisma.value.deleteMany();
    await prisma.processStep.deleteMany();
    await prisma.service.deleteMany();
    await prisma.navLink.deleteMany();
    await prisma.socialLink.deleteMany();
    await prisma.stat.deleteMany();

    // 1. User
    await prisma.user.upsert({
        where: { email: 'yousuf@wearecollaborative.net' },
        update: {},
        create: {
            email: 'yousuf@wearecollaborative.net',
            password: 'password', // As requested for easy access
            name: 'Yousuf Noor',
            role: 'admin',
        },
    });

    // 2. BrandConfig
    const brandData = {
        name: 'We Are Collaborative',
        tagline: 'Where Collaboration Drives Growth',
        logo: '/logo.png',
        defaultEmail: 'hello@wearecollaborative.net',
        domain: 'wearecollaborative.net',
        heroImage: 'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183371983_6dd8540a.png'
    };

    await prisma.brandConfig.upsert({
        where: { id: 1 },
        update: brandData,
        create: { id: 1, ...brandData },
    });

    // 3. ThemeConfig
    const themeData = {
        primaryColor: '#00f0ff',
        secondaryColor: '#b000ff',
        accentColor: '#ff006e',
        backgroundColor: '#0a0a0a',
        cardBackground: '#1a1a1a',
        sectionPadding: '2rem',
    };

    await prisma.themeConfig.upsert({
        where: { id: 1 },
        update: themeData,
        create: { id: 1, ...themeData },
    });

    // 4. SectionContent
    const sections = [
        {
            sectionId: 'hero',
            badge: 'Digital Marketing Excellence',
            headline: 'We Are Collaborative',
            subheadline: 'Where visionary brands and elite marketing minds unite to create unstoppable growth.',
            description: 'Not just an agency — a movement.',
        },
        {
            sectionId: 'services',
            badge: 'Global Solutions',
            headline: 'Full-Spectrum Marketing Performance',
            description: 'Strategic expertise designed to scale your business and dominate your market.',
        },
        {
            sectionId: 'process',
            badge: 'Our Process',
            headline: 'How We Collaborate',
            description: 'A proven framework that transforms ambitious goals into measurable results.',
        },
        {
            sectionId: 'about',
            badge: 'Who We Are',
            headline: 'More Than Just An Agency',
            description: 'We are a network of elite marketing specialists, strategists, and creative minds who believe that the old agency model is broken.',
        },
        {
            sectionId: 'cta',
            badge: 'Limited Availability',
            headline: 'Ready to Join the Movement?',
            subheadline: 'Stop competing. Start collaborating.',
            description: 'Experience the power of radical collaboration. Let\'s build something extraordinary together.',
        }
    ];

    for (const section of sections) {
        await prisma.sectionContent.upsert({
            where: { sectionId: section.sectionId },
            update: section,
            create: section,
        });
    }

    // 5. NavLinks
    const navLinks = [
        { label: 'Services', href: '#services', order: 1 },
        { label: 'Case Studies', href: '#case-studies', order: 2 },
        { label: 'About', href: '#about', order: 3 },
        { label: 'Blog', href: '#blog', order: 4 },
        { label: 'Contact', href: '#contact', order: 5 },
    ];

    for (const link of navLinks) {
        await prisma.navLink.create({ data: link });
    }

    // 6. Services
    const services = [
        { title: 'Digital Marketing Strategy', description: 'Data-driven strategies that transform your digital presence and drive measurable growth.', icon: 'strategy', order: 1 },
        { title: 'Performance Marketing', description: 'ROI-focused campaigns across paid search, social, and programmatic channels.', icon: 'performance', order: 2 },
        { title: 'Brand Development', description: 'Build a brand that commands attention and creates lasting connections.', icon: 'brand', order: 3 },
        { title: 'Conversion Optimization', description: 'Turn more visitors into customers with data-backed UX improvements.', icon: 'conversion', order: 4 },
        { title: 'SEO & Content', description: 'Dominate search results with strategic content and technical excellence.', icon: 'seo', order: 5 },
        { title: 'Agency Partnerships', description: 'White-label solutions for agencies looking to expand their capabilities.', icon: 'partnership', order: 6 },
    ];

    for (const service of services) {
        await prisma.service.create({ data: service });
    }

    // 7. ProcessSteps
    const steps = [
        { number: '01', title: 'Discovery', description: 'We dive deep into your business, market, and goals to understand the full picture.', color: '#00f0ff', order: 1 },
        { number: '02', title: 'Strategy', description: 'We craft a custom roadmap designed to achieve your specific growth objectives.', color: '#b000ff', order: 2 },
        { number: '03', title: 'Execution', description: 'Our network of specialists implements the strategy with precision and speed.', color: '#ff006e', order: 3 },
        { number: '04', title: 'Optimization', description: 'Continuous testing, learning, and refinement to maximize your results.', color: '#00f0ff', order: 4 },
    ];

    for (const step of steps) {
        await prisma.processStep.create({ data: step });
    }

    // 8. Values
    const values = [
        { title: 'Collaboration Over Competition', description: 'We believe the best results come from bringing diverse expertise together.', icon: 'collaboration', order: 1 },
        { title: 'Results-Driven Strategy', description: 'Every decision is backed by data. We focus on the numbers that move your business.', icon: 'results', order: 2 },
        { title: 'Radical Transparency', description: 'No black boxes, no hidden fees. You\'ll always know exactly what we\'re doing.', icon: 'transparency', order: 3 },
        { title: 'Long-Term Partnership', description: 'We build relationships and strategies designed to compound growth over years.', icon: 'partnership', order: 4 },
    ];

    for (const val of values) {
        await prisma.value.create({ data: val });
    }

    // 9. Stats
    const stats = [
        { value: '$50M+', label: 'Revenue Generated', order: 1 },
        { value: '340%', label: 'Avg. ROI Increase', order: 2 },
        { value: '200+', label: 'Brands Transformed', order: 3 },
        { value: '15+', label: 'Agency Partners', order: 4 },
    ];

    for (const stat of stats) {
        await prisma.stat.create({ data: stat });
    }

    // 10. SocialLinks
    const socialLinks = [
        { platform: 'LinkedIn', url: 'https://linkedin.com/company/wearecollaborative', icon: 'linkedin' },
        { platform: 'X (Twitter)', url: 'https://twitter.com/wearecollab', icon: 'twitter' },
        { platform: 'Instagram', url: 'https://instagram.com/wearecollaborative', icon: 'instagram' },
    ];

    for (const link of socialLinks) {
        await prisma.socialLink.create({ data: link });
    }

    // 10. Testimonials
    const testimonials = [
        {
            quote: "Working with We Are Collaborative completely transformed our business. Their strategic approach delivered results beyond our wildest expectations.",
            author: "Sarah Chen",
            role: "CEO",
            company: "TechStyle Fashion",
            image: 'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183461360_05ceb3d1.png',
            results: "340% Revenue Growth",
            order: 1
        },
        {
            quote: "The collaborative approach brought fresh perspectives that our internal team never considered. They think like owners and partners.",
            author: "Michael Torres",
            role: "Founder",
            company: "CloudMetrics Pro",
            image: 'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183461608_482020d2.png',
            results: "900% Customer Growth",
            order: 2
        }
    ];

    for (const t of testimonials) {
        await prisma.testimonial.create({ data: t });
    }

    // 11. Clients
    const clientLogos = [
        'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183391536_34bca91b.png',
        'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183403824_33342f54.png',
        'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183393684_3ea28ac4.png',
    ];

    for (let i = 0; i < clientLogos.length; i++) {
        await prisma.client.create({
            data: {
                name: `Partner ${i + 1}`,
                logo: clientLogos[i],
                order: i + 1
            }
        });
    }

    // 12. Case Studies
    const studies = [
        {
            slug: 'global-growth',
            title: 'Global Growth Strategy',
            description: 'How we helped a SaaS unicorn scale their user base by 300% in 6 months.',
            client: 'TechFlow Inc.',
            image: 'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183421385_1dc07b72.jpg',
            category: 'SaaS',
            results: JSON.stringify(['300% User Growth', '40% Lower CAC']),
            order: 1,
            isFeatured: true
        }
    ];

    for (const s of studies) {
        await prisma.caseStudy.create({ data: s });
    }

    // 13. Blogs
    const blogs = [
        {
            slug: 'future-performance-marketing',
            title: 'The Future of Performance Marketing in 2026',
            excerpt: 'How AI and decentralized data models are reshaping the landscape.',
            content: 'Full content goes here...',
            image: 'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183493684_209ae0c2.png',
            author: 'Collaborative Team',
        }
    ];

    for (const b of blogs) {
        await prisma.blogPost.create({ data: b });
    }

    console.log('Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

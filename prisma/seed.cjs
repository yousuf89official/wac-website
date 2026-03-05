require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // Clear existing data (in reverse order of dependencies)
    await prisma.servicePackage.deleteMany();
    await prisma.course.deleteMany();
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

    // 1. User
    const hashedPassword = bcrypt.hashSync('password', 12);
    await prisma.user.upsert({
        where: { email: 'yousuf@wearecollaborative.net' },
        update: {},
        create: {
            email: 'yousuf@wearecollaborative.net',
            password: hashedPassword,
            name: 'Yousuf Noor',
            role: 'admin',
        },
    });

    // 1b. Test Customer
    const customerPassword = bcrypt.hashSync('customer123', 12);
    await prisma.customer.upsert({
        where: { email: 'customer@test.com' },
        update: {},
        create: {
            email: 'customer@test.com',
            password: customerPassword,
            firstName: 'Test',
            lastName: 'Customer',
            phone: '+6281200000000',
            company: 'Test Corp',
            country: 'ID',
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

    // 5. NavLinks (updated for multi-page)
    const navLinks = [
        { label: 'Services', href: '/services', order: 1 },
        { label: 'Academy', href: '/academy', order: 2 },
        { label: 'Resources', href: '/resources', order: 3 },
        { label: 'About', href: '/about', order: 4 },
        { label: 'Contact', href: '#contact', order: 5 },
    ];

    for (const link of navLinks) {
        await prisma.navLink.create({ data: link });
    }

    // 6. Services
    const services = [
        { title: 'Digital Marketing Strategy', description: 'Data-driven strategies that transform your digital presence and drive measurable growth across all channels.', icon: 'strategy', order: 1 },
        { title: 'Performance Marketing', description: 'ROI-focused campaigns across paid search, social, and programmatic channels that deliver real results.', icon: 'performance', order: 2 },
        { title: 'Brand Development', description: 'Build a brand that commands attention and creates lasting connections with your target audience.', icon: 'brand', order: 3 },
        { title: 'Conversion Optimization', description: 'Turn more visitors into customers with data-backed UX improvements and funnel optimization.', icon: 'conversion', order: 4 },
        { title: 'SEO & Content', description: 'Dominate search results with strategic content marketing and technical SEO excellence.', icon: 'seo', order: 5 },
        { title: 'Agency Partnerships', description: 'White-label solutions for agencies looking to expand their capabilities and client offerings.', icon: 'partnership', order: 6 },
    ];

    const createdServices = [];
    for (const service of services) {
        const created = await prisma.service.create({ data: service });
        createdServices.push(created);
    }

    // 6b. Service Packages (pricing tiers for first 3 services)
    const packageSets = [
        {
            serviceIndex: 0, // Digital Marketing Strategy
            packages: [
                { tier: 'Starter', price: '$2,500/mo', features: JSON.stringify(['Market analysis', 'Channel strategy', 'Monthly reporting', 'Email support']), isPopular: false, order: 1 },
                { tier: 'Growth', price: '$5,000/mo', features: JSON.stringify(['Everything in Starter', 'Competitor intelligence', 'Weekly strategy calls', 'Custom dashboards', 'Dedicated strategist']), isPopular: true, order: 2 },
                { tier: 'Enterprise', price: 'Custom', features: JSON.stringify(['Everything in Growth', 'Multi-market strategy', 'C-suite advisory', 'On-site workshops', 'Priority support']), isPopular: false, order: 3 },
            ]
        },
        {
            serviceIndex: 1, // Performance Marketing
            packages: [
                { tier: 'Starter', price: '$3,000/mo', features: JSON.stringify(['2 ad platforms', 'Campaign setup', 'Monthly optimization', 'Performance reports']), isPopular: false, order: 1 },
                { tier: 'Growth', price: '$7,500/mo', features: JSON.stringify(['Everything in Starter', '4 ad platforms', 'Weekly optimization', 'A/B testing', 'Attribution modeling']), isPopular: true, order: 2 },
                { tier: 'Enterprise', price: 'Custom', features: JSON.stringify(['Everything in Growth', 'Unlimited platforms', 'Real-time optimization', 'Custom integrations', 'Dedicated team']), isPopular: false, order: 3 },
            ]
        },
        {
            serviceIndex: 4, // SEO & Content
            packages: [
                { tier: 'Starter', price: '$2,000/mo', features: JSON.stringify(['Technical SEO audit', '4 blog posts/mo', 'Keyword tracking', 'Monthly reports']), isPopular: false, order: 1 },
                { tier: 'Growth', price: '$4,500/mo', features: JSON.stringify(['Everything in Starter', '8 blog posts/mo', 'Link building', 'Content strategy', 'Bi-weekly calls']), isPopular: true, order: 2 },
                { tier: 'Enterprise', price: 'Custom', features: JSON.stringify(['Everything in Growth', 'Unlimited content', 'Video production', 'Thought leadership', 'Dedicated editor']), isPopular: false, order: 3 },
            ]
        },
    ];

    for (const set of packageSets) {
        for (const pkg of set.packages) {
            await prisma.servicePackage.create({
                data: { ...pkg, serviceId: createdServices[set.serviceIndex].id }
            });
        }
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

    // 11. Testimonials
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

    // 12. Clients
    const clientLogos = [
        'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183391536_34bca91b.png',
        'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183403824_33342f54.png',
        'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183393684_3ea28ac4.png',
    ];

    for (let i = 0; i < clientLogos.length; i++) {
        await prisma.client.create({
            data: { name: `Partner ${i + 1}`, logo: clientLogos[i], order: i + 1 }
        });
    }

    // 13. Case Studies
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

    // 14. Blog Posts (with categories)
    const blogs = [
        {
            slug: 'future-performance-marketing',
            title: 'The Future of Performance Marketing in 2026',
            excerpt: 'How AI and decentralized data models are reshaping the performance marketing landscape.',
            content: 'The performance marketing landscape is undergoing a seismic shift. As third-party cookies disappear and privacy regulations tighten, marketers must adapt to a new reality built on first-party data, AI-powered optimization, and creative excellence.\n\nIn this post, we explore the key trends shaping performance marketing in 2026 and beyond, from automated bid strategies to privacy-preserving measurement frameworks.\n\nThe brands that thrive will be those that embrace collaboration — between teams, between channels, and between data sources. The siloed approach to digital marketing is dead.',
            image: 'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183493684_209ae0c2.png',
            author: 'Collaborative Team',
            category: 'Performance',
        },
        {
            slug: 'seo-content-strategy-guide',
            title: 'The Ultimate Guide to SEO-Driven Content Strategy',
            excerpt: 'Build a content engine that drives organic traffic and converts readers into customers.',
            content: 'Content without strategy is just noise. In a world where billions of pieces of content are published daily, the only way to break through is with a disciplined, data-driven approach to content creation.\n\nThis guide walks you through our proven framework for building a content strategy that ranks, resonates, and converts. From keyword research to content clusters, from editorial calendars to performance measurement.\n\nThe key insight: treat your content like a product. Ship it, measure it, iterate on it.',
            image: 'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183421385_1dc07b72.jpg',
            author: 'Collaborative Team',
            category: 'SEO',
        },
        {
            slug: 'affiliate-marketing-beginners',
            title: 'Affiliate Marketing: From Zero to Revenue',
            excerpt: 'A practical guide to launching and scaling an affiliate marketing program.',
            content: 'Affiliate marketing remains one of the most cost-effective acquisition channels available. With the right structure, you can build a network of partners who actively promote your brand — and you only pay for results.\n\nIn this guide, we cover everything from choosing your affiliate platform to recruiting partners, setting commission structures, and measuring true incremental revenue.\n\nThe secret to a great affiliate program? Treat your affiliates like partners, not vendors. Give them the tools, creative, and data they need to succeed.',
            image: 'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183461360_05ceb3d1.png',
            author: 'Collaborative Team',
            category: 'Growth',
        },
        {
            slug: 'brand-building-digital-age',
            title: 'Brand Building in the Digital Age',
            excerpt: 'Why brand matters more than ever in a world of infinite competition.',
            content: 'In a world where anyone can launch a business overnight, your brand is your moat. It is the reason customers choose you over a cheaper alternative, the reason talent wants to work for you, and the reason partners want to collaborate with you.\n\nThis article explores the principles of modern brand building — from positioning and visual identity to tone of voice and community cultivation.\n\nThe most powerful brands in the digital age are not the loudest. They are the most consistent, the most authentic, and the most collaborative.',
            image: 'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183461608_482020d2.png',
            author: 'Collaborative Team',
            category: 'Strategy',
        },
    ];

    for (const b of blogs) {
        await prisma.blogPost.create({ data: b });
    }

    // 15. Courses
    const courses = [
        {
            slug: 'digital-marketing-mastery',
            title: 'Digital Marketing Mastery',
            description: 'A comprehensive program covering every major digital marketing channel — from paid acquisition to organic growth. Learn the frameworks used by top agencies to drive millions in revenue for their clients.',
            price: 497,
            image: 'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183493684_209ae0c2.png',
            category: 'Digital Marketing',
            duration: '8 weeks',
            level: 'Intermediate',
            modules: JSON.stringify([
                { title: 'Marketing Fundamentals', lessons: 6, duration: '2h 30m' },
                { title: 'Paid Acquisition Channels', lessons: 8, duration: '3h 45m' },
                { title: 'Content & SEO', lessons: 7, duration: '3h 15m' },
                { title: 'Email & Automation', lessons: 5, duration: '2h 00m' },
                { title: 'Analytics & Attribution', lessons: 6, duration: '2h 45m' },
                { title: 'Strategy & Planning', lessons: 4, duration: '1h 45m' },
            ]),
            features: JSON.stringify(['36 video lessons', 'Real-world case studies', 'Downloadable templates', 'Private community access', 'Certificate of completion']),
            isPublished: true,
            isFeatured: true,
            order: 1,
        },
        {
            slug: 'seo-content-strategy',
            title: 'SEO & Content Strategy',
            description: 'Master the art and science of search engine optimization. From technical audits to content clusters, learn how to build an organic growth engine that compounds over time.',
            price: 397,
            image: 'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183421385_1dc07b72.jpg',
            category: 'SEO',
            duration: '6 weeks',
            level: 'Beginner',
            modules: JSON.stringify([
                { title: 'SEO Foundations', lessons: 5, duration: '2h 00m' },
                { title: 'Keyword Research & Strategy', lessons: 6, duration: '2h 30m' },
                { title: 'Technical SEO', lessons: 7, duration: '3h 00m' },
                { title: 'Content Creation at Scale', lessons: 6, duration: '2h 45m' },
                { title: 'Link Building & Authority', lessons: 5, duration: '2h 15m' },
            ]),
            features: JSON.stringify(['29 video lessons', 'SEO audit checklist', 'Keyword research toolkit', 'Content calendar template', 'Certificate of completion']),
            isPublished: true,
            isFeatured: false,
            order: 2,
        },
        {
            slug: 'affiliate-marketing-blueprint',
            title: 'Affiliate Marketing Blueprint',
            description: 'Build and scale a profitable affiliate marketing operation from scratch. Learn recruitment, commission structures, tracking, and optimization strategies used by top programs.',
            price: 347,
            image: 'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183461360_05ceb3d1.png',
            category: 'Affiliate',
            duration: '5 weeks',
            level: 'Beginner',
            modules: JSON.stringify([
                { title: 'Affiliate Fundamentals', lessons: 4, duration: '1h 30m' },
                { title: 'Program Setup & Structure', lessons: 5, duration: '2h 00m' },
                { title: 'Partner Recruitment', lessons: 5, duration: '2h 15m' },
                { title: 'Optimization & Scaling', lessons: 6, duration: '2h 30m' },
            ]),
            features: JSON.stringify(['20 video lessons', 'Affiliate agreement template', 'Commission calculator', 'Partner outreach scripts', 'Certificate of completion']),
            isPublished: true,
            isFeatured: false,
            order: 3,
        },
    ];

    for (const c of courses) {
        await prisma.course.create({ data: c });
    }

    // ── FAQs ───────────────────────────────────────
    await prisma.fAQ.deleteMany();
    const faqs = [
        // Services FAQs - English
        { question: 'What services does WAC offer?', answer: 'We offer full-spectrum digital marketing including SEO, content strategy, performance marketing, social media management, and web development. Each engagement is custom-built around your goals.', page: 'services', locale: 'en', order: 1 },
        { question: 'How does your pricing work?', answer: 'We offer tiered packages (Starter, Growth, Enterprise) with transparent pricing. Each tier includes a defined scope of services. We also offer custom packages for unique needs.', page: 'services', locale: 'en', order: 2 },
        { question: 'How long before I see results?', answer: 'SEO and content marketing typically show significant results within 3-6 months. Performance marketing (ads) can show results within the first week. We provide monthly reports so you can track progress from day one.', page: 'services', locale: 'en', order: 3 },
        { question: 'Do you work with international clients?', answer: 'Yes! We serve clients across Southeast Asia, Australia, the US, and Europe. Our team operates in English and Bahasa Indonesia.', page: 'services', locale: 'en', order: 4 },

        // Services FAQs - Indonesian
        { question: 'Layanan apa saja yang ditawarkan WAC?', answer: 'Kami menawarkan pemasaran digital spektrum penuh termasuk SEO, strategi konten, pemasaran performa, manajemen media sosial, dan pengembangan web. Setiap kerja sama dirancang khusus sesuai tujuan Anda.', page: 'services', locale: 'id', order: 1 },
        { question: 'Bagaimana sistem harganya?', answer: 'Kami menawarkan paket berjenjang (Starter, Growth, Enterprise) dengan harga transparan. Setiap tier mencakup cakupan layanan yang ditentukan. Kami juga menawarkan paket khusus untuk kebutuhan unik.', page: 'services', locale: 'id', order: 2 },
        { question: 'Berapa lama sebelum saya melihat hasil?', answer: 'SEO dan content marketing biasanya menunjukkan hasil signifikan dalam 3-6 bulan. Performance marketing (iklan) dapat menunjukkan hasil dalam minggu pertama. Kami memberikan laporan bulanan.', page: 'services', locale: 'id', order: 3 },
        { question: 'Apakah WAC melayani klien internasional?', answer: 'Ya! Kami melayani klien di seluruh Asia Tenggara, Australia, AS, dan Eropa. Tim kami beroperasi dalam Bahasa Inggris dan Bahasa Indonesia.', page: 'services', locale: 'id', order: 4 },

        // Academy FAQs - English
        { question: 'Are WAC Academy courses self-paced?', answer: 'Yes, all courses are self-paced with lifetime access. Learn on your schedule, revisit modules anytime, and complete at your own speed.', page: 'academy', locale: 'en', order: 1 },
        { question: 'Do I get a certificate?', answer: 'Yes, you receive a certificate of completion for every course you finish. These can be shared on LinkedIn and added to your professional portfolio.', page: 'academy', locale: 'en', order: 2 },
        { question: 'What payment methods do you accept?', answer: 'We accept credit cards, bank transfers, GoPay, OVO, DANA, QRIS, and other Indonesian e-wallets through our secure payment partner Midtrans.', page: 'academy', locale: 'en', order: 3 },

        // Academy FAQs - Indonesian
        { question: 'Apakah kursus WAC Akademi bisa diikuti sesuai jadwal sendiri?', answer: 'Ya, semua kursus bersifat self-paced dengan akses seumur hidup. Belajar sesuai jadwal Anda, kunjungi kembali modul kapan saja.', page: 'academy', locale: 'id', order: 1 },
        { question: 'Apakah saya mendapat sertifikat?', answer: 'Ya, Anda menerima sertifikat penyelesaian untuk setiap kursus yang diselesaikan. Sertifikat ini dapat dibagikan di LinkedIn dan ditambahkan ke portofolio profesional Anda.', page: 'academy', locale: 'id', order: 2 },
        { question: 'Metode pembayaran apa yang diterima?', answer: 'Kami menerima kartu kredit, transfer bank, GoPay, OVO, DANA, QRIS, dan e-wallet Indonesia lainnya melalui partner pembayaran aman Midtrans.', page: 'academy', locale: 'id', order: 3 },

        // About FAQs - English
        { question: 'Where is WAC based?', answer: 'We Are Collaborative is based in Indonesia with a distributed team serving clients globally. Our primary market focus is Southeast Asia.', page: 'about', locale: 'en', order: 1 },
        { question: 'How is WAC different from other agencies?', answer: 'We combine data-driven performance marketing with bold creative execution. No templates, no generic playbooks — every engagement is custom-built. Plus, our WAC Academy means we practice what we teach.', page: 'about', locale: 'en', order: 2 },

        // About FAQs - Indonesian
        { question: 'Di mana WAC berlokasi?', answer: 'We Are Collaborative berbasis di Indonesia dengan tim terdistribusi yang melayani klien secara global. Fokus pasar utama kami adalah Asia Tenggara.', page: 'about', locale: 'id', order: 1 },
        { question: 'Apa yang membedakan WAC dari agensi lain?', answer: 'Kami menggabungkan pemasaran performa berbasis data dengan eksekusi kreatif yang berani. Tanpa template, tanpa buku pedoman generik — setiap kerja sama dirancang khusus.', page: 'about', locale: 'id', order: 2 },
    ];
    for (const faq of faqs) {
        await prisma.fAQ.create({ data: faq });
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

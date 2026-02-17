import { z } from 'zod';

// ── Auth ─────────────────────────────────────

export const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password required'),
});

// ── Blog ─────────────────────────────────────

export const blogCreateSchema = z.object({
    title: z.string().min(1).max(200),
    slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    excerpt: z.string().min(1).max(500),
    content: z.string().min(1),
    image: z.string().min(1),
    author: z.string().min(1).max(100),
    isPublished: z.boolean().optional().default(true),
});

export const blogUpdateSchema = blogCreateSchema.partial();

// ── SEO (shared) ─────────────────────────────

export const seoUpdateSchema = z.object({
    metaTitle: z.string().max(70).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
    focusKeyword: z.string().max(50).optional().nullable(),
    canonicalUrl: z.string().url().optional().nullable(),
});

// ── Case Study ───────────────────────────────

export const caseStudyCreateSchema = z.object({
    title: z.string().min(1).max(200),
    slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
    description: z.string().min(1),
    client: z.string().min(1).max(100),
    image: z.string().min(1),
    category: z.string().min(1).max(50),
    results: z.string().min(1),
    order: z.number().int().optional().default(0),
    isFeatured: z.boolean().optional().default(false),
});

export const caseStudyUpdateSchema = caseStudyCreateSchema.partial();

// ── Service ──────────────────────────────────

export const serviceCreateSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    icon: z.string().min(1).max(50),
    order: z.number().int().optional().default(0),
});

export const serviceUpdateSchema = serviceCreateSchema.partial();

// ── Testimonial ──────────────────────────────

export const testimonialCreateSchema = z.object({
    quote: z.string().min(1).max(1000),
    author: z.string().min(1).max(100),
    role: z.string().min(1).max(100),
    company: z.string().min(1).max(100),
    image: z.string().min(1),
    results: z.string().min(1).max(200),
    order: z.number().int().optional().default(0),
});

export const testimonialUpdateSchema = testimonialCreateSchema.partial();

// ── Client ───────────────────────────────────

export const clientCreateSchema = z.object({
    name: z.string().min(1).max(100),
    logo: z.string().min(1),
    order: z.number().int().optional().default(0),
});

export const clientUpdateSchema = clientCreateSchema.partial();

// ── Navigation ───────────────────────────────

export const navLinkCreateSchema = z.object({
    label: z.string().min(1).max(50),
    href: z.string().min(1).max(200),
    order: z.number().int().optional().default(0),
});

export const navLinkUpdateSchema = navLinkCreateSchema.partial();

// ── Stat ─────────────────────────────────────

export const statCreateSchema = z.object({
    value: z.string().min(1).max(20),
    label: z.string().min(1).max(50),
    order: z.number().int().optional().default(0),
});

export const statUpdateSchema = statCreateSchema.partial();

// ── Brand ────────────────────────────────────

export const brandUpdateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    tagline: z.string().max(200).optional(),
    logo: z.string().optional(),
    defaultEmail: z.string().email().optional(),
    domain: z.string().optional(),
    heroImage: z.string().optional().nullable(),
});

// ── Theme ────────────────────────────────────

export const themeUpdateSchema = z.object({
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    cardBackground: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    sectionPadding: z.string().max(10).optional(),
});

// ── Global SEO ───────────────────────────────

export const globalSeoSchema = z.object({
    siteName: z.string().max(100).optional(),
    siteDescription: z.string().max(200).optional(),
    separator: z.string().max(3).optional(),
    defaultImage: z.string().optional().nullable(),
    twitterHandle: z.string().max(50).optional().nullable(),
    facebookAppId: z.string().max(50).optional().nullable(),
});

// ── Lead (public submission) ─────────────────

export const leadCreateSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    company: z.string().max(100).optional().nullable(),
    message: z.string().min(1).max(2000),
    lead_type: z.string().min(1).max(50),
});

export const leadUpdateSchema = z.object({
    status: z.enum(['new', 'contacted', 'qualified', 'closed']),
});

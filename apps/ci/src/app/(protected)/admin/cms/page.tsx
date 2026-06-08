'use client';

import { useState } from 'react';
import { Save, Eye, FileEdit, Globe, Layout, Type, MessageSquare, BarChart, Users, Megaphone } from 'lucide-react';

const CMS_SECTIONS = [
    {
        id: 'hero',
        label: 'Hero Section',
        icon: Layout,
        fields: [
            { key: 'badge', label: 'Badge Text', type: 'text', placeholder: 'e.g., Now Live' },
            { key: 'heroTitle', label: 'Hero Title', type: 'text', placeholder: 'Main headline' },
            { key: 'heroHighlight', label: 'Hero Highlight', type: 'text', placeholder: 'Gradient text portion' },
            { key: 'heroSubtitle', label: 'Hero Subtitle', type: 'textarea', placeholder: 'Supporting description' },
        ],
    },
    {
        id: 'trust',
        label: 'Trust Bar',
        icon: Users,
        fields: [
            { key: 'trustTitle', label: 'Section Title', type: 'text', placeholder: 'Trusted by...' },
            { key: 'trustLogos', label: 'Brand Names (comma-separated)', type: 'text', placeholder: 'Unilever, Samsung, ...' },
        ],
    },
    {
        id: 'stats',
        label: 'Statistics',
        icon: BarChart,
        fields: [
            { key: 'stat1_value', label: 'Stat 1 Value', type: 'text', placeholder: '500' },
            { key: 'stat1_suffix', label: 'Stat 1 Suffix', type: 'text', placeholder: '+' },
            { key: 'stat1_label', label: 'Stat 1 Label', type: 'text', placeholder: 'Campaigns Managed' },
            { key: 'stat2_value', label: 'Stat 2 Value', type: 'text', placeholder: '98' },
            { key: 'stat2_suffix', label: 'Stat 2 Suffix', type: 'text', placeholder: '%' },
            { key: 'stat2_label', label: 'Stat 2 Label', type: 'text', placeholder: 'Client Satisfaction' },
            { key: 'stat3_value', label: 'Stat 3 Value', type: 'text', placeholder: '2' },
            { key: 'stat3_suffix', label: 'Stat 3 Suffix', type: 'text', placeholder: 'B+' },
            { key: 'stat3_label', label: 'Stat 3 Label', type: 'text', placeholder: 'Impressions Tracked' },
            { key: 'stat4_value', label: 'Stat 4 Value', type: 'text', placeholder: '45' },
            { key: 'stat4_suffix', label: 'Stat 4 Suffix', type: 'text', placeholder: '%' },
            { key: 'stat4_label', label: 'Stat 4 Label', type: 'text', placeholder: 'Avg. ROI Increase' },
        ],
    },
    {
        id: 'features',
        label: 'Features Grid',
        icon: FileEdit,
        fields: [
            { key: 'features', label: 'Features (JSON array)', type: 'code', placeholder: '[{"icon":"hub","title":"...","desc":"..."}]' },
        ],
    },
    {
        id: 'platform',
        label: 'Platform Features',
        icon: Globe,
        fields: [
            { key: 'platformFeatures', label: 'Platform Features (JSON array)', type: 'code', placeholder: '[{"icon":"auto_graph","title":"...","desc":"..."}]' },
        ],
    },
    {
        id: 'howItWorks',
        label: 'How It Works',
        icon: Megaphone,
        fields: [
            { key: 'howItWorks', label: 'Steps (JSON array)', type: 'code', placeholder: '[{"step":"01","title":"...","desc":"..."}]' },
        ],
    },
    {
        id: 'testimonials',
        label: 'Testimonials',
        icon: MessageSquare,
        fields: [
            { key: 'testimonials', label: 'Testimonials (JSON array)', type: 'code', placeholder: '[{"name":"...","role":"...","company":"...","quote":"..."}]' },
        ],
    },
    {
        id: 'blog',
        label: 'Blog Posts',
        icon: Type,
        fields: [
            { key: 'blogPosts', label: 'Blog Posts (JSON array)', type: 'code', placeholder: '[{"title":"...","category":"...","excerpt":"...","date":"...","readTime":"..."}]' },
        ],
    },
    {
        id: 'footer',
        label: 'Footer',
        icon: Layout,
        fields: [
            { key: 'footerDescription', label: 'Footer Description', type: 'textarea', placeholder: 'Company description' },
            { key: 'contactEmail', label: 'Contact Email', type: 'text', placeholder: 'hello@company.com' },
            { key: 'footerLinks', label: 'Footer Links (JSON)', type: 'code', placeholder: '{"platform":["..."],"company":["..."],"resources":["..."]}' },
        ],
    },
];

const PAGES = [
    { id: 'landing', label: 'Home Page', route: '/', status: 'published' },
    { id: 'about', label: 'About Page', route: '/about', status: 'published' },
    { id: 'pricing', label: 'Pricing Page', route: '/pricing', status: 'published' },
    { id: 'blog', label: 'Blog Page', route: '/blog', status: 'published' },
    { id: 'contact', label: 'Contact Page', route: '/contact', status: 'published' },
];

export default function AdminCmsPage() {
    const [activeTab, setActiveTab] = useState<'pages' | 'sections'>('pages');
    const [activeSection, setActiveSection] = useState('hero');
    const [activePage, setActivePage] = useState('landing');
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/cms/landing-page', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            setLastSaved(new Date().toLocaleTimeString());
        } catch (e) {}
        setSaving(false);
    };

    const currentSection = CMS_SECTIONS.find(s => s.id === activeSection);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · CMS
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    Content Management System
                </h1>
                <p className="mt-4 text-foreground-soft max-w-2xl">
                    Manage all public site content, sections, pages, and media from a single dashboard.
                </p>
                <div className="mt-6 flex gap-3">
                    <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-xl font-bold text-xs hover:bg-card transition-all">
                        <Eye className="h-4 w-4" /> PREVIEW SITE
                    </a>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-primary text-foreground rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                        <Save className="h-4 w-4" /> {saving ? 'SAVING...' : 'PUBLISH CHANGES'}
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border pb-0">
                {[{ id: 'pages', label: 'Pages' }, { id: 'sections', label: 'Section Editor' }].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-foreground-soft hover:text-foreground'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'pages' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PAGES.map((page) => (
                        <div key={page.id} className={`p-6 rounded-2xl border transition-all cursor-pointer ${activePage === page.id ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:border-border'}`} onClick={() => setActivePage(page.id)}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Globe className="h-5 w-5" />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${page.status === 'published' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                    {page.status}
                                </span>
                            </div>
                            <h3 className="font-bold text-foreground mb-1">{page.label}</h3>
                            <p className="text-xs text-foreground-soft">Route: {page.route}</p>
                            <div className="mt-4 flex gap-2">
                                <button className="flex-1 py-2 bg-card border border-border text-foreground-soft rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary hover:text-foreground hover:border-primary transition-all">
                                    Edit Content
                                </button>
                                <a href={page.route} target="_blank" className="py-2 px-3 bg-card border border-border text-foreground-soft rounded-lg hover:bg-card transition-all">
                                    <Eye className="h-3.5 w-3.5" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'sections' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Section List */}
                    <div className="col-span-1 lg:col-span-3 space-y-1">
                        {CMS_SECTIONS.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeSection === section.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-foreground-soft hover:bg-card border border-transparent'}`}
                            >
                                <section.icon className="h-4 w-4 shrink-0" />
                                <span className="text-xs font-medium">{section.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Section Editor */}
                    <div className="col-span-1 lg:col-span-9">
                        {currentSection && (
                            <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
                                <div className="flex items-center gap-3 pb-4 border-b border-border">
                                    <currentSection.icon className="h-5 w-5 text-primary" />
                                    <h3 className="font-bold text-foreground">{currentSection.label}</h3>
                                    {lastSaved && <span className="text-[10px] text-foreground-soft ml-auto">Last saved: {lastSaved}</span>}
                                </div>
                                {currentSection.fields.map((field) => (
                                    <div key={field.key} className="space-y-2">
                                        <label className="text-xs font-medium text-foreground-soft">{field.label}</label>
                                        {field.type === 'text' && (
                                            <input
                                                value={formData[field.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                placeholder={field.placeholder}
                                                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-foreground-soft text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                                            />
                                        )}
                                        {field.type === 'textarea' && (
                                            <textarea
                                                rows={3}
                                                value={formData[field.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                placeholder={field.placeholder}
                                                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-foreground-soft text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                                            />
                                        )}
                                        {field.type === 'code' && (
                                            <textarea
                                                rows={8}
                                                value={formData[field.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                placeholder={field.placeholder}
                                                className="w-full px-4 py-3 rounded-xl bg-background-2 border border-border text-success font-mono text-xs focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Master list of all navigable features — used by sidebar filtering and admin permissions UI

export interface Feature {
    key: string;
    label: string;
    section: string;
    href: string;
}

export const ALL_FEATURES: Feature[] = [
    // Social Listening (Lens)
    { key: 'lens-dashboard', label: 'Social Listening Overview', section: 'Social Listening', href: '/lens/dashboard' },
    { key: 'lens-feed', label: 'Live Feed', section: 'Social Listening', href: '/lens/feed' },
    { key: 'lens-media-monitoring', label: 'Media Monitoring', section: 'Social Listening', href: '/lens/media-monitoring' },
    { key: 'lens-crisis', label: 'Crisis Intelligence', section: 'Social Listening', href: '/lens/crisis' },
    { key: 'lens-influencers', label: 'Influencer Intelligence', section: 'Social Listening', href: '/lens/influencers' },
    { key: 'lens-reputation', label: 'Reputation Benchmarking', section: 'Social Listening', href: '/lens/reputation' },
    { key: 'lens-public-opinion', label: 'Public Opinion', section: 'Social Listening', href: '/lens/public-opinion' },
    // Overview
    { key: 'dashboard', label: 'Dashboard', section: 'Overview', href: '/dashboard' },
    { key: 'widgets', label: 'Widgets & Cards', section: 'Overview', href: '/dashboard/widgets' },
    // Operations
    { key: 'brands', label: 'Brands', section: 'Operations', href: '/brands' },
    { key: 'ave-calculator', label: 'Media Analyzer', section: 'Operations', href: '/ave-calculator' },
    { key: 'campaigns', label: 'Campaigns', section: 'Operations', href: '/admin/brand-campaign-settings' },
    { key: 'campaign-templates', label: 'Campaign Templates', section: 'Operations', href: '/admin/campaign-templates' },
    { key: 'approval-workflow', label: 'Approval Workflow', section: 'Operations', href: '/admin/approval-workflow' },
    { key: 'campaign-rules', label: 'Campaign Rules', section: 'Operations', href: '/admin/campaign-rules' },
    { key: 'reports', label: 'Reports', section: 'Operations', href: '/reports' },
    // Public Site
    { key: 'cms', label: 'CMS Manager', section: 'Public Site', href: '/admin/cms' },
    { key: 'seo', label: 'SEO / AEO Manager', section: 'Public Site', href: '/admin/seo-manager' },
    { key: 'brand-identity', label: 'Brand Identity', section: 'Public Site', href: '/admin/brand-identity' },
    { key: 'chatbot', label: 'AI Chatbot', section: 'Public Site', href: '/admin/chatbot' },
    // Growth & Revenue
    { key: 'future-products', label: 'Future Products', section: 'Growth & Revenue', href: '/admin/future-products' },
    { key: 'analytics', label: 'Analytics & Tracking', section: 'Growth & Revenue', href: '/admin/analytics' },
    { key: 'client-portal', label: 'Client Portal', section: 'Growth & Revenue', href: '/admin/client-portal' },
    { key: 'whitelabel', label: 'Whitelabel System', section: 'Growth & Revenue', href: '/admin/whitelabel' },
    { key: 'benchmarks', label: 'Benchmarks', section: 'Growth & Revenue', href: '/admin/benchmarks' },
    { key: 'attribution', label: 'Attribution', section: 'Growth & Revenue', href: '/admin/attribution' },
    { key: 'billing', label: 'Billing & Referrals', section: 'Growth & Revenue', href: '/admin/billing' },
    // Platform
    { key: 'integrations', label: 'Integrations', section: 'Platform', href: '/admin/integrations' },
    { key: 'api-keys', label: 'API Keys', section: 'Platform', href: '/admin/api-keys' },
    { key: 'users', label: 'Users & Roles', section: 'Platform', href: '/admin/users' },
    { key: 'security', label: 'Security', section: 'Platform', href: '/admin/security' },
    { key: 'activity-logs', label: 'Activity Logs', section: 'Platform', href: '/admin/activity-logs' },
    // Tools
    { key: 'database', label: 'Database', section: 'Tools', href: '/admin/database' },
    { key: 'invoice', label: 'Create Invoice', section: 'Tools', href: '/tools/invoice' },
    { key: 'extractors', label: 'Post ID Extractors', section: 'Tools', href: '/tools/extractors' },
    { key: 'settings', label: 'Settings', section: 'Tools', href: '/admin/settings' },
];

// Feature keys grouped by section for the permissions UI
export const FEATURE_SECTIONS = Array.from(
    new Set(ALL_FEATURES.map(f => f.section))
).map(section => ({
    section,
    features: ALL_FEATURES.filter(f => f.section === section),
}));

// Parse user permissions from JSON string. Returns null for admins (full access)
export function parsePermissions(permissionsJson: string | null | undefined): string[] | null {
    if (!permissionsJson) return null; // null = no restrictions (full access for admins)
    try {
        return JSON.parse(permissionsJson);
    } catch {
        return null;
    }
}

// Check if user has access to a specific feature
export function hasFeatureAccess(
    role: string,
    permissionsJson: string | null | undefined,
    featureKey: string
): boolean {
    // Super admins always have full access
    if (['super_admin', 'MasterAdmin', 'masteradmin'].includes(role)) return true;

    const permissions = parsePermissions(permissionsJson);
    // If no permissions set, allow all (default for existing users)
    if (!permissions) return true;

    return permissions.includes(featureKey);
}

/**
 * @wac/agents — Agent Registry (the org chart).
 *
 * Pure data: NO imports from the Claude Agent SDK, so a client UI can import
 * this catalog to render the team without pulling server-only code.
 *
 * Everyone reports to JARVIS. `reportsTo` is null only for JARVIS.
 */

export type AgentType = "Coordinator" | "Builder" | "Guardian";
export type AgentTier = "ecosystem" | "public" | "backend" | "ci";

export interface AgentMeta {
    id: string;
    name: string;
    role: string;
    type: AgentType;
    /** Which tier of the ecosystem this agent primarily serves. */
    tier: AgentTier;
    model: string;
    description: string;
    capabilities: string[];
    /** id of the agent this one reports to; null for the top of the org. */
    reportsTo: string | null;
    /** Read-only sub-agents this agent can spawn (JARVIS only, today). */
    subAgents?: string[];
    requiredRole: "admin";
}

export const AGENT_CATALOG: readonly AgentMeta[] = [
    {
        id: "jarvis",
        name: "JARVIS",
        role: "Lead Project Manager",
        type: "Coordinator",
        tier: "ecosystem",
        model: "claude-opus-4-6",
        description: "Strategic orchestrator for the whole ecosystem — delegates work, monitors health, drives decisions. Never codes directly.",
        capabilities: ["task_orchestration", "gap_analysis", "risk_detection", "industry_research", "agent_delegation", "quality_oversight"],
        reportsTo: null,
        subAgents: ["code-auditor", "ui-inspector", "db-analyst", "security-scanner", "feature-planner"],
        requiredRole: "admin",
    },

    // ── Cross-cutting (all tiers) ───────────────────────────────────────────
    {
        id: "neon",
        name: "NEON",
        role: "Database & Migrations Engineer",
        type: "Builder",
        tier: "ecosystem",
        model: "claude-opus-4-6",
        description: "Prisma schema, the Supabase→Neon migration, seeds, data integrity, and query performance. Keeps WAC and CI databases separate.",
        capabilities: ["prisma_schema", "migrations", "supabase_to_neon", "seed_data", "data_integrity", "query_performance"],
        reportsTo: "jarvis",
        requiredRole: "admin",
    },
    {
        id: "sentinel",
        name: "SENTINEL",
        role: "Security & DevOps",
        type: "Guardian",
        tier: "ecosystem",
        model: "claude-sonnet-4-6",
        description: "Vulnerability scanning, Vercel deployment, CI/CD, monitoring, compliance, and secrets hygiene across all apps.",
        capabilities: ["vulnerability_scanning", "deployment", "ci_cd", "monitoring", "compliance", "secrets_hygiene"],
        reportsTo: "jarvis",
        requiredRole: "admin",
    },
    {
        id: "scribe",
        name: "SCRIBE",
        role: "QA, Build Verification & Docs",
        type: "Guardian",
        tier: "ecosystem",
        model: "claude-sonnet-4-6",
        description: "Tests (API/E2E), build/lint verification, and keeping CLAUDE.md / DEPLOY.md / .env.example / memory in sync. JARVIS's quality gate.",
        capabilities: ["test_authoring", "e2e_verification", "build_checks", "docs_sync", "changelog", "memory_upkeep"],
        reportsTo: "jarvis",
        requiredRole: "admin",
    },

    // ── Public site (wearecollaborative.net) ────────────────────────────────
    {
        id: "edith",
        name: "EDITH",
        role: "SEO / Marketing-Site Engineer",
        type: "Builder",
        tier: "public",
        model: "claude-opus-4-6",
        description: "Owns the indexed public site: SEO/GEO/AEO, metadata, JSON-LD, sitemap/robots, performance, and marketing pages.",
        capabilities: ["seo_metadata", "structured_data", "geo_aeo", "sitemap_robots", "perf_lighthouse", "content_rendering"],
        reportsTo: "jarvis",
        requiredRole: "admin",
    },
    {
        id: "friday",
        name: "FRIDAY",
        role: "Frontend Engineer",
        type: "Builder",
        tier: "public",
        model: "claude-sonnet-4-6",
        description: "Component development, responsive design, animation, accessibility, and theme consistency across every surface.",
        capabilities: ["component_development", "responsive_design", "animation", "accessibility", "theme_consistency"],
        reportsTo: "jarvis",
        requiredRole: "admin",
    },

    // ── Backend app (app.wearecollaborative.net) ────────────────────────────
    {
        id: "shield",
        name: "SHIELD",
        role: "Auth & Backend Identity Engineer",
        type: "Guardian",
        tier: "backend",
        model: "claude-opus-4-6",
        description: "Dual-JWT auth, customer portal, checkout/payments orchestration, and the shared cross-subdomain cookie. The identity provider.",
        capabilities: ["dual_jwt_auth", "customer_portal", "checkout_payments", "cross_subdomain_cookies", "midtrans_webhooks", "session_management"],
        reportsTo: "jarvis",
        requiredRole: "admin",
    },
    {
        id: "stark",
        name: "STARK",
        role: "Full-Stack Engineer",
        type: "Builder",
        tier: "backend",
        model: "claude-opus-4-6",
        description: "Builds APIs, business logic, and integration pipelines across the backend app and products.",
        capabilities: ["api_development", "business_logic", "auth_wiring", "integration_pipelines", "database_queries"],
        reportsTo: "jarvis",
        requiredRole: "admin",
    },
    {
        id: "pepper",
        name: "PEPPER",
        role: "Revenue & Billing Engine",
        type: "Builder",
        tier: "backend",
        model: "claude-opus-4-6",
        description: "Subscriptions, referrals, commissions, payouts, invoicing. Midtrans for WAC commerce, Stripe for CI SaaS.",
        capabilities: ["midtrans_integration", "stripe_integration", "subscription_management", "referral_tracking", "commission_calculation", "payout_system"],
        reportsTo: "jarvis",
        requiredRole: "admin",
    },

    // ── Collaborative Intelligence (intelligence.wearecollaborative.net) ─────
    {
        id: "vision",
        name: "VISION",
        role: "Data & Analytics Engineer",
        type: "Builder",
        tier: "ci",
        model: "claude-opus-4-6",
        description: "Data pipelines, metric aggregation, chart generation, forecasting, and report automation.",
        capabilities: ["data_pipelines", "metric_aggregation", "chart_generation", "forecasting", "report_automation"],
        reportsTo: "jarvis",
        requiredRole: "admin",
    },
    {
        id: "hawkeye",
        name: "HAWKEYE",
        role: "Integration Specialist",
        type: "Builder",
        tier: "ci",
        model: "claude-sonnet-4-6",
        description: "Connects ad platforms (Google Ads, Meta, TikTok), syncs data, normalizes metrics.",
        capabilities: ["google_ads_sync", "meta_ads_connector", "tiktok_api", "data_normalization", "oauth_management"],
        reportsTo: "jarvis",
        requiredRole: "admin",
    },
    {
        id: "commander",
        name: "COMMANDER",
        role: "Campaign Lifecycle Manager",
        type: "Builder",
        tier: "ci",
        model: "claude-opus-4-6",
        description: "Campaign cloning, templates, bulk actions, approval workflows, and status enforcement.",
        capabilities: ["campaign_cloning", "template_management", "bulk_operations", "approval_workflow", "status_enforcement"],
        reportsTo: "jarvis",
        requiredRole: "admin",
    },
    {
        id: "autopilot",
        name: "AUTOPILOT",
        role: "Automation & Rules Engine",
        type: "Builder",
        tier: "ci",
        model: "claude-opus-4-6",
        description: "Campaign rules creation, condition evaluation, automated actions, execution auditing.",
        capabilities: ["rule_creation", "condition_evaluation", "action_execution", "consecutive_tracking", "conflict_detection"],
        reportsTo: "jarvis",
        requiredRole: "admin",
    },
    {
        id: "allocator",
        name: "ALLOCATOR",
        role: "Budget & Performance Intelligence",
        type: "Builder",
        tier: "ci",
        model: "claude-opus-4-6",
        description: "Budget pacing, spend forecasting, allocation management, cross-channel rebalancing.",
        capabilities: ["budget_pacing", "spend_forecasting", "allocation_management", "alert_evaluation", "performance_rebalancing"],
        reportsTo: "jarvis",
        requiredRole: "admin",
    },
] as const;

export type AgentId = (typeof AGENT_CATALOG)[number]["id"];

/** Look up one agent's metadata by id. */
export function getAgent(id: string): AgentMeta | undefined {
    return AGENT_CATALOG.find((a) => a.id === id);
}

/** All agents that report (directly) to the given agent id. */
export function directReports(id: string): AgentMeta[] {
    return AGENT_CATALOG.filter((a) => a.reportsTo === id);
}

/** All agents on a given tier. */
export function agentsByTier(tier: AgentTier): AgentMeta[] {
    return AGENT_CATALOG.filter((a) => a.tier === tier);
}

/** The coordinator at the top of the org (JARVIS). */
export const COORDINATOR: AgentMeta = AGENT_CATALOG.find((a) => a.reportsTo === null)!;

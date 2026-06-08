import { query } from "@anthropic-ai/claude-agent-sdk";

/**
 * @wac/agents — shared agent runtime.
 *
 * One `defineAgent` factory builds every specialist on the team so they share
 * identical wiring (model, tools, turn/budget caps, the Claude Agent SDK
 * `query()` loop) while keeping their own system prompt and capabilities.
 *
 * The whole team reports to JARVIS (see ./agents/jarvis.ts). Each agent is a
 * specialized Claude instance — see ./registry.ts for the org chart.
 */

/** Model IDs used across the team. Opus for heavy reasoning, Sonnet for faster builders. */
export const MODELS = {
    opus: "claude-opus-4-6",
    sonnet: "claude-sonnet-4-6",
} as const;

export type AgentModel = (typeof MODELS)[keyof typeof MODELS];

/**
 * Shared orientation appended to every agent's system prompt so the whole team
 * understands the project it operates on and where the tier boundaries are.
 */
export const ECOSYSTEM_CONTEXT = `## WAC Ecosystem (the project you operate on)
This is the **We Are Collaborative (WAC)** monorepo — npm workspaces, deployed on Vercel. Three tiers:

- **Public site** — repo ROOT → \`wearecollaborative.net\` (indexed). The front-of-house marketing site for the whole ecosystem: ecosystem marketing, a landing page per product, and the academy CATALOG. Next.js 16 (App Router, Turbopack) + Prisma + Postgres (Neon), reading the DB **directly** in server components. No login/portal/admin UI lives here. Dark cyberpunk theme (cyan #00f0ff, purple #b000ff on #0a0a0a).
- **Backend app** — \`apps/backend\` → \`app.wearecollaborative.net\` (non-indexed; Phase 2, not built yet). The "app": login/register, customer dashboard/portal, admin CMS, checkout/payments (Midtrans Snap). It is the **identity provider** — it issues the shared \`wac-customer-token\` JWT (cookie scoped to \`.wearecollaborative.net\`, 30d). Admin \`wac-auth-token\` is host-only, 24h.
- **Product apps** — e.g. \`apps/ci\` → \`intelligence.wearecollaborative.net\` (non-indexed). Collaborative Intelligence: a campaign-analytics SaaS. Only **verifies** the shared cookie. Editorial Luxe theme (sienna #C8553D).

**Shared:** \`packages/ui\` (\`@wac/ui\`), \`packages/agents\` (\`@wac/agents\` — this team). \`JWT_SECRET\` is identical across all apps so the shared cookie verifies everywhere. The WAC database is migrating Supabase→Neon via Vercel; CI keeps its **own separate** Neon DB/schema.

Respect tier boundaries: the public site never gains auth UI; privileged writes live in the backend app; CI's database is not merged with WAC's.`;

/** Read-only inspection tools — safe for any agent. */
export const READONLY_TOOLS = ["Read", "Glob", "Grep"] as const;

export interface SubAgentSpec {
    description: string;
    prompt: string;
    tools: string[];
}

export interface AgentDefinition {
    /** Stable lowercase id, matches the registry. */
    id: string;
    /** Display name, e.g. "JARVIS". */
    name: string;
    model: AgentModel;
    systemPrompt: string;
    allowedTools: string[];
    /** Default turn cap; callers may override per-run. */
    maxTurns: number;
    /** Enable adaptive extended thinking. */
    thinking?: boolean;
    /** Auto-accept file edits (builders that write code). */
    permissionMode?: "acceptEdits";
    /** Default USD spend cap for a run; callers may override. */
    maxBudgetUsd?: number;
    /** Declarative sub-agents this agent may spawn via the Agent tool. */
    subAgents?: Record<string, SubAgentSpec>;
    /** Set false to skip appending ECOSYSTEM_CONTEXT (defaults to appending it). */
    includeEcosystem?: boolean;
}

/** Per-invocation overrides. */
export interface RunOptions {
    cwd?: string;
    maxTurns?: number;
    maxBudgetUsd?: number;
}

export interface Agent {
    id: string;
    name: string;
    model: AgentModel;
    /** Run the agent and stream SDK messages (async iterator). */
    run: (prompt: string, options?: RunOptions) => ReturnType<typeof query>;
    /** Run the agent and resolve the final result text. */
    ask: (prompt: string, options?: RunOptions) => Promise<string>;
}

/**
 * Build an agent from a definition. Returns `{ run, ask }` plus identity —
 * destructure the run/ask functions to keep the `runX`/`askX` export style.
 */
export function defineAgent(def: AgentDefinition): Agent {
    const systemPrompt =
        def.includeEcosystem === false
            ? def.systemPrompt
            : `${def.systemPrompt}\n\n${ECOSYSTEM_CONTEXT}`;

    const run = (prompt: string, options: RunOptions = {}) =>
        query({
            prompt,
            options: {
                cwd: options.cwd ?? process.cwd(),
                model: def.model,
                systemPrompt,
                allowedTools: def.allowedTools,
                maxTurns: options.maxTurns ?? def.maxTurns,
                ...(def.thinking ? { thinking: { type: "adaptive" as const } } : {}),
                ...(def.permissionMode ? { permissionMode: def.permissionMode } : {}),
                ...(def.maxBudgetUsd !== undefined || options.maxBudgetUsd !== undefined
                    ? { maxBudgetUsd: options.maxBudgetUsd ?? def.maxBudgetUsd }
                    : {}),
                ...(def.subAgents ? { agents: def.subAgents } : {}),
            },
        });

    const ask = async (prompt: string, options: RunOptions = {}): Promise<string> => {
        let result = "";
        for await (const message of run(prompt, options)) {
            if ("result" in message) result = (message as { result: string }).result;
        }
        return result;
    };

    return { id: def.id, name: def.name, model: def.model, run, ask };
}

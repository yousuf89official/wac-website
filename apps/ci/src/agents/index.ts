/**
 * Collaborative Intelligence — Agent Registry (re-export shim).
 *
 * The agent team now lives in the shared `@wac/agents` package and serves the
 * entire WAC ecosystem. This file re-exports it so existing CI imports
 * (`@/agents`, `@/agents/jarvis`) keep working. Everyone reports to JARVIS.
 *
 * @see packages/agents
 */

export * from "@wac/agents";

// Backwards-compatible alias: CI historically imported `AGENT_CATALOG` from here.
export { AGENT_CATALOG } from "@wac/agents/registry";

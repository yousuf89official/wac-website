/**
 * @wac/agents — the WAC ecosystem agent team.
 *
 * JARVIS coordinates; every specialist reports to it. Each agent is a
 * specialized Claude instance built on the Claude Agent SDK (see ./runtime.ts).
 *
 *   import { askJarvis } from "@wac/agents";
 *   const result = await askJarvis("Audit the checkout flow and delegate fixes.");
 *
 * For the org chart without pulling the SDK, import "@wac/agents/registry".
 */

// Coordinator
export { runJarvis, askJarvis, type JarvisOptions } from "./agents/jarvis";

// Cross-cutting (all tiers)
export { runNeon, askNeon } from "./agents/neon";
export { runSentinel, askSentinel } from "./agents/sentinel";
export { runScribe, askScribe } from "./agents/scribe";

// Public site
export { runEdith, askEdith } from "./agents/edith";
export { runFriday, askFriday } from "./agents/friday";

// Backend app
export { runShield, askShield } from "./agents/shield";
export { runStark, askStark } from "./agents/stark";
export { runPepper, askPepper } from "./agents/pepper";

// Collaborative Intelligence
export { runVision, askVision } from "./agents/vision";
export { runHawkeye, askHawkeye } from "./agents/hawkeye";
export { runCommander, askCommander } from "./agents/commander";
export { runAutopilot, askAutopilot } from "./agents/autopilot";
export { runAllocator, askAllocator } from "./agents/allocator";

// Runtime + registry
export {
    defineAgent,
    MODELS,
    ECOSYSTEM_CONTEXT,
    READONLY_TOOLS,
    type Agent,
    type AgentDefinition,
    type AgentModel,
    type RunOptions,
    type SubAgentSpec,
} from "./runtime";

export {
    AGENT_CATALOG,
    COORDINATOR,
    getAgent,
    directReports,
    agentsByTier,
    type AgentId,
    type AgentMeta,
    type AgentType,
    type AgentTier,
} from "./registry";

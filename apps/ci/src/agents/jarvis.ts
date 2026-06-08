/**
 * Re-export shim — JARVIS now lives in the shared `@wac/agents` package.
 * Kept so `import { askJarvis } from '@/agents/jarvis'` continues to resolve.
 *
 * @see packages/agents/src/agents/jarvis.ts
 */
export { runJarvis, askJarvis, type JarvisOptions } from "@wac/agents";

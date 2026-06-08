/**
 * Intelligence Layer — Campaign performance analysis engine.
 *
 * Three core capabilities:
 * 1. Scoring: 0-100 performance scores for every campaign
 * 2. Anomalies: Z-score based deviation detection
 * 3. Summaries: Natural-language performance reports
 */

export { scoreCampaign, scoreBrand } from './scoring';
export type { CampaignScore } from './scoring';

export { detectAnomalies } from './anomalies';
export type { Anomaly } from './anomalies';

export { generateBrandSummary } from './summary';
export type { BrandSummary } from './summary';

export { generateBenchmarks } from './benchmarks';
export type { BenchmarkComparison, BenchmarkReport } from './benchmarks';

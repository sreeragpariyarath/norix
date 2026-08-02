/**
 * Insights Public API
 *
 * Re-exports all public symbols from the insights module.
 * External callers (commands, plugins, tests) should import from here.
 */

export { InsightEngine } from './InsightEngine.js';
export { detectArchetype } from './archetypes.js';
export { evaluateStrengths } from './strengths.js';
export { evaluateRisks } from './risks.js';
export { evaluateRules } from './rules.js';
export { renderInsights } from './renderer.js';
export { generateInsightsMarkdown } from './markdown.js';

export type {
  ArchitectureReport,
  ReportMetadata,
  ProjectSummary,
  FrontendArchitecture,
  BackendArchitecture,
  DatabaseArchitecture,
  InfrastructureArchitecture,
  MonorepoArchitecture,
  ProjectProfile,
  Insight,
  Recommendation,
} from './types.js';

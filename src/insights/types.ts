/**
 * Insight Engine Domain Types
 *
 * All models produced by the InsightEngine and consumed by
 * renderer, markdown generator, and external callers.
 */

import type { CapabilityMatch } from '../types.js';

// ─── Intermediate Profile ─────────────────────────────────────────────────────

/**
 * Derived, role-partitioned view of an AnalysisResult.
 * Built once by InsightEngine and shared across all sub-modules.
 */
export interface ProjectProfile {
  // ── Repository metadata
  readonly repoName: string;
  readonly isMonorepo: boolean;
  readonly workspaceNames: readonly string[];
  readonly language: string;
  readonly packageManager: string;
  readonly hasTypeScript: boolean;

  // ── Frameworks, partitioned by role
  readonly metaFrameworks: readonly CapabilityMatch[]; // role='meta-framework'
  readonly serverFrameworks: readonly CapabilityMatch[]; // role='server-framework'
  readonly uiLibraries: readonly CapabilityMatch[]; // role='ui-library'
  readonly apiLayers: readonly CapabilityMatch[]; // role='api-layer'

  // ── Databases, partitioned by role
  readonly relationalDbs: readonly CapabilityMatch[]; // role='relational-driver'
  readonly documentDbs: readonly CapabilityMatch[]; // role='document-driver'
  readonly managedDbs: readonly CapabilityMatch[]; // role='managed-db'

  // ── ORMs / query builders, partitioned by role
  readonly relationalOrms: readonly CapabilityMatch[]; // role='relational-orm'
  readonly documentOrms: readonly CapabilityMatch[]; // role='document-orm'
  readonly queryBuilders: readonly CapabilityMatch[]; // role='query-builder'

  // ── Build tools, partitioned by role
  readonly bundlers: readonly CapabilityMatch[]; // role='bundler'
  readonly monorepoTools: readonly CapabilityMatch[]; // role='monorepo-tool'

  // ── Infrastructure, partitioned by role
  readonly ciCd: readonly CapabilityMatch[]; // role='ci-cd'
  readonly deploymentPlatforms: readonly CapabilityMatch[]; // role='deployment-platform'

  // ── Full capability lists (not partitioned)
  readonly containerTools: readonly CapabilityMatch[];
  readonly authentication: readonly CapabilityMatch[];
  readonly validation: readonly CapabilityMatch[];
  readonly testing: readonly CapabilityMatch[];
  readonly cache: readonly CapabilityMatch[];
  readonly queue: readonly CapabilityMatch[];
  readonly payments: readonly CapabilityMatch[];
  readonly monitoring: readonly CapabilityMatch[];
  readonly styling: readonly CapabilityMatch[];
  readonly ai: readonly CapabilityMatch[];
}

// ─── Output Report ────────────────────────────────────────────────────────────

export interface ArchitectureReport {
  readonly metadata: ReportMetadata;
  readonly summary: ProjectSummary;
  readonly frontend: FrontendArchitecture;
  readonly backend: BackendArchitecture;
  readonly database: DatabaseArchitecture;
  readonly infrastructure: InfrastructureArchitecture;
  readonly monorepo?: MonorepoArchitecture;
  readonly strengths: readonly Insight[];
  readonly risks: readonly Insight[];
  readonly recommendations: readonly Recommendation[];
}

export interface ReportMetadata {
  readonly engine: 'modern';
  readonly generatedAt: string;
  readonly durationMs: number;
  readonly norixVersion: string;
}

export interface ProjectSummary {
  readonly archetype: string;
  readonly primaryLanguage: string;
  readonly packageManager: string;
  readonly repoName: string;
  readonly isMonorepo: boolean;
  readonly detectedCapabilityCount: number;
}

export interface FrontendArchitecture {
  readonly metaFramework?: string;
  readonly uiLibrary?: string;
  readonly bundler?: string;
  readonly styling: readonly string[];
  readonly hasTypeScript: boolean;
}

export interface BackendArchitecture {
  readonly frameworks: readonly string[];
  readonly apiLayer: readonly string[];
  readonly authentication: readonly string[];
  readonly validation: readonly string[];
  readonly queue: readonly string[];
  readonly cache: readonly string[];
}

export interface DatabaseArchitecture {
  readonly drivers: readonly string[];
  readonly orms: readonly string[];
  readonly isRelational: boolean;
  readonly isDocument: boolean;
  readonly managedServices: readonly string[];
}

export interface InfrastructureArchitecture {
  readonly deployment: readonly string[];
  readonly containerization: readonly string[];
  readonly ciCd: readonly string[];
  readonly monitoring: readonly string[];
}

export interface MonorepoArchitecture {
  readonly tool: string;
  readonly workspaceCount: number;
  readonly workspaceNames: readonly string[];
}

export interface Insight {
  readonly title: string;
  readonly detail: string;
}

export interface Recommendation {
  readonly id: string;
  readonly priority: 'high' | 'medium' | 'low';
  readonly title: string;
  readonly detail: string;
}

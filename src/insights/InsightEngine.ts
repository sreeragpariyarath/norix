/**
 * Insight Engine
 *
 * Orchestrates all insight sub-modules to transform an AnalysisResult
 * into a structured ArchitectureReport.
 *
 * No business logic lives here — this class only coordinates:
 *  - Profile construction (role-partitioned view of capabilities)
 *  - Archetype detection (archetypes.ts)
 *  - Strength evaluation (strengths.ts)
 *  - Risk evaluation (risks.ts)
 *  - Recommendation evaluation (rules.ts)
 */

import type { AnalysisResult, CapabilityMatch } from '../types.js';
import type {
  ArchitectureReport,
  BackendArchitecture,
  DatabaseArchitecture,
  FrontendArchitecture,
  InfrastructureArchitecture,
  ProjectProfile,
  ProjectSummary,
  ReportMetadata,
} from './types.js';
import { detectArchetype } from './archetypes.js';
import { evaluateStrengths } from './strengths.js';
import { evaluateRisks } from './risks.js';
import { evaluateRules } from './rules.js';

export class InsightEngine {
  /**
   * Generates a structured ArchitectureReport from a fully populated AnalysisResult.
   *
   * @param result     The AnalysisResult produced by the modern engine
   * @param durationMs Total scan + analysis duration in milliseconds
   * @param norixVersion The active Norix CLI version string (e.g. "v1.14.0")
   */
  generate(result: AnalysisResult, durationMs: number, norixVersion: string): ArchitectureReport {
    const profile = this.buildProfile(result);

    const detectedCapabilityCount = (
      Object.values(result.capabilities) as Array<CapabilityMatch[] | undefined>
    ).reduce((sum, matches) => sum + (matches?.length ?? 0), 0);

    const metadata: ReportMetadata = {
      engine: 'modern',
      generatedAt: new Date().toISOString(),
      durationMs,
      norixVersion,
    };

    const summary: ProjectSummary = {
      archetype: detectArchetype(profile),
      primaryLanguage: result.language,
      packageManager: result.packageManager,
      repoName: result.repoName,
      isMonorepo: result.isMonorepo,
      detectedCapabilityCount,
    };

    const frontend: FrontendArchitecture = {
      ...(profile.metaFrameworks[0] !== undefined
        ? { metaFramework: profile.metaFrameworks[0].label }
        : {}),
      ...(profile.uiLibraries[0] !== undefined ? { uiLibrary: profile.uiLibraries[0].label } : {}),
      ...(profile.bundlers[0] !== undefined ? { bundler: profile.bundlers[0].label } : {}),
      styling: profile.styling.map((s) => s.label),
      hasTypeScript: profile.hasTypeScript,
    };

    const backend: BackendArchitecture = {
      frameworks: profile.serverFrameworks.map((f) => f.label),
      apiLayer: profile.apiLayers.map((a) => a.label),
      authentication: profile.authentication.map((a) => a.label),
      validation: profile.validation.map((v) => v.label),
      queue: profile.queue.map((q) => q.label),
      cache: profile.cache.map((c) => c.label),
    };

    const allOrms = [...profile.relationalOrms, ...profile.documentOrms, ...profile.queryBuilders];
    const database: DatabaseArchitecture = {
      drivers: [...profile.relationalDbs, ...profile.documentDbs].map((d) => d.label),
      orms: allOrms.map((o) => o.label),
      isRelational:
        profile.relationalDbs.length > 0 ||
        profile.relationalOrms.length > 0 ||
        profile.managedDbs.length > 0,
      isDocument: profile.documentDbs.length > 0 || profile.documentOrms.length > 0,
      managedServices: profile.managedDbs.map((d) => d.label),
    };

    const infrastructure: InfrastructureArchitecture = {
      deployment: profile.deploymentPlatforms.map((d) => d.label),
      containerization: profile.containerTools.map((c) => c.label),
      ciCd: profile.ciCd.map((c) => c.label),
      monitoring: profile.monitoring.map((m) => m.label),
    };

    const monorepoTool =
      profile.monorepoTools[0]?.label ??
      (result.packageManager === 'pnpm' ? 'pnpm workspaces' : 'npm workspaces');

    return {
      metadata,
      summary,
      frontend,
      backend,
      database,
      infrastructure,
      ...(result.isMonorepo
        ? {
            monorepo: {
              tool: monorepoTool,
              workspaceCount: result.workspaceNames.length,
              workspaceNames: result.workspaceNames,
            },
          }
        : {}),
      strengths: evaluateStrengths(profile),
      risks: evaluateRisks(profile),
      recommendations: evaluateRules(profile),
    };
  }

  /**
   * Builds the intermediate ProjectProfile from an AnalysisResult.
   * Partitions capabilities by role for efficient rule evaluation.
   */
  private buildProfile(result: AnalysisResult): ProjectProfile {
    const frameworks = result.capabilities.framework ?? [];
    const databases = result.capabilities.database ?? [];
    const orms = result.capabilities.orm ?? [];
    const build = result.capabilities.build ?? [];
    const cloud = result.capabilities.cloud ?? [];

    const byRole = (list: readonly CapabilityMatch[], role: string): CapabilityMatch[] =>
      list.filter((m) => m.role === role);

    const hasTypeScript = result.language === 'TypeScript' || result.allPackages.has('typescript');

    return {
      repoName: result.repoName,
      isMonorepo: result.isMonorepo,
      workspaceNames: result.workspaceNames,
      language: result.language,
      packageManager: result.packageManager,
      hasTypeScript,

      metaFrameworks: byRole(frameworks, 'meta-framework'),
      serverFrameworks: byRole(frameworks, 'server-framework'),
      uiLibraries: byRole(frameworks, 'ui-library'),
      apiLayers: byRole(frameworks, 'api-layer'),

      relationalDbs: byRole(databases, 'relational-driver'),
      documentDbs: byRole(databases, 'document-driver'),
      managedDbs: byRole(databases, 'managed-db'),

      relationalOrms: byRole(orms, 'relational-orm'),
      documentOrms: byRole(orms, 'document-orm'),
      queryBuilders: byRole(orms, 'query-builder'),

      bundlers: byRole(build, 'bundler'),
      monorepoTools: byRole(build, 'monorepo-tool'),

      ciCd: byRole(cloud, 'ci-cd'),
      deploymentPlatforms: byRole(cloud, 'deployment-platform'),

      containerTools: result.capabilities.container ?? [],
      authentication: result.capabilities.authentication ?? [],
      validation: result.capabilities.validation ?? [],
      testing: result.capabilities.testing ?? [],
      cache: result.capabilities.cache ?? [],
      queue: result.capabilities.queue ?? [],
      payments: result.capabilities.payments ?? [],
      monitoring: result.capabilities.monitoring ?? [],
      styling: result.capabilities.css ?? [],
      ai: result.capabilities.ai ?? [],
    };
  }
}

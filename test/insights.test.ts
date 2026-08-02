/**
 * Insights Engine Test Suite
 *
 * Verifies ArchitectureReport generation for 12 scenarios covering:
 *  - Next.js full-stack project
 *  - MERN backend
 *  - NestJS API server
 *  - React SPA (Vite)
 *  - Monorepo (Turborepo)
 *  - Empty repository
 *  - Recommendation rules
 *  - Strength generation
 *  - Risk generation
 *  - JSON serialization
 *  - Markdown generation
 *  - Metadata generation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { analyze } from '../src/analyzer.js';
import type { ScanResult, AnalysisResult } from '../src/types.js';
import { InsightEngine } from '../src/insights/InsightEngine.js';
import { detectArchetype } from '../src/insights/archetypes.js';
import { evaluateStrengths } from '../src/insights/strengths.js';
import { evaluateRisks } from '../src/insights/risks.js';
import { evaluateRules } from '../src/insights/rules.js';
import { generateInsightsMarkdown } from '../src/insights/markdown.js';
import type { ArchitectureReport, ProjectProfile } from '../src/insights/types.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

/**
 * Creates a mock ScanResult from a flat package record.
 * Include 'typescript' as a package key to signal TypeScript usage.
 */
function createMockScan(
  packages: Record<string, string>,
  options: Partial<
    Pick<ScanResult, 'language' | 'isMonorepo' | 'workspaceNames' | 'repoName'>
  > = {},
): ScanResult {
  const allPackages = new Map<string, { version: string; isDev: boolean }>();
  for (const [name, version] of Object.entries(packages)) {
    allPackages.set(name, { version, isDev: false });
  }
  return {
    repoName: options.repoName ?? 'test-repo',
    repoRoot: '/test',
    isMonorepo: options.isMonorepo ?? false,
    workspaceNames: options.workspaceNames ?? [],
    workspaces: [],
    allPackages,
    language: options.language ?? 'JavaScript',
    packageManager: 'npm',
    packageJsonCount: 1,
    duration: 10,
  };
}

function analyzeAndInsight(
  packages: Record<string, string>,
  options: Parameters<typeof createMockScan>[1] = {},
): ArchitectureReport {
  const scan = createMockScan(packages, options);
  const result = analyze(scan);
  const engine = new InsightEngine();
  return engine.generate(result, 42, 'v1.0.0');
}

/**
 * Build a minimal ProjectProfile for unit-testing rule modules directly.
 */
function buildProfile(overrides: Partial<ProjectProfile> = {}): ProjectProfile {
  const base: ProjectProfile = {
    repoName: 'test-repo',
    isMonorepo: false,
    workspaceNames: [],
    language: 'JavaScript',
    packageManager: 'npm',
    hasTypeScript: false,
    metaFrameworks: [],
    serverFrameworks: [],
    uiLibraries: [],
    apiLayers: [],
    relationalDbs: [],
    documentDbs: [],
    managedDbs: [],
    relationalOrms: [],
    documentOrms: [],
    queryBuilders: [],
    bundlers: [],
    monorepoTools: [],
    ciCd: [],
    deploymentPlatforms: [],
    containerTools: [],
    authentication: [],
    validation: [],
    testing: [],
    cache: [],
    queue: [],
    payments: [],
    monitoring: [],
    styling: [],
    ai: [],
  };
  return { ...base, ...overrides };
}

// ─── Tests: Archetype Detection ───────────────────────────────────────────────

describe('detectArchetype', () => {
  it('detects Next.js as "Full-stack React application"', () => {
    const profile = buildProfile({
      metaFrameworks: [{ label: 'Next.js', matchedPackages: ['next'], role: 'meta-framework' }],
    });
    expect(detectArchetype(profile)).toBe('Full-stack React application');
  });

  it('detects NestJS as "NestJS API server"', () => {
    const profile = buildProfile({
      serverFrameworks: [
        { label: 'NestJS', matchedPackages: ['@nestjs/core'], role: 'server-framework' },
      ],
    });
    expect(detectArchetype(profile)).toBe('NestJS API server');
  });

  it('detects MERN stack as "MERN-style backend"', () => {
    const profile = buildProfile({
      serverFrameworks: [
        { label: 'Express.js', matchedPackages: ['express'], role: 'server-framework' },
      ],
      documentDbs: [{ label: 'MongoDB', matchedPackages: ['mongodb'], role: 'document-driver' }],
    });
    expect(detectArchetype(profile)).toBe('MERN-style backend');
  });

  it('detects React + Vite as "React SPA (Vite)"', () => {
    const profile = buildProfile({
      uiLibraries: [{ label: 'React', matchedPackages: ['react'], role: 'ui-library' }],
      bundlers: [{ label: 'Vite', matchedPackages: ['vite'], role: 'bundler' }],
    });
    expect(detectArchetype(profile)).toBe('React SPA (Vite)');
  });

  it('falls back to "Node.js project" for empty profile', () => {
    expect(detectArchetype(buildProfile())).toBe('Node.js project');
  });

  it('detects monorepo archetype', () => {
    const profile = buildProfile({
      monorepoTools: [{ label: 'Turborepo', matchedPackages: ['turbo'], role: 'monorepo-tool' }],
    });
    expect(detectArchetype(profile)).toBe('Monorepo');
  });
});

// ─── Tests: Full Report Generation ───────────────────────────────────────────

describe('InsightEngine – Next.js full-stack report', () => {
  let report: ArchitectureReport;

  beforeAll(() => {
    report = analyzeAndInsight(
      { next: '14.0.0', react: '18.0.0', typescript: '5.0.0', vitest: '1.0.0' },
      { language: 'TypeScript' },
    );
  });

  it('detects Next.js archetype', () => {
    expect(report.summary.archetype).toBe('Full-stack React application');
  });

  it('populates frontend meta-framework', () => {
    expect(report.frontend.metaFramework).toBe('Next.js');
  });

  it('populates frontend ui-library', () => {
    expect(report.frontend.uiLibrary).toBe('React');
  });

  it('flags TypeScript as enabled', () => {
    expect(report.frontend.hasTypeScript).toBe(true);
  });

  it('includes typescript strength', () => {
    const titles = report.strengths.map((s) => s.title);
    expect(titles).toContain('Type-safe codebase');
  });

  it('includes test suite strength', () => {
    const titles = report.strengths.map((s) => s.title);
    expect(titles).toContain('Test suite configured');
  });

  it('does NOT recommend adding a test runner', () => {
    const ids = report.recommendations.map((r) => r.id);
    expect(ids).not.toContain('no-testing');
  });
});

describe('InsightEngine – MERN backend report', () => {
  let report: ArchitectureReport;

  beforeAll(() => {
    report = analyzeAndInsight({
      express: '4.18.0',
      mongodb: '6.0.0',
      mongoose: '8.0.0',
      zod: '3.0.0',
    });
  });

  it('detects MERN archetype', () => {
    expect(report.summary.archetype).toBe('MERN-style backend');
  });

  it('populates backend frameworks', () => {
    expect(report.backend.frameworks).toContain('Express.js');
  });

  it('populates database drivers', () => {
    expect(report.database.drivers).toContain('MongoDB');
  });

  it('populates ORM list with Mongoose', () => {
    expect(report.database.orms).toContain('Mongoose');
  });

  it('marks database as document type', () => {
    expect(report.database.isDocument).toBe(true);
    expect(report.database.isRelational).toBe(false);
  });

  it('populates validation from backend', () => {
    expect(report.backend.validation).toContain('Zod');
  });

  it('includes ORM strength', () => {
    const titles = report.strengths.map((s) => s.title);
    expect(titles).toContain('Database access abstracted via ORM');
  });

  it('does NOT fire orm-without-relational-db recommendation (document ORM)', () => {
    const ids = report.recommendations.map((r) => r.id);
    expect(ids).not.toContain('orm-without-relational-db');
  });
});

describe('InsightEngine – NestJS API report', () => {
  let report: ArchitectureReport;

  beforeAll(() => {
    report = analyzeAndInsight({
      '@nestjs/core': '10.0.0',
      pg: '8.0.0',
      '@prisma/client': '5.0.0',
      vitest: '1.0.0',
    });
  });

  it('detects NestJS archetype', () => {
    expect(report.summary.archetype).toBe('NestJS API server');
  });

  it('marks database as relational', () => {
    expect(report.database.isRelational).toBe(true);
  });

  it('includes Prisma ORM', () => {
    expect(report.database.orms).toContain('Prisma');
  });

  it('includes PostgreSQL driver', () => {
    expect(report.database.drivers).toContain('PostgreSQL');
  });

  it('does NOT recommend adding test runner', () => {
    const ids = report.recommendations.map((r) => r.id);
    expect(ids).not.toContain('no-testing');
  });
});

describe('InsightEngine – React SPA (Vite)', () => {
  let report: ArchitectureReport;

  beforeAll(() => {
    report = analyzeAndInsight({ react: '18.0.0', vite: '5.0.0' });
  });

  it('detects React SPA (Vite) archetype', () => {
    expect(report.summary.archetype).toBe('React SPA (Vite)');
  });

  it('populates bundler', () => {
    expect(report.frontend.bundler).toBe('Vite');
  });

  it('flags TypeScript as false (no typescript package)', () => {
    expect(report.frontend.hasTypeScript).toBe(false);
  });

  it('recommends TypeScript migration for React without TS', () => {
    const ids = report.recommendations.map((r) => r.id);
    expect(ids).toContain('react-without-typescript');
  });
});

describe('InsightEngine – Monorepo (Turborepo)', () => {
  let report: ArchitectureReport;

  beforeAll(() => {
    report = analyzeAndInsight(
      { turbo: '1.10.0' },
      { isMonorepo: true, workspaceNames: ['apps/web', 'apps/api', 'packages/ui'] },
    );
  });

  it('populates monorepo section', () => {
    expect(report.monorepo).toBeDefined();
  });

  it('identifies Turborepo as the tool', () => {
    expect(report.monorepo?.tool).toBe('Turborepo');
  });

  it('reports correct workspace count', () => {
    expect(report.monorepo?.workspaceCount).toBe(3);
  });

  it('summary reflects isMonorepo', () => {
    expect(report.summary.isMonorepo).toBe(true);
  });

  it('does NOT fire monorepo-without-orchestrator recommendation', () => {
    const ids = report.recommendations.map((r) => r.id);
    expect(ids).not.toContain('monorepo-without-orchestrator');
  });
});

describe('InsightEngine – Empty repository', () => {
  let report: ArchitectureReport;

  beforeAll(() => {
    report = analyzeAndInsight({});
  });

  it('falls back to Node.js project archetype', () => {
    expect(report.summary.archetype).toBe('Node.js project');
  });

  it('detects zero capabilities', () => {
    expect(report.summary.detectedCapabilityCount).toBe(0);
  });

  it('has no frontend meta-framework', () => {
    expect(report.frontend.metaFramework).toBeUndefined();
  });

  it('has no monorepo section', () => {
    expect(report.monorepo).toBeUndefined();
  });

  it('recommends adding a test runner', () => {
    const ids = report.recommendations.map((r) => r.id);
    expect(ids).toContain('no-testing');
  });

  it('includes no-testing risk', () => {
    const titles = report.risks.map((r) => r.title);
    expect(titles).toContain('No test framework detected');
  });

  it('generates no strengths', () => {
    expect(report.strengths).toHaveLength(0);
  });
});

// ─── Tests: Recommendation Rules (Unit) ──────────────────────────────────────

describe('evaluateRules – recommendation rule coverage', () => {
  it('fires "payments-without-auth" when payments but no auth', () => {
    const profile = buildProfile({
      payments: [{ label: 'Stripe', matchedPackages: ['stripe'], role: 'payment-processor' }],
    });
    const recs = evaluateRules(profile);
    expect(recs.some((r) => r.id === 'payments-without-auth')).toBe(true);
  });

  it('does not fire "payments-without-auth" when auth is present', () => {
    const profile = buildProfile({
      payments: [{ label: 'Stripe', matchedPackages: ['stripe'], role: 'payment-processor' }],
      authentication: [
        { label: 'Auth.js', matchedPackages: ['next-auth'], role: 'auth-framework' },
      ],
    });
    const recs = evaluateRules(profile);
    expect(recs.some((r) => r.id === 'payments-without-auth')).toBe(false);
  });

  it('fires "orm-without-relational-db" when ORM present but no DB driver', () => {
    const profile = buildProfile({
      relationalOrms: [
        { label: 'Prisma', matchedPackages: ['@prisma/client'], role: 'relational-orm' },
      ],
    });
    const recs = evaluateRules(profile);
    expect(recs.some((r) => r.id === 'orm-without-relational-db')).toBe(true);
  });

  it('fires "monorepo-without-orchestrator" for isMonorepo without tools', () => {
    const profile = buildProfile({ isMonorepo: true, monorepoTools: [] });
    const recs = evaluateRules(profile);
    expect(recs.some((r) => r.id === 'monorepo-without-orchestrator')).toBe(true);
  });

  it('sorts high priority recommendations before medium and low', () => {
    const profile = buildProfile({
      testing: [],
      uiLibraries: [{ label: 'React', matchedPackages: ['react'], role: 'ui-library' }],
    });
    const recs = evaluateRules(profile);
    const priorities = recs.map((r) => r.priority);
    const highIdx = priorities.indexOf('high');
    const mediumIdx = priorities.indexOf('medium');
    if (highIdx !== -1 && mediumIdx !== -1) {
      expect(highIdx).toBeLessThan(mediumIdx);
    }
  });
});

// ─── Tests: Strengths (Unit) ──────────────────────────────────────────────────

describe('evaluateStrengths', () => {
  it('returns empty for an empty profile', () => {
    expect(evaluateStrengths(buildProfile())).toHaveLength(0);
  });

  it('returns TypeScript strength when hasTypeScript is true', () => {
    const strengths = evaluateStrengths(buildProfile({ hasTypeScript: true }));
    expect(strengths.some((s) => s.title === 'Type-safe codebase')).toBe(true);
  });

  it('returns Docker strength when Docker is in containerTools', () => {
    const profile = buildProfile({
      containerTools: [{ label: 'Docker', matchedPackages: [], role: 'containerizer' }],
    });
    const strengths = evaluateStrengths(profile);
    expect(strengths.some((s) => s.title === 'Containerized with Docker')).toBe(true);
  });

  it('returns CI strength when ciCd is populated', () => {
    const profile = buildProfile({
      ciCd: [{ label: 'GitHub Actions', matchedPackages: [], role: 'ci-cd' }],
    });
    const strengths = evaluateStrengths(profile);
    expect(strengths.some((s) => s.title === 'Automated CI/CD pipeline')).toBe(true);
  });
});

// ─── Tests: Risks (Unit) ──────────────────────────────────────────────────────

describe('evaluateRisks', () => {
  it('fires "no-testing" risk for empty profile', () => {
    const risks = evaluateRisks(buildProfile());
    expect(risks.some((r) => r.title === 'No test framework detected')).toBe(true);
  });

  it('fires "multiple-orms" risk when 2+ ORMs present', () => {
    const profile = buildProfile({
      relationalOrms: [
        { label: 'Prisma', matchedPackages: [], role: 'relational-orm' },
        { label: 'Drizzle', matchedPackages: [], role: 'relational-orm' },
      ],
    });
    const risks = evaluateRisks(profile);
    expect(risks.some((r) => r.title === 'Multiple ORM libraries detected')).toBe(true);
  });

  it('fires "docker-without-ci" when Docker present but no CI', () => {
    const profile = buildProfile({
      containerTools: [{ label: 'Docker', matchedPackages: [], role: 'containerizer' }],
      ciCd: [],
    });
    const risks = evaluateRisks(profile);
    expect(risks.some((r) => r.title === 'Docker without CI/CD pipeline')).toBe(true);
  });

  it('does NOT fire "no-testing" when testing is populated', () => {
    const profile = buildProfile({
      testing: [{ label: 'Vitest', matchedPackages: ['vitest'], role: 'test-runner' }],
    });
    const risks = evaluateRisks(profile);
    expect(risks.some((r) => r.title === 'No test framework detected')).toBe(false);
  });
});

// ─── Tests: JSON Serialization ────────────────────────────────────────────────

describe('JSON serialization', () => {
  it('round-trips cleanly through JSON.stringify / JSON.parse', () => {
    const report = analyzeAndInsight({ next: '14.0.0', react: '18.0.0' });
    const json = JSON.stringify(report);
    const parsed = JSON.parse(json) as ArchitectureReport;
    expect(parsed.summary.archetype).toBe(report.summary.archetype);
    expect(parsed.metadata.engine).toBe('modern');
    expect(parsed.metadata.norixVersion).toBe('v1.0.0');
  });

  it('includes all required top-level keys in JSON output', () => {
    const report = analyzeAndInsight({});
    const keys = Object.keys(report);
    expect(keys).toContain('metadata');
    expect(keys).toContain('summary');
    expect(keys).toContain('frontend');
    expect(keys).toContain('backend');
    expect(keys).toContain('database');
    expect(keys).toContain('infrastructure');
    expect(keys).toContain('strengths');
    expect(keys).toContain('risks');
    expect(keys).toContain('recommendations');
  });
});

// ─── Tests: Markdown Generation ───────────────────────────────────────────────

describe('generateInsightsMarkdown', () => {
  it('starts with the repository name H1', () => {
    const report = analyzeAndInsight({ next: '14.0.0' }, { repoName: 'my-app' });
    const md = generateInsightsMarkdown(report);
    expect(md).toMatch(/^# Architecture Report: my-app/);
  });

  it('includes Project Summary table', () => {
    const report = analyzeAndInsight({ express: '4.0.0' });
    const md = generateInsightsMarkdown(report);
    expect(md).toContain('## Project Summary');
    expect(md).toContain('Archetype');
  });

  it('includes Backend section for Express project', () => {
    const report = analyzeAndInsight({ express: '4.0.0', zod: '3.0.0' });
    const md = generateInsightsMarkdown(report);
    expect(md).toContain('## Backend');
    expect(md).toContain('Express.js');
  });

  it('includes Recommendations section when rules fire', () => {
    const report = analyzeAndInsight({});
    const md = generateInsightsMarkdown(report);
    expect(md).toContain('## ◆ Recommendations');
    expect(md).toContain('🔴 High');
  });

  it('includes Norix footer', () => {
    const report = analyzeAndInsight({});
    const md = generateInsightsMarkdown(report);
    expect(md).toContain('Generated by [Norix]');
  });

  it('does not include Frontend section for pure backend project', () => {
    const report = analyzeAndInsight({ express: '4.0.0' });
    const md = generateInsightsMarkdown(report);
    expect(md).not.toContain('## Frontend');
  });
});

// ─── Tests: Metadata ─────────────────────────────────────────────────────────

describe('ReportMetadata', () => {
  it('engine is always "modern"', () => {
    const report = analyzeAndInsight({});
    expect(report.metadata.engine).toBe('modern');
  });

  it('norixVersion matches what was passed', () => {
    const scan = createMockScan({});
    const result: AnalysisResult = { ...scan, capabilities: {} };
    const engine = new InsightEngine();
    const report = engine.generate(result, 123, 'v2.5.0');
    expect(report.metadata.norixVersion).toBe('v2.5.0');
  });

  it('durationMs is a non-negative number', () => {
    const report = analyzeAndInsight({});
    expect(report.metadata.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('generatedAt is a valid ISO timestamp', () => {
    const report = analyzeAndInsight({});
    const date = new Date(report.metadata.generatedAt);
    expect(date.toISOString()).toBe(report.metadata.generatedAt);
  });
});

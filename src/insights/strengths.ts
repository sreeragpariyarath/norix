/**
 * Strength Rules
 *
 * Evaluates positive architectural observations from a ProjectProfile.
 * Each rule returns an Insight if the condition is met, or null otherwise.
 */

import type { Insight, ProjectProfile } from './types.js';

export interface StrengthRule {
  readonly id: string;
  evaluate(profile: ProjectProfile): Insight | null;
}

const STRENGTH_RULES: readonly StrengthRule[] = [
  {
    id: 'typescript',
    evaluate: (p) =>
      p.hasTypeScript
        ? {
            title: 'Type-safe codebase',
            detail: 'TypeScript is configured across the project',
          }
        : null,
  },
  {
    id: 'auth',
    evaluate: (p) =>
      p.authentication.length > 0
        ? {
            title: 'Authentication layer configured',
            detail: p.authentication.map((a) => a.label).join(', '),
          }
        : null,
  },
  {
    id: 'testing',
    evaluate: (p) =>
      p.testing.length > 0
        ? {
            title: 'Test suite configured',
            detail: p.testing.map((t) => t.label).join(', '),
          }
        : null,
  },
  {
    id: 'cache',
    evaluate: (p) =>
      p.cache.length > 0
        ? {
            title: 'Caching layer present',
            detail: p.cache.map((c) => c.label).join(', '),
          }
        : null,
  },
  {
    id: 'orm',
    evaluate: (p) => {
      const orms = [...p.relationalOrms, ...p.documentOrms];
      return orms.length > 0
        ? {
            title: 'Database access abstracted via ORM',
            detail: orms.map((o) => o.label).join(', '),
          }
        : null;
    },
  },
  {
    id: 'ci',
    evaluate: (p) =>
      p.ciCd.length > 0
        ? {
            title: 'Automated CI/CD pipeline',
            detail: p.ciCd.map((c) => c.label).join(', '),
          }
        : null,
  },
  {
    id: 'docker',
    evaluate: (p) =>
      p.containerTools.some((c) => c.label === 'Docker')
        ? {
            title: 'Containerized with Docker',
            detail: 'Docker is configured for consistent deployment environments',
          }
        : null,
  },
  {
    id: 'validation',
    evaluate: (p) =>
      p.validation.length > 0
        ? {
            title: 'Input validation layer present',
            detail: p.validation.map((v) => v.label).join(', '),
          }
        : null,
  },
  {
    id: 'monitoring',
    evaluate: (p) =>
      p.monitoring.length > 0
        ? {
            title: 'Monitoring and observability configured',
            detail: p.monitoring.map((m) => m.label).join(', '),
          }
        : null,
  },
  {
    id: 'monorepo-orchestrator',
    evaluate: (p) =>
      p.monorepoTools.length > 0
        ? {
            title: 'Build orchestration configured',
            detail: p.monorepoTools.map((t) => t.label).join(', '),
          }
        : null,
  },
  {
    id: 'deployment',
    evaluate: (p) =>
      p.deploymentPlatforms.length > 0
        ? {
            title: 'Deployment target configured',
            detail: p.deploymentPlatforms.map((d) => d.label).join(', '),
          }
        : null,
  },
];

/**
 * Evaluates all strength rules against the profile and returns
 * only non-null Insight results.
 */
export function evaluateStrengths(profile: ProjectProfile): readonly Insight[] {
  return STRENGTH_RULES.map((rule) => rule.evaluate(profile)).filter(
    (insight): insight is Insight => insight !== null,
  );
}

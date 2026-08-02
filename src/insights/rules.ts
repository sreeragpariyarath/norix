/**
 * Recommendation Rules
 *
 * Deterministic, actionable rules that evaluate a ProjectProfile and
 * return prioritized Recommendation objects.
 *
 * Results are sorted high → medium → low before being returned.
 * Each rule's id is stable across runs — suitable for deduplication.
 */

import type { ProjectProfile, Recommendation } from './types.js';

export interface RecommendationRule {
  readonly id: string;
  readonly priority: 'high' | 'medium' | 'low';
  evaluate(profile: ProjectProfile): Recommendation | null;
}

const PRIORITY_ORDER: Record<'high' | 'medium' | 'low', number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const RECOMMENDATION_RULES: readonly RecommendationRule[] = [
  {
    id: 'no-testing',
    priority: 'high',
    evaluate: (p) =>
      p.testing.length === 0
        ? {
            id: 'no-testing',
            priority: 'high',
            title: 'No test runner detected',
            detail:
              'No testing framework was found. Consider adding Vitest or Jest to improve code reliability.',
          }
        : null,
  },
  {
    id: 'payments-without-auth',
    priority: 'high',
    evaluate: (p) =>
      p.payments.length > 0 && p.authentication.length === 0
        ? {
            id: 'payments-without-auth',
            priority: 'high',
            title: 'Payment processing without authentication',
            detail: `${p.payments.map((pay) => pay.label).join(', ')} detected but no authentication library was found. Payment endpoints must be protected.`,
          }
        : null,
  },
  {
    id: 'express-without-validation',
    priority: 'high',
    evaluate: (p) =>
      p.serverFrameworks.some((f) => f.label === 'Express.js') && p.validation.length === 0
        ? {
            id: 'express-without-validation',
            priority: 'high',
            title: 'No input validation library detected',
            detail:
              'Express is present without a validation library. Consider adding Zod, Joi, or Yup to validate API inputs.',
          }
        : null,
  },
  {
    id: 'react-without-typescript',
    priority: 'medium',
    evaluate: (p) =>
      p.uiLibraries.some((f) => f.label === 'React') && !p.hasTypeScript
        ? {
            id: 'react-without-typescript',
            priority: 'medium',
            title: 'Consider migrating to TypeScript',
            detail:
              'React is detected without TypeScript. TypeScript significantly improves code safety and long-term maintainability.',
          }
        : null,
  },
  {
    id: 'express-without-auth',
    priority: 'medium',
    evaluate: (p) =>
      p.serverFrameworks.some((f) => f.label === 'Express.js') && p.authentication.length === 0
        ? {
            id: 'express-without-auth',
            priority: 'medium',
            title: 'No authentication middleware detected',
            detail:
              'Express is present without an authentication library. Consider adding Passport.js, JWT, or Auth.js.',
          }
        : null,
  },
  {
    id: 'docker-without-ci',
    priority: 'medium',
    evaluate: (p) =>
      p.containerTools.some((c) => c.label === 'Docker') && p.ciCd.length === 0
        ? {
            id: 'docker-without-ci',
            priority: 'medium',
            title: 'Automated CI pipeline not detected',
            detail:
              'Docker is configured but no CI/CD workflow was found. Consider adding GitHub Actions or GitLab CI.',
          }
        : null,
  },
  {
    id: 'monorepo-without-orchestrator',
    priority: 'medium',
    evaluate: (p) =>
      p.isMonorepo && p.monorepoTools.length === 0
        ? {
            id: 'monorepo-without-orchestrator',
            priority: 'medium',
            title: 'Monorepo without a build orchestrator',
            detail:
              'A monorepo was detected without Turborepo or Nx. Consider adding a build orchestrator for caching and task parallelism.',
          }
        : null,
  },
  {
    id: 'multiple-orms',
    priority: 'medium',
    evaluate: (p) => {
      const allOrms = [...p.relationalOrms, ...p.documentOrms];
      return allOrms.length > 1
        ? {
            id: 'multiple-orms',
            priority: 'medium',
            title: 'Conflicting ORM libraries detected',
            detail: `Found: ${allOrms.map((o) => o.label).join(', ')}. Consider consolidating to a single ORM.`,
          }
        : null;
    },
  },
  {
    id: 'orm-without-relational-db',
    priority: 'low',
    evaluate: (p) => {
      const hasRelationalOrm = p.relationalOrms.length > 0;
      const hasRelationalDb = p.relationalDbs.length > 0 || p.managedDbs.length > 0;
      return hasRelationalOrm && !hasRelationalDb
        ? {
            id: 'orm-without-relational-db',
            priority: 'low',
            title: 'ORM detected without relational database evidence',
            detail: `${p.relationalOrms.map((o) => o.label).join(', ')} found but no relational database driver was detected. Ensure your database connection is configured.`,
          }
        : null;
    },
  },
  {
    id: 'mongodb-without-odm',
    priority: 'low',
    evaluate: (p) =>
      p.documentDbs.some((d) => d.label === 'MongoDB') && p.documentOrms.length === 0
        ? {
            id: 'mongodb-without-odm',
            priority: 'low',
            title: 'MongoDB used without an ODM',
            detail:
              'MongoDB is detected but no ODM (e.g. Mongoose) was found. Consider adding Mongoose or Prisma for schema validation.',
          }
        : null,
  },
];

/**
 * Evaluates all recommendation rules against the profile, filters nulls,
 * and returns results sorted high → medium → low.
 */
export function evaluateRules(profile: ProjectProfile): readonly Recommendation[] {
  return RECOMMENDATION_RULES.map((rule) => rule.evaluate(profile))
    .filter((rec): rec is Recommendation => rec !== null)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

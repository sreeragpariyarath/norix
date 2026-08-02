/**
 * Risk Rules
 *
 * Evaluates architectural risks from a ProjectProfile.
 * Each rule returns an Insight if the risk condition is met, or null otherwise.
 *
 * Risks are distinct from Recommendations: risks are observations about
 * the current state; recommendations are actionable suggestions to improve it.
 */

import type { Insight, ProjectProfile } from './types.js';

export interface RiskRule {
  readonly id: string;
  evaluate(profile: ProjectProfile): Insight | null;
}

const RISK_RULES: readonly RiskRule[] = [
  {
    id: 'no-testing',
    evaluate: (p) =>
      p.testing.length === 0
        ? {
            title: 'No test framework detected',
            detail: 'No test runner was found. Consider adding Vitest or Jest.',
          }
        : null,
  },
  {
    id: 'multiple-orms',
    evaluate: (p) => {
      const allOrms = [...p.relationalOrms, ...p.documentOrms, ...p.queryBuilders];
      return allOrms.length > 1
        ? {
            title: 'Multiple ORM libraries detected',
            detail: `Found: ${allOrms.map((o) => o.label).join(', ')}. Consider consolidating to one.`,
          }
        : null;
    },
  },
  {
    id: 'multiple-auth',
    evaluate: (p) =>
      p.authentication.length > 2
        ? {
            title: 'Multiple authentication libraries detected',
            detail: `Found: ${p.authentication.map((a) => a.label).join(', ')}. This may indicate auth complexity.`,
          }
        : null,
  },
  {
    id: 'docker-without-ci',
    evaluate: (p) =>
      p.containerTools.some((c) => c.label === 'Docker') && p.ciCd.length === 0
        ? {
            title: 'Docker without CI/CD pipeline',
            detail: 'Docker is configured but no CI/CD automation was detected.',
          }
        : null,
  },
  {
    id: 'no-validation',
    evaluate: (p) =>
      p.serverFrameworks.length > 0 && p.validation.length === 0
        ? {
            title: 'No input validation library detected',
            detail:
              'A server framework is present without a validation library (e.g. Zod, Joi, Yup).',
          }
        : null,
  },
  {
    id: 'payments-without-auth',
    evaluate: (p) =>
      p.payments.length > 0 && p.authentication.length === 0
        ? {
            title: 'Payment library without authentication',
            detail: `${p.payments.map((pay) => pay.label).join(', ')} detected but no authentication layer was found.`,
          }
        : null,
  },
];

/**
 * Evaluates all risk rules against the profile and returns
 * only non-null Insight results.
 */
export function evaluateRisks(profile: ProjectProfile): readonly Insight[] {
  return RISK_RULES.map((rule) => rule.evaluate(profile)).filter(
    (insight): insight is Insight => insight !== null,
  );
}
